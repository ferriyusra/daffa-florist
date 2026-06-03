import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/env';
import { IS_DEVELOPMENT } from './constant';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createPrismaClient() {
	const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
	return new PrismaClient({
		adapter,
		log: IS_DEVELOPMENT ? ['query', 'error', 'warn'] : ['error'],
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (IS_DEVELOPMENT) globalForPrisma.prisma = prisma;
