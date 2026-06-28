import 'server-only';

/**
 * Rate-limiter sliding-window in-memory sederhana (per-proses). Dipakai untuk
 * throttle per-IP yang TIDAK bergantung pada keberadaan akun, sehingga aman
 * memunculkan pesan "terlalu banyak percobaan" tanpa membocorkan email terdaftar.
 *
 * CATATAN: state ada di memori proses — ter-reset saat restart & TIDAK terbagi
 * antar instance (mis. pm2 cluster). Cukup untuk meredam spam form; untuk jaminan
 * lintas instance ganti ke store bersama (Redis/DB).
 */
const hits = new Map<string, number[]>();

type RateLimitResult = { allowed: boolean; retryAfterMs: number };

/**
 * Catat satu percobaan untuk `key`. Mengembalikan `allowed: false` bila sudah
 * mencapai `max` dalam `windowMs` terakhir, beserta `retryAfterMs` (sisa waktu
 * sampai slot tertua kedaluwarsa).
 */
export function rateLimit(
	key: string,
	max: number,
	windowMs: number,
): RateLimitResult {
	const now = Date.now();
	const since = now - windowMs;
	// Buang stempel di luar jendela.
	const recent = (hits.get(key) ?? []).filter((t) => t > since);

	if (recent.length >= max) {
		hits.set(key, recent);
		return { allowed: false, retryAfterMs: recent[0] + windowMs - now };
	}

	recent.push(now);
	hits.set(key, recent);

	// Pembersihan oportunistik agar map tak tumbuh tanpa batas.
	if (hits.size > 5000) {
		for (const [k, v] of hits) {
			if (v.every((t) => t <= since)) hits.delete(k);
		}
	}

	return { allowed: true, retryAfterMs: 0 };
}

/**
 * Ambil IP klien dari header request. UTAMAKAN `x-real-ip`: di Nginx (lihat
 * docs/DEPLOY-VPS.md) ia di-set `$remote_addr` (IP peer asli) dan MENIMPA nilai
 * kiriman klien → tak bisa dipalsukan. `x-forwarded-for` hanya fallback; entri
 * pertamanya BISA dipalsukan bila proxy sekadar menambah (append), jadi bukan
 * pilihan utama. Fallback `'unknown'` (mis. dev tanpa proxy) berarti semua
 * request berbagi satu bucket.
 */
export function getClientIp(headers: Headers): string {
	const realIp = headers.get('x-real-ip');
	if (realIp) return realIp.trim();
	const xff = headers.get('x-forwarded-for');
	if (xff) return xff.split(',')[0]?.trim() || 'unknown';
	return 'unknown';
}
