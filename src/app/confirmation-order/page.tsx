'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	CalendarDays,
	CheckCircle2,
	CreditCard,
	Home,
	Landmark,
	Minus,
	Package,
	Plus,
	ShieldCheck,
	ShoppingBag,
	StickyNote,
	Trash2,
	Truck,
	Wallet,
} from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { formatRupiah, useAuth, useCart } from '@/hooks';

const SHIPPING_FEE = 25_000;

const paymentMethods = [
	{ id: 'transfer', label: 'Transfer Bank', sub: 'BCA, BRI, Mandiri', Icon: Landmark },
	{ id: 'ewallet', label: 'E-Wallet', sub: 'OVO, DANA, GoPay', Icon: Wallet },
	{ id: 'cod', label: 'Bayar di Tempat (COD)', sub: 'Bayar saat barang sampai', Icon: CreditCard },
] as const;

const dummyAddress = {
	label: 'Rumah',
	recipient: 'Pengguna Demo',
	phone: '0852-7432-0917',
	full: 'Jl. Melati No. 12, RT 02 / RW 03, Ampar Putih, Pasaman Barat, Sumatera Barat 26566',
};

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
	const { user, isLoading: authLoading } = useAuth();
	const { items, isLoading: cartLoading, updateQuantity, removeItem, clear, subtotal } = useCart();

	const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]['id']>('transfer');
	const [deliveryDate, setDeliveryDate] = useState('');
	const [notes, setNotes] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [orderId, setOrderId] = useState('');

	useEffect(() => {
		if (!authLoading && !user) {
			router.replace('/login?redirect=/confirmation-order');
		}
	}, [authLoading, user, router]);

	const shipping = items.length > 0 ? SHIPPING_FEE : 0;
	const total = subtotal + shipping;

	const minDate = useMemo(() => {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return d.toISOString().split('T')[0];
	}, []);

	const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);
		setTimeout(() => {
			const id = `DF-${new Date().getFullYear()}-${String(
				Math.floor(Math.random() * 9000) + 1000,
			)}`;
			setOrderId(id);
			setSubmitted(true);
			clear();
			setSubmitting(false);
		}, 800);
	};

	if (authLoading || !user || cartLoading) {
		return <main className='floral-bg min-h-[60vh]' />;
	}

	if (submitted) {
		return <SuccessScreen orderId={orderId} />;
	}

	if (items.length === 0) {
		return <EmptyCartScreen />;
	}

	return (
		<main className='floral-bg min-h-[70vh]'>
			<div className='mx-auto max-w-[1100px] px-6 py-12'>
				<Link
					href='/#product'
					className='inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors'
					style={{ color: 'var(--primary)' }}>
					<ArrowLeft size={16} />
					Lanjut Belanja
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
						Periksa kembali pesanan Anda dan lengkapi detail pengiriman.
					</p>
				</div>

				<form
					onSubmit={handlePlaceOrder}
					className='grid lg:grid-cols-[1fr_360px] gap-6'>
					<div className='space-y-5'>
						<Section
							icon={ShoppingBag}
							title='Pesanan Anda'
							subtitle={`${items.length} produk dalam keranjang`}>
							<div className='divide-y divide-[var(--border)]'>
								{items.map((item) => (
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
														{formatRupiah(item.price)} / item
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
								))}
							</div>
						</Section>

						<Section
							icon={Home}
							title='Alamat Pengiriman'
							subtitle='Alamat utama Anda'
							action={
								<Link
									href='/dashboard/addresses'
									className='text-xs font-semibold transition-colors'
									style={{ color: 'var(--primary)' }}>
									Ubah
								</Link>
							}>
							<div
								className='rounded-xl p-4 border-2'
								style={{
									borderColor: 'var(--primary)',
									background: 'rgba(157, 23, 77, 0.04)',
								}}>
								<div className='flex items-center gap-2 mb-2'>
									<span
										className='inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider'
										style={{
											background: 'var(--primary)',
											color: 'white',
										}}>
										{dummyAddress.label}
									</span>
									<span className='text-sm font-semibold'>
										{dummyAddress.recipient}
									</span>
									<span
										className='text-xs'
										style={{ color: 'var(--text-secondary)' }}>
										· {dummyAddress.phone}
									</span>
								</div>
								<p
									className='text-sm leading-relaxed'
									style={{ color: 'var(--text-secondary)' }}>
									{dummyAddress.full}
								</p>
							</div>
						</Section>

						<Section
							icon={Truck}
							title='Detail Pengiriman'
							subtitle='Pilih tanggal pengantaran'>
							<label
								className='block text-xs font-medium mb-2'
								htmlFor='deliveryDate'>
								Tanggal Pengantaran
							</label>
							<div className='relative'>
								<CalendarDays
									size={16}
									className='absolute left-3 top-1/2 -translate-y-1/2'
									style={{ color: 'var(--text-muted)' }}
								/>
								<input
									id='deliveryDate'
									type='date'
									min={minDate}
									value={deliveryDate}
									onChange={(e) => setDeliveryDate(e.target.value)}
									className='w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
								/>
							</div>
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

						<Section
							icon={StickyNote}
							title='Catatan'
							subtitle='Opsional — pesan untuk penerima atau permintaan khusus'>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
								maxLength={200}
								placeholder='Contoh: Tulisan papan bunga "Selamat & Sukses" untuk Bapak Andi...'
								className='w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none'
							/>
							<p
								className='text-[11px] mt-1.5 text-right'
								style={{ color: 'var(--text-muted)' }}>
								{notes.length} / 200
							</p>
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
								<Package
									size={16}
									style={{ color: 'var(--primary)' }}
								/>
								<h2 className='font-serif text-base font-semibold'>
									Ringkasan Pesanan
								</h2>
							</div>

							<div className='p-5 space-y-3'>
								<Row label={`Subtotal (${items.length} produk)`} value={formatRupiah(subtotal)} />
								<Row label='Ongkos Kirim' value={formatRupiah(shipping)} />
								<div className='pt-3 border-t border-[var(--border)]'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-semibold'>Total</span>
										<span
											className='font-serif text-xl font-bold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(total)}
										</span>
									</div>
								</div>

								<button
									type='submit'
									disabled={submitting || !deliveryDate}
									className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
									style={{ background: 'var(--primary)' }}>
									{submitting ? 'Memproses...' : 'Buat Pesanan'}
								</button>

								<div
									className='flex items-center justify-center gap-2 text-[11px] pt-2'
									style={{ color: 'var(--text-muted)' }}>
									<ShieldCheck size={12} />
									Pembayaran aman & terjamin
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
	icon: typeof Home;
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

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex items-center justify-between text-sm'>
			<span style={{ color: 'var(--text-secondary)' }}>{label}</span>
			<span className='font-medium'>{value}</span>
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
					<ShoppingBag
						size={32}
						style={{ color: 'var(--primary)' }}
					/>
				</div>
				<h1 className='font-serif text-2xl font-bold mb-2'>
					Keranjang Anda Kosong
				</h1>
				<p
					className='text-sm mb-6'
					style={{ color: 'var(--text-secondary)' }}>
					Belum ada produk yang Anda tambahkan. Yuk pilih papan bunga favorit
					Anda!
				</p>
				<Link
					href='/#product'
					className='inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
					style={{ background: 'var(--primary)' }}>
					Mulai Belanja
				</Link>
			</div>
		</main>
	);
}

function SuccessScreen({ orderId }: { orderId: string }) {
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
				<p
					className='text-sm mb-2'
					style={{ color: 'var(--text-secondary)' }}>
					Nomor pesanan Anda
				</p>
				<p
					className='font-mono text-lg font-bold mb-6'
					style={{ color: 'var(--primary)' }}>
					{orderId}
				</p>
				<p
					className='text-sm mb-6'
					style={{ color: 'var(--text-secondary)' }}>
					Tim Dafa Florist akan segera menghubungi Anda untuk konfirmasi
					pembayaran dan pengiriman.
				</p>
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
