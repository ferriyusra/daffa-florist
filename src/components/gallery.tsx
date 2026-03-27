'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const galleryItems = [
	{
		category: 'Papan Bunga',
		title: 'Happy Wedding — Dafa Florist',
		image: '/product/papan-bunga-5.PNG',
	},
	{
		category: 'Papan Bunga',
		title: 'Selamat & Sukses — Papan Ucapan',
		image: '/product/papan-bunga-4.PNG',
	},
	{
		category: 'Papan Bunga',
		title: 'Happy Wedding — Biru Elegan',
		image: '/product/papan-bunga-3.PNG',
	},
	{
		category: 'Mobil Pengantin',
		title: 'Dekorasi Mobil Pengantin',
		image: '/product/mobil-pengantin-1.PNG',
	},
	{
		category: 'Papan Bunga',
		title: 'Happy Wedding — Pink Rose',
		image: '/product/papan-bunga-2.PNG',
	},
	{
		category: 'Papan Bunga',
		title: 'Happy Wedding — Abu Elegan',
		image: '/product/papan-bunga-1.PNG',
	},
];

const categories = ['Semua', 'Papan Bunga', 'Mobil Pengantin'];

export default function Gallery() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const [filter, setFilter] = useState('Semua');
	const [lightbox, setLightbox] = useState<number | null>(null);

	const filtered =
		filter === 'Semua'
			? galleryItems
			: galleryItems.filter((g) => g.category === filter);

	return (
		<section id='gallery'>
			<div className='mx-auto max-w-[1200px] px-6'>
				{/* Header */}
				<div className='text-center max-w-[600px] mx-auto mb-12'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
						style={{
							background: 'rgba(139, 105, 20, 0.08)',
							color: 'var(--accent)',
						}}>
						Galeri
					</span>
					<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-4'>
						Galeri Papan Bunga{' '}
						<span className='gradient-text'>Dafa Florist</span>
					</h2>
					<p
						className='text-lg leading-relaxed'
						style={{ color: 'var(--text-secondary)' }}>
						Koleksi papan bunga dan karangan bunga yang telah kami buat untuk
						pelanggan di Ampar Putih, Pasaman Barat.
					</p>
				</div>

				{/* Filter tabs */}
				<div className='flex flex-wrap justify-center gap-2 mb-10'>
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setFilter(cat)}
							className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
								filter === cat
									? 'bg-[var(--primary)] text-white shadow-sm'
									: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
							}`}>
							{cat}
						</button>
					))}
				</div>

				{/* Grid */}
				<div ref={ref} className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<AnimatePresence mode='popLayout'>
						{filtered.map((item, i) => (
							<motion.div
								key={`${filter}-${item.title}`}
								layout
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 12 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{
									duration: 0.3,
									delay: i * 0.04,
									ease: 'easeOut' as const,
								}}
								className='group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer card-hover border border-[var(--border)]'
								onClick={() => setLightbox(i)}>
								<Image
									src={item.image}
									alt={item.title}
									fill
									className='object-cover transition-transform duration-500 group-hover:scale-110'
									sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
								/>

								{/* Hover overlay */}
								<div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end'>
									<div className='p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
										<span className='text-[10px] font-semibold tracking-wider uppercase text-white/70'>
											{item.category}
										</span>
										<p className='font-serif text-white text-sm font-semibold mt-0.5'>
											{item.title}
										</p>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{/* Lightbox */}
				<AnimatePresence>
					{lightbox !== null && filtered[lightbox] && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6'
							onClick={() => setLightbox(null)}>
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								transition={{ duration: 0.25 }}
								className='relative bg-[var(--bg-card)] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl'
								onClick={(e) => e.stopPropagation()}>
								<button
									onClick={() => setLightbox(null)}
									className='absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer'
									aria-label='Tutup'>
									<X size={20} />
								</button>
								<div className='relative aspect-4/3'>
									<Image
										src={filtered[lightbox].image}
										alt={filtered[lightbox].title}
										fill
										className='object-cover'
										sizes='(max-width: 768px) 100vw, 672px'
									/>
								</div>
								<div className='p-6'>
									<span
										className='text-xs font-semibold tracking-wider uppercase'
										style={{ color: 'var(--text-muted)' }}>
										{filtered[lightbox].category}
									</span>
									<h3 className='font-serif text-xl font-semibold mt-1'>
										{filtered[lightbox].title}
									</h3>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}
