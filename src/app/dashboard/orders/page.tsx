'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	CalendarClock,
	CalendarDays,
	MapPin,
	Package,
} from 'lucide-react';
import { formatRupiah } from '@/hooks';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';

type Order = RouterOutputs['order']['listMine'][number];
type OrderStatus = Order['status'];

// Semua 8 status sewa → label Indonesia + warna (token/inline).
const statusMeta: Record<
	OrderStatus,
	{ label: string; bg: string; color: string }
> = {
	PENDING: {
		label: 'Menunggu Konfirmasi',
		bg: 'rgba(234, 179, 8, 0.15)',
		color: '#a16207',
	},
	CONFIRMED: {
		label: 'Dikonfirmasi',
		bg: 'rgba(59, 130, 246, 0.12)',
		color: '#2563eb',
	},
	SCHEDULED: {
		label: 'Dijadwalkan',
		bg: 'rgba(99, 102, 241, 0.12)',
		color: '#4f46e5',
	},
	INSTALLED: {
		label: 'Terpasang',
		bg: 'rgba(20, 184, 166, 0.14)',
		color: '#0d9488',
	},
	PICKED_UP: {
		label: 'Dibongkar',
		bg: 'rgba(139, 92, 246, 0.14)',
		color: '#7c3aed',
	},
	RETURNED: {
		label: 'Dikembalikan',
		bg: 'rgba(100, 116, 139, 0.14)',
		color: '#475569',
	},
	COMPLETED: {
		label: 'Selesai',
		bg: 'rgba(34, 197, 94, 0.12)',
		color: '#16a34a',
	},
	CANCELLED: {
		label: 'Dibatalkan',
		bg: 'rgba(220, 38, 38, 0.12)',
		color: '#dc2626',
	},
};

/** Format tanggal sewa selalu di UTC agar tidak bergeser hari bagi pengguna WIB. */
function formatRentalDate(date: Date): string {
	return date.toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

function formatCreatedAt(date: Date): string {
	return date.toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export default function OrdersPage() {
	const { data: orders, isLoading } = api.order.listMine.useQuery();

	return (
		<section>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='font-serif text-xl font-semibold'>Riwayat Pesanan</h2>
				{orders && (
					<span
						className='text-xs font-medium'
						style={{ color: 'var(--text-secondary)' }}>
						{orders.length} pesanan
					</span>
				)}
			</div>

			{isLoading ? (
				<LoadingState />
			) : !orders || orders.length === 0 ? (
				<EmptyState />
			) : (
				<div className='space-y-4'>
					{orders.map((order) => (
						<OrderCard key={order.id} order={order} />
					))}
				</div>
			)}
		</section>
	);
}

function OrderCard({ order }: { order: Order }) {
	const status = statusMeta[order.status];
	return (
		<div
			className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
			style={{ boxShadow: 'var(--shadow-sm)' }}>
			<div
				className='flex items-center justify-between px-5 py-3 border-b border-[var(--border)] text-xs'
				style={{ background: 'rgba(157, 23, 77, 0.04)' }}>
				<div className='flex items-center gap-2 min-w-0'>
					<Package size={14} style={{ color: 'var(--primary)' }} />
					<span
						className='font-mono font-semibold truncate'
						style={{ color: 'var(--text)' }}>
						{order.orderNumber}
					</span>
					<span style={{ color: 'var(--text-muted)' }}>•</span>
					<span
						className='inline-flex items-center gap-1 shrink-0'
						style={{ color: 'var(--text-secondary)' }}>
						<CalendarDays size={12} />
						{formatCreatedAt(order.createdAt)}
					</span>
				</div>
				<span
					className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0'
					style={{ background: status.bg, color: status.color }}>
					{status.label}
				</span>
			</div>

			<div className='p-5 space-y-4'>
				<div className='divide-y divide-[var(--border)]'>
					{order.items.map((item) => (
						<div
							key={item.id}
							className='flex gap-4 py-4 first:pt-0 last:pb-0'>
							<div className='relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] shrink-0'>
								<Image
									src={item.productImage}
									alt={item.productTitle}
									fill
									className='object-cover'
									sizes='80px'
								/>
							</div>
							<div className='flex-1 min-w-0 flex flex-col gap-1.5'>
								<div className='flex items-start justify-between gap-3'>
									<div className='min-w-0'>
										<h3 className='font-serif text-base font-semibold truncate'>
											{item.productTitle}
										</h3>
										{item.sizeLabel && (
											<p
												className='text-xs mt-0.5'
												style={{ color: 'var(--text-secondary)' }}>
												{item.sizeLabel} · {item.quantity} unit
											</p>
										)}
									</div>
									<span
										className='text-sm font-semibold shrink-0'
										style={{ color: 'var(--primary)' }}>
										{formatRupiah(item.price * item.quantity)}
									</span>
								</div>
								<p
									className='inline-flex items-start gap-1.5 text-[11px] leading-relaxed'
									style={{ color: 'var(--text-secondary)' }}>
									<CalendarClock
										size={12}
										className='mt-0.5 shrink-0'
										style={{ color: 'var(--primary)' }}
									/>
									<span>
										Pasang {formatRentalDate(item.installDate)} → Bongkar{' '}
										{formatRentalDate(item.pickupDate)} · {item.rentalDays} hari
									</span>
								</p>
							</div>
						</div>
					))}
				</div>

				{order.address && (
					<p
						className='inline-flex items-start gap-1.5 text-xs'
						style={{ color: 'var(--text-secondary)' }}>
						<MapPin size={12} className='mt-0.5 shrink-0' />
						<span>
							<span className='font-medium' style={{ color: 'var(--text)' }}>
								{order.address.recipientName}
							</span>{' '}
							— {order.address.fullAddress}
						</span>
					</p>
				)}

				<div className='flex items-center justify-between pt-3 border-t border-[var(--border)]'>
					<span
						className='text-xs'
						style={{ color: 'var(--text-secondary)' }}>
						Total
					</span>
					<span
						className='font-semibold text-sm'
						style={{ color: 'var(--primary)' }}>
						{formatRupiah(order.total)}
					</span>
				</div>
			</div>
		</div>
	);
}

function LoadingState() {
	return (
		<div className='space-y-4'>
			{Array.from({ length: 3 }).map((_, i) => (
				<div
					key={i}
					className='h-40 rounded-2xl border border-[var(--border)] animate-pulse'
					style={{ background: 'var(--bg-card)' }}
				/>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div
			className='text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-10'
			style={{ boxShadow: 'var(--shadow-sm)' }}>
			<div
				className='mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4'
				style={{ background: 'rgba(157, 23, 77, 0.08)' }}>
				<Package size={28} style={{ color: 'var(--primary)' }} />
			</div>
			<h3 className='font-serif text-lg font-semibold mb-2'>
				Belum Ada Pesanan
			</h3>
			<p
				className='text-sm mb-6'
				style={{ color: 'var(--text-secondary)' }}>
				Anda belum pernah menyewa papan bunga. Yuk mulai pesan sekarang!
			</p>
			<Link
				href='/products'
				className='inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
				style={{ background: 'var(--primary)' }}>
				Mulai Sewa
			</Link>
		</div>
	);
}
