'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
			'Papan bunga premium dengan rangkaian bunga segar dan hiasan mewah untuk momen istimewa.',
		features: ['Bunga segar pilihan', 'Hiasan premium', 'Berbagai tema warna'],
		price: 'Mulai Rp 500.000',
		image: '/product/papan-bunga-3.PNG',
		color: 'var(--secondary)',
	},
	{
		title: 'Dekorasi Mobil Pengantin',
		description:
			'Dekorasi bunga segar untuk mobil pengantin yang cantik di hari bahagia Anda.',
		features: ['Desain romantis', 'Bunga segar pilihan', 'Pasang di lokasi'],
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

export default function Products() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });

	return (
		<section id='produk' className='floral-bg'>
			<div className='mx-auto max-w-[1200px] px-6'>
				{/* Header */}
				<div className='text-center max-w-[600px] mx-auto mb-16'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}
					>
						Produk Kami
					</span>
					<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-4'>
						Karangan Bunga untuk{' '}
						<span className='gradient-text'>Setiap Kesempatan</span>
					</h2>
					<p style={{ color: 'var(--text-secondary)' }} className='text-lg leading-relaxed'>
						Dafa Florist menyediakan berbagai rangkaian bunga segar berkualitas
						dengan harga terjangkau di area Ampar Putih dan sekitarnya.
					</p>
				</div>

				{/* Product grid */}
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial='hidden'
					animate={inView ? 'visible' : 'hidden'}
					className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'
				>
					{products.map((product) => (
						<motion.div
							key={product.title}
							variants={cardVariants}
							className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover cursor-pointer'
							style={{ boxShadow: 'var(--shadow-sm)' }}
						>
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
									<p className='text-xs font-semibold' style={{ color: 'var(--text)' }}>
										{product.price}
									</p>
								</div>
							</div>

							{/* Content */}
							<div className='p-5'>
								<h3 className='font-serif text-lg font-semibold mb-2'>{product.title}</h3>

								<p className='text-sm leading-relaxed mb-4' style={{ color: 'var(--text-secondary)' }}>
									{product.description}
								</p>

								{/* Features */}
								<ul className='space-y-1.5 mb-5'>
									{product.features.map((f) => (
										<li
											key={f}
											className='flex items-start gap-2 text-xs'
											style={{ color: 'var(--text-secondary)' }}
										>
											<span className='mt-1.5 w-1 h-1 rounded-full shrink-0' style={{ background: product.color }} />
											{f}
										</li>
									))}
								</ul>

								{/* CTA link */}
								<a
									href='#kontak'
									className='inline-flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer group/link'
									style={{ color: product.color }}
								>
									Pesan Sekarang
									<ArrowRight
										size={14}
										className='transition-transform duration-200 group-hover/link:translate-x-1'
									/>
								</a>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
