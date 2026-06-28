'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
	ArrowRight,
	BadgeCheck,
	CalendarCheck,
	MapPin,
	MessageCircle,
	Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FloatingPetals from './floating-petals';

const trustBadges = [
	{
		icon: Truck,
		title: 'Antar & Pasang',
		label: 'Area layanan',
		color: 'var(--secondary)',
	},
	{
		icon: CalendarCheck,
		title: 'Cek Tanggal',
		label: 'Ketersediaan real-time',
		color: 'var(--accent)',
	},
	{
		icon: BadgeCheck,
		title: 'Pasang & Ambil',
		label: 'Ditangani tim',
		color: 'var(--primary)',
	},
];

export default function Hero() {
	const reduceMotion = useReducedMotion();

	// LCP-safe: konten di atas lipatan (judul H1, gambar hero) TIDAK boleh
	// mulai dari opacity:0 — itu menunda LCP sampai JS hydrate + animasi selesai.
	// `rise` hanya menganimasikan transform (opacity tetap 1), jadi elemen
	// langsung ter-paint di HTML SSR; gambar hero utama bahkan dirender statis.
	const rise = (y = 24) =>
		reduceMotion ? { initial: false as const } : { initial: { y }, animate: { y: 0 } };

	const floatAnim = reduceMotion ? {} : { y: [0, -6, 0] };

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
						{...rise(28)}
						transition={{ duration: 0.6, ease: 'easeOut' }}>
						<Badge
							variant='secondary'
							className='mb-6 px-4 py-2 rounded-full text-xs font-semibold tracking-wide'
							style={{
								background: 'rgba(157, 23, 77, 0.08)',
								color: 'var(--primary)',
							}}>
							<MapPin />
							Ampar Putih & Sekitarnya
						</Badge>

						<h1 className='font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.08] font-bold mb-5'>
							Sewa <span className='gradient-text'>Papan Bunga</span> untuk Momen{' '}
							<span className='gradient-text-green'>Spesial</span>
						</h1>

						<p
							className='text-base leading-relaxed mb-8 max-w-[480px]'
							style={{ color: 'var(--text-secondary)' }}>
							Papan bunga ucapan untuk wedding, duka cita, hingga grand opening.
							Pilih tanggal, kami antar &amp; pasang di lokasi acara, lalu ambil
							kembali setelah masa sewa — area Ampar Putih &amp; Pasaman Barat.
						</p>

						<div className='flex flex-wrap gap-3 mb-10'>
							<Button
								asChild
								className='h-12 rounded-full px-7 text-sm'>
								<a href='#product'>
									Sewa Sekarang
									<ArrowRight size={16} />
								</a>
							</Button>
							<Button
								asChild
								variant='outline'
								className='h-12 rounded-full px-7 text-sm'>
								<a
									href='https://wa.me/6285274320917'
									target='_blank'
									rel='noopener noreferrer'>
									<MessageCircle size={16} />
									WhatsApp Kami
								</a>
							</Button>
						</div>

						{/* Trust badges — rental relevant, compact icon + two-line text */}
						<div className='flex flex-wrap items-center gap-5'>
							{trustBadges.map(({ icon: Icon, title, label, color }) => (
								<div key={title} className='flex items-center gap-2.5'>
									<div
										className='w-9 h-9 rounded-lg flex items-center justify-center'
										style={{
											background: `color-mix(in srgb, ${color} 10%, transparent)`,
										}}>
										<Icon size={16} style={{ color }} />
									</div>
									<div>
										<p className='text-sm font-bold leading-tight'>{title}</p>
										<p
											className='text-[11px]'
											style={{ color: 'var(--text-muted)' }}>
											{label}
										</p>
									</div>
								</div>
							))}
						</div>
					</motion.div>

					{/* Right — hero image composition (rich version for lg+).
					    Wrapper statis (bukan motion) supaya gambar LCP langsung paint. */}
					<div className='relative hidden lg:block'>
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

						{/* Floating status badge — top right, clear of image content */}
						<motion.div
							className='absolute -top-3 -right-3'
							animate={floatAnim}
							transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
							<Card className='glass gap-1 rounded-2xl border-0 py-3 px-4 shadow-md'>
								<p
									className='text-xs font-semibold flex items-center gap-1.5'
									style={{ color: 'var(--text)' }}>
									<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
									Menerima Pesanan
								</p>
								<p
									className='text-[10px] font-medium'
									style={{ color: 'var(--primary)' }}>
									Cek tanggal &amp; periode sewa
								</p>
							</Card>
						</motion.div>

						{/* Small secondary image — bottom left offset */}
						<motion.div
							className='absolute -bottom-5 -left-5 w-[140px] aspect-square rounded-2xl overflow-hidden shadow-lg border-4'
							style={{ borderColor: 'var(--bg)' }}
							{...rise(16)}
							transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}>
							<Image
								src='/product/mobil-pengantin-1.PNG'
								alt='Dekorasi mobil pengantin dari Dafa Florist'
								fill
								className='object-cover'
								sizes='140px'
							/>
						</motion.div>
					</div>

					{/* Mobile / tablet image — single main image, shown below copy on < lg.
					    Wrapper statis supaya gambar LCP langsung paint di mobile. */}
					<div className='relative lg:hidden'>
						<div className='relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-lg'>
							<Image
								src='/product/papan-bunga-5.PNG'
								alt='Papan bunga Happy Wedding dari Dafa Florist'
								fill
								className='object-cover'
								sizes='(max-width: 1024px) 100vw, 0vw'
								priority
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5' />
							{/* Floating status badge */}
							<motion.div
								className='absolute top-3 right-3'
								animate={floatAnim}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: 'easeInOut',
								}}>
								<Card className='glass gap-1 rounded-2xl border-0 py-2.5 px-3.5 shadow-md'>
									<p
										className='text-xs font-semibold flex items-center gap-1.5'
										style={{ color: 'var(--text)' }}>
										<span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
										Menerima Pesanan
									</p>
									<p
										className='text-[10px] font-medium'
										style={{ color: 'var(--primary)' }}>
										Cek tanggal &amp; periode sewa
									</p>
								</Card>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
