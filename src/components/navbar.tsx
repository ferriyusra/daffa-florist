'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Menu,
	X,
	MessageCircle,
	Instagram,
	MapPin,
	LogIn,
	LogOut,
	ShoppingCart,
	ShieldCheck,
	User,
} from 'lucide-react';
import { useAuth, useCart } from '@/hooks';
import { ConfirmDialog } from './confirm-dialog';

const navLinks = [
	{ label: 'Beranda', href: '/#home' },
	{ label: 'Produk', href: '/products' },
	{ label: 'Tentang', href: '/#about' },
	{ label: 'Galeri', href: '/#gallery' },
	{ label: 'Testimoni', href: '/#testimony' },
	{ label: 'Kontak', href: '/#contact' },
];

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const { user, isLoading, logout } = useAuth();
	const { totalItems } = useCart();
	const [confirmLogout, setConfirmLogout] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 60);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const headerHeight = scrolled ? 56 : 80;

	return (
		<>
			<header className='fixed top-0 left-0 right-0 z-50'>
				<div
					className='transition-all duration-300 ease-out border-b'
					style={{
						background: 'var(--bg-surface)',
						borderColor: 'var(--border)',
						height: headerHeight,
						boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
					}}>
					<div className='mx-auto max-w-[1200px] px-6 h-full flex items-center'>
						<button
							onClick={() => setMobileOpen(!mobileOpen)}
							className='text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer mr-6'
							aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}>
							{mobileOpen ? <X size={20} /> : <Menu size={20} />}
						</button>

						<div
							className='hidden md:flex items-center justify-center flex-1 h-full border-r border-[var(--border)] transition-opacity duration-300'
							style={{
								opacity: scrolled ? 0 : 1,
								pointerEvents: scrolled ? 'none' : 'auto',
							}}>
							<p
								className='text-[10px] font-medium tracking-[0.2em] uppercase text-center leading-relaxed'
								style={{ color: 'var(--text-secondary)' }}>
								Karangan Bunga
								<br />
								Ampar Putih
							</p>
						</div>

						<a
							href='/'
							className='flex flex-col items-center justify-center h-full cursor-pointer flex-1'>
							<span
								className='font-serif font-semibold tracking-tight text-[var(--text)] transition-all duration-300'
								style={{
									fontSize: scrolled ? '1.25rem' : 'clamp(1.5rem, 3vw, 2rem)',
								}}>
								Dafa Florist
							</span>
							<span
								className='text-[9px] font-medium tracking-[0.3em] uppercase mt-0.5 transition-opacity duration-300'
								style={{
									color: 'var(--text-muted)',
									opacity: scrolled ? 0 : 1,
								}}>
								Ampar Putih
							</span>
						</a>

						<div
							className='hidden md:flex items-center justify-center flex-1 h-full border-l border-[var(--border)] transition-opacity duration-300'
							style={{
								opacity: scrolled ? 0 : 1,
								pointerEvents: scrolled ? 'none' : 'auto',
							}}>
							<div className='text-center'>
								<p
									className='text-[9px] font-medium tracking-[0.2em] uppercase'
									style={{ color: 'var(--text-muted)' }}>
									Hubungi Kami
								</p>
								<p
									className='text-[11px] font-semibold tracking-[0.15em] uppercase mt-1'
									style={{ color: 'var(--text)' }}>
									0852 7432 0917
								</p>
							</div>
						</div>

						<Link
							href='/confirmation-order'
							aria-label='Lihat keranjang'
							className='ml-4 relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer'
							style={{ color: 'var(--text-secondary)' }}>
							<ShoppingCart size={15} />
							{totalItems > 0 && (
								<span
									className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center'
									style={{
										background: 'var(--primary)',
										boxShadow: '0 0 0 2px var(--bg-surface)',
									}}>
									{totalItems > 99 ? '99+' : totalItems}
								</span>
							)}
						</Link>

						<div className='ml-2 flex items-center'>
							{isLoading ? null : user ? (
								<div className='flex items-center gap-2'>
									{user.role === 'ADMIN' && (
										<Link
											href='/admin'
											className='hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80 cursor-pointer'
											style={{
												background: 'var(--secondary)',
												color: 'white',
											}}>
											<ShieldCheck size={13} />
											Admin
										</Link>
									)}
									<Link
										href='/dashboard'
										className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:opacity-80 cursor-pointer'
										style={{
											background: 'rgba(157, 23, 77, 0.08)',
											color: 'var(--primary)',
										}}>
										<User size={14} />
										<span className='text-xs font-semibold max-w-[100px] truncate'>
											{user.name}
										</span>
									</Link>
									<button
										onClick={() => setConfirmLogout(true)}
										aria-label='Keluar'
										className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer'
										style={{ color: 'var(--text-secondary)' }}>
										<LogOut size={15} />
									</button>
								</div>
							) : (
								<Link
									href='/login'
									className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-transform hover:scale-[1.02] cursor-pointer'
									style={{
										background: 'var(--primary)',
										color: 'white',
									}}>
									<LogIn size={13} />
									Masuk
								</Link>
							)}
						</div>
					</div>
				</div>
			</header>

			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeOut' as const }}
						className='fixed inset-0 z-40 overflow-y-auto'
						style={{ background: 'var(--bg-surface)', top: headerHeight }}>
						<div className='mx-auto max-w-[800px] px-6 py-10 sm:py-14 flex flex-col min-h-[calc(100dvh-80px)]'>
							<div className='grid sm:grid-cols-2 gap-x-10 gap-y-0 flex-1'>
								{navLinks.map(({ label, href }, i) => (
									<motion.div
										key={href}
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 6 }}
										transition={{
											duration: 0.3,
											delay: i * 0.05,
											ease: 'easeOut' as const,
										}}>
										<a
											href={href}
											onClick={() => setMobileOpen(false)}
											className='group flex items-baseline gap-4 py-5 sm:py-6 border-t border-[var(--border)] cursor-pointer'>
											<span
												className='text-[10px] font-medium tracking-[0.15em] tabular-nums'
												style={{ color: 'var(--text-muted)' }}>
												{String(i + 1).padStart(2, '0')}
											</span>
											<span className='font-serif text-[clamp(1.4rem,3.5vw,2rem)] font-medium text-[var(--text)] group-hover:text-[var(--primary)] group-hover:translate-x-1 inline-block transition-all duration-200'>
												{label}
											</span>
										</a>
									</motion.div>
								))}
							</div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 0.4,
									delay: 0.35,
									ease: 'easeOut' as const,
								}}
								className='border-t border-[var(--border)] pt-6 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5'>
								<a
									href='https://wa.me/6285274320917'
									target='_blank'
									rel='noopener noreferrer'
									onClick={() => setMobileOpen(false)}
									className='inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.02]'
									style={{
										background: '#25D366',
										color: 'white',
										boxShadow: '0 2px 12px rgba(37, 211, 102, 0.2)',
									}}>
									<MessageCircle size={15} />
									Chat WhatsApp
								</a>

								<div className='flex items-center gap-4'>
									<a
										href='https://instagram.com/dafaflorist_'
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-2 text-sm cursor-pointer hover:text-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<Instagram size={15} />
										@dafaflorist_
									</a>
									<span className='text-[var(--border)]'>|</span>
									<a
										href='https://maps.app.goo.gl/bu8mfdxXKyU4avVf7'
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-1.5 text-sm cursor-pointer hover:text-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<MapPin size={13} />
										Ampar Putih
									</a>
								</div>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Spacer — matches header height */}
			<div
				className='transition-all duration-300'
				style={{ height: headerHeight }}
			/>

			<ConfirmDialog
				open={confirmLogout}
				onClose={() => setConfirmLogout(false)}
				onConfirm={async () => {
					setLoggingOut(true);
					await logout();
				}}
				icon={LogOut}
				title='Keluar dari akun?'
				description='Anda akan keluar dari akun dan kembali ke beranda.'
				confirmLabel='Keluar'
				loadingLabel='Keluar...'
				loading={loggingOut}
			/>
		</>
	);
}
