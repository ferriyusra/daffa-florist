import { createElement } from 'react';
import { hash } from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { registerFields } from '@/lib/auth-schema';
import {
	generateResetToken,
	hashResetToken,
	RESET_IP_RATE_MAX,
	RESET_IP_RATE_WINDOW_MS,
	RESET_RATE_MAX,
	RESET_RATE_WINDOW_MS,
	RESET_TOKEN_TTL_MS,
} from '@/lib/password-reset';
import { getClientIp, rateLimit } from '@/server/api/rate-limit';
import { sendEmail } from '@/lib/email';
import { ResetPasswordEmail } from '@/emails/reset-password';
import { env } from '@/env';

/** Asal aplikasi untuk menyusun tautan reset. Di produksi NEXTAUTH_URL WAJIB
 * (lihat env.ts) sehingga selalu dipakai; fallback header (proto + host) hanya
 * untuk dev lokal — header bisa dipalsukan, jadi tak boleh jadi sumber di prod. */
function getAppOrigin(headers: Headers): string {
	if (env.NEXTAUTH_URL) return env.NEXTAUTH_URL.replace(/\/$/, '');
	const host = headers.get('host') ?? 'localhost:3000';
	const proto =
		headers.get('x-forwarded-proto') ??
		(host.includes('localhost') ? 'http' : 'https');
	return `${proto}://${host}`;
}

/** Respons seragam untuk requestPasswordReset — sama persis baik email
 * terdaftar maupun tidak (anti-enumeration). */
const GENERIC_RESET_RESPONSE = {
	message:
		'Jika email terdaftar, kami telah mengirim tautan untuk mengatur ulang password.',
} as const;

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(registerFields)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			});
			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Email sudah terdaftar.',
				});
			}
			const hashedPassword = await hash(input.password, 10);
			const user = await ctx.prisma.user.create({
				data: {
					name: input.name,
					email: input.email,
					phone: input.phone,
					hashedPassword,
				},
				select: { id: true, name: true, email: true },
			});
			return user;
		}),

	/**
	 * Minta tautan reset password. SELALU mengembalikan respons yang sama
	 * (anti-enumeration). Token hanya dibuat & dikirim bila user ada, aktif, dan
	 * belum melampaui rate-limit (maks RESET_RATE_MAX per RESET_RATE_WINDOW_MS).
	 * Kegagalan kirim email ditelan diam-diam agar tak membocorkan keberadaan akun.
	 */
	requestPasswordReset: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			// Throttle per-IP DULU — independen dari keberadaan akun, jadi boleh
			// memunculkan pesan limit (tidak membocorkan email terdaftar). Limit
			// per-user di bawah tetap senyap.
			const ipLimit = rateLimit(
				`pwreset:${getClientIp(ctx.headers)}`,
				RESET_IP_RATE_MAX,
				RESET_IP_RATE_WINDOW_MS,
			);
			if (!ipLimit.allowed) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(
						ipLimit.retryAfterMs / 60000,
					)} menit.`,
				});
			}

			const email = input.email.toLowerCase().trim();
			const user = await ctx.prisma.user.findUnique({ where: { email } });

			// Hanya proses akun yang ada & aktif (sejalan dengan blokir login).
			if (!user || !user.isActive) return GENERIC_RESET_RESPONSE;

			// Rate-limit: hitung token yang dibuat dalam jendela terakhir.
			const since = new Date(Date.now() - RESET_RATE_WINDOW_MS);
			const recentCount = await ctx.prisma.passwordResetToken.count({
				where: { userId: user.id, createdAt: { gte: since } },
			});
			if (recentCount >= RESET_RATE_MAX) return GENERIC_RESET_RESPONSE;

			// Batalkan token lama yang belum dipakai sebelum menerbitkan yang baru.
			await ctx.prisma.passwordResetToken.updateMany({
				where: { userId: user.id, usedAt: null },
				data: { usedAt: new Date() },
			});

			const { token, tokenHash } = generateResetToken();
			await ctx.prisma.passwordResetToken.create({
				data: {
					userId: user.id,
					tokenHash,
					expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
				},
			});

			const resetUrl = `${getAppOrigin(ctx.headers)}/reset-password?token=${token}`;
			// Fire-and-forget: JANGAN await. Kalau di-await, latensi respons ikut
			// kecepatan Resend HANYA untuk akun yang benar-benar ada → jadi oracle
			// timing yang membocorkan keberadaan akun. Kegagalan tetap ditelan
			// (anti-enumeration). Aman karena app jalan di server Node long-running
			// (pm2), bukan serverless yang mematikan proses begitu respons terkirim.
			void sendEmail({
				to: user.email,
				subject: 'Atur ulang password akun Daffa Florist',
				react: createElement(ResetPasswordEmail, {
					resetUrl,
					name: user.name ?? undefined,
				}),
			}).catch((err) => {
				console.error('Gagal mengirim email reset password:', err);
			});

			return GENERIC_RESET_RESPONSE;
		}),

	/** Cek validitas token (dipakai halaman reset saat dibuka, sebelum form). */
	verifyResetToken: publicProcedure
		.input(z.object({ token: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const record = await ctx.prisma.passwordResetToken.findUnique({
				where: { tokenHash: hashResetToken(input.token) },
			});
			const valid =
				!!record && record.usedAt === null && record.expiresAt > new Date();
			return { valid };
		}),

	/**
	 * Set password baru memakai token. Memvalidasi ulang token di server,
	 * meng-hash password (bcrypt cost 10, konsisten dengan register), lalu dalam
	 * satu transaksi: update password + tandai semua token reset user terpakai.
	 */
	resetPassword: publicProcedure
		.input(
			z.object({
				token: z.string().min(1),
				password: registerFields.shape.password,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const record = await ctx.prisma.passwordResetToken.findUnique({
				where: { tokenHash: hashResetToken(input.token) },
			});
			if (!record || record.usedAt !== null || record.expiresAt <= new Date()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Tautan reset tidak valid atau sudah kedaluwarsa.',
				});
			}

			const hashedPassword = await hash(input.password, 10);
			await ctx.prisma.$transaction([
				ctx.prisma.user.update({
					where: { id: record.userId },
					// passwordChangedAt membatalkan semua JWT yang terbit sebelum ini
					// (logout paksa akun ini di semua perangkat).
					data: { hashedPassword, passwordChangedAt: new Date() },
				}),
				// Tandai token ini + semua token aktif user lain sebagai terpakai.
				ctx.prisma.passwordResetToken.updateMany({
					where: { userId: record.userId, usedAt: null },
					data: { usedAt: new Date() },
				}),
			]);

			return { ok: true };
		}),
});
