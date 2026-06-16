import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/env';
import { DATABASE_POOL, IS_DEVELOPMENT } from './constant';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createPrismaClient() {
	// `PrismaPg` menerima `pg.PoolConfig`, jadi connection string + tuning pool
	// (max/idle/connection timeout) diteruskan dalam satu objek. Pool dibuat sekali
	// dan dipakai ulang via singleton global di bawah (hindari kehabisan koneksi
	// saat hot-reload dev).
	const adapter = new PrismaPg({
		connectionString: env.DATABASE_URL,
		...DATABASE_POOL,
	});
	return new PrismaClient({
		adapter,
		log: IS_DEVELOPMENT ? ['query', 'error', 'warn'] : ['error'],
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (IS_DEVELOPMENT) globalForPrisma.prisma = prisma;
