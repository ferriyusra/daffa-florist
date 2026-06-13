import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { OrderStatus } from '@/generated/prisma';

/**
 * Manajemen stok unit per (produk + ukuran) — S3.5 pendekatan a. Stok disimpan
 * sebagai `ProductSize.unitCount` (TANPA model `ProductUnit` terpisah, TANPA
 * migrasi baru). Admin mengatur jumlah unit fisik yang tersedia per ukuran;
 * pengecekan ketersediaan per-tanggal tetap ditangani `src/server/rental.ts`.
 */

/**
 * Status pesanan yang TIDAK menahan unit (selaras dengan `INACTIVE_STATUSES` di
 * `src/server/rental.ts`). Pesanan aktif = status BUKAN salah satu dari ini.
 */
const INACTIVE_STATUSES = [OrderStatus.CANCELLED, OrderStatus.COMPLETED];

export const adminUnitRouter = createTRPCRouter({
	/**
	 * Daftar produk + ukuran beserta `inUse` per ukuran. `inUse` = total unit yang
	 * sedang tersewa di pesanan aktif (lintas tanggal), BUKAN ketersediaan
	 * per-tanggal. Dipakai admin sebagai pagar bawah saat mengatur stok.
	 */
	list: adminProcedure.query(async ({ ctx }) => {
		const [products, usage] = await Promise.all([
			ctx.prisma.product.findMany({
				orderBy: { title: 'asc' },
				select: {
					id: true,
					title: true,
					slug: true,
					category: true,
					sizes: {
						orderBy: { price: 'asc' },
						select: { id: true, label: true, price: true, unitCount: true },
					},
				},
			}),
			ctx.prisma.orderItem.groupBy({
				by: ['productId', 'sizeLabel'],
				where: {
					order: { status: { notIn: INACTIVE_STATUSES } },
					productId: { not: null },
				},
				_sum: { quantity: true },
			}),
		]);

		// Map `${productId}::${sizeLabel}` → total quantity aktif.
		const usageMap = new Map<string, number>();
		for (const row of usage) {
			if (!row.productId || row.sizeLabel === null) continue;
			usageMap.set(
				`${row.productId}::${row.sizeLabel}`,
				row._sum.quantity ?? 0,
			);
		}

		return {
			products: products.map((product) => ({
				id: product.id,
				title: product.title,
				slug: product.slug,
				category: product.category,
				sizes: product.sizes.map((size) => ({
					id: size.id,
					label: size.label,
					price: size.price,
					unitCount: size.unitCount,
					inUse: usageMap.get(`${product.id}::${size.label}`) ?? 0,
				})),
			})),
		};
	}),

	/** Set jumlah unit fisik untuk satu ukuran (0–999). */
	setUnitCount: adminProcedure
		.input(
			z.object({
				sizeId: z.string().min(1),
				unitCount: z.coerce.number().int().min(0).max(999),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const size = await ctx.prisma.productSize.findUnique({
				where: { id: input.sizeId },
				select: { id: true },
			});
			if (!size) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Ukuran tidak ditemukan.',
				});
			}

			return ctx.prisma.productSize.update({
				where: { id: input.sizeId },
				data: { unitCount: input.unitCount },
				select: { id: true, unitCount: true },
			});
		}),
});
