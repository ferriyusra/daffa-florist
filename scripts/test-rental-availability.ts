import 'dotenv/config';
import {
	addDays,
	blocksPeriod,
	computeAvailability,
	computePickupDate,
	countOverlapping,
	rangesOverlap,
	type Period,
} from '@/lib/rental';

/**
 * Tes manual helper ketersediaan sewa (S2.1) — MURNI, tanpa DB. Memakai tanggal
 * tetap supaya deterministik. Jalankan: `tsx scripts/test-rental-availability.ts`.
 */
const d = (iso: string) => new Date(iso);
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

const checks: string[] = [];
const ok = (label: string, pass: boolean) =>
	checks.push(`${label}: ${pass ? '✓' : '✗'}`);

// 1) computePickupDate = installDate + rentalDays.
const install = d('2026-06-01T00:00:00');
ok(
	'computePickupDate(01 Jun, 3 hari) = 04 Jun',
	sameDay(computePickupDate(install, 3), d('2026-06-04T00:00:00')),
);

// addDays immutable (tidak memutasi).
const before = install.getTime();
addDays(install, 5);
ok('addDays tidak memutasi parameter', install.getTime() === before);

// 2) rangesOverlap — tumpang tindih, tidak, dan bersentuhan ujung (inklusif).
ok(
	'rangesOverlap: overlap penuh',
	rangesOverlap(d('2026-06-01'), d('2026-06-05'), d('2026-06-03'), d('2026-06-07')),
);
ok(
	'rangesOverlap: tidak overlap',
	!rangesOverlap(d('2026-06-01'), d('2026-06-03'), d('2026-06-05'), d('2026-06-07')),
);
ok(
	'rangesOverlap: bersentuhan ujung = overlap (inklusif)',
	rangesOverlap(d('2026-06-01'), d('2026-06-05'), d('2026-06-05'), d('2026-06-07')),
);

// 3) blocksPeriod dengan buffer.
const request: Period = {
	installDate: d('2026-06-10T00:00:00'),
	pickupDate: d('2026-06-12T00:00:00'),
};
// Booking selesai 09 Jun; tanpa buffer tidak menghalangi (09 < 10),
// tetapi dengan buffer 1 hari → diperlebar ke 10 Jun → menghalangi.
const adjacent: Period = {
	installDate: d('2026-06-07T00:00:00'),
	pickupDate: d('2026-06-09T00:00:00'),
};
ok('blocksPeriod: buffer 0 → tidak menghalangi', !blocksPeriod(request, adjacent, 0));
ok('blocksPeriod: buffer 1 → menghalangi', blocksPeriod(request, adjacent, 1));

// 4) countOverlapping.
const existing: Period[] = [
	adjacent, // menghalangi dengan buffer 1
	{ installDate: d('2026-06-11T00:00:00'), pickupDate: d('2026-06-13T00:00:00') }, // overlap langsung
	{ installDate: d('2026-07-01T00:00:00'), pickupDate: d('2026-07-03T00:00:00') }, // jauh, tidak
];
ok('countOverlapping (buffer 1) = 2', countOverlapping(request, existing, 1) === 2);

// 5) computeAvailability — tersedia (unit cukup).
const avail = computeAvailability(request, existing, 3, 1);
ok(
	'computeAvailability: tersedia (unit 3 > pakai 2)',
	avail.available &&
		avail.remainingUnits === 1 &&
		sameDay(avail.nextAvailableDate ?? d('1970-01-01'), request.installDate) &&
		sameDay(avail.pickupDate, request.pickupDate),
);

// 6) computeAvailability — penuh + nextAvailableDate.
const full = computeAvailability(request, existing, 2, 1);
// Dua booking menghalangi → penuh. Kandidat pertama yang bebas: pickup booking
// 'adjacent' (09 Jun) + buffer 1 + 1 = 11 Jun; periode 11–13 Jun hanya
// bertumpang dengan satu booking (unit 2) → masih ada unit kosong.
ok(
	'computeAvailability: penuh (unit 2 = pakai 2)',
	!full.available && full.remainingUnits === 0,
);
ok(
	'computeAvailability: nextAvailableDate = 11 Jun saat penuh',
	sameDay(full.nextAvailableDate ?? d('1970-01-01'), d('2026-06-11T00:00:00')),
);

// 7) computeAvailability — penuh dengan kandidat bebas vs benar-benar buntu.
const blocker: Period = {
	installDate: d('2026-06-01T00:00:00'),
	pickupDate: d('2026-06-30T00:00:00'),
};
const noNext = computeAvailability(request, [blocker], 1, 1);
// Kandidat: pickup 30 Jun + buffer 1 + 1 = 02 Jul; periode 02–04 Jul bebas
// dari blocker (yang diperlebar 31 Mei–01 Jul) → nextAvailableDate ada.
// unitCount 0 (ukuran tak punya unit / tak ditemukan) → tak pernah ada slot.
const noUnits = computeAvailability(request, existing, 0, 1);
ok(
	'computeAvailability: penuh, kandidat 02 Jul bebas (bukan null)',
	sameDay(noNext.nextAvailableDate ?? d('1970-01-01'), d('2026-07-02T00:00:00')),
);
ok(
	'computeAvailability: unitCount 0 → penuh & nextAvailableDate null',
	!noUnits.available && noUnits.remainingUnits === 0 && noUnits.nextAvailableDate === null,
);

console.log('\n── Tes helper ketersediaan sewa (S2.1) ──');
for (const c of checks) console.log(`  ${c}`);
const pass = checks.every((c) => c.endsWith('✓'));
console.log(
	`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — helper ketersediaan ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
);
if (!pass) process.exit(1);
