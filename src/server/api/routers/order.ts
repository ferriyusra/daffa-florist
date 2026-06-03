import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import {
	createTRPCRouter,
	protectedProcedure,
} from '@/server/api/trpc';

const orderItemInput = z.object({
	productSlug: z.string().min(1),
	productTitle: z.string().min(1),
	productImage: z.string().min(1),
	sizeLabel: z.string().optional(),
	price: z.number().int().nonnegative(),
	quantity: z.number().int().positive(),
	designTemplateName: z.string().optional(),
	themeColorName: z.string().optional(),
	addonNames: z.array(z.string()).default([]),
	// Periode sewa (PRD §7.3): pelanggan memilih tanggal pasang + durasi tampil.
	installDate: z.coerce.date(),
	rentalDays: z.number().int().positive(),
});

function generateOrderNumber() {
	const ts = Date.now().toString(36).toUpperCase();
	const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
	return `DF-${ts}-${rnd}`;
}

/**
 * Tanggal pengambilan papan = tanggal pasang + durasi sewa (PRD §7.3).
 * Dihitung & disimpan di server agar query jadwal/ketersediaan tak menghitung ulang.
 * Versi minimal M1; helper kanonik (dengan buffer pasang/bongkar) dibuat di S2.1.
 */
function computePickupDate(installDate: Date, rentalDays: number): Date {
	const pickupDate = new Date(installDate);
	pickupDate.setDate(pickupDate.getDate() + rentalDays);
	return pickupDate;
}

export const orderRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				addressId: z.string().optional(),
				items: z.array(orderItemInput).min(1),
				shippingCost: z.number().int().nonnegative().default(0),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const subtotal = input.items.reduce(
				(sum, i) => sum + i.price * i.quantity,
				0,
			);
			const total = subtotal + input.shippingCost;

			const order = await ctx.prisma.order.create({
				data: {
					orderNumber: generateOrderNumber(),
					userId: ctx.session.user.id,
					addressId: input.addressId,
					subtotal,
					shippingCost: input.shippingCost,
					total,
					notes: input.notes,
					items: {
						create: input.items.map((i) => ({
							productSlug: i.productSlug,
							productTitle: i.productTitle,
							productImage: i.productImage,
							sizeLabel: i.sizeLabel,
							price: i.price,
							quantity: i.quantity,
							designTemplateName: i.designTemplateName,
							themeColorName: i.themeColorName,
							addonNames: i.addonNames,
							installDate: i.installDate,
							rentalDays: i.rentalDays,
							pickupDate: computePickupDate(i.installDate, i.rentalDays),
						})),
					},
				},
				include: { items: true },
			});

			return order;
		}),

	list: protectedProcedure.query(({ ctx }) =>
		ctx.prisma.order.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: 'desc' },
			include: { items: true, address: true },
		}),
	),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findUnique({
				where: { id: input.id },
				include: { items: true, address: true },
			});
			if (!order || order.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}
			return order;
		}),
});
