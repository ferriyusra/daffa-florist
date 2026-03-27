'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Flower2, Clock, Truck, ShieldCheck } from 'lucide-react';

const highlights = [
	{
		icon: Flower2,
		title: 'Tahan Lama & Awet',
		description:
			'Rangkaian bunga kami tetap cantik dalam jangka waktu lama — tidak layu, tidak perlu disiram.',
	},
	{
		icon: Clock,
		title: 'Proses Cepat',
		description:
			'Pengerjaan cepat dan bisa diantar di hari yang sama untuk area Ampar Putih dan sekitarnya.',
	},
	{
		icon: Truck,
		title: 'Antar & Pasang',
		description:
			'Untuk papan bunga dan dekorasi mobil, kami antar dan pasang langsung di lokasi Anda.',
	},
	{
		icon: ShieldCheck,
		title: 'Harga Terjangkau',
		description:
			'Rangkaian bunga berkualitas dengan harga bersaing. Konsultasi gratis sebelum pesan.',
	},
];

export default function About() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });

	return (
		<section id='about' style={{ background: 'var(--bg-surface)' }}>
			<div className='mx-auto max-w-[1200px] px-6'>
				<div className='grid lg:grid-cols-2 gap-16 items-center'>
					{/* Left — image + text */}
					<motion.div
						ref={ref}
						initial={{ opacity: 0, x: -30 }}
						animate={inView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.6, ease: 'easeOut' }}>
						<span
							className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
							style={{
								background: 'rgba(61, 107, 79, 0.08)',
								color: 'var(--secondary)',
							}}>
							Tentang Kami
						</span>

						<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-6'>
							Toko Bunga{' '}
							<span className='gradient-text-green'>Ampar Putih</span>, Pasaman
							Barat
						</h2>

						{/* About image */}
						<div className='relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-md'>
							<Image
								src='/product/papan-bunga-3.PNG'
								alt='Papan bunga wedding dari Dafa Florist Ampar Putih'
								fill
								className='object-cover'
								sizes='(max-width: 1024px) 100vw, 50vw'
							/>
						</div>

						<div className='space-y-4 text-[var(--text-secondary)] leading-relaxed'>
							<p>
								<strong className='text-[var(--text)]'>Dafa Florist</strong>{' '}
								adalah toko karangan bunga di Ampar Putih, Pasaman Barat yang
								melayani pemesanan papan bunga ucapan, bucket bunga, dan
								dekorasi mobil pengantin.
							</p>
							<p>
								Saat ini kami menggunakan bunga artifisial berkualitas yang
								tahan lama dan tetap cantik.{' '}
								<strong className='text-[var(--secondary)]'>
									Segera hadir: rangkaian bunga asli dan segar
								</strong>{' '}
								untuk melengkapi koleksi kami!
							</p>
						</div>

						{/* Stats */}
						<div className='grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-[var(--border)]'>
							{[
								{ num: '1+', label: 'Tahun Melayani' },
								{ num: '30+', label: 'Pelanggan Puas' },
								{ num: '50+', label: 'Rangkaian Dibuat' },
							].map(({ num, label }) => (
								<div key={label}>
									<p className='font-serif text-2xl font-bold text-[var(--secondary)]'>
										{num}
									</p>
									<p className='text-sm text-[var(--text-muted)] mt-1'>
										{label}
									</p>
								</div>
							))}
						</div>
					</motion.div>

					{/* Right — highlight cards */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={inView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
						className='grid sm:grid-cols-2 gap-4'>
						{highlights.map((item, i) => (
							<div
								key={item.title}
								className='bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] card-hover'
								style={{
									boxShadow: 'var(--shadow-sm)',
									animationDelay: `${i * 100}ms`,
								}}>
								<div
									className='w-11 h-11 rounded-lg flex items-center justify-center mb-4'
									style={{ background: 'rgba(61, 107, 79, 0.08)' }}>
									<item.icon size={22} className='text-[var(--secondary)]' />
								</div>
								<h3 className='font-semibold text-sm mb-2'>{item.title}</h3>
								<p className='text-sm leading-relaxed text-[var(--text-secondary)]'>
									{item.description}
								</p>
							</div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
