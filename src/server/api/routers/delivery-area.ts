import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

/**
 * Zona pengiriman publik untuk pemilihan ongkir saat checkout (S4.3) — hanya
 * zona aktif, hanya field yang dibutuhkan klien (tarif otoritatif dari DB).
 */
export const deliveryAreaRouter = createTRPCRouter({
	list: publicProcedure.query(({ ctx }) =>
		ctx.prisma.deliveryArea.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' },
			select: { id: true, name: true, district: true, shippingCost: true },
		}),
	),
});
