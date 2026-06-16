import Link from 'next/link';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Footer, Navbar } from '@/components';

/**
 * Halaman pendaratan setelah popup/redirect Midtrans (Finish / Unfinish / Error
 * URL semua mengarah ke sini). MURNI tampilan — status pesanan yang otoritatif
 * tetap ditentukan webhook `/api/midtrans/notification`. Midtrans menambahkan
 * query `order_id`, `status_code`, `transaction_status` ke URL ini.
 */

type SearchParams = Record<string, string | string[] | undefined>;

type Variant = 'success' | 'pending' | 'failed';

const META: Record<
	Variant,
	{
		Icon: typeof CheckCircle2;
		ring: string;
		color: string;
		title: string;
		message: string;
	}
> = {
	success: {
		Icon: CheckCircle2,
		ring: 'rgba(34, 197, 94, 0.12)',
		color: '#16a34a',
		title: 'Pembayaran Berhasil',
		message:
			'Terima kasih! Pembayaran Anda diterima. Pesanan akan otomatis dikonfirmasi dalam beberapa saat.',
	},
	pending: {
		Icon: Clock,
		ring: 'rgba(234, 179, 8, 0.15)',
		color: '#a16207',
		title: 'Menunggu Pembayaran',
		message:
			'Pembayaran Anda belum selesai. Selesaikan sesuai instruksi (mis. transfer ke Virtual Account). Status akan diperbarui otomatis setelah pembayaran masuk.',
	},
	failed: {
		Icon: XCircle,
		ring: 'rgba(220, 38, 38, 0.12)',
		color: '#dc2626',
		title: 'Pembayaran Belum Selesai',
		message:
			'Pembayaran dibatalkan atau gagal. Pesanan Anda masih tersimpan — Anda bisa mengulang pembayaran dari halaman Pesanan Saya.',
	},
};

/** Petakan transaction_status (+ status_code cadangan) ke varian tampilan. */
function classify(transactionStatus?: string, statusCode?: string): Variant {
	switch (transactionStatus) {
		case 'settlement':
		case 'capture':
			return 'success';
		case 'pending':
			return 'pending';
		case 'deny':
		case 'cancel':
		case 'expire':
		case 'failure':
			return 'failed';
		default:
			// Tanpa transaction_status: status_code 200 = sukses, 201 = pending.
			if (statusCode === '200') return 'success';
			if (statusCode === '201') return 'pending';
			return 'pending';
	}
}

function first(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentFinishPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const sp = await searchParams;
	const orderId = first(sp.order_id);
	const variant = classify(
		first(sp.transaction_status),
		first(sp.status_code),
	);
	const meta = META[variant];
	const { Icon } = meta;

	return (
		<>
			<Navbar />
			<main className='floral-bg min-h-[70vh] flex items-center justify-center px-6 py-16'>
				<div
					className='text-center max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-10'
					style={{ boxShadow: 'var(--shadow-md)' }}>
					<div
						className='mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5'
						style={{ background: meta.ring }}>
						<Icon size={36} style={{ color: meta.color }} />
					</div>
					<h1 className='font-serif text-2xl font-bold mb-3'>{meta.title}</h1>
					<p
						className='text-sm mb-6 leading-relaxed'
						style={{ color: 'var(--text-secondary)' }}>
						{meta.message}
					</p>

					{orderId && (
						<div
							className='rounded-xl border border-[var(--border)] p-3 mb-6'
							style={{ background: 'rgba(157, 23, 77, 0.03)' }}>
							<p
								className='text-[11px] uppercase tracking-wider mb-0.5'
								style={{ color: 'var(--text-muted)' }}>
								Nomor Referensi
							</p>
							<p
								className='font-mono text-sm font-semibold'
								style={{ color: 'var(--primary)' }}>
								{orderId}
							</p>
						</div>
					)}

					<div className='flex flex-col sm:flex-row gap-2'>
						<Link
							href='/dashboard/orders'
							className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
							style={{ background: 'var(--primary)' }}>
							Pesanan Saya
						</Link>
						<Link
							href='/'
							className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-[var(--border)] transition-colors hover:bg-[rgba(0,0,0,0.03)]'>
							Beranda
						</Link>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
