import { createHash } from 'node:crypto';

import { env } from '@/env';
import { PaymentStatus } from '@/generated/prisma';

/**
 * Integrasi Midtrans Snap lewat REST (tanpa dependensi tambahan). SERVER_KEY
 * hanya dipakai di server (Basic auth + verifikasi signature). CLIENT_KEY
 * non-rahasia diteruskan ke browser untuk memuat snap.js.
 *
 * Sandbox vs produksi dideteksi dari prefix SERVER_KEY (`SB-...`) agar host Snap
 * dan host Core/Status API selalu benar — keduanya BEDA host di Midtrans:
 *   - Snap   : https://app[.sandbox].midtrans.com
 *   - Core/Status : MIDTRANS_API_URL (mis. https://api.sandbox.midtrans.com)
 */

const isSandbox = env.MIDTRANS_SERVER_KEY.startsWith('SB-');
const SNAP_BASE = isSandbox
	? 'https://app.sandbox.midtrans.com'
	: 'https://app.midtrans.com';

type SnapItem = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

type CreateSnapArgs = {
	midtransOrderId: string;
	grossAmount: number;
	customer: { name?: string | null; email?: string | null; phone?: string | null };
	items: SnapItem[];
};

/** Header Basic auth Midtrans: base64(`${SERVER_KEY}:`). */
function authHeader(): string {
	const token = Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString('base64');
	return `Basic ${token}`;
}

/**
 * Buat transaksi Snap. `item_details` wajib berjumlah sama persis dengan
 * `gross_amount` — pemanggil menyertakan baris ongkir/diskon agar konsisten.
 */
export async function createSnapTransaction(
	args: CreateSnapArgs,
): Promise<{ token: string; redirectUrl: string }> {
	const res = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: authHeader(),
		},
		body: JSON.stringify({
			transaction_details: {
				order_id: args.midtransOrderId,
				gross_amount: args.grossAmount,
			},
			item_details: args.items,
			customer_details: {
				first_name: args.customer.name ?? undefined,
				email: args.customer.email ?? undefined,
				phone: args.customer.phone ?? undefined,
			},
		}),
	});

	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`Midtrans Snap gagal (${res.status}): ${detail}`);
	}

	const data = (await res.json()) as { token: string; redirect_url: string };
	return { token: data.token, redirectUrl: data.redirect_url };
}

/** Bentuk respons Status API Midtrans (subset yang kita pakai). */
export type MidtransStatus = {
	order_id: string;
	status_code: string;
	transaction_status: string;
	fraud_status?: string;
	gross_amount: string;
	payment_type?: string;
	transaction_id?: string;
};

/**
 * Tanyakan status OTORITATIF transaksi langsung ke Midtrans (Core API). Dipakai
 * webhook agar tak memercayai field tak-tertandatangani dari body notifikasi
 * (mis. `transaction_status` yang TIDAK termasuk dalam signature).
 */
export async function getTransactionStatus(
	midtransOrderId: string,
): Promise<MidtransStatus> {
	const res = await fetch(
		`${env.MIDTRANS_API_URL}/v2/${encodeURIComponent(midtransOrderId)}/status`,
		{
			method: 'GET',
			headers: { Accept: 'application/json', Authorization: authHeader() },
		},
	);

	if (!res.ok) {
		const detail = await res.text();
		throw new Error(`Midtrans status gagal (${res.status}): ${detail}`);
	}
	return (await res.json()) as MidtransStatus;
}

/**
 * Verifikasi tanda tangan webhook Midtrans:
 * `SHA512(order_id + status_code + gross_amount + ServerKey)`. Mencegah
 * notifikasi palsu menandai pesanan lunas.
 */
export function verifySignature(input: {
	order_id: string;
	status_code: string;
	gross_amount: string;
	signature_key: string;
}): boolean {
	const expected = createHash('sha512')
		.update(
			input.order_id +
				input.status_code +
				input.gross_amount +
				env.MIDTRANS_SERVER_KEY,
		)
		.digest('hex');
	return expected === input.signature_key;
}

/**
 * Petakan `transaction_status` (+ `fraud_status` untuk kartu) Midtrans ke
 * `PaymentStatus` internal. Mengembalikan `null` untuk status yang tidak kita
 * petakan agar pemanggil bisa mengabaikannya.
 */
export function mapTransactionStatus(
	transactionStatus: string,
	fraudStatus?: string,
): PaymentStatus | null {
	switch (transactionStatus) {
		case 'capture':
			// Kartu kredit: hanya lunas jika fraud_status accept.
			return fraudStatus === 'accept' ? PaymentStatus.PAID : null;
		case 'settlement':
			return PaymentStatus.PAID;
		case 'pending':
			return PaymentStatus.PENDING;
		case 'deny':
		case 'cancel':
			return PaymentStatus.FAILED;
		case 'expire':
			return PaymentStatus.EXPIRED;
		default:
			return null;
	}
}

/** URL snap.js sesuai host Snap (sandbox vs produksi). */
export function snapJsUrl(): string {
	return `${SNAP_BASE}/snap/snap.js`;
}
