'use client';

import { Flower2, Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';

const quickLinks = [
	{ label: 'Beranda', href: '#beranda' },
	{ label: 'Produk', href: '#produk' },
	{ label: 'Tentang Kami', href: '#tentang' },
	{ label: 'Galeri', href: '#galeri' },
	{ label: 'Testimoni', href: '#testimoni' },
	{ label: 'Kontak', href: '#kontak' },
];

const products = [
	'Papan Bunga Ucapan',
	'Papan Bunga Duka Cita',
	'Bucket Bunga',
	'Bunga Wisuda',
	'Dekorasi Mobil Pengantin',
];

export default function Footer() {
	return (
		<footer style={{ background: 'var(--text)' }} className='text-white'>
			<div className='mx-auto max-w-[1200px] px-6 pt-16 pb-8'>
				<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12'>
					{/* Brand */}
					<div className='sm:col-span-2 lg:col-span-1'>
						<div className='flex items-center gap-2 mb-4'>
							<Flower2 size={24} className='text-[var(--primary-light)]' />
							<span className='font-serif text-lg font-semibold'>Dafa Florist</span>
						</div>
						<p className='text-sm leading-relaxed opacity-70 mb-2'>
							Karangan Bunga Ampar Putih
						</p>
						<p className='text-sm leading-relaxed opacity-50 mb-6 max-w-[280px]'>
							Toko karangan bunga segar untuk papan bunga, bucket, wisuda,
							dan dekorasi mobil pengantin.
						</p>
						<div className='flex gap-3'>
							<a
								href='https://instagram.com/dafaflorist_'
								target='_blank'
								rel='noopener noreferrer'
								className='w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-white/20'
								style={{ background: 'rgba(255,255,255,0.1)' }}
								aria-label='Instagram'
							>
								<Instagram size={18} />
							</a>
							<a
								href='https://wa.me/6281234567890'
								target='_blank'
								rel='noopener noreferrer'
								className='w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-white/20'
								style={{ background: 'rgba(255,255,255,0.1)' }}
								aria-label='WhatsApp'
							>
								<MessageCircle size={18} />
							</a>
						</div>
					</div>

					{/* Quick links */}
					<div>
						<h4 className='font-semibold text-sm uppercase tracking-wider mb-4 opacity-50'>
							Navigasi
						</h4>
						<ul className='space-y-3'>
							{quickLinks.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										className='text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Products */}
					<div>
						<h4 className='font-semibold text-sm uppercase tracking-wider mb-4 opacity-50'>
							Produk
						</h4>
						<ul className='space-y-3'>
							{products.map((p) => (
								<li key={p}>
									<a
										href='#produk'
										className='text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
									>
										{p}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Contact info */}
					<div>
						<h4 className='font-semibold text-sm uppercase tracking-wider mb-4 opacity-50'>
							Kontak
						</h4>
						<ul className='space-y-4'>
							<li className='flex items-start gap-3'>
								<MapPin size={16} className='mt-0.5 shrink-0 opacity-50' />
								<span className='text-sm opacity-70'>Ampar Putih, Pasaman Barat</span>
							</li>
							<li className='flex items-start gap-3'>
								<Phone size={16} className='mt-0.5 shrink-0 opacity-50' />
								<span className='text-sm opacity-70'>+62 812-3456-7890</span>
							</li>
							<li className='flex items-start gap-3'>
								<Mail size={16} className='mt-0.5 shrink-0 opacity-50' />
								<span className='text-sm opacity-70'>@dafaflorist_</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Divider + copyright */}
				<div className='border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
					<p className='text-sm opacity-40'>
						&copy; {new Date().getFullYear()} Dafa Florist. All rights reserved.
					</p>
					<p className='text-xs opacity-30'>
						Karangan Bunga Ampar Putih
					</p>
				</div>
			</div>
		</footer>
	);
}
