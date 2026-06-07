/**
 * Sumber kebenaran tunggal untuk alur status sewa (ERD §2): dipakai BERSAMA oleh
 * server (validasi transisi di `admin.order.updateStatus`) dan klien (tombol aksi
 * di order-detail). Modul ini sengaja MURNI & client-safe — tanpa `@/env`, tanpa
 * import nilai Prisma — jadi aman diimpor di komponen `'use client'`. String enum
 * `OrderStatus` di sini cocok persis dengan enum Prisma, sehingga server boleh
 * membandingkan keduanya.
 */

/** 8 status sewa (mirror enum `OrderStatus` Prisma). */
export const ORDER_STATUSES = [
	'PENDING',
	'CONFIRMED',
	'SCHEDULED',
	'INSTALLED',
	'PICKED_UP',
	'RETURNED',
	'COMPLETED',
	'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Transisi status yang diizinkan: status saat ini → daftar status berikutnya. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	PENDING: ['CONFIRMED', 'CANCELLED'],
	CONFIRMED: ['SCHEDULED', 'CANCELLED'],
	SCHEDULED: ['INSTALLED', 'CANCELLED'],
	INSTALLED: ['PICKED_UP', 'CANCELLED'],
	PICKED_UP: ['RETURNED'],
	RETURNED: ['COMPLETED'],
	COMPLETED: [],
	CANCELLED: [],
};

/** Label Indonesia untuk tiap status (konsisten lintas halaman admin). */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	PENDING: 'Menunggu Konfirmasi',
	CONFIRMED: 'Dikonfirmasi',
	SCHEDULED: 'Dijadwalkan',
	INSTALLED: 'Terpasang',
	PICKED_UP: 'Dibongkar',
	RETURNED: 'Dikembalikan',
	COMPLETED: 'Selesai',
	CANCELLED: 'Dibatalkan',
};

/** Verb tombol aksi untuk berpindah KE status target. */
export const ACTION_LABEL: Record<OrderStatus, string> = {
	PENDING: 'Kembalikan ke Menunggu',
	CONFIRMED: 'Verifikasi Pembayaran',
	SCHEDULED: 'Tetapkan Jadwal',
	INSTALLED: 'Tandai Terpasang',
	PICKED_UP: 'Tandai Dibongkar',
	RETURNED: 'Tandai Dikembalikan',
	COMPLETED: 'Selesaikan',
	CANCELLED: 'Batalkan',
};

/** Apakah transisi `from` → `to` diizinkan. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
	return ORDER_STATUS_TRANSITIONS[from].includes(to);
}
