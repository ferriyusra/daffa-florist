import 'server-only';
import pino from 'pino';

/**
 * Logger aplikasi (pino) — keluaran JSON terstruktur, konsisten dengan log
 * internal Next.js yang sudah dipatch next-logger. Pakai HANYA di kode server
 * (tRPC, route handler); jangan di komponen client atau runtime edge.
 *
 * Contoh: `logger.info({ userId }, 'Pesan masuk')` / `logger.error(err, '...')`.
 */
export const logger = pino({
	level:
		process.env.LOG_LEVEL ??
		(process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});
