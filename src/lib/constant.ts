import { env } from '@/env';

export const DATABASE_URL = env.DATABASE_URL;
export const NODE_ENV = env.NODE_ENV;

/**
 * Konfigurasi connection pool untuk driver adapter `pg` (lihat
 * [prisma.ts](./prisma.ts)). Diteruskan apa adanya sebagai `pg.PoolConfig`.
 * - `max`: maksimum koneksi serentak dalam pool.
 * - `idleTimeoutMillis`: tutup koneksi idle setelah sekian ms.
 * - `connectionTimeoutMillis`: gagal-cepat bila tak dapat koneksi dalam sekian ms.
 */
export const DATABASE_POOL = {
	max: env.DATABASE_POOL_MAX,
	idleTimeoutMillis: env.DATABASE_POOL_IDLE_TIMEOUT_MS,
	connectionTimeoutMillis: env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
} as const;

export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

/**
 * Re-export konstanta sewa dari sumber tunggal yang isomorfik (`./rental-config`)
 * demi back-compat — modul ini sendiri TIDAK aman untuk klien (membaca `@/env`),
 * jadi kode client harus mengimpor langsung dari `@/lib/rental-config`.
 */
export { RENTAL_BUFFER_DAYS, MIN_LEAD_TIME_DAYS } from './rental-config';
