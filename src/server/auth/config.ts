import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { baseAuthConfig } from './base-config';

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const authConfig = {
	...baseAuthConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			authorize: async (credentials) => {
				const parsed = credentialsSchema.safeParse(credentials);
				if (!parsed.success) return null;

				const user = await prisma.user.findUnique({
					where: { email: parsed.data.email },
				});
				// Akun nonaktif / tanpa hash (mis. akun non-kredensial) tak bisa login.
			if (!user || !user.isActive || !user.hashedPassword) return null;

				const valid = await compare(
					parsed.data.password,
					user.hashedPassword,
				);
				if (!valid) return null;

				return {
					id: user.id,
					email: user.email,
					name: user.name ?? null,
					role: user.role,
				};
			},
		}),
	],
} satisfies NextAuthConfig;
