import { env } from '@/env';

export const DATABASE_URL = env.DATABASE_URL;
export const NODE_ENV = env.NODE_ENV;

export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

/**
 * Jeda (buffer) bongkar/pasang antar sewa, dalam hari. Periode sewa yang ada
 * "diperlebar" sebesar nilai ini pada kedua ujungnya saat cek ketersediaan,
 * supaya ada waktu pembongkaran unit lama dan pemasangan unit baru (ERD §4).
 */
export const RENTAL_BUFFER_DAYS = 1;

/**
 * Lead time minimal pemesanan, dalam hari (minimal H-1). Tanggal pasang yang
 * diminta tidak boleh lebih cepat dari `hari ini + MIN_LEAD_TIME_DAYS`.
 * Dipakai pada validasi pembuatan sewa (S2.6).
 */
export const MIN_LEAD_TIME_DAYS = 1;
