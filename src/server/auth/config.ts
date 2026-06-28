import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { baseAuthConfig } from './base-config';

const credentialsSchema = z.object({
	// Normalisasi sama dengan register & reset (lowercase+trim) supaya lookup
	// email tidak meleset karena beda kapitalisasi.
	email: z
		.string()
		.email()
		.transform((v) => v.trim().toLowerCase()),
	password: z.string().min(6),
});

export const authConfig = {
	...baseAuthConfig,
	// Menambahkan kunci `callbacks` MENGGANTI seluruh objek callbacks dari
	// baseAuthConfig (spread bukan deep-merge), jadi `jwt` & `session` ditulis
	// ulang lengkap di sini. Versi base tetap dipakai jalur edge/middleware.
	callbacks: {
		async jwt({ token, user }) {
			// Saat sign-in awal: salin id/role + stempel passwordChangedAt user
			// saat ini ke token (epoch ms, atau null bila belum pernah ganti).
			if (user) {
				if (user.id) token.id = user.id;
				token.role = user.role;
				try {
					const dbUser = user.id
						? await prisma.user.findUnique({
								where: { id: user.id },
								select: { passwordChangedAt: true },
							})
						: null;
					token.passwordChangedAt =
						dbUser?.passwordChangedAt?.getTime() ?? null;
				} catch {
					// DB bermasalah saat login → stempel null; request berikutnya yang
					// membaca passwordChangedAt asli akan membatalkan token bila perlu.
					token.passwordChangedAt = null;
				}
				return token;
			}

			// Token tanpa id (mis. JWT lama pra-fitur) → batalkan agar login ulang
			// bersih, sekaligus hindari findUnique({ id: undefined }) yang melempar.
			if (!token.id) return null;

			// Panggilan berikutnya: cek apakah password berubah SETELAH token terbit.
			// Bila ya → kembalikan null agar sesi dibatalkan (logout paksa). Bila DB
			// sedang bermasalah, fail-open (kembalikan token) supaya blip DB tidak
			// melogout semua user sekaligus.
			let dbUser: { passwordChangedAt: Date | null } | null;
			try {
				dbUser = await prisma.user.findUnique({
					where: { id: token.id },
					select: { passwordChangedAt: true },
				});
			} catch {
				return token;
			}
			const changedAt = dbUser?.passwordChangedAt?.getTime();
			const tokenStamp = token.passwordChangedAt ?? 0;
			if (changedAt && changedAt > tokenStamp) {
				return null;
			}
			return token;
		},
		session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.role = token.role;
			}
			return session;
		},
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			authorize: async (credentials) => {
				const parsed = credentialsSchema.safeParse(credentials);
				if (!parsed.success) return null;

				const user = await prisma.user.findUnique({
					where: { email: parsed.data.email },
				});
				// Akun nonaktif / tanpa hash (mis. akun non-kredensial) tak bisa login.
			if (!user || !user.isActive || !user.hashedPassword) return null;

				const valid = await compare(
					parsed.data.password,
					user.hashedPassword,
				);
				if (!valid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name ?? null,
					role: user.role,
				};
			},
		}),
	],
} satisfies NextAuthConfig;
