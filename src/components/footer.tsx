'use client';

import {
	Flower2,
	Instagram,
	MessageCircle,
	MapPin,
	Phone,
	ArrowUpRight,
} from 'lucide-react';

const quickLinks = [
	{ label: 'Beranda', href: '/#home' },
	{ label: 'Produk', href: '/#product' },
	{ label: 'Tentang Kami', href: '/#about' },
	{ label: 'Galeri', href: '/#gallery' },
	{ label: 'Testimoni', href: '/#testimony' },
	{ label: 'Kontak', href: '/#contact' },
];

const products = [
	'Papan Bunga Wedding',
	'Papan Bunga Ucapan',
	'Papan Bunga Duka Cita',
	'Dekorasi Mobil Pengantin',
];

export default function Footer() {
	return (
		<footer className='bg-[#1C1917] text-white'>
			{/* CTA banner */}
			<div className='border-b border-white/10'>
				<div className='mx-auto max-w-[1200px] px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6'>
					<div>
						<h3 className='font-serif text-xl sm:text-2xl font-semibold mb-1'>
							Butuh karangan bunga?
						</h3>
						<p className='text-sm opacity-60'>
							Chat langsung via WhatsApp — respon cepat, konsultasi gratis.
						</p>
					</div>
					<a
						href='https://wa.me/6285274320917'
						target='_blank'
						rel='noopener noreferrer'
						className='shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg'
						style={{
							background: '#25D366',
							color: 'white',
							boxShadow: '0 4px 20px rgba(37, 211, 102, 0.25)',
						}}>
						<MessageCircle size={16} />
						Chat WhatsApp
					</a>
				</div>
			</div>

			{/* Main footer */}
			<div className='mx-auto max-w-[1200px] px-6 pt-14 pb-8'>
				<div className='grid sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12'>
					{/* Brand — wider column */}
					<div className='sm:col-span-2 lg:col-span-4'>
						<div className='flex items-center gap-2.5 mb-4'>
							<Flower2 size={22} className='text-[var(--primary-light)]' />
							<span className='font-serif text-lg font-semibold'>
								Dafa Florist
							</span>
						</div>
						<p className='text-sm leading-relaxed opacity-50 mb-6 max-w-[300px]'>
							Toko karangan bunga di Ampar Putih, Pasaman Barat. Melayani papan
							bunga, bucket bunga, dan dekorasi mobil pengantin.
						</p>

						{/* Social icons */}
						<div className='flex gap-2'>
							<a
								href='https://instagram.com/dafaflorist_'
								target='_blank'
								rel='noopener noreferrer'
								className='group w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/[0.06] hover:bg-white/[0.12]'
								aria-label='Instagram'>
								<Instagram
									size={16}
									className='opacity-60 group-hover:opacity-100 transition-opacity'
								/>
							</a>
							<a
								href='https://wa.me/6285274320917'
								target='_blank'
								rel='noopener noreferrer'
								className='group w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white/[0.06] hover:bg-white/[0.12]'
								aria-label='WhatsApp'>
								<MessageCircle
									size={16}
									className='opacity-60 group-hover:opacity-100 transition-opacity'
								/>
							</a>
						</div>
					</div>

					{/* Quick links */}
					<div className='lg:col-span-2'>
						<h4 className='text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 opacity-40'>
							Navigasi
						</h4>
						<ul className='space-y-2.5'>
							{quickLinks.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										className='text-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer'>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Products */}
					<div className='lg:col-span-3'>
						<h4 className='text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 opacity-40'>
							Produk
						</h4>
						<ul className='space-y-2.5'>
							{products.map((p) => (
								<li key={p}>
									<a
										href='/#product'
										className='text-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer'>
										{p}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Contact info */}
					<div className='lg:col-span-3'>
						<h4 className='text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 opacity-40'>
							Kontak
						</h4>
						<ul className='space-y-4'>
							<li>
								<a
									href='https://maps.app.goo.gl/bu8mfdxXKyU4avVf7'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-start gap-3 group cursor-pointer'>
									<MapPin size={15} className='mt-0.5 shrink-0 opacity-40' />
									<span className='text-sm opacity-50 group-hover:opacity-100 transition-opacity'>
										Ampar Putih, Pasaman Barat
										<br />
										<span className='text-xs opacity-70'>Sumatera Barat</span>
									</span>
								</a>
							</li>
							<li>
								<a
									href='https://wa.me/6285274320917'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-start gap-3 group cursor-pointer'>
									<Phone size={15} className='mt-0.5 shrink-0 opacity-40' />
									<span className='text-sm opacity-50 group-hover:opacity-100 transition-opacity'>
										0852-7432-0917
									</span>
								</a>
							</li>
							<li>
								<a
									href='https://instagram.com/dafaflorist_'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-start gap-3 group cursor-pointer'>
									<Instagram size={15} className='mt-0.5 shrink-0 opacity-40' />
									<span className='text-sm opacity-50 group-hover:opacity-100 transition-opacity'>
										@dafaflorist_
									</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className='border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
					<p className='text-xs opacity-30'>
						&copy; {new Date().getFullYear()} Dafa Florist &middot; Karangan
						Bunga Ampar Putih
					</p>
					<a
						href='https://maps.app.goo.gl/bu8mfdxXKyU4avVf7'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-1 text-xs opacity-30 hover:opacity-60 transition-opacity cursor-pointer'>
						<MapPin size={10} />
						Lihat di Google Maps
						<ArrowUpRight size={10} />
					</a>
				</div>
			</div>
		</footer>
	);
}
