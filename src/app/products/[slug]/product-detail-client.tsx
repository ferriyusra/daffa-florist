'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	Check,
	ChevronRight,
	Minus,
	Package,
	Plus,
	ShieldCheck,
	ShoppingCart,
	Truck,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/products';

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

	const cartInput = {
		id: product.slug,
		title: product.title,
		price: product.price,
		priceLabel: product.priceLabel,
		image: product.image,
	};

	const handleAddToCart = () => {
		addItem(cartInput, quantity);
		setAdded(true);
		setTimeout(() => setAdded(false), 1800);
	};

	const handleOrderNow = () => {
		addItem(cartInput, quantity);
		const target = '/confirmation-order';
		router.push(
			user ? target : `/login?redirect=${encodeURIComponent(target)}`,
		);
	};

	return (
		<main className='floral-bg min-h-[70vh]'>
			<div className='mx-auto max-w-[1100px] px-6 py-10'>
				{/* Breadcrumb */}
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
					{/* Gallery */}
					<div>
						<div
							className='relative aspect-square rounded-2xl overflow-hidden border border-[var(--border)] mb-3'
							style={{ background: 'var(--bg-card)' }}>
							<Image
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
											<Image
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

					{/* Info + actions */}
					<div className='flex flex-col'>
						<h1 className='font-serif text-3xl sm:text-4xl font-bold mb-3'>
							{product.title}
						</h1>
						<p
							className='text-base leading-relaxed mb-5'
							style={{ color: 'var(--text-secondary)' }}>
							{product.description}
						</p>

						<div
							className='inline-flex items-baseline gap-2 mb-6 pb-6 border-b border-[var(--border)]'>
							<span
								className='font-serif text-3xl font-bold'
								style={{ color: 'var(--primary)' }}>
								{product.priceLabel}
							</span>
							<span
								className='text-xs'
								style={{ color: 'var(--text-muted)' }}>
								/ unit
							</span>
						</div>

						{/* Specs */}
						<div className='grid grid-cols-2 gap-4 mb-6'>
							{product.specs.map((spec) => (
								<div key={spec.label}>
									<p
										className='text-[11px] font-semibold uppercase tracking-wider mb-1'
										style={{ color: 'var(--text-muted)' }}>
										{spec.label}
									</p>
									<p className='text-sm font-medium'>{spec.value}</p>
								</div>
							))}
						</div>

						{/* Features */}
						<ul className='space-y-2 mb-6'>
							{product.features.map((f) => (
								<li
									key={f}
									className='flex items-start gap-2 text-sm'
									style={{ color: 'var(--text-secondary)' }}>
									<Check
										size={16}
										style={{ color: 'var(--primary)' }}
										className='mt-0.5 shrink-0'
									/>
									{f}
								</li>
							))}
						</ul>

						{/* Quantity + actions */}
						<div className='mt-auto pt-6 border-t border-[var(--border)] space-y-4'>
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
										onClick={() => setQuantity((q) => q + 1)}
										aria-label='Tambah jumlah'
										className='inline-flex items-center justify-center w-9 h-9 cursor-pointer hover:text-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<Plus size={14} />
									</button>
								</div>
							</div>

							<div className='flex flex-col sm:flex-row gap-3'>
								<button
									type='button'
									onClick={handleAddToCart}
									className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all hover:scale-[1.02] cursor-pointer'
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
									className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer'
									style={{
										background: 'var(--primary)',
										boxShadow: '0 2px 12px rgba(157, 23, 77, 0.25)',
									}}>
									Pesan Sekarang
									<ArrowRight size={16} />
								</button>
							</div>

							{/* Trust badges */}
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

				{/* Related products */}
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
										<Image
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
