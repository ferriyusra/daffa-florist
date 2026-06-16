/**
 * Konstanta konfigurasi sewa yang ISOMORFIK (aman dipakai di server maupun
 * klien) — HANYA literal murni, TANPA impor `@/env` / I/O, sehingga modul ini
 * (dan apa pun yang mengimpornya) boleh di-bundle ke client tanpa melempar
 * error validasi env. Sumber tunggal untuk nilai-nilai ini; `@/lib/constant`
 * me-RE-EXPORT-nya demi back-compat.
 */

/** Jeda bongkar/pasang antar sewa (hari). */
export const RENTAL_BUFFER_DAYS = 1;
/** Lead time minimal pemesanan (hari, minimal H-1). */
export const MIN_LEAD_TIME_DAYS = 1;
