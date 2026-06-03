import { z } from 'zod';
import { hash } from 'bcryptjs';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Nama wajib diisi'),
				email: z.string().email('Format email tidak valid'),
				phone: z.string().min(8).optional(),
				password: z.string().min(6, 'Password minimal 6 karakter'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.prisma.user.findUnique({
				where: { email: input.email },
			});
			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Email sudah terdaftar.',
				});
			}
			const hashedPassword = await hash(input.password, 10);
			const user = await ctx.prisma.user.create({
				data: {
					name: input.name,
					email: input.email,
					phone: input.phone,
					hashedPassword,
				},
				select: { id: true, name: true, email: true },
			});
			return user;
		}),
});
