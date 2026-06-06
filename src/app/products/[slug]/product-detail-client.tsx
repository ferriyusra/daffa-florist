'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	CalendarDays,
	Check,
	ChevronRight,
	Loader2,
	MapPin,
	Minus,
	Package,
	Plus,
	ShieldCheck,
	ShoppingCart,
	Truck,
} from 'lucide-react';
import { formatRupiah, useAuth, useCart } from '@/hooks';
import type { Product } from '@/lib';
import { addDays, computePickupDate, floorToUtcDay } from '@/lib/rental';
import { MIN_LEAD_TIME_DAYS } from '@/lib/rental-config';
import { ProductImage, RentalDatePicker, RentalDurationSelector } from '@/components';
import { api } from '@/trpc/react';

const MAX_QUANTITY = 10;

export default function ProductDetailClient({
	product,
	related,
}: {
	product: Product;
	related: Product[];
}) {
	const router = useRouter();
	const { user } = useAuth();
	const { addItem } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [activeImage, setActiveImage] = useState(product.image);
	const [added, setAdded] = useState(false);
	const [selectedSizeId, setSelectedSizeId] = useState(product.sizes[0].id);
	const [selectedTemplateId, setSelectedTemplateId] = useState(
		product.designTemplates[0].id,
	);
	const [selectedColorId, setSelectedColorId] = useState(
		product.themeColors[0].id,
	);
	const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

	// Periode sewa (S2.3). installDate null = belum dipilih; durasi default 3 hari.
	const [installDate, setInstallDate] = useState<Date | null>(null);
	const [rentalDays, setRentalDays] = useState(3);

	// Batas tanggal dihitung SEKALI (identitas stabil) supaya tidak menjadi input
	// query yang berubah tiap render → mencegah refetch loop react-query.
	const [{ minDate, maxDate }] = useState(() => {
		const today = floorToUtcDay(new Date());
		const min = addDays(today, MIN_LEAD_TIME_DAYS);
		// Jendela ~120 hari (dalam batas cap server 366 hari).
		return { minDate: min, maxDate: addDays(min, 119) };
	});

	const selectedSize =
		product.sizes.find((s) => s.id === selectedSizeId) ?? product.sizes[0];
	const selectedTemplate =
		product.designTemplates.find((t) => t.id === selectedTemplateId) ??
		product.designTemplates[0];
	const selectedColor =
		product.themeColors.find((c) => c.id === selectedColorId) ??
		product.themeColors[0];
	const selectedAddons = product.addons.filter((a) =>
		selectedAddonIds.includes(a.id),
	);

	const unitPrice = useMemo(() => {
		const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
		return selectedSize.price + addonsTotal;
	}, [selectedSize, selectedAddons]);

	const totalPrice = unitPrice * quantity;

	// Saat ukuran berganti, RESET tanggal: hari yang kosong untuk satu ukuran bisa
	// penuh untuk ukuran lain (ketersediaan dihitung per ukuran).
	useEffect(() => {
		setInstallDate(null);
	}, [selectedSize.label]);

	// Hari penuh (untuk menonaktifkan tanggal di kalender). Re-run saat sizeLabel
	// berganti (bagian dari input → query key).
	const productId = product.id ?? '';
	const bookedDatesQuery = api.rental.getBookedDates.useQuery(
		{
			productId,
			sizeLabel: selectedSize.label,
			from: minDate,
			to: maxDate,
		},
		{ enabled: productId !== '' },
	);
	const bookedDates = bookedDatesQuery.data ?? [];

	// Ketersediaan untuk tanggal+durasi terpilih. enabled hanya saat tanggal diset.
	const availabilityQuery = api.rental.checkAvailability.useQuery(
		{
			productId,
			sizeLabel: selectedSize.label,
			installDate: installDate as Date,
			rentalDays,
		},
		{ enabled: installDate !== null && productId !== '' },
	);
	const availability = availabilityQuery.data;
	const checkingAvailability =
		installDate !== null && availabilityQuery.isFetching;

	const pickupDate =
		installDate !== null ? computePickupDate(installDate, rentalDays) : null;

	// Saran tanggal kosong berikutnya — hanya berguna bila MASIH di dalam jendela
	// kalender [minDate, maxDate]; di luar itu kalender tak bisa menampilkannya.
	const suggestion = availability?.nextAvailableDate
		? floorToUtcDay(availability.nextAvailableDate)
		: null;
	const suggestionInWindow =
		suggestion !== null && suggestion.getTime() <= maxDate.getTime();

	// Jangan aktifkan order saat masih memeriksa (data lama bisa stale, mis. setelah
	// ganti durasi) — cegah memesan periode yang sebenarnya penuh.
	const canOrder =
		installDate !== null &&
		availability?.available === true &&
		!availabilityQuery.isFetching;

	const cartId = `${product.slug}::${selectedSize.id}::${selectedColor.id}::${
		selectedTemplate.id
	}::${[...selectedAddonIds].sort().join(',')}`;

	const cartTitleParts = [
		product.title,
		`(${selectedSize.label}`,
		selectedColor.name ? `· ${selectedColor.name}` : '',
		`)`,
	];
	const cartTitle = cartTitleParts.join(' ').replace(/\s+\)/, ')');

	const cartInput = {
		id: cartId,
		title: cartTitle,
		price: unitPrice,
		priceLabel: formatRupiah(unitPrice),
		image: selectedTemplate.image || product.image,
	};

	const toggleAddon = (id: string) => {
		setSelectedAddonIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const handleAddToCart = () => {
		if (!canOrder) return;
		addItem(cartInput, quantity);
		setAdded(true);
		setTimeout(() => setAdded(false), 1800);
	};

	const handleOrderNow = () => {
		if (!canOrder) return;
		addItem(cartInput, quantity);
		const target = '/confirmation-order';
		router.push(
			user ? target : `/login?redirect=${encodeURIComponent(target)}`,
		);
	};

	return (
		<main className='floral-bg min-h-[70vh]'>
			<div className='mx-auto max-w-[1100px] px-6 py-10'>
				<nav
					aria-label='Breadcrumb'
					className='inline-flex items-center gap-1.5 text-xs mb-6'
					style={{ color: 'var(--text-secondary)' }}>
					<Link
						href='/'
						className='hover:text-[var(--primary)] transition-colors'>
						Beranda
					</Link>
					<ChevronRight size={12} />
					<Link
						href='/products'
						className='hover:text-[var(--primary)] transition-colors'>
						Produk
					</Link>
					<ChevronRight size={12} />
					<span style={{ color: 'var(--text)' }} className='font-medium'>
						{product.title}
					</span>
				</nav>

				<div className='grid lg:grid-cols-2 gap-8 mb-12'>
					<div>
						<div
							className='relative aspect-square rounded-2xl overflow-hidden border border-[var(--border)] mb-3'
							style={{ background: 'var(--bg-card)' }}>
							<ProductImage
								src={activeImage}
								alt={product.title}
								fill
								className='object-cover'
								sizes='(max-width: 1024px) 100vw, 540px'
								priority
							/>
							<span
								className='absolute top-4 left-4 inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider'
								style={{
									background: 'rgba(255, 255, 255, 0.95)',
									color: 'var(--primary)',
								}}>
								{product.category}
							</span>
						</div>
						{product.images.length > 1 && (
							<div className='grid grid-cols-4 gap-2'>
								{product.images.map((img) => {
									const active = img === activeImage;
									return (
										<button
											key={img}
											type='button'
											onClick={() => setActiveImage(img)}
											className='relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer'
											style={{
												borderColor: active
													? 'var(--primary)'
													: 'var(--border)',
												opacity: active ? 1 : 0.7,
											}}>
											<ProductImage
												src={img}
												alt={`${product.title} thumbnail`}
												fill
												className='object-cover'
												sizes='120px'
											/>
										</button>
									);
								})}
							</div>
						)}
					</div>

					<div className='flex flex-col'>
						<h1 className='font-serif text-3xl sm:text-4xl font-bold mb-3'>
							{product.title}
						</h1>
						<p
							className='text-base leading-relaxed mb-5'
							style={{ color: 'var(--text-secondary)' }}>
							{product.description}
						</p>

						<div className='inline-flex items-baseline gap-2 mb-6 pb-6 border-b border-[var(--border)]'>
							<span
								className='font-serif text-3xl font-bold'
								style={{ color: 'var(--primary)' }}>
								{formatRupiah(unitPrice)}
							</span>
							<span
								className='text-xs'
								style={{ color: 'var(--text-muted)' }}>
								/ unit
							</span>
						</div>

						{product.productionTime && (
							<div className='mb-6'>
								<p
									className='text-[11px] font-semibold uppercase tracking-wider mb-1'
									style={{ color: 'var(--text-muted)' }}>
									Estimasi Pengerjaan
								</p>
								<p className='text-sm font-medium'>
									{product.productionTime}
								</p>
							</div>
						)}

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2'
								style={{ color: 'var(--text-muted)' }}>
								Ukuran
							</p>
							<div className='flex flex-wrap gap-2'>
								{product.sizes.map((size) => {
									const active = size.id === selectedSizeId;
									return (
										<button
											key={size.id}
											type='button'
											onClick={() => setSelectedSizeId(size.id)}
											className='inline-flex flex-col items-start gap-0.5 px-4 py-2 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all'
											style={{
												borderColor: active
													? 'var(--primary)'
													: 'var(--border)',
												background: active
													? 'rgba(157, 23, 77, 0.06)'
													: 'var(--bg-surface)',
												color: active ? 'var(--primary)' : 'var(--text)',
											}}>
											<span>{size.label}</span>
											<span
												className='text-[10px] font-medium'
												style={{
													color: active
														? 'var(--primary)'
														: 'var(--text-muted)',
												}}>
												{size.priceLabel}
											</span>
										</button>
									);
								})}
							</div>
							{selectedSize.note && (
								<p
									className='text-[11px] mt-2'
									style={{ color: 'var(--text-muted)' }}>
									{selectedSize.note}
								</p>
							)}
						</div>

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2 inline-flex items-center gap-1'
								style={{ color: 'var(--text-muted)' }}>
								<CalendarDays size={11} />
								Periode Sewa
							</p>

							<RentalDatePicker
								value={installDate}
								onChange={setInstallDate}
								bookedDates={bookedDates}
								minDate={minDate}
								maxDate={maxDate}
								loading={bookedDatesQuery.isFetching}
							/>

							<p
								className='text-[10px] font-semibold uppercase tracking-wider mt-3 mb-2'
								style={{ color: 'var(--text-muted)' }}>
								Durasi
							</p>
							<RentalDurationSelector
								value={rentalDays}
								onChange={setRentalDays}
							/>

							{installDate !== null && pickupDate && (
								<p
									className='text-[11px] mt-3'
									style={{ color: 'var(--text-secondary)' }}>
									Estimasi bongkar:{' '}
									<span
										className='font-semibold'
										style={{ color: 'var(--text)' }}>
										{pickupDate.toLocaleDateString('id-ID', {
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											timeZone: 'UTC',
										})}
									</span>
								</p>
							)}

							{checkingAvailability && (
								<p
									className='text-xs mt-2 inline-flex items-center gap-1.5'
									style={{ color: 'var(--text-muted)' }}>
									<Loader2 size={13} className='animate-spin' />
									Memeriksa ketersediaan…
								</p>
							)}

							{!checkingAvailability &&
								installDate !== null &&
								availability?.available === true && (
									<p
										className='text-xs font-semibold mt-2 inline-flex items-center gap-1.5'
										style={{ color: '#16a34a' }}>
										<Check size={14} />
										Tersedia · sisa {availability.remainingUnits} unit
									</p>
								)}

							{!checkingAvailability &&
								installDate !== null &&
								availability?.available === false && (
									<div className='mt-2 space-y-1.5'>
										<p
											className='text-xs font-semibold'
											style={{ color: '#dc2626' }}>
											Tanggal penuh
										</p>
										{suggestion && suggestionInWindow && (
											<button
												type='button'
												onClick={() => setInstallDate(suggestion)}
												className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all'
												style={{
													borderColor: 'var(--primary)',
													color: 'var(--primary)',
													background: 'rgba(157, 23, 77, 0.04)',
												}}>
												<CalendarDays size={13} />
												Tersedia mulai{' '}
												{suggestion.toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
													timeZone: 'UTC',
												})}
											</button>
										)}
										{suggestion && !suggestionInWindow && (
											<p
												className='text-[11px]'
												style={{ color: 'var(--text-muted)' }}>
												Tersedia mulai{' '}
												{suggestion.toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
													timeZone: 'UTC',
												})}{' '}
												— di luar jangkauan kalender, silakan hubungi kami.
											</p>
										)}
									</div>
								)}
						</div>

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2'
								style={{ color: 'var(--text-muted)' }}>
								Template Desain
							</p>
							<div className='grid grid-cols-3 gap-2'>
								{product.designTemplates.map((tpl) => {
									const active = tpl.id === selectedTemplateId;
									return (
										<button
											key={tpl.id}
											type='button'
											onClick={() => {
												setSelectedTemplateId(tpl.id);
												setActiveImage(tpl.image);
											}}
											className='relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all'
											style={{
												borderColor: active
													? 'var(--primary)'
													: 'var(--border)',
											}}>
											<div className='relative aspect-square'>
												<ProductImage
													src={tpl.image}
													alt={tpl.name}
													fill
													className='object-cover'
													sizes='120px'
												/>
											</div>
											<div
												className='px-2 py-1.5 text-[10px] font-semibold text-center truncate'
												style={{
													background: active
														? 'rgba(157, 23, 77, 0.08)'
														: 'var(--bg-surface)',
													color: active ? 'var(--primary)' : 'var(--text)',
												}}>
												{tpl.name}
											</div>
										</button>
									);
								})}
							</div>
						</div>

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2'
								style={{ color: 'var(--text-muted)' }}>
								Warna Tema:{' '}
								<span style={{ color: 'var(--text)' }}>
									{selectedColor.name}
								</span>
							</p>
							<div className='flex flex-wrap gap-2'>
								{product.themeColors.map((c) => {
									const active = c.id === selectedColorId;
									return (
										<button
											key={c.id}
											type='button'
											onClick={() => setSelectedColorId(c.id)}
											aria-label={c.name}
											title={c.name}
											className='relative w-9 h-9 rounded-full cursor-pointer transition-all hover:scale-110'
											style={{
												background: c.value,
												boxShadow: active
													? '0 0 0 2px var(--bg-surface), 0 0 0 4px var(--primary)'
													: '0 0 0 1px var(--border)',
											}}>
											{active && (
												<Check
													size={14}
													className='absolute inset-0 m-auto'
													style={{
														color:
															c.value.toLowerCase() === '#fafafa' ||
															c.value.toLowerCase() === '#f5f5dc'
																? 'var(--text)'
																: '#fff',
													}}
												/>
											)}
										</button>
									);
								})}
							</div>
						</div>

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2'
								style={{ color: 'var(--text-muted)' }}>
								Add-on (Opsional)
							</p>
							<div className='space-y-2'>
								{product.addons.map((a) => {
									const active = selectedAddonIds.includes(a.id);
									return (
										<label
											key={a.id}
											className='flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all'
											style={{
												borderColor: active
													? 'var(--primary)'
													: 'var(--border)',
												background: active
													? 'rgba(157, 23, 77, 0.04)'
													: 'var(--bg-surface)',
											}}>
											<div className='flex items-center gap-2.5'>
												<input
													type='checkbox'
													checked={active}
													onChange={() => toggleAddon(a.id)}
													className='w-4 h-4 rounded cursor-pointer'
													style={{ accentColor: 'var(--primary)' }}
												/>
												<span className='text-sm font-medium'>{a.name}</span>
											</div>
											<span
												className='text-xs font-semibold'
												style={{
													color: active
														? 'var(--primary)'
														: 'var(--text-secondary)',
												}}>
												+{a.priceLabel}
											</span>
										</label>
									);
								})}
							</div>
						</div>

						<div className='mb-5'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider mb-2 inline-flex items-center gap-1'
								style={{ color: 'var(--text-muted)' }}>
								<MapPin size={11} />
								Area Pengiriman
							</p>
							<div className='flex flex-wrap gap-1.5'>
								{product.serviceAreas.map((area) => (
									<span
										key={area}
										className='inline-block px-2.5 py-1 rounded-full text-[11px] font-medium'
										style={{
											background: 'rgba(157, 23, 77, 0.06)',
											color: 'var(--primary)',
										}}>
										{area}
									</span>
								))}
							</div>
						</div>

						<div className='mt-auto pt-6 border-t border-[var(--border)] space-y-4'>
							<div className='flex items-center justify-between gap-4'>
								<div className='flex items-center gap-4'>
									<span className='text-sm font-medium'>Jumlah</span>
									<div
										className='inline-flex items-center rounded-full border border-[var(--border)] overflow-hidden'
										style={{ background: 'var(--bg-surface)' }}>
										<button
											type='button'
											onClick={() => setQuantity((q) => Math.max(1, q - 1))}
											aria-label='Kurangi jumlah'
											disabled={quantity <= 1}
											className='inline-flex items-center justify-center w-9 h-9 cursor-pointer hover:text-[var(--primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
											style={{ color: 'var(--text-secondary)' }}>
											<Minus size={14} />
										</button>
										<span className='w-10 text-center text-sm font-semibold tabular-nums'>
											{quantity}
										</span>
										<button
											type='button'
											onClick={() =>
												setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
											}
											aria-label='Tambah jumlah'
											disabled={quantity >= MAX_QUANTITY}
											className='inline-flex items-center justify-center w-9 h-9 cursor-pointer hover:text-[var(--primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
											style={{ color: 'var(--text-secondary)' }}>
											<Plus size={14} />
										</button>
									</div>
								</div>
								<div className='text-right'>
									<p
										className='text-[10px] uppercase tracking-wider font-semibold'
										style={{ color: 'var(--text-muted)' }}>
										Total
									</p>
									<p
										className='font-serif text-xl font-bold'
										style={{ color: 'var(--primary)' }}>
										{formatRupiah(totalPrice)}
									</p>
								</div>
							</div>

							<div className='flex flex-col sm:flex-row gap-3'>
								<button
									type='button'
									onClick={handleAddToCart}
									disabled={!canOrder}
									className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
									style={{
										borderColor: added ? '#16a34a' : 'var(--primary)',
										color: added ? '#16a34a' : 'var(--primary)',
										background: added
											? 'rgba(34, 197, 94, 0.08)'
											: 'transparent',
									}}>
									{added ? (
										<>
											<Check size={16} />
											Ditambahkan
										</>
									) : (
										<>
											<ShoppingCart size={16} />
											Tambah ke Keranjang
										</>
									)}
								</button>
								<button
									type='button'
									onClick={handleOrderNow}
									disabled={!canOrder}
									className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
									style={{
										background: 'var(--primary)',
										boxShadow: '0 2px 12px rgba(157, 23, 77, 0.25)',
									}}>
									Pesan Sekarang
									<ArrowRight size={16} />
								</button>
							</div>

							{!canOrder && (
								<p
									className='text-[11px] text-center'
									style={{ color: 'var(--text-muted)' }}>
									Pilih tanggal &amp; durasi yang tersedia dulu.
								</p>
							)}

							<div
								className='grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border)] text-[11px]'
								style={{ color: 'var(--text-secondary)' }}>
								<div className='flex flex-col items-center gap-1 text-center'>
									<Truck size={16} style={{ color: 'var(--primary)' }} />
									Antar gratis
								</div>
								<div className='flex flex-col items-center gap-1 text-center'>
									<Package size={16} style={{ color: 'var(--primary)' }} />
									Bunga segar
								</div>
								<div className='flex flex-col items-center gap-1 text-center'>
									<ShieldCheck
										size={16}
										style={{ color: 'var(--primary)' }}
									/>
									Garansi 100%
								</div>
							</div>
						</div>
					</div>
				</div>

				{related.length > 0 && (
					<section>
						<div className='flex items-end justify-between mb-5'>
							<div>
								<span
									className='inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2'
									style={{
										background: 'rgba(157, 23, 77, 0.08)',
										color: 'var(--primary)',
									}}>
									Mungkin Anda Suka
								</span>
								<h2 className='font-serif text-2xl font-bold'>
									Produk Serupa
								</h2>
							</div>
							<Link
								href='/products'
								className='hidden sm:inline-flex items-center gap-1 text-sm font-semibold transition-colors'
								style={{ color: 'var(--primary)' }}>
								Lihat Semua
								<ArrowRight size={14} />
							</Link>
						</div>

						<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{related.map((p) => (
								<Link
									key={p.slug}
									href={`/products/${p.slug}`}
									className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover'
									style={{ boxShadow: 'var(--shadow-sm)' }}>
									<div className='relative aspect-4/3 overflow-hidden'>
										<ProductImage
											src={p.image}
											alt={p.title}
											fill
											className='object-cover transition-transform duration-500 group-hover:scale-105'
											sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
										/>
										<div className='absolute top-3 right-3 glass rounded-full px-3 py-1.5'>
											<p
												className='text-xs font-semibold'
												style={{ color: 'var(--text)' }}>
												{p.priceLabel}
											</p>
										</div>
									</div>
									<div className='p-4'>
										<h3 className='font-serif text-base font-semibold group-hover:text-[var(--primary)] transition-colors'>
											{p.title}
										</h3>
										<p
											className='text-xs mt-1 line-clamp-2'
											style={{ color: 'var(--text-secondary)' }}>
											{p.shortDescription}
										</p>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
