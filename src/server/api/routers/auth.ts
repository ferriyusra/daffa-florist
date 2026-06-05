import { hash } from 'bcryptjs';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { registerFields } from '@/lib/auth-schema';

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(registerFields)
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
