import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';

/** Field aman customer (tanpa `hashedPassword`) + jumlah pesanan. */
const customerSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	role: true,
	isActive: true,
	createdAt: true,
	_count: { select: { orders: true } },
} as const;

/**
 * Manajemen customer (S0.8) — semua `adminProcedure`. Tak pernah mengekspos
 * `hashedPassword`. Admin bisa ubah peran & aktif/nonaktif (kecuali akun sendiri).
 */
export const adminCustomerRouter = createTRPCRouter({
	list: adminProcedure
		.input(
			z.object({
				search: z.string().trim().default(''),
				role: z.enum(['ALL', 'CUSTOMER', 'ADMIN']).default('ALL'),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(50).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { search, role, page, pageSize } = input;
			const where = {
				...(role !== 'ALL' ? { role } : {}),
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: 'insensitive' as const } },
								{ email: { contains: search, mode: 'insensitive' as const } },
								{ phone: { contains: search, mode: 'insensitive' as const } },
							],
						}
					: {}),
			};

			const [rows, total] = await Promise.all([
				ctx.prisma.user.findMany({
					where,
					select: customerSelect,
					orderBy: { createdAt: 'desc' },
					skip: (page - 1) * pageSize,
					take: pageSize,
				}),
				ctx.prisma.user.count({ where }),
			]);

			// Total belanja per user (Σ Order.total, kecuali CANCELLED).
			const spent = rows.length
				? await ctx.prisma.order.groupBy({
						by: ['userId'],
						where: {
							userId: { in: rows.map((r) => r.id) },
							status: { not: 'CANCELLED' },
						},
						_sum: { total: true },
					})
				: [];
			const spentMap = new Map(spent.map((s) => [s.userId, s._sum.total ?? 0]));

			return {
				items: rows.map(({ _count, ...u }) => ({
					...u,
					orderCount: _count.orders,
					totalSpent: spentMap.get(u.id) ?? 0,
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
			const user = await ctx.prisma.user.findUnique({
				where: { id: input.id },
				select: {
					...customerSelect,
					addresses: {
						select: {
							id: true,
							recipientName: true,
							phone: true,
							fullAddress: true,
							city: true,
							province: true,
							isDefault: true,
						},
					},
					orders: {
						select: {
							id: true,
							orderNumber: true,
							status: true,
							total: true,
							createdAt: true,
						},
						orderBy: { createdAt: 'desc' },
						take: 10,
					},
				},
			});
			if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

			const agg = await ctx.prisma.order.aggregate({
				where: { userId: user.id, status: { not: 'CANCELLED' } },
				_sum: { total: true },
			});
			const { _count, ...rest } = user;
			return {
				...rest,
				orderCount: _count.orders,
				totalSpent: agg._sum.total ?? 0,
			};
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string().min(1),
				role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			if (id === ctx.session.user.id) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Tidak dapat mengubah akun sendiri.',
				});
			}
			const { _count, ...updated } = await ctx.prisma.user.update({
				where: { id },
				data,
				select: customerSelect,
			});
			return { ...updated, orderCount: _count.orders };
		}),
});
