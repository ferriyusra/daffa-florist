'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
	{ label: 'Beranda', href: '#beranda' },
	{ label: 'Produk', href: '#produk' },
	{ label: 'Tentang', href: '#tentang' },
	{ label: 'Galeri', href: '#galeri' },
	{ label: 'Testimoni', href: '#testimoni' },
	{ label: 'Kontak', href: '#kontak' },
];

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 60);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const headerHeight = scrolled ? 56 : 80;

	return (
		<>
			<header className='fixed top-0 left-0 right-0 z-50'>
				{/* Single header bar */}
				<div
					className='transition-all duration-300 ease-out border-b'
					style={{
						background: 'var(--bg-surface)',
						borderColor: 'var(--border)',
						height: headerHeight,
						boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
					}}
				>
					<div className='mx-auto max-w-[1200px] px-6 h-full flex items-center'>
						{/* Hamburger — always visible on left */}
						<button
							onClick={() => setMobileOpen(!mobileOpen)}
							className='text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer mr-6'
							aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
						>
							{mobileOpen ? <X size={20} /> : <Menu size={20} />}
						</button>

						{/* Left — tagline (hidden when scrolled or mobile) */}
						<div
							className='hidden md:flex items-center justify-center flex-1 h-full border-r border-[var(--border)] transition-opacity duration-300'
							style={{ opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? 'none' : 'auto' }}
						>
							<p
								className='text-[10px] font-medium tracking-[0.2em] uppercase text-center leading-relaxed'
								style={{ color: 'var(--text-secondary)' }}
							>
								Karangan Bunga
								<br />
								Ampar Putih
							</p>
						</div>

						{/* Center — brand */}
						<a
							href='#beranda'
							className='flex flex-col items-center justify-center h-full cursor-pointer flex-1'
						>
							<span
								className='font-serif font-semibold tracking-tight text-[var(--text)] transition-all duration-300'
								style={{ fontSize: scrolled ? '1.25rem' : 'clamp(1.5rem, 3vw, 2rem)' }}
							>
								Dafa Florist
							</span>
							<span
								className='text-[9px] font-medium tracking-[0.3em] uppercase mt-0.5 transition-opacity duration-300'
								style={{ color: 'var(--text-muted)', opacity: scrolled ? 0 : 1 }}
							>
								Ampar Putih
							</span>
						</a>

						{/* Right — phone CTA (fades on scroll) */}
						<div
							className='hidden md:flex items-center justify-center flex-1 h-full border-l border-[var(--border)] transition-opacity duration-300'
							style={{ opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? 'none' : 'auto' }}
						>
							<div className='text-center'>
								<p
									className='text-[9px] font-medium tracking-[0.2em] uppercase'
									style={{ color: 'var(--text-muted)' }}
								>
									Hubungi Kami
								</p>
								<p
									className='text-[11px] font-semibold tracking-[0.15em] uppercase mt-1'
									style={{ color: 'var(--text)' }}
								>
									0812 3456 7890
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Full-screen menu overlay */}
			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeOut' as const }}
						className='fixed inset-0 z-40 overflow-y-auto'
						style={{ background: 'var(--bg-surface)', top: headerHeight }}
					>
						<div className='mx-auto max-w-[700px] px-6 py-16'>
							<div className='grid sm:grid-cols-2 gap-x-12 gap-y-2'>
								{navLinks.map(({ label, href }, i) => (
									<motion.div
										key={href}
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 8 }}
										transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' as const }}
									>
										<a
											href={href}
											onClick={() => setMobileOpen(false)}
											className='group block py-8 border-t border-[var(--border)] cursor-pointer'
										>
											<span
												className='text-[10px] font-medium tracking-[0.2em] block mb-3'
												style={{ color: 'var(--text-muted)' }}
											>
												{String(i + 1).padStart(2, '0')}
											</span>
											<span className='font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-200'>
												{label}
											</span>
										</a>
									</motion.div>
								))}
							</div>

							{/* Social links in menu */}
							<div className='mt-12 sm:mt-16 flex justify-end'>
								<div className='text-right'>
									<p
										className='text-[9px] font-medium tracking-[0.25em] uppercase mb-3'
										style={{ color: 'var(--text-muted)' }}
									>
										Follow Kami:
									</p>
									<div className='flex gap-4'>
										<a
											href='https://instagram.com/daffaflorist'
											target='_blank'
											rel='noopener noreferrer'
											className='text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer'
											aria-label='Instagram'
										>
											<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
												<rect x='2' y='2' width='20' height='20' rx='5' />
												<circle cx='12' cy='12' r='5' />
												<circle cx='17.5' cy='6.5' r='1' fill='currentColor' stroke='none' />
											</svg>
										</a>
										<a
											href='https://wa.me/6281234567890'
											target='_blank'
											rel='noopener noreferrer'
											className='text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer'
											aria-label='WhatsApp'
										>
											<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
												<path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
											</svg>
										</a>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Spacer — matches header height */}
			<div className='transition-all duration-300' style={{ height: headerHeight }} />
		</>
	);
}
