import 'server-only';
import type { Prisma, PrismaClient } from '@/generated/prisma';
import { OrderStatus } from '@/generated/prisma';
import {
	computeAvailability,
	computePickupDate,
	type Availability,
	type Period,
} from '@/lib/rental';

/**
 * Klien DB yang diterima: PrismaClient normal ATAU transaction client, supaya
 * helper ini bisa dipakai ulang di dalam `prisma.$transaction` (S2.6).
 */
type Db = PrismaClient | Prisma.TransactionClient;

/** Status pesanan yang dianggap TIDAK aktif (tidak menahan unit). */
const INACTIVE_STATUSES = [OrderStatus.CANCELLED, OrderStatus.COMPLETED];

type CheckSizeAvailabilityParams = {
	productId: string;
	sizeLabel: string;
	installDate: Date;
	rentalDays: number;
};

/**
 * Mengecek ketersediaan satu (produk + ukuran) untuk periode sewa yang diminta
 * (ERD §4). Menghitung `pickupDate`, memuat `unitCount` ukuran (0 bila ukuran
 * tidak ada), memuat OrderItem aktif (status BUKAN CANCELLED/COMPLETED) yang
 * tumpang tindih, lalu mendelegasikan ke {@link computeAvailability} murni.
 *
 * @param db klien Prisma atau transaction client
 * @param params produk, ukuran, tanggal pasang, dan durasi sewa
 */
export const checkSizeAvailability = async (
	db: Db,
	params: CheckSizeAvailabilityParams,
): Promise<Availability> => {
	const { productId, sizeLabel, installDate, rentalDays } = params;
	const pickupDate = computePickupDate(installDate, rentalDays);
	const request: Period = { installDate, pickupDate };

	const [size, activeItems] = await Promise.all([
		db.productSize.findFirst({
			where: { productId, label: sizeLabel },
			select: { unitCount: true },
		}),
		db.orderItem.findMany({
			where: {
				productId,
				sizeLabel,
				order: { status: { notIn: INACTIVE_STATUSES } },
			},
			select: { installDate: true, pickupDate: true },
		}),
	]);

	const unitCount = size?.unitCount ?? 0;
	const existing: Period[] = activeItems.map((item) => ({
		installDate: item.installDate,
		pickupDate: item.pickupDate,
	}));

	return computeAvailability(request, existing, unitCount);
};
