import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { env } from '@/env';
import { createSnapTransaction, snapJsUrl } from '@/server/midtrans';

/**
 * Pembayaran customer via Midtrans Snap (mode Popup). Order naik ke CONFIRMED
 * HANYA lewat webhook `/api/midtrans/notification` — endpoint ini sekadar
 * membuat attempt pembayaran & token Snap. Dipakai saat checkout dan saat
 * "Bayar Sekarang" di dashboard (retry bila gagal/kedaluwarsa).
 */
export const paymentRouter = createTRPCRouter({
	createSnapTransaction: protectedProcedure
		.input(z.object({ orderId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findFirst({
				// Kepemilikan: customer hanya bisa membayar order miliknya (cegah IDOR).
				where: { id: input.orderId, userId: ctx.session.user.id },
				select: {
					id: true,
					orderNumber: true,
					status: true,
					subtotal: true,
					shippingCost: true,
					discount: true,
					total: true,
					user: { select: { name: true, email: true, phone: true } },
					items: {
						select: {
							productId: true,
							productSlug: true,
							productTitle: true,
							price: true,
							quantity: true,
						},
					},
					payments: { select: { status: true } },
				},
			});
			if (!order) throw new TRPCError({ code: 'NOT_FOUND' });

			if (order.status !== 'PENDING') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Pesanan ini tidak dapat dibayar.',
				});
			}
			if (order.payments.some((p) => p.status === 'PAID')) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Pesanan ini sudah dibayar.',
				});
			}

			// Nominal & rincian DITURUNKAN dari DB — input klien tak pernah dipercaya.
			// item_details harus berjumlah persis = gross_amount (Order.total), jadi
			// ongkir & diskon disertakan sebagai baris tersendiri.
			const items = order.items.map((i) => ({
				id: i.productId ?? i.productSlug,
				name: i.productTitle.slice(0, 50),
				price: i.price,
				quantity: i.quantity,
			}));
			if (order.shippingCost > 0) {
				items.push({
					id: 'shipping',
					name: 'Ongkir',
					price: order.shippingCost,
					quantity: 1,
				});
			}
			if (order.discount > 0) {
				items.push({
					id: 'discount',
					name: 'Diskon',
					price: -order.discount,
					quantity: 1,
				});
			}

			// order_id unik per attempt — Midtrans menolak order_id duplikat.
			const midtransOrderId = `${order.orderNumber}-${randomUUID().slice(0, 8)}`;

			const snap = await createSnapTransaction({
				midtransOrderId,
				grossAmount: order.total,
				customer: order.user,
				items,
			});

			await ctx.prisma.payment.create({
				data: {
					orderId: order.id,
					amount: order.total,
					status: 'PENDING',
					midtransOrderId,
					snapToken: snap.token,
					snapRedirectUrl: snap.redirectUrl,
				},
			});

			return {
				snapToken: snap.token,
				clientKey: env.MIDTRANS_CLIENT_KEY,
				snapJsUrl: snapJsUrl(),
			};
		}),
});
