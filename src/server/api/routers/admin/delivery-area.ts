import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { withUniqueConflict } from '../../util';
import { deliveryAreaFields } from '@/lib/delivery-area-schema';

/** CRUD zona pengiriman + ongkir (S0.9) — semua `adminProcedure`. */
export const adminDeliveryAreaRouter = createTRPCRouter({
	list: adminProcedure.query(({ ctx }) =>
		ctx.prisma.deliveryArea.findMany({ orderBy: { name: 'asc' } }),
	),

	getById: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const area = await ctx.prisma.deliveryArea.findUnique({
				where: { id: input.id },
			});
			if (!area) throw new TRPCError({ code: 'NOT_FOUND' });
			return area;
		}),

	create: adminProcedure
		.input(deliveryAreaFields)
		.mutation(async ({ ctx, input }) => {
			const exists = await ctx.prisma.deliveryArea.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (exists) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Nama zona sudah ada.',
				});
			}
			return withUniqueConflict(
				ctx.prisma.deliveryArea.create({ data: input }),
				'Nama zona sudah ada.',
			);
		}),

	update: adminProcedure
		.input(deliveryAreaFields.extend({ id: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			const clash = await ctx.prisma.deliveryArea.findFirst({
				where: { name: input.name, id: { not: id } },
				select: { id: true },
			});
			if (clash) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Nama zona sudah dipakai zona lain.',
				});
			}
			return withUniqueConflict(
				ctx.prisma.deliveryArea.update({ where: { id }, data }),
				'Nama zona sudah dipakai zona lain.',
			);
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(({ ctx, input }) =>
			ctx.prisma.deliveryArea.delete({ where: { id: input.id } }),
		),
});
