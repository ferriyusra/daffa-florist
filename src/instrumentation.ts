/**
 * Instrumentation Next.js — memuat next-logger (pino) di runtime Node agar log
 * internal Next.js & `console.*` menjadi JSON terstruktur. Hanya runtime Node
 * (bukan edge/proxy), karena pino memakai API Node.
 */
export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('pino');
		await import('next-logger');
	}
}
