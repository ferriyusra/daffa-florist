import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { checkSizeAvailability, getBookedDates } from '@/server/rental';
import {
	MS_PER_DAY,
	MAX_BOOKED_RANGE_DAYS,
	floorToUtcDay,
} from '@/lib/rental';

/**
 * Router sewa publik (S2.2) — ketersediaan & tanggal penuh sebuah (produk +
 * ukuran). Tanggal dikirim sebagai `Date` (superjson men-serialisasi `Date`,
 * jadi `z.date()` benar untuk input). Lihat ERD §4 "Inti Logika Sewa".
 */
export const rentalRouter = createTRPCRouter({
	checkAvailability: publicProcedure
		.input(
			z.object({
				productId: z.string().uuid(),
				sizeLabel: z.string().min(1),
				installDate: z.date(),
				rentalDays: z.number().int().positive().max(MAX_BOOKED_RANGE_DAYS),
			}),
		)
		.query(async ({ ctx, input }) =>
			// Bulatkan installDate ke hari UTC: domain sewa date-only, jangan
			// sampai komponen jam dari klien menggeser perhitungan hari.
			checkSizeAvailability(ctx.prisma, {
				...input,
				installDate: floorToUtcDay(input.installDate),
			}),
		),

	getBookedDates: publicProcedure
		.input(
			z.object({
				productId: z.string().uuid(),
				sizeLabel: z.string().min(1),
				from: z.date(),
				to: z.date(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Normalisasi ke hari UTC agar langkah harian jatuh tepat di batas hari.
			const from = floorToUtcDay(input.from);
			const to = floorToUtcDay(input.to);
			if (to.getTime() < from.getTime()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.',
				});
			}
			const spanDays = (to.getTime() - from.getTime()) / MS_PER_DAY + 1;
			if (spanDays > MAX_BOOKED_RANGE_DAYS) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Rentang tanggal terlalu lebar (maks ${MAX_BOOKED_RANGE_DAYS} hari).`,
				});
			}
			return getBookedDates(ctx.prisma, { ...input, from, to });
		}),
});
