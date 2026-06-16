import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { createCaller } from '@/server/api/root';
import { TRPCError } from '@trpc/server';

/**
 * Tes manual `order.createRental` (S2.6) — endpoint anti double-booking.
 * Self-contained & idempotent: membuat user + produk + ukuran (unitCount=1)
 * sementara, memanggil router via `createCaller` dengan ctx yang difabrikasi,
 * lalu menghapus SEMUA baris di `finally`. Jalankan:
 * `tsx --conditions=react-server scripts/test-create-rental.ts`.
 *
 * Basis tanggal: tengah malam UTC (`Date.UTC(...)`) agar batas hari & assertion
 * stabil di semua timezone, sejajar dengan basis domain sewa.
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
	const SIZE_PRICE = 250_000;
	const rentalDays = 3;

	// Hari ini (UTC) + 10 hari → memenuhi lead time (MIN_LEAD_TIME_DAYS).
	const todayMs = Math.floor(Date.now() / DAY) * DAY;
	const install = new Date(todayMs + 10 * DAY);
	const installToday = new Date(todayMs); // untuk uji lead-time reject

	let productId = '';
	let userId = '';
	let otherUserId = '';
	const orderIds: string[] = [];

	try {
		const user = await prisma.user.create({
			data: {
				email: `create-rental-test-${stamp}@daffaflorist.test`,
				name: 'Uji createRental',
				hashedPassword: 'x',
			},
		});
		userId = user.id;

		const product = await prisma.product.create({
			data: {
				slug: `uji-create-rental-${stamp}`,
				title: 'Produk Uji createRental',
				shortDescription: 'uji',
				description: 'uji',
				category: 'papan-bunga',
				basePrice: 999_999, // sengaja beda dari harga ukuran
				image: 'gambar.jpg',
				sizes: {
					create: { label: SIZE_LABEL, price: SIZE_PRICE, unitCount: 1 },
				},
			},
		});
		productId = product.id;

		// Caller dengan ctx yang difabrikasi (session.user = user uji).
		const caller = createCaller({
			session: {
				user: { id: userId, role: 'CUSTOMER' },
				expires: new Date(todayMs + 365 * DAY).toISOString(),
			},
			prisma,
			headers: new Headers(),
		} as Parameters<typeof createCaller>[0]);

		// (a) Happy path — kirim field harga ngawur (tidak ada di skema input,
		// jadi otomatis ditolak zod kalau dipaksa). Buktikan server menurunkan
		// harga dari ukuran, bukan dari klien.
		const order = await caller.order.createRental({
			items: [
				{
					productId,
					sizeLabel: SIZE_LABEL,
					quantity: 1,
					installDate: install,
					rentalDays,
				},
			],
		});
		orderIds.push(order.id);

		assert('happy: status PENDING', order.status === 'PENDING');
		assert(
			'happy: orderNumber non-kosong',
			typeof order.orderNumber === 'string' && order.orderNumber.length > 0,
		);
		assert('happy: tepat 1 item', order.items.length === 1);
		const item = order.items[0]!;
		assert(
			'happy: pickupDate = installDate + rentalDays',
			item.pickupDate.getTime() === install.getTime() + rentalDays * DAY,
		);
		assert(
			'happy: price diturunkan dari harga UKURAN (bukan basePrice)',
			item.price === SIZE_PRICE,
		);
		assert(
			'happy: subtotal & total benar',
			order.subtotal === SIZE_PRICE && order.total === SIZE_PRICE,
		);

		// (b) Lead-time reject — installDate = hari ini (< today+MIN_LEAD_TIME).
		let leadRejected = false;
		let leadCode = '';
		try {
			await caller.order.createRental({
				items: [
					{
						productId,
						sizeLabel: SIZE_LABEL,
						quantity: 1,
						installDate: installToday,
						rentalDays,
					},
				],
			});
		} catch (err) {
			leadRejected = true;
			if (err instanceof TRPCError) leadCode = err.code;
		}
		assert(
			'lead-time: createRental(hari ini) ditolak BAD_REQUEST',
			leadRejected && leadCode === 'BAD_REQUEST',
		);

		// (c) KONKURENSI (AC inti) — unitCount=1, satu periode, DUA permintaan
		// bersamaan untuk produk+ukuran+periode yang SAMA → tepat SATU sukses,
		// satu lagi CONFLICT. Gunakan periode berbeda dari happy path agar tidak
		// tertahan order (a). Bersihkan order yang berhasil di akhir.
		const concInstall = new Date(todayMs + 30 * DAY);
		const callOnce = () =>
			caller.order.createRental({
				items: [
					{
						productId,
						sizeLabel: SIZE_LABEL,
						quantity: 1,
						installDate: concInstall,
						rentalDays,
					},
				],
			});

		const results = await Promise.allSettled([callOnce(), callOnce()]);
		const fulfilled = results.filter((r) => r.status === 'fulfilled');
		const rejected = results.filter((r) => r.status === 'rejected');
		for (const r of fulfilled) {
			if (r.status === 'fulfilled') orderIds.push(r.value.id);
		}

		const conflictRejection =
			rejected.length === 1 &&
			rejected[0]!.status === 'rejected' &&
			(rejected[0] as PromiseRejectedResult).reason instanceof TRPCError &&
			((rejected[0] as PromiseRejectedResult).reason as TRPCError).code ===
				'CONFLICT';

		assert(
			'konkurensi: tepat 1 sukses (unit terakhir)',
			fulfilled.length === 1,
		);
		assert(
			'konkurensi: tepat 1 ditolak CONFLICT (double-booking dicegah)',
			conflictRejection,
		);

		// (d) IDOR — addressId milik user LAIN harus ditolak NOT_FOUND.
		const otherUser = await prisma.user.create({
			data: {
				email: `create-rental-other-${stamp}@daffaflorist.test`,
				name: 'User Lain',
				hashedPassword: 'x',
			},
		});
		otherUserId = otherUser.id;
		const otherAddress = await prisma.address.create({
			data: {
				userId: otherUserId,
				recipientName: 'Orang Lain',
				phone: '08123',
				fullAddress: 'Jalan Lain 1',
				city: 'Kota',
			},
		});
		let idorRejected = false;
		let idorCode = '';
		try {
			const o = await caller.order.createRental({
				addressId: otherAddress.id,
				items: [
					{
						productId,
						sizeLabel: SIZE_LABEL,
						quantity: 1,
						installDate: new Date(todayMs + 50 * DAY),
						rentalDays,
					},
				],
			});
			orderIds.push(o.id); // jangan bocor bila (keliru) berhasil
		} catch (err) {
			idorRejected = true;
			if (err instanceof TRPCError) idorCode = err.code;
		}
		assert(
			'IDOR: addressId milik user lain ditolak NOT_FOUND',
			idorRejected && idorCode === 'NOT_FOUND',
		);

		// (e) Inline address (S2.5) — alamat acara dibuat di dalam transaksi &
		// tertaut ke order. (f) Rollback — createRental yang CONFLICT dgn inline
		// address TIDAK meninggalkan alamat yatim.
		const addrBefore = await prisma.address.count({ where: { userId } });
		const inlineOrder = await caller.order.createRental({
			address: {
				recipientName: 'Acara A',
				phone: '0811',
				fullAddress: 'Jl. Acara 1',
				city: 'Kota',
			},
			items: [
				{
					productId,
					sizeLabel: SIZE_LABEL,
					quantity: 1,
					installDate: new Date(todayMs + 70 * DAY),
					rentalDays,
				},
			],
		});
		orderIds.push(inlineOrder.id);
		assert(
			'inline address: order tertaut alamat acara baru',
			inlineOrder.address?.recipientName === 'Acara A',
		);

		let conflictThrown = false;
		try {
			await caller.order.createRental({
				address: {
					recipientName: 'Yatim',
					phone: '0812',
					fullAddress: 'Jl. Yatim 2',
					city: 'Kota',
				},
				items: [
					{
						productId,
						sizeLabel: SIZE_LABEL,
						quantity: 1,
						installDate: install, // periode penuh (dipesan happy-path)
						rentalDays: 1,
					},
				],
			});
		} catch (err) {
			conflictThrown = err instanceof TRPCError && err.code === 'CONFLICT';
		}
		const addrAfter = await prisma.address.count({ where: { userId } });
		assert(
			'rollback: CONFLICT dgn inline address tak buat alamat yatim',
			conflictThrown && addrAfter === addrBefore + 1,
		);

		console.log('\n── Tes order.createRental anti double-booking (S2.6) ──');
		for (const c of checks) console.log(`  ${c}`);
		const pass = checks.every((c) => c.endsWith('✓'));
		console.log(
			`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — createRental ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
		);
		if (!pass) process.exitCode = 1;
	} finally {
		for (const id of orderIds) {
			await prisma.order.delete({ where: { id } }).catch(() => {});
		}
		if (productId)
			await prisma.product.delete({ where: { id: productId } }).catch(() => {});
		if (userId)
			await prisma.user.delete({ where: { id: userId } }).catch(() => {});
		if (otherUserId)
			await prisma.user.delete({ where: { id: otherUserId } }).catch(() => {});
		await prisma.$disconnect();
	}
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
