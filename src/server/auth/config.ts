import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

type AppUserRole = 'CUSTOMER' | 'ADMIN';

declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: AppUserRole;
		} & DefaultSession['user'];
	}

	interface User {
		role: AppUserRole;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		role: AppUserRole;
	}
}

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const authConfig = {
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
				if (!user) return null;

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
	session: { strategy: 'jwt' },
	pages: { signIn: '/login' },
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				if (user.id) token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.role = token.role;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
