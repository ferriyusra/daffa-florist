import { RENTAL_BUFFER_DAYS } from './constant';

/**
 * Helper logika ketersediaan sewa — MURNI (pure) & bebas framework (tanpa
 * Prisma / I/O). Semua fungsi deterministik: tidak memanggil `Date.now()`
 * atau `new Date()` tanpa argumen, dan tidak memutasi parameter. Lihat ERD §4
 * "Inti Logika Sewa".
 */

export const MS_PER_DAY = 86_400_000;

/**
 * Menambahkan `days` hari ke sebuah tanggal dan mengembalikan Date BARU
 * (immutable, granularitas hari). Nilai `days` boleh negatif untuk mundur.
 *
 * @param date tanggal acuan (tidak dimutasi)
 * @param days jumlah hari yang ditambahkan
 */
export const addDays = (date: Date, days: number): Date =>
	new Date(date.getTime() + days * MS_PER_DAY);

/**
 * Membulatkan sebuah tanggal ke TENGAH MALAM UTC (00:00:00.000Z) pada hari
 * kalendernya — membuang komponen jam. Dipakai di batas API agar domain sewa
 * yang bersifat date-only tidak bergeser hari akibat komponen waktu yang
 * dikirim klien, dan agar langkah harian {@link computeBookedDates} jatuh tepat
 * pada batas hari.
 *
 * @param date tanggal acuan (tidak dimutasi)
 */
export const floorToUtcDay = (date: Date): Date =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * Menghitung tanggal bongkar (pickup) dari tanggal pasang dan durasi sewa.
 * `pickupDate = installDate + rentalDays` (ERD §4).
 *
 * @param installDate tanggal pasang
 * @param rentalDays durasi sewa dalam hari
 */
export const computePickupDate = (installDate: Date, rentalDays: number): Date =>
	addDays(installDate, rentalDays);

/**
 * Mengecek apakah dua rentang tanggal tumpang tindih dengan batas inklusif
 * (ERD §4): `aStart <= bEnd` DAN `aEnd >= bStart`. Rentang yang hanya
 * bersentuhan di ujung (mis. aEnd === bStart) dianggap tumpang tindih.
 */
export const rangesOverlap = (
	aStart: Date,
	aEnd: Date,
	bStart: Date,
	bEnd: Date,
): boolean => aStart.getTime() <= bEnd.getTime() && aEnd.getTime() >= bStart.getTime();

/** Periode tampil sebuah item sewa: `[installDate, pickupDate]`. */
export type Period = { installDate: Date; pickupDate: Date };

/**
 * Apakah sebuah booking yang sudah ada menghalangi periode yang diminta.
 * Booking yang ada diperlebar `bufferDays` hari pada kedua ujungnya (jeda
 * bongkar/pasang) lalu diuji tumpang tindih dengan periode permintaan.
 *
 * @param request periode yang diminta
 * @param existing periode booking yang sudah ada
 * @param bufferDays jeda hari (default {@link RENTAL_BUFFER_DAYS})
 */
export const blocksPeriod = (
	request: Period,
	existing: Period,
	bufferDays: number = RENTAL_BUFFER_DAYS,
): boolean =>
	rangesOverlap(
		request.installDate,
		request.pickupDate,
		addDays(existing.installDate, -bufferDays),
		addDays(existing.pickupDate, bufferDays),
	);

/**
 * Menghitung berapa banyak booking yang ada yang menghalangi periode diminta
 * (masing-masing diperlebar buffer). Hasilnya = jumlah unit yang terpakai
 * pada periode tersebut.
 *
 * @param request periode yang diminta
 * @param existing daftar periode booking yang sudah ada
 * @param bufferDays jeda hari (default {@link RENTAL_BUFFER_DAYS})
 */
export const countOverlapping = (
	request: Period,
	existing: readonly Period[],
	bufferDays: number = RENTAL_BUFFER_DAYS,
): number =>
	existing.reduce(
		(count, booking) => count + (blocksPeriod(request, booking, bufferDays) ? 1 : 0),
		0,
	);

/** Ringkasan ketersediaan sebuah (produk + sizeLabel) untuk satu periode. */
export type Availability = {
	available: boolean;
	remainingUnits: number;
	pickupDate: Date;
	nextAvailableDate: Date | null;
};

/**
 * Menghitung ketersediaan sebuah (produk + sizeLabel) untuk periode diminta.
 *
 * - `remainingUnits = max(0, unitCount - jumlah booking yang tumpang tindih)`.
 * - `available` bila `remainingUnits > 0`.
 * - `nextAvailableDate`: bila tersedia → `request.installDate`. Bila penuh →
 *   tanggal pasang terdekat `>= request.installDate` di mana periode dengan
 *   durasi yang SAMA masih punya unit kosong. Kandidat tanggal diturunkan dari
 *   `pickupDate` tiap booking yang ada + buffer (lalu diurut menaik); `null`
 *   bila tidak ada kandidat yang menghasilkan unit kosong.
 *
 * @param request periode yang diminta
 * @param existing daftar periode booking aktif yang sudah ada
 * @param unitCount jumlah unit fisik tersedia
 * @param bufferDays jeda hari (default {@link RENTAL_BUFFER_DAYS})
 */
export const computeAvailability = (
	request: Period,
	existing: readonly Period[],
	unitCount: number,
	bufferDays: number = RENTAL_BUFFER_DAYS,
): Availability => {
	const overlapCount = countOverlapping(request, existing, bufferDays);
	const remainingUnits = Math.max(0, unitCount - overlapCount);
	const available = remainingUnits > 0;

	if (available) {
		return {
			available,
			remainingUnits,
			pickupDate: request.pickupDate,
			nextAvailableDate: request.installDate,
		};
	}

	const durationMs = request.pickupDate.getTime() - request.installDate.getTime();
	const requestStartMs = request.installDate.getTime();

	// Kandidat tanggal pasang: hari pertama SETELAH booking selesai + buffer
	// (overlap inklusif, jadi `+ bufferDays + 1` agar lewat batas jeda),
	// hanya yang tidak lebih cepat dari permintaan, diurut menaik & unik.
	const candidateMs = [
		...new Set(
			existing
				.map((booking) => addDays(booking.pickupDate, bufferDays + 1).getTime())
				.filter((ms) => ms >= requestStartMs),
		),
	].sort((a, b) => a - b);

	const nextAvailableMs = candidateMs.find((startMs) => {
		const candidate: Period = {
			installDate: new Date(startMs),
			pickupDate: new Date(startMs + durationMs),
		};
		return unitCount - countOverlapping(candidate, existing, bufferDays) > 0;
	});

	return {
		available,
		remainingUnits,
		pickupDate: request.pickupDate,
		nextAvailableDate: nextAvailableMs === undefined ? null : new Date(nextAvailableMs),
	};
};

/**
 * Batas keras jumlah hari yang boleh diiterasi {@link computeBookedDates} agar
 * tidak terjadi loop patologis bila rentang yang diminta terlalu lebar. Rentang
 * yang melebihi ini membuat {@link computeBookedDates} melempar `RangeError` —
 * BUKAN dipotong diam-diam — supaya hasil terpotong tak pernah lolos tanpa
 * disadari. Pemanggil (mis. router) memvalidasi lebih dulu & menolak dengan
 * `BAD_REQUEST`.
 */
export const MAX_BOOKED_RANGE_DAYS = 366;

/**
 * Mengembalikan daftar hari kalender dalam rentang inklusif `[from, to]` di mana
 * sebuah (produk + ukuran) berstatus PENUH — yakni jumlah booking aktif yang
 * menempati hari tersebut `>= unitCount` (sehingga `remainingUnits === 0`).
 *
 * Sebuah hari `d` dianggap ditempati oleh booking bila `d` jatuh di dalam
 * periode booking yang diperlebar `bufferDays` pada kedua ujungnya — semantik
 * buffer SAMA dengan {@link blocksPeriod}. Implementasi: iterasi hari demi hari
 * (granularitas {@link MS_PER_DAY}), bangun `Period {installDate: d, pickupDate: d}`
 * satu hari, lalu pakai ulang {@link countOverlapping}; hari masuk daftar bila
 * `unitCount - count <= 0`.
 *
 * MURNI & deterministik: `from`/`to` diberikan eksplisit (tidak ada `Date` tanpa
 * argumen). Basis hari = epoch-ms; pemanggil bertanggung jawab atas basis
 * tanggal (lihat router/server yang memakai basis UTC date-only).
 *
 * Penjaga (guard): bila `unitCount <= 0` semua hari dalam rentang dianggap penuh;
 * bila `from > to` kembalikan `[]`; bila rentang melebihi
 * {@link MAX_BOOKED_RANGE_DAYS} hari, melempar `RangeError` (gagal keras, bukan
 * pangkas diam-diam) untuk mencegah loop patologis & hasil terpotong senyap.
 *
 * @param existing daftar periode booking aktif yang sudah ada
 * @param unitCount jumlah unit fisik tersedia
 * @param from tanggal awal rentang (inklusif)
 * @param to tanggal akhir rentang (inklusif)
 * @param bufferDays jeda hari (default {@link RENTAL_BUFFER_DAYS})
 */
export const computeBookedDates = (
	existing: readonly Period[],
	unitCount: number,
	from: Date,
	to: Date,
	bufferDays: number = RENTAL_BUFFER_DAYS,
): Date[] => {
	const fromMs = from.getTime();
	const toMs = to.getTime();
	if (fromMs > toMs) return [];

	// Gagal KERAS bila rentang melebihi batas — jangan potong diam-diam, agar
	// pemanggil tak pernah menerima hasil terpotong tanpa sadar.
	const spanDays = Math.floor((toMs - fromMs) / MS_PER_DAY) + 1;
	if (spanDays > MAX_BOOKED_RANGE_DAYS) {
		throw new RangeError(
			`computeBookedDates: rentang ${spanDays} hari melebihi batas ${MAX_BOOKED_RANGE_DAYS} hari.`,
		);
	}

	const booked: Date[] = [];
	for (let dayMs = fromMs; dayMs <= toMs; dayMs += MS_PER_DAY) {
		if (unitCount <= 0) {
			booked.push(new Date(dayMs));
			continue;
		}
		const day = new Date(dayMs);
		const dayPeriod: Period = { installDate: day, pickupDate: day };
		const count = countOverlapping(dayPeriod, existing, bufferDays);
		if (unitCount - count <= 0) booked.push(day);
	}
	return booked;
};
