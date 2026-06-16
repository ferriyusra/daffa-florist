'use client';

import { useRef } from 'react';
import Link from 'next/link';
import ProductImage from './product-image';
import { RentalBadge } from './rental-badge';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { type Product } from '@/lib';
import { api } from '@/trpc/react';

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

	const { data: allProducts = [] } = api.product.list.useQuery();
	const featuredProducts: Product[] = allProducts.slice(0, 4);

	// Sewa butuh pemilihan periode (tanggal pasang + durasi) yang hanya ada di
	// halaman detail → kartu unggulan mengarahkan ke detail, bukan quick-add.

	return (
		<section id='product' className='floral-bg'>
			<div className='mx-auto max-w-[1200px] px-6'>
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

				<motion.div
					ref={ref}
					variants={containerVariants}
					initial='hidden'
					animate={inView ? 'visible' : 'hidden'}
					className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{featuredProducts.map((product) => {
						return (
							<motion.div
								key={product.slug}
								variants={cardVariants}
								className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover flex flex-col'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								<Link
									href={`/products/${product.slug}`}
									className='relative aspect-4/3 overflow-hidden block'>
									<ProductImage
										src={product.image}
										alt={product.title}
										className='object-cover transition-transform duration-500 group-hover:scale-105'
										sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
									/>
									<div className='absolute top-3 left-3'>
										<RentalBadge />
									</div>
									<div className='absolute top-3 right-3 glass rounded-full px-3 py-1.5'>
										<p
											className='text-xs font-semibold'
											style={{ color: 'var(--text)' }}>
											{product.priceLabel}
										</p>
									</div>
								</Link>

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

									<div className='mt-auto flex items-center gap-2'>
										<Link
											href={`/products/${product.slug}`}
											aria-label='Pilih tanggal sewa'
											className='inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer shrink-0 hover:scale-[1.05]'
											style={{
												borderColor: 'var(--primary)',
												color: 'var(--primary)',
											}}>
											<CalendarDays size={16} />
										</Link>
										<Link
											href={`/products/${product.slug}`}
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
										</Link>
									</div>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				<div className='mt-12 text-center'>
					<Link
						href='/products'
						className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent transition-all hover:scale-[1.02] hover:bg-[var(--primary)] hover:text-white'>
						Lihat Semua Produk
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}
