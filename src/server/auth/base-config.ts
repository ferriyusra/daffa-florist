import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import 'next-auth/jwt';

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

/**
 * Konfigurasi auth bersama yang AMAN untuk edge runtime — tanpa Prisma/bcrypt.
 * Hanya berisi strategi sesi + callback (decode JWT → sesi). Provider Credentials
 * yang butuh DB ditambahkan terpisah di config.ts (runtime Node), sehingga
 * middleware (edge) bisa membaca sesi tanpa mem-bundle Prisma.
 */
export const baseAuthConfig = {
	// Di belakang reverse proxy (Caddy/Nginx) host dari header tak sama dengan
	// origin asli — tanpa ini NextAuth v5 menolak request (`UntrustedHost`).
	trustHost: true,
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
} satisfies Omit<NextAuthConfig, 'providers'>;
