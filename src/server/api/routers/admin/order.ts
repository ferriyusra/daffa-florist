import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import {
	ORDER_STATUSES,
	ORDER_STATUS_LABEL,
	canTransition,
} from '@/lib/order-status';

/** Semua status sewa (ERD §4) + sentinel `ALL` untuk filter. */
const statusFilter = z.enum([
	'ALL',
	'PENDING',
	'CONFIRMED',
	'SCHEDULED',
	'INSTALLED',
	'PICKED_UP',
	'RETURNED',
	'COMPLETED',
	'CANCELLED',
]);

/**
 * Manajemen pesanan (S3.1/S3.2) — semua `adminProcedure`. Admin melihat SEMUA
 * pesanan lintas pengguna (tidak difilter per-user, berbeda dari `order.listMine`).
 */
export const adminOrderRouter = createTRPCRouter({
	list: adminProcedure
		.input(
			z.object({
				search: z.string().trim().default(''),
				status: statusFilter.default('ALL'),
				category: z.string().trim().optional(),
				dateFrom: z.coerce.date().optional(),
				dateTo: z.coerce.date().optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { search, status, category, dateFrom, dateTo, page, pageSize } =
				input;

			// Rentang createdAt. Klien mengirim instant presisi (awal/akhir hari di
			// zona bisnis WIB), jadi dipakai apa adanya — tak ada penyetelan UTC di
			// sini yang bisa menggeser batas hari admin.
			const createdAt =
				dateFrom || dateTo
					? {
							...(dateFrom ? { gte: dateFrom } : {}),
							...(dateTo ? { lte: dateTo } : {}),
						}
					: undefined;

			const where = {
				...(status !== 'ALL' ? { status } : {}),
				...(createdAt ? { createdAt } : {}),
				...(category
					? { items: { some: { product: { category } } } }
					: {}),
				...(search
					? {
							OR: [
								{
									orderNumber: {
										contains: search,
										mode: 'insensitive' as const,
									},
								},
								{
									user: {
										name: {
											contains: search,
											mode: 'insensitive' as const,
										},
									},
								},
								{
									user: {
										email: {
											contains: search,
											mode: 'insensitive' as const,
										},
									},
								},
							],
						}
					: {}),
			};

			const [rows, total] = await Promise.all([
				ctx.prisma.order.findMany({
					where,
					select: {
						id: true,
						orderNumber: true,
						status: true,
						total: true,
						createdAt: true,
						eventDate: true,
						user: { select: { name: true, email: true } },
						_count: { select: { items: true } },
						items: {
							select: { productTitle: true },
							orderBy: { id: 'asc' },
							take: 1,
						},
					},
					orderBy: { createdAt: 'desc' },
					skip: (page - 1) * pageSize,
					take: pageSize,
				}),
				ctx.prisma.order.count({ where }),
			]);

			return {
				items: rows.map((o) => ({
					id: o.id,
					orderNumber: o.orderNumber,
					status: o.status,
					total: o.total,
					createdAt: o.createdAt,
					eventDate: o.eventDate,
					itemCount: o._count.items,
					firstProductTitle: o.items[0]?.productTitle ?? null,
					customerName: o.user.name ?? o.user.email,
					customerEmail: o.user.email,
				})),
				total,
				page,
				pageSize,
				totalPages: Math.max(1, Math.ceil(total / pageSize)),
			};
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					orderNumber: true,
					status: true,
					subtotal: true,
					shippingCost: true,
					discount: true,
					total: true,
					eventDate: true,
					notes: true,
					createdAt: true,
					user: { select: { name: true, email: true, phone: true } },
					address: {
						select: {
							recipientName: true,
							phone: true,
							fullAddress: true,
							city: true,
							province: true,
						},
					},
					items: {
						select: {
							id: true,
							productSlug: true,
							productTitle: true,
							productImage: true,
							sizeLabel: true,
							price: true,
							quantity: true,
							designTemplateName: true,
							themeColorName: true,
							addonNames: true,
							installDate: true,
							rentalDays: true,
							pickupDate: true,
						},
						orderBy: { id: 'asc' },
					},
				},
			});
			if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
			return order;
		}),

	/**
	 * Mengubah status pesanan dengan memvalidasi transisi (ERD §2). Transisi
	 * divalidasi di server — tak mempercayai klien — memakai peta bersama
	 * `@/lib/order-status`. CANCELLED/COMPLETED sudah dianggap tidak aktif oleh
	 * `checkSizeAvailability` (unit otomatis bebas), jadi tak perlu kerja ekstra.
	 *
	 * TODO: catat riwayat perubahan (OrderStatusHistory) bila modelnya sudah ada
	 * (direncanakan di ERD, belum diimplementasikan).
	 */
	updateStatus: adminProcedure
		.input(
			z.object({ id: z.string().min(1), status: z.enum(ORDER_STATUSES) }),
		)
		.mutation(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findUnique({
				where: { id: input.id },
				select: { id: true, status: true },
			});
			if (!order) throw new TRPCError({ code: 'NOT_FOUND' });

			if (!canTransition(order.status, input.status)) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Transisi status tidak valid: ${ORDER_STATUS_LABEL[order.status]} → ${ORDER_STATUS_LABEL[input.status]}.`,
				});
			}

			// Compare-and-swap: tulis hanya bila status masih sama dengan yang
			// divalidasi → cegah race dua admin (last-write tak menimpa diam-diam).
			const res = await ctx.prisma.order.updateMany({
				where: { id: input.id, status: order.status },
				data: { status: input.status },
			});
			if (res.count === 0) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Status pesanan sudah berubah. Muat ulang halaman.',
				});
			}
			return { id: input.id, status: input.status };
		}),
});
