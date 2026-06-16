import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { withUniqueConflict } from '../../util';
import { productFields } from '@/lib/product-schema';

const productInclude = {
	sizes: { orderBy: { price: 'asc' } },
	designTemplates: true,
	themeColors: true,
	addons: true,
} as const;

export const adminProductRouter = createTRPCRouter({
	list: adminProcedure.query(({ ctx }) =>
		ctx.prisma.product.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				_count: {
					select: {
						sizes: true,
						designTemplates: true,
						themeColors: true,
						addons: true,
					},
				},
			},
		}),
	),

	getById: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.findUnique({
				where: { id: input.id },
				include: productInclude,
			});
			if (!product) throw new TRPCError({ code: 'NOT_FOUND' });
			return product;
		}),

	create: adminProcedure
		.input(productFields)
		.mutation(async ({ ctx, input }) => {
			const exists = await ctx.prisma.product.findUnique({
				where: { slug: input.slug },
				select: { id: true },
			});
			if (exists) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Slug sudah dipakai produk lain.',
				});
			}

			const { sizes, ...rest } = input;
			return withUniqueConflict(
				ctx.prisma.product.create({
					data: { ...rest, sizes: { create: sizes } },
					include: productInclude,
				}),
				'Slug sudah dipakai produk lain.',
			);
		}),

	update: adminProcedure
		.input(productFields.extend({ id: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const { id, sizes, ...scalar } = input;

			const clash = await ctx.prisma.product.findFirst({
				where: { slug: input.slug, id: { not: id } },
				select: { id: true },
			});
			if (clash) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Slug sudah dipakai produk lain.',
				});
			}

			// Ganti ukuran secara menyeluruh (hapus lama, buat baru). Aman karena
			// OrderItem menyimpan sizeLabel sebagai snapshot string, bukan FK.
			return withUniqueConflict(
				ctx.prisma.product.update({
					where: { id },
					data: { ...scalar, sizes: { deleteMany: {}, create: sizes } },
					include: productInclude,
				}),
				'Slug sudah dipakai produk lain.',
			);
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(({ ctx, input }) =>
			ctx.prisma.product.delete({ where: { id: input.id } }),
		),
});
