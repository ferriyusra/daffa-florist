import { auth } from '@/server/auth';
import { prisma } from '@/lib/prisma';

/**
 * Membangun konteks tRPC per-request: `{ session, prisma, headers }`.
 *
 * Sengaja DIPISAH dari [trpc.ts](./trpc.ts): hanya entrypoint nyata (route
 * handler HTTP + RSC caller di `@/trpc/server`) yang memuatnya. Dengan begitu
 * graf impor `appRouter`/`createCaller` TIDAK menarik `@/server/auth`
 * (NextAuth → `next/navigation`, modul sisi klien) — penting agar router bisa
 * diimpor di lingkungan server-only murni (mis. test caller).
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
	const session = await auth();
	return {
		session,
		prisma,
		...opts,
	};
};
