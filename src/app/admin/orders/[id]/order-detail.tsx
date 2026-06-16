'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	CalendarClock,
	CalendarDays,
	CheckCircle2,
	MapPin,
	Package,
	Receipt,
	StickyNote,
	User,
	XCircle,
} from 'lucide-react';
import { ConfirmDialog, ProductImage } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { formatRupiah, useToast } from '@/hooks';
import { api, type RouterOutputs } from '@/trpc/react';
import {
	ACTION_LABEL,
	ORDER_STATUS_LABEL,
	ORDER_STATUS_TRANSITIONS,
	type OrderStatus,
} from '@/lib/order-status';
import { MAX_SHIPPING_COST } from '@/lib/delivery-area-schema';

type Order = RouterOutputs['admin']['order']['getById'];

// Warna badge status (UI-only). Label diambil dari modul bersama
// `@/lib/order-status` agar konsisten lintas halaman admin.
const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
	CONFIRMED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	SCHEDULED: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
	INSTALLED: { bg: 'rgba(20, 184, 166, 0.14)', color: '#0d9488' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	CANCELLED: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' },
};

// Urutan linear daur hidup sewa (CANCELLED di luar jalur ini). Dipakai
// untuk menghitung langkah selesai/aktif/akan datang pada stepper.
const STEPPER_FLOW: OrderStatus[] = [
	'PENDING',
	'CONFIRMED',
	'SCHEDULED',
	'INSTALLED',
	'COMPLETED',
];

/** Pesan konfirmasi spesifik untuk transisi tertentu (fallback generik). */
const confirmCopy: Partial<Record<OrderStatus, string>> = {
	CONFIRMED: 'Verifikasi pembayaran pesanan ini?',
	SCHEDULED: 'Tetapkan jadwal pasang sesuai tanggal yang dipilih pelanggan?',
	INSTALLED: 'Tandai pesanan sebagai Terpasang?',
	COMPLETED: 'Selesaikan pesanan ini?',
	CANCELLED: 'Batalkan pesanan ini? Tindakan ini tak bisa dibatalkan.',
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
	action,
	children,
}: {
	title: string;
	icon: typeof MapPin;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div
			className='rounded-2xl border border-[var(--border)] p-6'
			style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
			<div className='flex items-center justify-between gap-3 mb-4'>
				<div className='flex items-center gap-2 min-w-0'>
					<Icon size={16} style={{ color: 'var(--primary)' }} />
					<h2 className='font-serif text-base font-semibold truncate'>
						{title}
					</h2>
				</div>
				{action}
			</div>
			{children}
		</div>
	);
}


export default function OrderDetail({ order }: { order: Order }) {
	const router = useRouter();
	const toast = useToast();
	const utils = api.useUtils();
	const color = statusColors[order.status];
	const isCancelled = order.status === 'CANCELLED';

	// Status target yang sedang dikonfirmasi (null = dialog tertutup).
	const [pending, setPending] = useState<OrderStatus | null>(null);

	// Editor ongkir: amount = nominal manual, deliveryAreaId = zona terpilih
	// (kosong = override manual). Memilih zona mengisi amount; mengedit amount
	// menghapus deliveryAreaId.
	const [shippingAmount, setShippingAmount] = useState(String(order.shippingCost));
	const [shippingAreaId, setShippingAreaId] = useState('');

	// Sinkronkan editor dengan nilai server setelah tersimpan (getById di-invalidate)
	// agar form tak menyisakan zona/nominal lama.
	useEffect(() => {
		setShippingAmount(String(order.shippingCost));
		setShippingAreaId('');
	}, [order.shippingCost, order.shippingArea]);

	const { data: deliveryAreas = [] } =
		api.admin.deliveryArea.list.useQuery();

	const setShipping = api.admin.order.setShipping.useMutation({
		onSuccess: () => {
			toast.success('Ongkir diperbarui');
			void utils.admin.order.getById.invalidate({ id: order.id });
		},
		onError: (e) => toast.error(e.message),
	});

	const parsedAmount = Number(shippingAmount);
	const amountInvalid =
		!Number.isInteger(parsedAmount) ||
		parsedAmount < 0 ||
		parsedAmount > MAX_SHIPPING_COST;

	const handleSaveShipping = () => {
		setShipping.mutate(
			shippingAreaId
				? { id: order.id, deliveryAreaId: shippingAreaId }
				: { id: order.id, shippingCost: parsedAmount },
		);
	};

	const updateStatus = api.admin.order.updateStatus.useMutation({
		onSuccess: async () => {
			toast.success('Status pesanan diperbarui.');
			setPending(null);
			await utils.admin.order.list.invalidate();
			router.refresh();
		},
		onError: (e) => toast.error(e.message),
	});

	const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
	const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);

	return (
		<div className='space-y-5 max-w-6xl'>
			<Link
				href='/admin/orders'
				className='inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors duration-150 hover:text-[var(--primary)]'
				style={{ color: 'var(--text-secondary)' }}>
				<ArrowLeft size={15} />
				Kembali
			</Link>

			{/* Header */}
			<div
				className='relative rounded-2xl border border-[var(--border)] p-6 overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				{/* aksen atas */}
				<span
					className='absolute inset-x-0 top-0 h-1'
					style={{
						background: isCancelled
							? 'var(--destructive)'
							: 'linear-gradient(90deg, var(--primary), var(--accent))',
					}}
				/>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div className='min-w-0'>
						<p
							className='font-mono text-xl font-semibold'
							style={{ color: 'var(--text)' }}>
							{order.orderNumber}
						</p>
						<p
							className='text-xs inline-flex items-center gap-1.5 mt-1.5'
							style={{ color: 'var(--text-muted)' }}>
							<CalendarDays size={12} />
							Dibuat {formatInstant(order.createdAt)}
						</p>
					</div>
					<span
						className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'
						style={{ background: color.bg, color: color.color }}>
						{ORDER_STATUS_LABEL[order.status]}
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

				{/* Stepper / banner dibatalkan */}
				<div className='mt-5 pt-5 border-t border-[var(--border)]'>
					{isCancelled ? (
						<div
							className='flex items-center gap-3 rounded-xl px-4 py-3'
							style={{
								background: 'rgba(220, 38, 38, 0.08)',
								border: '1px solid rgba(220, 38, 38, 0.25)',
							}}>
							<XCircle
								size={20}
								style={{ color: 'var(--destructive)' }}
								className='shrink-0'
							/>
							<div className='min-w-0'>
								<p
									className='text-sm font-semibold'
									style={{ color: 'var(--destructive)' }}>
									Pesanan dibatalkan
								</p>
								<p
									className='text-xs mt-0.5'
									style={{ color: 'var(--text-muted)' }}>
									Pesanan ini keluar dari alur sewa dan tidak dapat dilanjutkan.
								</p>
							</div>
						</div>
					) : (
						<Stepper
							steps={STEPPER_FLOW.map((s) => ({
								label: ORDER_STATUS_LABEL[s],
							}))}
							activeIndex={STEPPER_FLOW.indexOf(order.status)}
						/>
					)}
				</div>
			</div>

			{/* Layout dua kolom */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-5 items-start'>
				{/* Kolom utama */}
				<div className='lg:col-span-2 space-y-5'>
					{/* Item */}
					<Section
						title='Item Pesanan'
						icon={Package}
						action={
							<span
								className='text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap'
								style={{
									background: 'var(--bg-surface)',
									color: 'var(--text-secondary)',
								}}>
								{itemCount} unit · {order.items.length} item
							</span>
						}>
						<ul className='divide-y divide-[var(--border)]'>
							{order.items.map((item) => {
								const options = [
									item.designTemplateName,
									item.themeColorName,
									...item.addonNames,
								].filter(Boolean);
								return (
									<li
										key={item.id}
										className='flex gap-4 py-4 first:pt-0 last:pb-0'>
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
													Pasang {formatRentalDate(item.installDate)} →
													Bongkar {formatRentalDate(item.pickupDate)} ·{' '}
													{item.rentalDays} hari
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

					{/* Pelanggan */}
					<Section title='Pelanggan' icon={User}>
						<p className='text-sm font-semibold'>{order.user.name ?? '—'}</p>
						<p
							className='text-xs mt-0.5'
							style={{ color: 'var(--text-muted)' }}>
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
									{order.address.province
										? `, ${order.address.province}`
										: ''}
								</p>
							</>
						) : (
							<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
								Tidak ada alamat tersimpan.
							</p>
						)}
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
				</div>

				{/* Sidebar lengket */}
				<aside className='space-y-5 lg:sticky lg:top-6 self-start'>
					{/* Status & Aksi */}
					<Section title='Status & Aksi' icon={CheckCircle2}>
						<div className='mb-4'>
							<p
								className='text-xs mb-1.5'
								style={{ color: 'var(--text-muted)' }}>
								Status saat ini
							</p>
							<span
								className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold'
								style={{ background: color.bg, color: color.color }}>
								{ORDER_STATUS_LABEL[order.status]}
							</span>
						</div>
						{nextStatuses.length === 0 ? (
							<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
								Pesanan {ORDER_STATUS_LABEL[order.status].toLowerCase()} —
								tidak ada aksi lanjutan.
							</p>
						) : (
							<div className='flex flex-col gap-2.5'>
								{nextStatuses.map((target) => {
									const isCancel = target === 'CANCELLED';
									return (
										<Button
											key={target}
											type='button'
											variant={isCancel ? 'destructive' : 'default'}
											className='w-full justify-center'
											onClick={() => setPending(target)}
											disabled={updateStatus.isPending}>
											{isCancel ? (
												<XCircle size={15} />
											) : (
												<CheckCircle2 size={15} />
											)}
											{ACTION_LABEL[target]}
										</Button>
									);
								})}
							</div>
						)}
					</Section>

					{/* Rincian biaya */}
					<Section title='Rincian Biaya' icon={Receipt}>
						<dl className='space-y-2.5 text-sm'>
							<div className='flex items-center justify-between'>
								<dt style={{ color: 'var(--text-secondary)' }}>Subtotal</dt>
								<dd className='font-medium'>{formatRupiah(order.subtotal)}</dd>
							</div>
							<div className='flex items-center justify-between'>
								<dt
									className='flex items-center gap-2'
									style={{ color: 'var(--text-secondary)' }}>
									Ongkir
									{order.shippingArea && (
										<Badge variant='secondary'>
											Zona: {order.shippingArea}
										</Badge>
									)}
								</dt>
								<dd className='font-medium'>
									{formatRupiah(order.shippingCost)}
								</dd>
							</div>

							{/* Editor ongkir (admin) */}
							<div className='rounded-xl border border-[var(--border)] p-3 mt-1 space-y-3'>
								<div className='space-y-1.5'>
									<Label htmlFor='shippingZone' className='text-xs'>
										Pilih zona
									</Label>
									<Select
										value={shippingAreaId || undefined}
										onValueChange={(id) => {
											setShippingAreaId(id);
											const z = deliveryAreas.find((a) => a.id === id);
											if (z) setShippingAmount(String(z.shippingCost));
										}}>
										<SelectTrigger
											id='shippingZone'
											className='w-full'
											aria-label='Zona pengiriman'>
											<SelectValue placeholder='Pilih zona pengiriman' />
										</SelectTrigger>
										<SelectContent className='max-h-64'>
											{deliveryAreas.map((z) => (
												<SelectItem key={z.id} value={z.id}>
													{z.name} — {formatRupiah(z.shippingCost)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-1.5'>
									<Label htmlFor='shippingAmount' className='text-xs'>
										Atau nominal manual (Rp)
									</Label>
									<Input
										id='shippingAmount'
										type='number'
										min={0}
										value={shippingAmount}
										onChange={(e) => {
											setShippingAmount(e.target.value);
											// Edit manual = override → lupakan zona terpilih.
											setShippingAreaId('');
										}}
									/>
								</div>
								<Button
									type='button'
									className='w-full justify-center'
									onClick={handleSaveShipping}
									disabled={setShipping.isPending || amountInvalid}>
									{setShipping.isPending ? 'Menyimpan...' : 'Simpan Ongkir'}
								</Button>
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
							<div className='flex items-center justify-between pt-3 mt-1 border-t border-[var(--border)]'>
								<dt className='font-semibold'>Total</dt>
								<dd
									className='font-semibold text-lg'
									style={{ color: 'var(--primary)' }}>
									{formatRupiah(order.total)}
								</dd>
							</div>
						</dl>
					</Section>
				</aside>
			</div>

			<ConfirmDialog
				open={pending !== null}
				onClose={() => setPending(null)}
				onConfirm={() => {
					if (pending)
						updateStatus.mutate({ id: order.id, status: pending });
				}}
				title={pending ? ACTION_LABEL[pending] : ''}
				description={pending ? confirmCopy[pending] : undefined}
				icon={pending === 'CANCELLED' ? XCircle : CheckCircle2}
				tone={pending === 'CANCELLED' ? 'danger' : 'primary'}
				confirmLabel={pending ? ACTION_LABEL[pending] : 'Lanjutkan'}
				loadingLabel='Memproses...'
				loading={updateStatus.isPending}
			/>
		</div>
	);
}
