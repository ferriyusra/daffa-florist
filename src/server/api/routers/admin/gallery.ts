import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { galleryFields } from '@/lib/gallery-schema';

/** CRUD item galeri (S0.6) — semua `adminProcedure`. */
export const adminGalleryRouter = createTRPCRouter({
	list: adminProcedure.query(({ ctx }) =>
		ctx.prisma.galleryItem.findMany({
			orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
		}),
	),

	getById: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const item = await ctx.prisma.galleryItem.findUnique({
				where: { id: input.id },
			});
			if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
			return item;
		}),

	create: adminProcedure
		.input(galleryFields)
		.mutation(({ ctx, input }) =>
			ctx.prisma.galleryItem.create({ data: input }),
		),

	update: adminProcedure
		.input(galleryFields.extend({ id: z.string().min(1) }))
		.mutation(({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.prisma.galleryItem.update({ where: { id }, data });
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(({ ctx, input }) =>
			ctx.prisma.galleryItem.delete({ where: { id: input.id } }),
		),
});
