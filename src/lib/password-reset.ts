import { createHash, randomBytes } from 'crypto';

/**
 * Aturan token reset password (lihat model `PasswordResetToken` di schema).
 * Token mentah dikirim ke email; di DB hanya disimpan SHA-256-nya.
 */

/** Masa berlaku token sejak dibuat: 1 jam. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Jendela rate-limit permintaan reset: 5 menit. */
export const RESET_RATE_WINDOW_MS = 5 * 60 * 1000;

/** Maksimum permintaan reset per user dalam satu jendela. */
export const RESET_RATE_MAX = 3;

/**
 * Rate-limit per-IP — INDEPENDEN dari keberadaan akun, jadi aman menampilkan
 * pesan "terlalu banyak percobaan" tanpa membocorkan email terdaftar (beda dari
 * limit per-user yang sengaja senyap). Lebih longgar karena satu IP (NAT/kantor)
 * bisa melayani beberapa orang.
 */
export const RESET_IP_RATE_MAX = 10;
export const RESET_IP_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 menit

/** Hash token mentah → string heksadesimal SHA-256 (yang disimpan di DB). */
export function hashResetToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

/**
 * Buat token reset baru: `token` mentah (dikirim ke email) + `tokenHash`
 * (disimpan di DB). 32 byte acak → 64 char hex, tak bisa ditebak.
 */
export function generateResetToken(): { token: string; tokenHash: string } {
	const token = randomBytes(32).toString('hex');
	return { token, tokenHash: hashResetToken(token) };
}
