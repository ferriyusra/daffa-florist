import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
	verifySignature,
	mapTransactionStatus,
	getTransactionStatus,
} from '@/server/midtrans';
import { PaymentStatus, Prisma } from '@/generated/prisma';

// Butuh node:crypto (verifikasi signature) → paksa runtime Node.js.
export const runtime = 'nodejs';

/** Status pembayaran final yang tak boleh diturunkan lagi (idempotensi). */
const TERMINAL: PaymentStatus[] = [
	PaymentStatus.PAID,
	PaymentStatus.REFUNDED,
];

/**
 * Webhook notifikasi Midtrans (publik, dipanggil server Midtrans). Satu-satunya
 * sumber kebenaran status pembayaran. Pengamanan berlapis:
 *   1. Verifikasi signature SHA512 → menolak notifikasi palsu.
 *   2. Tanyakan status OTORITATIF ke Core API (getTransactionStatus) — TIDAK
 *      memercayai `transaction_status` dari body (field itu tak ikut signature).
 *   3. Update idempoten (aman dikirim berkali-kali / tak berurutan).
 *
 * Set Notification URL di dashboard Midtrans ke `${SITE_URL}/api/midtrans/notification`.
 */
export async function POST(req: Request) {
	let body: {
		order_id?: string;
		status_code?: string;
		gross_amount?: string;
		signature_key?: string;
	};
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: 'Body tidak valid.' }, { status: 400 });
	}

	const { order_id, status_code, gross_amount, signature_key } = body;
	if (!order_id || !status_code || !gross_amount || !signature_key) {
		return NextResponse.json({ error: 'Field kurang.' }, { status: 400 });
	}

	if (!verifySignature({ order_id, status_code, gross_amount, signature_key })) {
		logger.warn({ order_id }, 'Webhook Midtrans: signature tidak valid');
		return NextResponse.json({ error: 'Signature tidak valid.' }, { status: 401 });
	}

	// Tombol "Test Configuration" di dashboard Midtrans mengirim order_id sintetis
	// yang tak ada di DB. Signature sudah terverifikasi (server key benar) → akui
	// dengan 200 agar uji konfigurasi lulus, tanpa memproses apa pun.
	if (order_id.startsWith('payment_notif_test_')) {
		logger.info({ order_id }, 'Webhook Midtrans: notifikasi uji diterima');
		return NextResponse.json({ received: true });
	}

	const payment = await prisma.payment.findUnique({
		where: { midtransOrderId: order_id },
		select: { id: true, orderId: true, amount: true, status: true },
	});
	if (!payment) {
		return NextResponse.json({ error: 'Pembayaran tak ditemukan.' }, { status: 404 });
	}

	// Status OTORITATIF dari Midtrans — bukan dari body. Menutup celah field
	// `transaction_status` yang tak ditandatangani. Bila gagal, balas 500 agar
	// Midtrans mengirim ulang.
	let status: Awaited<ReturnType<typeof getTransactionStatus>>;
	try {
		status = await getTransactionStatus(order_id);
	} catch (err) {
		logger.error({ order_id, err }, 'Webhook Midtrans: gagal ambil status');
		return NextResponse.json({ error: 'Gagal verifikasi status.' }, { status: 500 });
	}

	// Defensif: nominal otoritatif harus cocok dengan attempt tersimpan.
	if (Math.round(Number(status.gross_amount)) !== payment.amount) {
		logger.warn(
			{ order_id, gross_amount: status.gross_amount, expected: payment.amount },
			'Webhook Midtrans: gross_amount tidak cocok',
		);
		return NextResponse.json({ error: 'Nominal tidak cocok.' }, { status: 400 });
	}

	const next = mapTransactionStatus(
		status.transaction_status,
		status.fraud_status,
	);
	if (!next) {
		// Status yang tak dipetakan (mis. authorize) — abaikan, balas 200.
		return NextResponse.json({ received: true });
	}

	// Idempotensi: jangan timpa status terminal.
	if (TERMINAL.includes(payment.status)) {
		return NextResponse.json({ received: true });
	}

	await prisma.payment.update({
		where: { id: payment.id },
		data: {
			status: next,
			paymentType: status.payment_type,
			transactionId: status.transaction_id,
			rawNotification: status as unknown as Prisma.InputJsonValue,
			paidAt: next === PaymentStatus.PAID ? new Date() : null,
		},
	});

	// Hanya pembayaran sukses yang mengonfirmasi pesanan. Compare-and-swap:
	// hanya transisi bila masih PENDING (aman terhadap notifikasi ganda).
	if (next === PaymentStatus.PAID) {
		const res = await prisma.order.updateMany({
			where: { id: payment.orderId, status: 'PENDING' },
			data: { status: 'CONFIRMED' },
		});
		// Catat audit trail hanya bila CAS benar-benar mengubah status (count === 1)
		// → idempoten terhadap notifikasi ganda. changedBy null = aksi sistem.
		if (res.count === 1) {
			await prisma.orderStatusHistory.create({
				data: {
					orderId: payment.orderId,
					fromStatus: 'PENDING',
					toStatus: 'CONFIRMED',
					changedBy: null,
					note: 'Pembayaran terverifikasi (Midtrans)',
				},
			});
		}
		logger.info(
			{ order_id, orderId: payment.orderId, confirmed: res.count },
			'Webhook Midtrans: pembayaran lunas',
		);
	}

	return NextResponse.json({ received: true });
}
