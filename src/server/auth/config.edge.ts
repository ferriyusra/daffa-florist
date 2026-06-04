import { type NextAuthConfig } from 'next-auth';

import { baseAuthConfig } from './base-config';

/**
 * Konfigurasi edge-safe untuk middleware: hanya decode sesi JWT (providers kosong,
 * tanpa Prisma). Verifikasi kredensial penuh dilakukan oleh config.ts di runtime Node.
 */
export const authConfigEdge = {
	...baseAuthConfig,
	providers: [],
} satisfies NextAuthConfig;
