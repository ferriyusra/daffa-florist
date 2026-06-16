import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		// Connection pooling (driver adapter `pg`). Opsional — punya default wajar;
		// override lewat env saat scaling atau di belakang pooler eksternal
		// (mis. PgBouncer/Supabase → set DATABASE_POOL_MAX kecil).
		DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
		DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce
			.number()
			.int()
			.nonnegative()
			.default(10_000),
		DATABASE_POOL_CONNECTION_TIMEOUT_MS: z.coerce
			.number()
			.int()
			.nonnegative()
			.default(10_000),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		NEXTAUTH_SECRET:
			process.env.NODE_ENV === 'production'
				? z.string().min(1)
				: z.string().min(1).optional(),
		NEXTAUTH_URL: z.string().url().optional(),
		// Midtrans Snap. API_URL membedakan sandbox vs produksi
		// (mis. https://api.sandbox.midtrans.com). CLIENT_KEY non-rahasia —
		// diteruskan ke browser lewat respons tRPC untuk memuat snap.js.
		MIDTRANS_API_URL: z.string().url(),
		MIDTRANS_CLIENT_KEY: z.string().min(1),
		MIDTRANS_SERVER_KEY: z.string().min(1),
	},
	client: {},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
		DATABASE_POOL_IDLE_TIMEOUT_MS: process.env.DATABASE_POOL_IDLE_TIMEOUT_MS,
		DATABASE_POOL_CONNECTION_TIMEOUT_MS:
			process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
		NODE_ENV: process.env.NODE_ENV,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		MIDTRANS_API_URL: process.env.MIDTRANS_API_URL,
		MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
		MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
	},
	emptyStringAsUndefined: true,
});
