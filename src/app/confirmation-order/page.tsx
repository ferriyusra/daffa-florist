'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	AlertTriangle,
	ArrowLeft,
	CalendarClock,
	CheckCircle2,
	CreditCard,
	Landmark,
	MapPin,
	Minus,
	Package,
	Plus,
	ShieldCheck,
	ShoppingBag,
	StickyNote,
	Trash2,
	Wallet,
} from 'lucide-react';
import { Footer, Navbar } from '@/components';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { formatRupiah, useAuth, useCart, useToast } from '@/hooks';
import { addDays, computePickupDate, floorToUtcDay } from '@/lib/rental';
import { MIN_LEAD_TIME_DAYS } from '@/lib/rental-config';
import { api } from '@/trpc/react';

// Metode bayar untuk M2: hanya menangkap PILIHAN dan dilipat ke `notes`.
// CATATAN: unggah bukti pembayaran DITUNDA — belum ada model `Payment`/endpoint.
const paymentMethods = [
	{
		id: 'transfer',
		label: 'Transfer Bank',
		sub: 'BCA, BRI, Mandiri',
		Icon: Landmark,
	},
] as const;

type PaymentMethodId = (typeof paymentMethods)[number]['id'];

/** Slot jam acara 07:00–22:00 tiap 30 menit. */
const TIME_SLOTS: string[] = (() => {
	const slots: string[] = [];
	for (let m = 7 * 60; m <= 22 * 60; m += 30) {
		const hh = String(Math.floor(m / 60)).padStart(2, '0');
		const mm = String(m % 60).padStart(2, '0');
		slots.push(`${hh}:${mm}`);
	}
	return slots;
})();

/** Format tanggal sewa selalu di zona UTC agar tidak bergeser hari bagi pengguna WIB. */
function formatRentalDate(date: Date): string {
	return date.toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

export default function ConfirmationOrderPage() {
	return (
		<>
			<Navbar />
			<CheckoutScreen />
			<Footer />
		</>
	);
}

function CheckoutScreen() {
	const router = useRouter();
	const toast = useToast();
	const { user, isLoading: authLoading } = useAuth();
	const {
		items,
		isLoading: cartLoading,
		updateQuantity,
		removeItem,
		clear,
		subtotal,
	} = useCart();

	const [recipientName, setRecipientName] = useState('');
	const [phone, setPhone] = useState('');
	const [fullAddress, setFullAddress] = useState('');
	const [city, setCity] = useState('');
	const [deliveryAreaId, setDeliveryAreaId] = useState('');
	const [eventTime, setEventTime] = useState('');
	const [boardMessage, setBoardMessage] = useState('');
	const [paymentMethod, setPaymentMethod] =
		useState<PaymentMethodId>('transfer');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [submitted, setSubmitted] = useState(false);
	const [orderNumber, setOrderNumber] = useState('');
	const [orderTotal, setOrderTotal] = useState(0);

	const { data: zones = [] } = api.deliveryArea.list.useQuery();
	const selectedZone = zones.find((z) => z.id === deliveryAreaId) ?? null;

	const createRental = api.order.createRental.useMutation();
	const submitting = createRental.isPending;
	// Guard re-entrancy SINKRON (sebelum await) — `submitting` baru update setelah
	// re-render, jadi ref ini menutup celah klik-ganda / Enter.
	const submitGuard = useRef(false);

	useEffect(() => {
		if (!authLoading && !user) {
			router.replace('/login?redirect=/confirmation-order');
		}
	}, [authLoading, user, router]);

	// Ongkir mengikuti zona yang dipilih pelanggan (S4.3). Diskon M2 = Rp 0.
	const shipping = selectedZone?.shippingCost ?? 0;
	const discount = 0;
	const total = subtotal + shipping - discount;

	// Zona wajib dipilih HANYA bila ada zona tersedia (graceful degrade saat kosong).
	const needsZone = zones.length > 0 && !deliveryAreaId;

	// Pre-flight lead time: tanggal pasang yang dipilih bisa sudah lewat batas
	// saat checkout (item lama di keranjang). Tandai item kedaluwarsa & blokir
	// submit dengan jalur perbaikan jelas, sebelum kena tolak server.
	const minInstall = useMemo(
		() => addDays(floorToUtcDay(new Date()), MIN_LEAD_TIME_DAYS),
		[],
	);
	const staleIds = useMemo(
		() =>
			new Set(
				items
					.filter(
						(i) => new Date(i.installDate).getTime() < minInstall.getTime(),
					)
					.map((i) => i.id),
			),
		[items, minInstall],
	);
	const hasStale = staleIds.size > 0;

	// Tanggal acara MENGIKUTI tanggal pasang (dipilih di detail produk, sudah lewat
	// cek ketersediaan) — pakai yang paling awal bila item berbeda tanggal. Di
	// checkout pelanggan hanya memilih JAM, tak memilih tanggal lagi (anti-duplikat).
	const eventBaseIso = items.length
		? items.reduce(
				(min, i) => (i.installDate < min ? i.installDate : min),
				items[0]!.installDate,
			)
		: '';

	const validate = () => {
		const next: Record<string, string> = {};
		if (!recipientName.trim())
			next.recipientName = 'Nama penerima wajib diisi.';
		if (!phone.trim()) next.phone = 'Nomor telepon wajib diisi.';
		if (!fullAddress.trim()) next.fullAddress = 'Alamat acara wajib diisi.';
		if (!city.trim()) next.city = 'Kota wajib diisi.';
		if (!eventTime) next.eventDate = 'Jam acara wajib dipilih.';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitGuard.current || submitting) return;
		if (!validate()) return;
		if (hasStale) {
			toast.error(
				'Ada item dengan tanggal pasang yang sudah lewat batas pemesanan. Pilih ulang periodenya.',
			);
			return;
		}
		if (needsZone) {
			toast.error('Pilih zona pengiriman terlebih dahulu.');
			return;
		}
		submitGuard.current = true;

		const methodLabel =
			paymentMethods.find((m) => m.id === paymentMethod)?.label ?? '';
		// Pesan papan dilipat ke notes (belum ada field boardMessage per item di M2).
		const composedNotes = [
			`Metode bayar: ${methodLabel}`,
			boardMessage.trim() ? `Pesan papan: ${boardMessage.trim()}` : '',
		]
			.filter(Boolean)
			.join('\n');

		try {
			// Alamat acara dibuat DI DALAM transaksi createRental (rollback bila
			// order gagal) → satu mutation, tak ada alamat yatim / dobel saat retry.
			const order = await createRental.mutateAsync({
				address: {
					recipientName: recipientName.trim(),
					phone: phone.trim(),
					fullAddress: fullAddress.trim(),
					city: city.trim(),
				},
				// Tanggal acara = tanggal pasang (dari keranjang) + jam dipilih, di WIB.
				eventDate: new Date(
					`${eventBaseIso.slice(0, 10)}T${eventTime}:00+07:00`,
				),
				...(deliveryAreaId ? { deliveryAreaId } : {}),
				notes: composedNotes,
				items: items.map((i) => ({
					productId: i.productId,
					sizeLabel: i.sizeLabel,
					quantity: i.quantity,
					installDate: new Date(i.installDate),
					rentalDays: i.rentalDays,
					designTemplateName: i.designTemplateName,
					themeColorName: i.themeColorName,
					addonNames: i.addonNames,
				})),
			});

			setOrderNumber(order.orderNumber);
			setOrderTotal(order.total);
			setSubmitted(true);
			clear();
		} catch (err) {
			// Jangan kosongkan keranjang — pengguna mungkin perlu memperbaiki tanggal
			// (mis. periode penuh / lead time kurang).
			const message =
				err instanceof Error
					? err.message
					: 'Gagal membuat pesanan. Silakan coba lagi.';
			toast.error(message);
		} finally {
			submitGuard.current = false;
		}
	};

	if (authLoading || !user || cartLoading) {
		return <main className='floral-bg min-h-[60vh]' />;
	}

	if (submitted) {
		return <SuccessScreen orderNumber={orderNumber} total={orderTotal} />;
	}

	if (items.length === 0) {
		return <EmptyCartScreen />;
	}

	return (
		<main className='floral-bg min-h-[70vh]'>
			<div className='mx-auto max-w-[1100px] px-6 py-12'>
				<Link
					href='/products'
					className='inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors'
					style={{ color: 'var(--primary)' }}>
					<ArrowLeft size={16} />
					Lanjut Sewa
				</Link>

				<div className='mb-8'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}>
						Checkout
					</span>
					<h1 className='font-serif text-3xl sm:text-4xl font-bold mb-2'>
						Konfirmasi Pesanan
					</h1>
					<p
						className='text-sm sm:text-base'
						style={{ color: 'var(--text-secondary)' }}>
						Periksa kembali periode sewa Anda dan lengkapi lokasi acara.
					</p>
				</div>

				<form
					onSubmit={handlePlaceOrder}
					className='grid lg:grid-cols-[1fr_360px] gap-6'>
					<div className='space-y-5'>
						<Section
							icon={ShoppingBag}
							title='Pesanan Anda'
							subtitle={`${items.length} item dalam keranjang`}>
							<div className='divide-y divide-[var(--border)]'>
								{items.map((item) => {
									const install = new Date(item.installDate);
									const pickup = computePickupDate(install, item.rentalDays);
									const isStale = staleIds.has(item.id);
									return (
										<div
											key={item.id}
											className='flex gap-4 py-4 first:pt-0 last:pb-0'>
											<div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[var(--border)] shrink-0'>
												<Image
													src={item.image}
													alt={item.title}
													fill
													className='object-cover'
													sizes='96px'
												/>
											</div>
											<div className='flex-1 min-w-0 flex flex-col gap-2'>
												<div className='flex items-start justify-between gap-3'>
													<div className='min-w-0'>
														<h3 className='font-serif text-base font-semibold truncate'>
															{item.title}
														</h3>
														<p
															className='text-xs mt-0.5'
															style={{ color: 'var(--text-secondary)' }}>
															{item.sizeLabel} · {formatRupiah(item.price)} /
															item
														</p>
													</div>
													<button
														type='button'
														onClick={() => removeItem(item.id)}
														aria-label={`Hapus ${item.title}`}
														className='inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] hover:border-[#dc2626] transition-colors cursor-pointer'
														style={{ color: 'var(--text-muted)' }}>
														<Trash2 size={13} />
													</button>
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
														Pasang {formatRentalDate(install)} → Bongkar{' '}
														{formatRentalDate(pickup)} · {item.rentalDays} hari
													</span>
												</p>
												{isStale && (
													<div
														className='flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[11px]'
														style={{
															background: 'rgba(220, 38, 38, 0.06)',
															color: '#dc2626',
														}}>
														<AlertTriangle
															size={13}
															className='mt-0.5 shrink-0'
														/>
														<span>
															Tanggal pasang sudah lewat batas pemesanan.{' '}
															<Link
																href={`/products/${item.slug}`}
																className='font-semibold underline'>
																Pilih ulang periode
															</Link>
															.
														</span>
													</div>
												)}
												<div className='flex items-center justify-between'>
													<QuantityStepper
														value={item.quantity}
														onChange={(q) => updateQuantity(item.id, q)}
													/>
													<span
														className='text-sm font-semibold'
														style={{ color: 'var(--primary)' }}>
														{formatRupiah(item.price * item.quantity)}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</Section>

						<Section
							icon={MapPin}
							title='Lokasi Acara & Penerima'
							subtitle='Alamat pemasangan papan bunga'>
							<div className='space-y-4'>
								<div className='grid sm:grid-cols-2 gap-4'>
									<Field
										id='recipientName'
										label='Nama Penerima'
										value={recipientName}
										onChange={setRecipientName}
										placeholder='Nama penerima di lokasi'
										error={errors.recipientName}
									/>
									<Field
										id='phone'
										label='Nomor Telepon'
										value={phone}
										onChange={setPhone}
										placeholder='08xxxxxxxxxx'
										error={errors.phone}
									/>
								</div>
								<Field
									id='fullAddress'
									label='Alamat Lengkap Acara'
									value={fullAddress}
									onChange={setFullAddress}
									placeholder='Nama gedung / jalan, nomor, kelurahan, kecamatan'
									error={errors.fullAddress}
									textarea
								/>
								<div className='space-y-4'>
									<Field
										id='city'
										label='Kota / Kabupaten'
										value={city}
										onChange={setCity}
										placeholder='mis. Pasaman Barat'
										error={errors.city}
									/>
									{zones.length > 0 && (
										<div>
											<label
												className='block text-xs font-medium mb-2'
												htmlFor='deliveryArea'>
												Zona Pengiriman
											</label>
											<Select
												value={deliveryAreaId || undefined}
												onValueChange={setDeliveryAreaId}>
												<SelectTrigger
													id='deliveryArea'
													className='h-auto w-full rounded-xl bg-muted px-4 py-3'
													aria-label='Zona pengiriman'>
													<SelectValue placeholder='Pilih zona pengiriman' />
												</SelectTrigger>
												<SelectContent className='max-h-64'>
													{zones.map((z) => (
														<SelectItem key={z.id} value={z.id}>
															{z.name} — {formatRupiah(z.shippingCost)}
															{z.district ? (
																<span style={{ color: 'var(--text-muted)' }}>
																	{' '}
																	· {z.district}
																</span>
															) : null}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<p
												className='text-[11px] mt-1.5'
												style={{ color: 'var(--text-muted)' }}>
												Ongkir mengikuti zona pengiriman yang dipilih.
											</p>
										</div>
									)}
									<div>
										<label
											className='block text-xs font-medium mb-2'
											htmlFor='eventTime'>
											Tanggal &amp; Jam Acara
										</label>
										<div className='grid grid-cols-2 gap-2'>
											{/* Tanggal = tanggal pasang (read-only, dari keranjang) */}
											<div
												className='inline-flex items-center gap-2 h-auto px-4 py-3 rounded-xl border text-sm'
												style={{
													borderColor: 'var(--border)',
													background: 'var(--bg-surface)',
													color: 'var(--text-secondary)',
												}}>
												<CalendarClock
													size={15}
													className='shrink-0'
													style={{ color: 'var(--primary)' }}
												/>
												<span className='truncate'>
													{eventBaseIso
														? formatRentalDate(new Date(eventBaseIso))
														: '—'}
												</span>
											</div>
											<Select
												value={eventTime || undefined}
												onValueChange={setEventTime}>
												<SelectTrigger
													id='eventTime'
													className='h-auto w-full rounded-xl bg-muted px-4 py-3'
													aria-label='Jam acara'>
													<SelectValue placeholder='Pilih jam' />
												</SelectTrigger>
												<SelectContent className='max-h-64'>
													{TIME_SLOTS.map((t) => (
														<SelectItem key={t} value={t}>
															{t}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<p
											className='text-[11px] mt-1.5'
											style={{ color: 'var(--text-muted)' }}>
											Tanggal mengikuti tanggal pasang yang dipilih — pilih jam
											acara.
										</p>
										{errors.eventDate && (
											<p
												className='text-[11px] mt-1'
												style={{ color: 'var(--destructive)' }}>
												{errors.eventDate}
											</p>
										)}
									</div>
								</div>
							</div>
						</Section>

						<Section
							icon={StickyNote}
							title='Catatan Papan / Pesan'
							subtitle='Opsional — teks pada papan bunga atau permintaan khusus'>
							<textarea
								value={boardMessage}
								onChange={(e) => setBoardMessage(e.target.value)}
								rows={3}
								maxLength={300}
								placeholder='Contoh: Tulisan papan "Selamat & Sukses" untuk Bapak Andi...'
								className='w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none'
							/>
							<p
								className='text-[11px] mt-1.5 text-right'
								style={{ color: 'var(--text-muted)' }}>
								{boardMessage.length} / 300
							</p>
						</Section>

						<Section
							icon={CreditCard}
							title='Metode Pembayaran'
							subtitle='Pilih cara pembayaran Anda'>
							<div className='space-y-2'>
								{paymentMethods.map((m) => {
									const active = paymentMethod === m.id;
									const Icon = m.Icon;
									return (
										<label
											key={m.id}
											className='flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors'
											style={{
												borderColor: active
													? 'var(--primary)'
													: 'var(--border)',
												background: active
													? 'rgba(157, 23, 77, 0.04)'
													: 'transparent',
											}}>
											<input
												type='radio'
												name='payment'
												value={m.id}
												checked={active}
												onChange={() => setPaymentMethod(m.id)}
												className='sr-only'
											/>
											<div
												className='w-10 h-10 rounded-full flex items-center justify-center shrink-0'
												style={{
													background: active
														? 'var(--primary)'
														: 'rgba(157, 23, 77, 0.08)',
													color: active ? 'white' : 'var(--primary)',
												}}>
												<Icon size={16} />
											</div>
											<div className='flex-1'>
												<p className='text-sm font-semibold'>{m.label}</p>
												<p
													className='text-xs'
													style={{ color: 'var(--text-secondary)' }}>
													{m.sub}
												</p>
											</div>
											<div
												className='w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0'
												style={{
													borderColor: active
														? 'var(--primary)'
														: 'var(--border)',
												}}>
												{active && (
													<div
														className='w-2.5 h-2.5 rounded-full'
														style={{ background: 'var(--primary)' }}
													/>
												)}
											</div>
										</label>
									);
								})}
							</div>
						</Section>
					</div>

					{/* Sticky summary */}
					<aside className='lg:sticky lg:top-24 self-start'>
						<div
							className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
							style={{ boxShadow: 'var(--shadow-md)' }}>
							<div
								className='px-5 py-4 border-b border-[var(--border)] flex items-center gap-2'
								style={{ background: 'rgba(157, 23, 77, 0.05)' }}>
								<Package size={16} style={{ color: 'var(--primary)' }} />
								<h2 className='font-serif text-base font-semibold'>
									Ringkasan Pesanan
								</h2>
							</div>

							<div className='p-5 space-y-3'>
								<Row
									label={`Subtotal (${items.length} item)`}
									value={formatRupiah(subtotal)}
								/>
								<Row
									label='Ongkir'
									value={
										selectedZone ? formatRupiah(shipping) : 'Pilih zona dulu'
									}
									muted={!selectedZone}
								/>
								<Row label='Diskon' value={formatRupiah(discount)} />
								<div className='pt-3 border-t border-[var(--border)]'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-semibold'>Total</span>
										<span
											className='font-serif text-xl font-bold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(total)}
										</span>
									</div>
									<p
										className='text-[11px] mt-1'
										style={{ color: 'var(--text-muted)' }}>
										{zones.length > 0
											? 'Ongkir mengikuti zona pengiriman yang Anda pilih.'
											: 'Ongkir ditetapkan admin sesuai zona acara Anda.'}
									</p>
								</div>

								{hasStale && (
									<p
										className='flex items-start gap-1.5 text-[11px]'
										style={{ color: '#dc2626' }}>
										<AlertTriangle size={13} className='mt-0.5 shrink-0' />
										Ada item dengan tanggal pasang kedaluwarsa — pilih ulang
										periodenya sebelum melanjutkan.
									</p>
								)}

								{needsZone && !hasStale && (
									<p
										className='flex items-start gap-1.5 text-[11px]'
										style={{ color: 'var(--text-muted)' }}>
										<AlertTriangle size={13} className='mt-0.5 shrink-0' />
										Pilih zona pengiriman dulu untuk melanjutkan.
									</p>
								)}

								<button
									type='submit'
									disabled={submitting || hasStale || needsZone}
									className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
									style={{ background: 'var(--primary)' }}>
									{submitting ? 'Memproses...' : 'Buat Pesanan Sewa'}
								</button>

								<div
									className='flex items-center justify-center gap-2 text-[11px] pt-2'
									style={{ color: 'var(--text-muted)' }}>
									<ShieldCheck size={12} />
									Pesanan aman & terjamin
								</div>
							</div>
						</div>
					</aside>
				</form>
			</div>
		</main>
	);
}

function Section({
	icon: Icon,
	title,
	subtitle,
	action,
	children,
}: {
	icon: typeof MapPin;
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div
			className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
			style={{ boxShadow: 'var(--shadow-sm)' }}>
			<div className='px-5 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3'>
				<div className='flex items-center gap-3 min-w-0'>
					<div
						className='w-9 h-9 rounded-full flex items-center justify-center shrink-0'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}>
						<Icon size={16} />
					</div>
					<div className='min-w-0'>
						<h2 className='font-serif text-base font-semibold leading-tight'>
							{title}
						</h2>
						{subtitle && (
							<p
								className='text-xs mt-0.5'
								style={{ color: 'var(--text-secondary)' }}>
								{subtitle}
							</p>
						)}
					</div>
				</div>
				{action}
			</div>
			<div className='p-5'>{children}</div>
		</div>
	);
}

function Field({
	id,
	label,
	value,
	onChange,
	placeholder,
	error,
	textarea,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	error?: string;
	textarea?: boolean;
}) {
	const baseClass =
		'w-full px-4 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors';
	const borderColor = error ? 'var(--destructive)' : 'var(--border)';
	return (
		<div>
			<label className='block text-xs font-medium mb-2' htmlFor={id}>
				{label}
			</label>
			{textarea ? (
				<textarea
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					rows={2}
					placeholder={placeholder}
					className={`${baseClass} resize-none`}
					style={{ borderColor }}
				/>
			) : (
				<input
					id={id}
					type='text'
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={baseClass}
					style={{ borderColor }}
				/>
			)}
			{error && (
				<p
					className='text-[11px] mt-1.5'
					style={{ color: 'var(--destructive)' }}>
					{error}
				</p>
			)}
		</div>
	);
}

function Row({
	label,
	value,
	muted,
}: {
	label: string;
	value: string;
	muted?: boolean;
}) {
	return (
		<div className='flex items-center justify-between text-sm'>
			<span style={{ color: 'var(--text-secondary)' }}>{label}</span>
			<span
				className='font-medium'
				style={muted ? { color: 'var(--text-muted)' } : undefined}>
				{value}
			</span>
		</div>
	);
}

function QuantityStepper({
	value,
	onChange,
}: {
	value: number;
	onChange: (next: number) => void;
}) {
	return (
		<div
			className='inline-flex items-center rounded-full border border-[var(--border)] overflow-hidden'
			style={{ background: 'var(--bg-surface)' }}>
			<button
				type='button'
				onClick={() => onChange(Math.max(1, value - 1))}
				aria-label='Kurangi jumlah'
				disabled={value <= 1}
				className='inline-flex items-center justify-center w-8 h-8 cursor-pointer hover:text-[var(--primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
				style={{ color: 'var(--text-secondary)' }}>
				<Minus size={13} />
			</button>
			<span className='w-8 text-center text-sm font-semibold tabular-nums'>
				{value}
			</span>
			<button
				type='button'
				onClick={() => onChange(value + 1)}
				aria-label='Tambah jumlah'
				className='inline-flex items-center justify-center w-8 h-8 cursor-pointer hover:text-[var(--primary)] transition-colors'
				style={{ color: 'var(--text-secondary)' }}>
				<Plus size={13} />
			</button>
		</div>
	);
}

function EmptyCartScreen() {
	return (
		<main className='floral-bg min-h-[70vh] flex items-center justify-center px-6 py-16'>
			<div
				className='text-center max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-10'
				style={{ boxShadow: 'var(--shadow-sm)' }}>
				<div
					className='mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5'
					style={{ background: 'rgba(157, 23, 77, 0.08)' }}>
					<ShoppingBag size={32} style={{ color: 'var(--primary)' }} />
				</div>
				<h1 className='font-serif text-2xl font-bold mb-2'>
					Keranjang Anda Kosong
				</h1>
				<p className='text-sm mb-6' style={{ color: 'var(--text-secondary)' }}>
					Belum ada papan bunga yang Anda pilih. Yuk pilih dan tentukan periode
					sewanya!
				</p>
				<Link
					href='/products'
					className='inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
					style={{ background: 'var(--primary)' }}>
					Mulai Sewa
				</Link>
			</div>
		</main>
	);
}

function SuccessScreen({
	orderNumber,
	total,
}: {
	orderNumber: string;
	total: number;
}) {
	return (
		<main className='floral-bg min-h-[70vh] flex items-center justify-center px-6 py-16'>
			<div
				className='text-center max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-10'
				style={{ boxShadow: 'var(--shadow-md)' }}>
				<div
					className='mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5'
					style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
					<CheckCircle2 size={36} style={{ color: '#16a34a' }} />
				</div>
				<h1 className='font-serif text-2xl font-bold mb-2'>
					Pesanan Berhasil Dibuat!
				</h1>
				<p className='text-sm mb-2' style={{ color: 'var(--text-secondary)' }}>
					Nomor pesanan Anda
				</p>
				<p
					className='font-mono text-lg font-bold mb-2'
					style={{ color: 'var(--primary)' }}>
					{orderNumber}
				</p>
				<p className='text-sm mb-6' style={{ color: 'var(--text-secondary)' }}>
					Total{' '}
					<span className='font-semibold' style={{ color: 'var(--text)' }}>
						{formatRupiah(total)}
					</span>
				</p>

				<div
					className='rounded-xl border border-[var(--border)] p-4 mb-6 text-left'
					style={{ background: 'rgba(157, 23, 77, 0.03)' }}>
					<p
						className='text-xs font-semibold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5'
						style={{ color: 'var(--text-muted)' }}>
						<Landmark size={12} style={{ color: 'var(--primary)' }} />
						Instruksi Pembayaran (Transfer Bank)
					</p>
					<ul
						className='space-y-1 text-sm'
						style={{ color: 'var(--text-secondary)' }}>
						<li>
							BCA <span className='font-semibold'>1234567890</span> a.n. Dafa
							Florist
						</li>
						<li>
							BRI <span className='font-semibold'>0987654321</span> a.n. Dafa
							Florist
						</li>
					</ul>
					<p
						className='text-xs mt-2'
						style={{ color: 'var(--text-secondary)' }}>
						Tim Dafa Florist akan mengonfirmasi pembayaran &amp; ongkir sesuai
						zona acara Anda.
					</p>
				</div>

				<div className='flex flex-col sm:flex-row gap-2'>
					<Link
						href='/dashboard/orders'
						className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
						style={{ background: 'var(--primary)' }}>
						Lihat Pesanan Saya
					</Link>
					<Link
						href='/'
						className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-[var(--border)] transition-colors hover:bg-[rgba(0,0,0,0.03)]'>
						Beranda
					</Link>
				</div>
			</div>
		</main>
	);
}
