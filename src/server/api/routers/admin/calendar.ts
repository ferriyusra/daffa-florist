import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { ORDER_STATUSES } from '@/lib/order-status';

/** Rentang maksimum yang boleh diminta (bulan + minggu overflow = ≤ 42 hari). */
const MAX_SPAN_DAYS = 62;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Status sewa + sentinel `ALL`. */
const statusFilter = z.enum(['ALL', ...ORDER_STATUSES]);

/**
 * Kalender operasional admin (S3.4) — `adminProcedure`. Memuat `OrderItem`
 * berdasarkan tanggal pasang (installDate) ATAU bongkar (pickupDate) yang jatuh
 * dalam rentang [from, to) yang diminta, lalu meng-EXPAND tiap item menjadi 0–2
 * event datar (pasang dan/atau bongkar) — satu query, ekspansi di memori (tanpa
 * N+1). Tanggal disimpan sebagai tengah-malam UTC (date-only); rentang dibatasi
 * server-side agar query tetap ringan.
 */
export const adminCalendarRouter = createTRPCRouter({
	events: adminProcedure
		.input(
			z.object({
				from: z.coerce.date(),
				to: z.coerce.date(),
				status: statusFilter.default('ALL'),
				category: z.string().trim().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { from, to, status, category } = input;

			// Validasi rentang: `to` harus > `from`, dan span ≤ 62 hari.
			if (to.getTime() <= from.getTime()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Rentang tanggal tidak valid (to harus setelah from).',
				});
			}
			const spanDays = (to.getTime() - from.getTime()) / DAY_MS;
			if (spanDays > MAX_SPAN_DAYS) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Rentang terlalu lebar (maks ${MAX_SPAN_DAYS} hari).`,
				});
			}

			// Item yang punya pasang ATAU bongkar di dalam [from, to). Filter status
			// pada relasi order (skip bila ALL — termasuk CANCELLED, agar admin tetap
			// bisa melihat jadwal yang dibatalkan; CANCELLED tetap difilter eksplisit).
			const items = await ctx.prisma.orderItem.findMany({
				where: {
					OR: [
						{ installDate: { gte: from, lt: to } },
						{ pickupDate: { gte: from, lt: to } },
					],
					...(status !== 'ALL' ? { order: { status } } : {}),
					...(category ? { product: { category } } : {}),
				},
				select: {
					id: true,
					installDate: true,
					pickupDate: true,
					sizeLabel: true,
					productTitle: true,
					order: {
						select: {
							id: true,
							orderNumber: true,
							status: true,
							user: { select: { name: true, email: true } },
						},
					},
				},
			});

			// Ekspansi datar: satu event `install` bila installDate ∈ [from,to), satu
			// event `pickup` bila pickupDate ∈ [from,to). Sebuah item bisa kontribusi
			// 1 atau 2 event (atau, secara teori, 0 bila kedua tanggal di luar — tapi
			// query menjamin minimal satu tanggal di dalam rentang).
			const inRange = (d: Date) =>
				d.getTime() >= from.getTime() && d.getTime() < to.getTime();

			const events = items.flatMap((item) => {
				const customerName = item.order.user.name ?? item.order.user.email;
				const base = {
					orderId: item.order.id,
					orderNumber: item.order.orderNumber,
					customerName,
					productTitle: item.productTitle,
					sizeLabel: item.sizeLabel,
					status: item.order.status,
				};
				const out: Array<
					{ id: string; type: 'install' | 'pickup'; date: Date } & typeof base
				> = [];
				if (inRange(item.installDate)) {
					out.push({
						id: `${item.id}-install`,
						type: 'install',
						date: item.installDate,
						...base,
					});
				}
				if (inRange(item.pickupDate)) {
					out.push({
						id: `${item.id}-pickup`,
						type: 'pickup',
						date: item.pickupDate,
						...base,
					});
				}
				return out;
			});

			return { events };
		}),
});
