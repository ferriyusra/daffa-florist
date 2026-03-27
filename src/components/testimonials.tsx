'use client';

import { Star } from 'lucide-react';

const testimonials = [
	{
		name: 'Anisa Putri',
		product: 'Bucket Bunga',
		text: 'Rangkaian bunganya cantik banget! Pacar saya sangat senang. Pasti order lagi!',
		rating: 5,
	},
	{
		name: 'Budi Santoso',
		product: 'Papan Bunga',
		text: 'Papan bunga untuk pembukaan toko sangat megah. Pengiriman tepat waktu, profesional.',
		rating: 5,
	},
	{
		name: 'Rina Maharani',
		product: 'Bunga Wisuda',
		text: 'Bouquet wisuda anak saya sangat indah. Semua teman-temannya bertanya beli dimana!',
		rating: 5,
	},
	{
		name: 'Ahmad & Dewi',
		product: 'Dekorasi Mobil',
		text: 'Dekorasi mobil pengantin luar biasa cantik. Tamu undangan semua memuji!',
		rating: 5,
	},
	{
		name: 'Sarah Wibowo',
		product: 'Bucket Bunga',
		text: 'Sudah 3 kali pesan dan tidak pernah mengecewakan. Bunga selalu segar dan indah.',
		rating: 5,
	},
	{
		name: 'Hendra Kurniawan',
		product: 'Papan Bunga',
		text: 'Pelayanan ramah dan responsif. Papan bunga duka cita dikirim dalam waktu singkat.',
		rating: 5,
	},
	{
		name: 'Lisa Permata',
		product: 'Bunga Wisuda',
		text: 'Bouquet-nya cantik dan fresh banget. Wisuda jadi makin berkesan. Recommended!',
		rating: 5,
	},
	{
		name: 'Rendi Pratama',
		product: 'Papan Bunga',
		text: 'Papan bunga ucapan selamat sangat berkelas. Rekan bisnis sangat terkesan.',
		rating: 5,
	},
];

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
	return (
		<div
			className='w-[320px] shrink-0 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] select-none'
			style={{ boxShadow: 'var(--shadow-sm)' }}
		>
			{/* Header: avatar + name + product badge */}
			<div className='flex items-center gap-3 mb-4'>
				<div
					className='w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0'
					style={{ background: 'var(--primary)' }}
				>
					{t.name.charAt(0)}
				</div>
				<div className='min-w-0'>
					<p className='text-sm font-semibold truncate'>{t.name}</p>
					<div className='flex items-center gap-2'>
						<div className='flex gap-0.5'>
							{Array.from({ length: t.rating }).map((_, i) => (
								<Star key={i} size={11} fill='var(--accent)' color='var(--accent)' />
							))}
						</div>
						<span className='text-[10px] font-medium' style={{ color: 'var(--text-muted)' }}>
							· {t.product}
						</span>
					</div>
				</div>
			</div>

			{/* Review text */}
			<p className='text-sm leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
				&ldquo;{t.text}&rdquo;
			</p>
		</div>
	);
}

export default function Testimonials() {
	const row1 = testimonials.slice(0, 4);
	const row2 = testimonials.slice(4).concat(testimonials.slice(0, 2));

	return (
		<section id='testimoni' className='overflow-hidden' style={{ background: 'var(--bg-surface)' }}>
			<div className='mx-auto max-w-[1200px] px-6'>
				{/* Header */}
				<div className='text-center max-w-[540px] mx-auto mb-12'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
						style={{ background: 'rgba(61, 107, 79, 0.08)', color: 'var(--secondary)' }}
					>
						Testimoni
					</span>
					<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-4'>
						Kepercayaan <span className='gradient-text-green'>Pelanggan</span> Kami
					</h2>
					<p className='text-base leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
						Kepuasan pelanggan adalah prioritas kami. Lihat apa kata mereka tentang Dafa Florist.
					</p>
				</div>
			</div>

			{/* Marquee row 1 — scrolls left */}
			<div className='relative mb-5'>
				{/* Fade edges */}
				<div className='absolute left-0 top-0 bottom-0 w-20 z-10' style={{ background: 'linear-gradient(to right, var(--bg-surface), transparent)' }} />
				<div className='absolute right-0 top-0 bottom-0 w-20 z-10' style={{ background: 'linear-gradient(to left, var(--bg-surface), transparent)' }} />

				<div className='marquee-track'>
					<div className='marquee-scroll'>
						{[...row1, ...row1].map((t, i) => (
							<TestimonialCard key={`r1-${i}`} t={t} />
						))}
					</div>
				</div>
			</div>

			{/* Marquee row 2 — scrolls right (reverse) */}
			<div className='relative'>
				<div className='absolute left-0 top-0 bottom-0 w-20 z-10' style={{ background: 'linear-gradient(to right, var(--bg-surface), transparent)' }} />
				<div className='absolute right-0 top-0 bottom-0 w-20 z-10' style={{ background: 'linear-gradient(to left, var(--bg-surface), transparent)' }} />

				<div className='marquee-track'>
					<div className='marquee-scroll marquee-reverse'>
						{[...row2, ...row2].map((t, i) => (
							<TestimonialCard key={`r2-${i}`} t={t} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
