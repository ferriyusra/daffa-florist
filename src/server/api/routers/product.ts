import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import {
	products,
	productCategories,
	getProductBySlug,
	getRelatedProducts,
} from '@/lib/products';

export const productRouter = createTRPCRouter({
	list: publicProcedure
		.input(
			z
				.object({
					category: z.enum(productCategories).optional(),
				})
				.optional(),
		)
		.query(({ input }) => {
			if (!input?.category) return products;
			return products.filter((p) => p.category === input.category);
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string().min(1) }))
		.query(({ input }) => {
			const product = getProductBySlug(input.slug);
			if (!product) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Produk tidak ditemukan',
				});
			}
			return product;
		}),

	related: publicProcedure
		.input(z.object({ slug: z.string().min(1), limit: z.number().min(1).max(20).default(3) }))
		.query(({ input }) => getRelatedProducts(input.slug, input.limit)),

	categories: publicProcedure.query(() => productCategories),
});
