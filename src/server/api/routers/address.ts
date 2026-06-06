import { z } from 'zod';

import {
	createTRPCRouter,
	protectedProcedure,
} from '@/server/api/trpc';

/**
 * Router alamat pengguna (S2.5) — dipakai checkout sewa untuk membuat alamat
 * acara/pengiriman lalu menyematkan `addressId` ke `order.createRental`.
 */
export const addressRouter = createTRPCRouter({
	listMine: protectedProcedure.query(({ ctx }) =>
		ctx.prisma.address.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
		}),
	),

	create: protectedProcedure
		.input(
			z.object({
				recipientName: z.string().min(1),
				phone: z.string().min(1),
				fullAddress: z.string().min(1),
				city: z.string().min(1),
				province: z.string().optional(),
				postalCode: z.string().optional(),
				isDefault: z.boolean().default(false),
			}),
		)
		.mutation(({ ctx, input }) =>
			ctx.prisma.$transaction(async (tx) => {
				// Bila dijadikan default, bersihkan default lain milik pengguna ini
				// dulu agar hanya ada satu alamat default.
				if (input.isDefault) {
					await tx.address.updateMany({
						where: { userId: ctx.session.user.id, isDefault: true },
						data: { isDefault: false },
					});
				}
				return tx.address.create({
					data: {
						userId: ctx.session.user.id,
						recipientName: input.recipientName,
						phone: input.phone,
						fullAddress: input.fullAddress,
						city: input.city,
						province: input.province,
						postalCode: input.postalCode,
						isDefault: input.isDefault,
					},
				});
			}),
		),
});
