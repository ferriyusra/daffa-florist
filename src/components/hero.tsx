'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, MessageCircle, Star, Truck } from 'lucide-react';
import FloatingPetals from './floating-petals';

export default function Hero() {
	return (
		<section
			id='home'
			className='relative min-h-dvh flex items-center overflow-hidden'
			style={{ background: 'var(--bg-hero)' }}>
			{/* Floating petals */}
			<FloatingPetals />

			{/* Decorative blobs */}
			<div className='absolute inset-0 pointer-events-none overflow-hidden'>
				<div
					className='absolute -top-32 -right-32 w-125 h-125 rounded-full opacity-[0.15] blur-[100px]'
					style={{ background: 'var(--primary-light)' }}
				/>
				<div
					className='absolute -bottom-40 -left-40 w-100 h-100 rounded-full opacity-[0.12] blur-[80px]'
					style={{ background: 'var(--secondary-light)' }}
				/>
			</div>

			<div className='relative mx-auto max-w-[1200px] px-6 w-full pt-12 pb-16'>
				<div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
					{/* Left — copy */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: 'easeOut' }}>
						<span
							className='inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide mb-6'
							style={{
								background: 'rgba(157, 23, 77, 0.08)',
								color: 'var(--primary)',
							}}>
							<MapPin size={13} />
							Ampar Putih & Sekitarnya
						</span>

						<h1 className='font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.08] font-bold mb-5'>
							Karangan Bunga <span className='gradient-text'>Cantik</span> untuk
							Momen <span className='gradient-text-green'>Spesial</span>
						</h1>

						<p
							className='text-base leading-relaxed mb-8 max-w-[480px]'
							style={{ color: 'var(--text-secondary)' }}>
							Papan bunga ucapan, bucket bunga, hingga dekorasi mobil pengantin
							— rangkaian bunga tahan lama dengan harga terjangkau di Ampar
							Putih.
						</p>

						<div className='flex flex-wrap gap-3 mb-10'>
							<a href='#product' className='btn-primary'>
								Lihat Produk
								<ArrowRight size={16} />
							</a>
							<a
								href='https://wa.me/6285274320917'
								target='_blank'
								rel='noopener noreferrer'
								className='btn-secondary'>
								<MessageCircle size={16} />
								WhatsApp Kami
							</a>
						</div>

						{/* Trust badges — inline compact */}
						<div className='flex flex-wrap items-center gap-5'>
							{[
								{
									icon: Star,
									num: '5.0',
									label: 'Rating',
									color: 'var(--accent)',
								},
								{
									icon: Truck,
									num: '50+',
									label: 'Terkirim',
									color: 'var(--secondary)',
								},
							].map(({ icon: Icon, num, label, color }) => (
								<div key={label} className='flex items-center gap-2.5'>
									<div
										className='w-9 h-9 rounded-lg flex items-center justify-center'
										style={{
											background: `color-mix(in srgb, ${color} 10%, transparent)`,
										}}>
										<Icon size={16} style={{ color }} />
									</div>
									<div>
										<p className='text-sm font-bold leading-tight'>{num}</p>
										<p
											className='text-[11px]'
											style={{ color: 'var(--text-muted)' }}>
											{label}
										</p>
									</div>
								</div>
							))}
							<div className='flex items-center gap-2.5'>
								<div
									className='w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold'
									style={{
										background: 'rgba(157, 23, 77, 0.08)',
										color: 'var(--primary)',
									}}>
									✓
								</div>
								<div>
									<p className='text-sm font-bold leading-tight'>Tahan Lama</p>
									<p
										className='text-[11px]'
										style={{ color: 'var(--text-muted)' }}>
										Tetap Cantik
									</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Right — hero image composition */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
						className='relative hidden lg:block'>
						{/* Main image */}
						<div className='relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg'>
							<Image
								src='/product/papan-bunga-5.PNG'
								alt='Papan bunga Happy Wedding dari Dafa Florist'
								fill
								className='object-cover'
								sizes='(max-width: 1024px) 0vw, 50vw'
								priority
							/>
							{/* Subtle vignette */}
							<div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5' />
						</div>

						{/* Floating badge — top right, clear of image content */}
						<motion.div
							className='absolute -top-3 -right-3 glass rounded-2xl px-4 py-3 shadow-md'
							animate={{ y: [0, -6, 0] }}
							transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
							<p
								className='text-xs font-semibold flex items-center gap-1.5'
								style={{ color: 'var(--text)' }}>
								<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
								Menerima Pesanan
							</p>
							<p
								className='text-[10px] mt-1 font-medium'
								style={{ color: 'var(--primary)' }}>
								Segera hadir: Bunga Segar!
							</p>
						</motion.div>

						{/* Small secondary image — bottom left offset */}
						<motion.div
							className='absolute -bottom-5 -left-5 w-[140px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4'
							style={{ borderColor: 'var(--bg)' }}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}>
							<Image
								src='/product/mobil-pengantin-1.PNG'
								alt='Dekorasi mobil pengantin dari Dafa Florist'
								fill
								className='object-cover'
								sizes='140px'
							/>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
