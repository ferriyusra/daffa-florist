import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { withUniqueConflict } from '../../util';
import { promoFields, promoUpdateFields } from '@/lib/promo-schema';

/** CRUD promo/diskon (S0.7) — semua `adminProcedure`. Kode unik (CONFLICT). */
export const adminPromoRouter = createTRPCRouter({
	list: adminProcedure.query(({ ctx }) =>
		ctx.prisma.promo.findMany({ orderBy: { createdAt: 'desc' } }),
	),

	getById: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const promo = await ctx.prisma.promo.findUnique({
				where: { id: input.id },
			});
			if (!promo) throw new TRPCError({ code: 'NOT_FOUND' });
			return promo;
		}),

	create: adminProcedure
		.input(promoFields)
		.mutation(async ({ ctx, input }) => {
			const exists = await ctx.prisma.promo.findUnique({
				where: { code: input.code },
				select: { id: true },
			});
			if (exists) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Kode promo sudah ada.',
				});
			}
			return withUniqueConflict(
				ctx.prisma.promo.create({ data: input }),
				'Kode promo sudah ada.',
			);
		}),

	update: adminProcedure
		.input(promoUpdateFields)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			const clash = await ctx.prisma.promo.findFirst({
				where: { code: input.code, id: { not: id } },
				select: { id: true },
			});
			if (clash) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Kode promo sudah dipakai promo lain.',
				});
			}
			return withUniqueConflict(
				ctx.prisma.promo.update({ where: { id }, data }),
				'Kode promo sudah dipakai promo lain.',
			);
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(({ ctx, input }) =>
			ctx.prisma.promo.delete({ where: { id: input.id } }),
		),
});
