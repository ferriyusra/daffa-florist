import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { checkSizeAvailability, getBookedDates } from '@/server/rental';
import { computeBookedDates, MAX_BOOKED_RANGE_DAYS } from '@/lib/rental';

/**
 * Tes manual ketersediaan sewa DB-backed (S2.2) — `checkSizeAvailability` &
 * `getBookedDates`. Self-contained & idempotent: membuat produk + ukuran
 * (unitCount=2) + user/order/orderItem sementara untuk mengisi periode, lalu
 * menghapus semuanya di `finally`. Jalankan:
 * `tsx scripts/test-rental-booked-dates.ts`.
 *
 * Basis tanggal: SEMUA tanggal uji dibangun pada tengah malam UTC
 * (`Date.UTC(...)`) — sejajar dengan basis epoch-ms yang dipakai helper murni —
 * supaya batas hari (dan assertion) stabil di semua timezone.
 */

const DAY = 86_400_000;
/** Tanggal pada 00:00:00 UTC. */
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

const checks: string[] = [];
const assert = (label: string, ok: boolean) => {
	checks.push(`${label}: ${ok ? '✓' : '✗'}`);
};

async function main() {
	const stamp = Date.now();
	const SIZE_LABEL = 'Sedang';
	const UNIT_COUNT = 2;
	const rentalDays = 2; // pickup = install + 2 hari

	// Dua booking yang sama-sama menempati 10 Jun 2026 → kedua unit terpakai
	// pada hari itu (PENUH). pickup = 12 Jun.
	const install = utc(2026, 5, 10);
	const pickup = new Date(install.getTime() + rentalDays * DAY);

	let productId = '';
	let userId = '';
	let orderId = '';

	try {
		const user = await prisma.user.create({
			data: {
				email: `rental-test-${stamp}@daffaflorist.test`,
				name: 'Uji Sewa',
				hashedPassword: 'x',
			},
		});
		userId = user.id;

		const product = await prisma.product.create({
			data: {
				slug: `uji-sewa-${stamp}`,
				title: 'Produk Uji Sewa',
				shortDescription: 'uji',
				description: 'uji',
				category: 'papan-bunga',
				basePrice: 100_000,
				image: 'x',
				sizes: {
					create: { label: SIZE_LABEL, price: 100_000, unitCount: UNIT_COUNT },
				},
			},
		});
		productId = product.id;

		const itemBase = {
			productId,
			productSlug: product.slug,
			productTitle: product.title,
			productImage: 'x',
			sizeLabel: SIZE_LABEL,
			price: 100_000,
			quantity: 1,
			installDate: install,
			rentalDays,
			pickupDate: pickup,
		};
		const order = await prisma.order.create({
			data: {
				orderNumber: `UJI-${stamp}`,
				userId,
				status: 'CONFIRMED', // aktif (bukan CANCELLED/COMPLETED)
				subtotal: 200_000,
				total: 200_000,
				items: { create: [{ ...itemBase }, { ...itemBase }] },
			},
		});
		orderId = order.id;

		// (a) Periode penuh (kedua unit terpakai 10 Jun) → tidak tersedia.
		const fullAvail = await checkSizeAvailability(prisma, {
			productId,
			sizeLabel: SIZE_LABEL,
			installDate: utc(2026, 5, 10),
			rentalDays: 1,
		});
		assert(
			'checkSizeAvailability penuh → available:false, remainingUnits:0',
			fullAvail.available === false && fullAvail.remainingUnits === 0,
		);
		assert(
			'pickupDate = installDate + rentalDays (11 Jun)',
			fullAvail.pickupDate.getTime() === utc(2026, 5, 11).getTime(),
		);

		// Periode bebas jauh hari (di luar buffer) → tersedia penuh.
		const freeAvail = await checkSizeAvailability(prisma, {
			productId,
			sizeLabel: SIZE_LABEL,
			installDate: utc(2026, 6, 1), // 1 Jul 2026
			rentalDays: 1,
		});
		assert(
			'checkSizeAvailability bebas → available:true, remainingUnits=unitCount',
			freeAvail.available === true && freeAvail.remainingUnits === UNIT_COUNT,
		);

		// (b) getBookedDates untuk Juni 2026.
		const booked = await getBookedDates(prisma, {
			productId,
			sizeLabel: SIZE_LABEL,
			from: utc(2026, 5, 1),
			to: utc(2026, 5, 30),
		});
		const bookedMs = new Set(booked.map((dt) => dt.getTime()));
		assert(
			'getBookedDates memuat hari penuh (11 Jun)',
			bookedMs.has(utc(2026, 5, 11).getTime()),
		);
		assert(
			'getBookedDates TIDAK memuat hari bebas (25 Jun)',
			!bookedMs.has(utc(2026, 5, 25).getTime()),
		);

		// (c) Rentang > MAX_BOOKED_RANGE_DAYS → gagal KERAS (RangeError),
		// bukan dipotong diam-diam.
		let threw = false;
		try {
			computeBookedDates(
				[],
				1,
				utc(2026, 0, 1),
				utc(2026, 0, 1 + MAX_BOOKED_RANGE_DAYS), // span = MAX + 1 hari
			);
		} catch (e) {
			threw = e instanceof RangeError;
		}
		assert(
			`computeBookedDates melempar RangeError bila rentang > ${MAX_BOOKED_RANGE_DAYS} hari`,
			threw,
		);

		console.log('\n── Tes ketersediaan sewa DB-backed (S2.2) ──');
		for (const c of checks) console.log(`  ${c}`);
		const pass = checks.every((c) => c.endsWith('✓'));
		console.log(
			`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — ketersediaan sewa ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
		);
		if (!pass) process.exitCode = 1;
	} finally {
		// Bersihkan (orderItem ikut terhapus via cascade onDelete order).
		if (orderId) await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
		if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => {});
		if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
		await prisma.$disconnect();
	}
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
