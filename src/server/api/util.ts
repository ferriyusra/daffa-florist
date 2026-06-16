import { TRPCError } from '@trpc/server';
import { Prisma } from '@/generated/prisma';

/**
 * Jalankan operasi tulis Prisma; bila melanggar unique constraint (`P2002`),
 * petakan ke `TRPCError CONFLICT` agar UI menampilkannya sebagai bentrok ramah
 * (bukan 500). Menutup celah race (TOCTOU) selain cek manual `findUnique`.
 */
export async function withUniqueConflict<T>(
	op: Promise<T>,
	message: string,
): Promise<T> {
	try {
		return await op;
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === 'P2002'
		) {
			throw new TRPCError({ code: 'CONFLICT', message });
		}
		throw err;
	}
}
