'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { products as allProducts, type Product } from '@/lib/products';

const featuredProducts = allProducts.slice(0, 4);

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: 'easeOut' as const },
	},
};

export default function Products() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const { user } = useAuth();
	const { addItem } = useCart();
	const router = useRouter();
	const [addedId, setAddedId] = useState<string | null>(null);

	const toCartItem = (product: Product) => ({
		id: product.slug,
		title: product.title,
		price: product.price,
		priceLabel: product.priceLabel,
		image: product.image,
	});

	const handleAddToCart = (product: Product) => {
		addItem(toCartItem(product));
		setAddedId(product.slug);
		setTimeout(() => {
			setAddedId((id) => (id === product.slug ? null : id));
		}, 1500);
	};

	const handleOrderNow = (product: Product) => {
		addItem(toCartItem(product));
		const target = '/confirmation-order';
		router.push(
			user ? target : `/login?redirect=${encodeURIComponent(target)}`,
		);
	};

	return (
		<section id='product' className='floral-bg'>
			<div className='mx-auto max-w-[1200px] px-6'>
				{/* Header */}
				<div className='text-center max-w-[600px] mx-auto mb-16'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}>
						Produk Kami
					</span>
					<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-4'>
						Papan Bunga & Karangan Bunga{' '}
						<span className='gradient-text'>Ampar Putih</span>
					</h2>
					<p
						style={{ color: 'var(--text-secondary)' }}
						className='text-lg leading-relaxed'>
						Dafa Florist menyediakan berbagai rangkaian bunga berkualitas dengan
						harga terjangkau di area Ampar Putih dan sekitarnya.
					</p>
				</div>

				{/* Product grid */}
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial='hidden'
					animate={inView ? 'visible' : 'hidden'}
					className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{featuredProducts.map((product) => {
						const isAdded = addedId === product.slug;
						return (
							<motion.div
								key={product.slug}
								variants={cardVariants}
								className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover flex flex-col'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								{/* Product image */}
								<Link
									href={`/products/${product.slug}`}
									className='relative aspect-4/3 overflow-hidden block'>
									<Image
										src={product.image}
										alt={product.title}
										fill
										className='object-cover transition-transform duration-500 group-hover:scale-105'
										sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
									/>
									{/* Price badge */}
									<div className='absolute top-3 right-3 glass rounded-full px-3 py-1.5'>
										<p
											className='text-xs font-semibold'
											style={{ color: 'var(--text)' }}>
											{product.priceLabel}
										</p>
									</div>
								</Link>

								{/* Content */}
								<div className='p-5 flex flex-col flex-1'>
									<Link href={`/products/${product.slug}`}>
										<h3 className='font-serif text-lg font-semibold mb-2 hover:text-[var(--primary)] transition-colors'>
											{product.title}
										</h3>
									</Link>

									<p
										className='text-sm leading-relaxed mb-4'
										style={{ color: 'var(--text-secondary)' }}>
										{product.shortDescription}
									</p>

									{/* Features */}
									<ul className='space-y-1.5 mb-5'>
										{product.features.map((f) => (
											<li
												key={f}
												className='flex items-start gap-2 text-xs'
												style={{ color: 'var(--text-secondary)' }}>
												<span
													className='mt-1.5 w-1 h-1 rounded-full shrink-0'
													style={{ background: product.color }}
												/>
												{f}
											</li>
										))}
									</ul>

									{/* CTAs */}
									<div className='mt-auto flex items-center gap-2'>
										<button
											type='button'
											onClick={() => handleAddToCart(product)}
											aria-label='Tambah ke keranjang'
											className='inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer shrink-0 hover:scale-[1.05]'
											style={{
												borderColor: isAdded
													? '#16a34a'
													: 'var(--primary)',
												color: isAdded ? '#16a34a' : 'var(--primary)',
												background: isAdded
													? 'rgba(34, 197, 94, 0.1)'
													: 'transparent',
											}}>
											{isAdded ? (
												<Check size={16} />
											) : (
												<ShoppingCart size={16} />
											)}
										</button>
										<button
											type='button'
											onClick={() => handleOrderNow(product)}
											className='flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer group/cta'
											style={{
												background: 'var(--primary)',
												boxShadow: '0 2px 8px rgba(157, 23, 77, 0.2)',
											}}>
											Pesan Sekarang
											<ArrowRight
												size={14}
												className='transition-transform duration-200 group-hover/cta:translate-x-1'
											/>
										</button>
									</div>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				{/* See all CTA */}
				<div className='mt-12 text-center'>
					<Link
						href='/products'
						className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 transition-all hover:scale-[1.02] hover:bg-[var(--primary)] hover:text-white'
						style={{
							borderColor: 'var(--primary)',
							color: 'var(--primary)',
						}}>
						Lihat Semua Produk
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}
