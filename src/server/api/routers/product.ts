import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { Prisma } from '@/generated/prisma';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import {
	productCategories,
	type Product,
	type ProductCategory,
} from '@/lib/products';

const rupiah = (n: number): string => `Rp ${n.toLocaleString('id-ID')}`;

const productInclude = {
	sizes: { orderBy: { price: 'asc' } },
	designTemplates: true,
	themeColors: true,
	addons: true,
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/**
 * Petakan baris `Product` DB (beserta relasi) ke bentuk `Product` yang dipakai
 * UI publik — `priceLabel` diturunkan dari harga, `specs` dibaca dari kolom Json.
 */
function mapProduct(p: DbProduct): Product {
	return {
		id: p.id,
		slug: p.slug,
		title: p.title,
		shortDescription: p.shortDescription,
		description: p.description,
		price: p.basePrice,
		priceLabel: rupiah(p.basePrice),
		category: p.category as ProductCategory,
		image: p.image,
		images: p.images,
		tags: p.tags,
		sizes: p.sizes.map((s) => ({
			id: s.id,
			label: s.label,
			price: s.price,
			priceLabel: rupiah(s.price),
			note: s.note ?? undefined,
		})),
		designTemplates: p.designTemplates.map((t) => ({
			id: t.id,
			name: t.name,
			image: t.image,
		})),
		themeColors: p.themeColors.map((c) => ({
			id: c.id,
			name: c.name,
			value: c.value,
		})),
		addons: p.addons.map((a) => ({
			id: a.id,
			name: a.name,
			price: a.price,
			priceLabel: rupiah(a.price),
		})),
		productionTime: p.productionTime ?? '',
		serviceAreas: p.serviceAreas,
	};
}

export const productRouter = createTRPCRouter({
	list: publicProcedure
		.input(z.object({ category: z.enum(productCategories).optional() }).optional())
		.query(async ({ ctx, input }) => {
			const rows = await ctx.prisma.product.findMany({
				where: input?.category ? { category: input.category } : undefined,
				include: productInclude,
				orderBy: { createdAt: 'asc' },
			});
			return rows.map(mapProduct);
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const row = await ctx.prisma.product.findUnique({
				where: { slug: input.slug },
				include: productInclude,
			});
			if (!row) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Produk tidak ditemukan',
				});
			}
			return mapProduct(row);
		}),

	related: publicProcedure
		.input(
			z.object({
				slug: z.string().min(1),
				limit: z.number().min(1).max(20).default(3),
			}),
		)
		.query(async ({ ctx, input }) => {
			const current = await ctx.prisma.product.findUnique({
				where: { slug: input.slug },
				select: { category: true },
			});
			if (!current) return [];

			const rows = await ctx.prisma.product.findMany({
				where: { category: current.category, slug: { not: input.slug } },
				include: productInclude,
				orderBy: { createdAt: 'asc' },
				take: input.limit,
			});
			return rows.map(mapProduct);
		}),

	categories: publicProcedure.query(() => productCategories),
});
