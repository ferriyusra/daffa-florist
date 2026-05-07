'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { parsePriceFromLabel, useCart } from '@/hooks/use-cart';

const products = [
	{
		title: 'Papan Bunga Wedding',
		description:
			'Papan bunga ucapan Happy Wedding dengan desain elegan. Tersedia berbagai warna dan ukuran.',
		features: ['Ucapan custom', 'Ukuran 1.5m - 2m', 'Antar & pasang gratis'],
		price: 'Mulai Rp 350.000',
		image: '/product/papan-bunga-5.PNG',
		color: 'var(--primary)',
	},
	{
		title: 'Papan Bunga Ucapan',
		description:
			'Papan bunga ucapan selamat & sukses untuk acara resmi, sertijab, pembukaan, dan lainnya.',
		features: ['Desain profesional', 'Warna custom', 'Pengiriman tepat waktu'],
		price: 'Mulai Rp 350.000',
		image: '/product/papan-bunga-4.PNG',
		color: 'var(--accent)',
	},
	{
		title: 'Papan Bunga Premium',
		description:
			'Papan bunga premium dengan hiasan mewah dan rangkaian bunga indah untuk momen istimewa.',
		features: ['Hiasan premium', 'Tahan lama & awet', 'Berbagai tema warna'],
		price: 'Mulai Rp 500.000',
		image: '/product/papan-bunga-3.PNG',
		color: 'var(--secondary)',
	},
	{
		title: 'Dekorasi Mobil Pengantin',
		description:
			'Dekorasi bunga untuk mobil pengantin yang cantik dan mewah di hari bahagia Anda.',
		features: ['Desain romantis', 'Rangkaian indah', 'Pasang di lokasi'],
		price: 'Mulai Rp 500.000',
		image: '/product/mobil-pengantin-1.PNG',
		color: 'var(--primary-dark)',
	},
];

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

type Product = (typeof products)[number];

export default function Products() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const { user } = useAuth();
	const { addItem } = useCart();
	const router = useRouter();
	const [addedId, setAddedId] = useState<string | null>(null);

	const toCartItem = (product: Product) => ({
		id: product.title,
		title: product.title,
		price: parsePriceFromLabel(product.price),
		priceLabel: product.price,
		image: product.image,
	});

	const handleAddToCart = (product: Product) => {
		addItem(toCartItem(product));
		setAddedId(product.title);
		setTimeout(() => {
			setAddedId((id) => (id === product.title ? null : id));
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
					{products.map((product) => {
						const isAdded = addedId === product.title;
						return (
							<motion.div
								key={product.title}
								variants={cardVariants}
								className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover flex flex-col'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								{/* Product image */}
								<div className='relative aspect-4/3 overflow-hidden'>
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
											{product.price}
										</p>
									</div>
								</div>

								{/* Content */}
								<div className='p-5 flex flex-col flex-1'>
									<h3 className='font-serif text-lg font-semibold mb-2'>
										{product.title}
									</h3>

									<p
										className='text-sm leading-relaxed mb-4'
										style={{ color: 'var(--text-secondary)' }}>
										{product.description}
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
											className='inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer shrink-0'
											style={{
												borderColor: isAdded
													? '#16a34a'
													: 'var(--border)',
												color: isAdded ? '#16a34a' : product.color,
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
											className='flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-transform hover:scale-[1.02] cursor-pointer group/cta'
											style={{ background: product.color }}>
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
			</div>
		</section>
	);
}
