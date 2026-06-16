import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

/**
 * Galeri publik — hanya item aktif, terurut `sortOrder` lalu terbaru.
 * CRUD-nya ada di `admin.gallery` (S0.6).
 */
export const galleryRouter = createTRPCRouter({
	list: publicProcedure.query(({ ctx }) =>
		ctx.prisma.galleryItem.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
			select: { id: true, title: true, image: true, category: true },
		}),
	),
});
