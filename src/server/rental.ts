import 'server-only';
import type { Prisma, PrismaClient } from '@/generated/prisma';
import { OrderStatus } from '@/generated/prisma';
import {
	addDays,
	computeAvailability,
	computeBookedDates,
	computePickupDate,
	type Availability,
	type Period,
} from '@/lib/rental';
import { RENTAL_BUFFER_DAYS } from '@/lib/rental-config';

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
				// Buang booking yang sudah selesai sebelum window permintaan (tak
				// mungkin menabrak request maupun kandidat nextAvailableDate yang
				// selalu >= installDate). Upper-bound SENGAJA dibiarkan terbuka:
				// nextAvailableDate butuh melihat booking masa depan.
				pickupDate: { gte: addDays(installDate, -RENTAL_BUFFER_DAYS) },
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

type GetBookedDatesParams = {
	productId: string;
	sizeLabel: string;
	from: Date;
	to: Date;
};

/**
 * Mengembalikan daftar hari kalender PENUH untuk satu (produk + ukuran) dalam
 * rentang `[from, to]` (untuk menonaktifkan tanggal di kalender UI, S2.2). Memuat
 * `unitCount` ukuran (0 bila ukuran tidak ada) + OrderItem aktif (status BUKAN
 * CANCELLED/COMPLETED), memetakannya ke `Period[]`, lalu mendelegasikan ke
 * {@link computeBookedDates} yang murni.
 *
 * Catatan: hari yang dikembalikan adalah hari di mana sewa 1 hari pun tak muat
 * (penuh). Sebuah hari yang TIDAK di sini tetap bisa ditolak `checkAvailability`
 * bila ekor periode multi-hari menabrak booking lain — UI tetap wajib memanggil
 * `checkAvailability` saat tanggal dipilih.
 *
 * @param db klien Prisma atau transaction client
 * @param params produk, ukuran, dan rentang tanggal inklusif
 */
export const getBookedDates = async (
	db: Db,
	params: GetBookedDatesParams,
): Promise<Date[]> => {
	const { productId, sizeLabel, from, to } = params;

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
				// Hanya booking yang periode (diperlebar buffer) bisa menyentuh
				// window [from, to]. Kedua sisi aman dibatasi: getBookedDates tak
				// melakukan pencarian maju seperti nextAvailableDate.
				installDate: { lte: addDays(to, RENTAL_BUFFER_DAYS) },
				pickupDate: { gte: addDays(from, -RENTAL_BUFFER_DAYS) },
			},
			select: { installDate: true, pickupDate: true },
		}),
	]);

	const unitCount = size?.unitCount ?? 0;
	const existing: Period[] = activeItems.map((item) => ({
		installDate: item.installDate,
		pickupDate: item.pickupDate,
	}));

	return computeBookedDates(existing, unitCount, from, to);
};
