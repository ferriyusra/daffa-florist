'use client';

import Link from 'next/link';
import {
	ArrowLeft,
	CalendarClock,
	CalendarDays,
	MapPin,
	Package,
	Receipt,
	StickyNote,
	User,
} from 'lucide-react';
import { ProductImage } from '@/components';
import { formatRupiah } from '@/hooks';
import type { RouterOutputs } from '@/trpc/react';

type Order = RouterOutputs['admin']['order']['getById'];
type OrderStatus = Order['status'];

// Semua 8 status sewa → label Indonesia + warna (token/inline).
const statusStyles: Record<
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

/** Tanggal sewa selalu di UTC agar tidak bergeser hari bagi pengguna WIB. */
const formatRentalDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	});

/** createdAt/eventDate adalah instan nyata → format lokal. */
const formatInstant = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

const formatInstantTime = (d: Date) =>
	new Date(d).toLocaleString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

function Section({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: typeof MapPin;
	children: React.ReactNode;
}) {
	return (
		<div
			className='rounded-2xl border border-[var(--border)] p-6'
			style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
			<div className='flex items-center gap-2 mb-4'>
				<Icon size={16} style={{ color: 'var(--primary)' }} />
				<h2 className='font-serif text-base font-semibold'>{title}</h2>
			</div>
			{children}
		</div>
	);
}

export default function OrderDetail({ order }: { order: Order }) {
	const style = statusStyles[order.status];

	return (
		<div className='space-y-5 max-w-3xl'>
			<Link
				href='/admin/orders'
				className='inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer'
				style={{ color: 'var(--text-secondary)' }}>
				<ArrowLeft size={15} />
				Kembali
			</Link>

			{/* Header */}
			<div
				className='rounded-2xl border border-[var(--border)] p-6'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div className='min-w-0'>
						<p
							className='font-mono text-lg font-semibold'
							style={{ color: 'var(--text)' }}>
							{order.orderNumber}
						</p>
						<p
							className='text-xs inline-flex items-center gap-1.5 mt-1'
							style={{ color: 'var(--text-muted)' }}>
							<CalendarDays size={12} />
							Dibuat {formatInstant(order.createdAt)}
						</p>
					</div>
					<span
						className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'
						style={{ background: style.bg, color: style.color }}>
						{style.label}
					</span>
				</div>
				{order.eventDate && (
					<p
						className='text-sm inline-flex items-center gap-1.5 mt-3'
						style={{ color: 'var(--text-secondary)' }}>
						<CalendarClock size={14} style={{ color: 'var(--primary)' }} />
						Tanggal acara: {formatInstantTime(order.eventDate)}
					</p>
				)}
			</div>

			{/* Pelanggan */}
			<Section title='Pelanggan' icon={User}>
				<p className='text-sm font-semibold'>{order.user.name ?? '—'}</p>
				<p className='text-xs mt-0.5' style={{ color: 'var(--text-muted)' }}>
					{order.user.email}
					{order.user.phone ? ` · ${order.user.phone}` : ''}
				</p>
			</Section>

			{/* Alamat pengiriman */}
			<Section title='Alamat Pengiriman' icon={MapPin}>
				{order.address ? (
					<>
						<p className='text-sm font-semibold'>
							{order.address.recipientName}
						</p>
						<p
							className='text-xs mt-1'
							style={{ color: 'var(--text-secondary)' }}>
							{order.address.phone} · {order.address.fullAddress},{' '}
							{order.address.city}
							{order.address.province ? `, ${order.address.province}` : ''}
						</p>
					</>
				) : (
					<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
						Tidak ada alamat tersimpan.
					</p>
				)}
			</Section>

			{/* Item */}
			<Section title='Item Pesanan' icon={Package}>
				<ul className='divide-y divide-[var(--border)]'>
					{order.items.map((item) => {
						const options = [
							item.designTemplateName,
							item.themeColorName,
							...item.addonNames,
						].filter(Boolean);
						return (
							<li key={item.id} className='flex gap-4 py-4 first:pt-0 last:pb-0'>
								<div className='relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] shrink-0'>
									<ProductImage
										src={item.productImage}
										alt={item.productTitle}
										sizes='80px'
									/>
								</div>
								<div className='flex-1 min-w-0 flex flex-col gap-1.5'>
									<div className='flex items-start justify-between gap-3'>
										<div className='min-w-0'>
											<h3 className='font-serif text-base font-semibold truncate'>
												{item.productTitle}
											</h3>
											<p
												className='text-xs mt-0.5'
												style={{ color: 'var(--text-secondary)' }}>
												{item.sizeLabel ? `${item.sizeLabel} · ` : ''}
												{item.quantity} unit ·{' '}
												{formatRupiah(item.price)}/unit
											</p>
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
											{formatRentalDate(item.pickupDate)} · {item.rentalDays}{' '}
											hari
										</span>
									</p>
									{options.length > 0 && (
										<p
											className='text-[11px]'
											style={{ color: 'var(--text-muted)' }}>
											{options.join(' · ')}
										</p>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			</Section>

			{/* Catatan */}
			{order.notes && (
				<Section title='Catatan' icon={StickyNote}>
					<p
						className='text-sm whitespace-pre-wrap leading-relaxed'
						style={{ color: 'var(--text-secondary)' }}>
						{order.notes}
					</p>
				</Section>
			)}

			{/* Rincian biaya */}
			<Section title='Rincian Biaya' icon={Receipt}>
				<dl className='space-y-2 text-sm'>
					<div className='flex items-center justify-between'>
						<dt style={{ color: 'var(--text-secondary)' }}>Subtotal</dt>
						<dd className='font-medium'>{formatRupiah(order.subtotal)}</dd>
					</div>
					<div className='flex items-center justify-between'>
						<dt style={{ color: 'var(--text-secondary)' }}>Ongkir</dt>
						<dd className='font-medium'>{formatRupiah(order.shippingCost)}</dd>
					</div>
					{order.discount > 0 && (
						<div className='flex items-center justify-between'>
							<dt style={{ color: 'var(--text-secondary)' }}>Diskon</dt>
							<dd
								className='font-medium'
								style={{ color: 'var(--secondary)' }}>
								-{formatRupiah(order.discount)}
							</dd>
						</div>
					)}
					<div className='flex items-center justify-between pt-2 border-t border-[var(--border)]'>
						<dt className='font-semibold'>Total</dt>
						<dd
							className='font-semibold text-base'
							style={{ color: 'var(--primary)' }}>
							{formatRupiah(order.total)}
						</dd>
					</div>
				</dl>
			</Section>
		</div>
	);
}
