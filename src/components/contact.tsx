'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
	MessageCircle,
	Phone,
	MapPin,
	Clock,
	Send,
	CheckCircle,
	ArrowUpRight,
} from 'lucide-react';

const WHATSAPP_NUMBER = '6285274320917';

export default function Contact() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-80px' });
	const [formState, setFormState] = useState({
		name: '',
		phone: '',
		product: '',
		message: '',
	});
	const [submitted, setSubmitted] = useState(false);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const text = encodeURIComponent(
			`Halo Dafa Florist!\n\nNama: ${formState.name}\nNo. HP: ${formState.phone}\nProduk: ${formState.product}\nPesan: ${formState.message}`,
		);
		window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
		setSubmitted(true);
		setTimeout(() => {
			setSubmitted(false);
			setFormState({ name: '', phone: '', product: '', message: '' });
		}, 3000);
	}

	const inputClass =
		'w-full px-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all duration-200 placeholder:text-[var(--text-muted)]';

	return (
		<section id='contact' className='floral-bg'>
			<div className='mx-auto max-w-[1200px] px-6'>
				{/* Header */}
				<div className='text-center max-w-[640px] mx-auto mb-14'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}>
						Hubungi Kami
					</span>
					<h2 className='font-serif text-[clamp(2rem,4vw,3rem)] font-bold mb-4'>
						Pesan Papan Bunga <span className='gradient-text'>Ampar Putih</span>
					</h2>
					<p
						className='text-base leading-relaxed'
						style={{ color: 'var(--text-secondary)' }}>
						Konsultasi gratis dan respon cepat via WhatsApp. Kami bantu pilihkan
						rangkaian bunga terbaik untuk momen Anda.
					</p>
				</div>

				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 30 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className='grid lg:grid-cols-2 gap-8'>
					{/* Left — visual + quick contact */}
					<div className='space-y-5'>
						{/* WhatsApp hero card with image */}
						<a
							href={`https://wa.me/${WHATSAPP_NUMBER}`}
							target='_blank'
							rel='noopener noreferrer'
							className='group relative block rounded-2xl overflow-hidden cursor-pointer card-hover'
							style={{ boxShadow: '0 8px 30px rgba(37, 211, 102, 0.15)' }}>
							<div className='relative h-[220px]'>
								<Image
									src='/product/papan-bunga-2.PNG'
									alt='Hubungi Dafa Florist via WhatsApp'
									fill
									className='object-cover transition-transform duration-500 group-hover:scale-105'
									sizes='(max-width: 1024px) 100vw, 50vw'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-[#128C7E]/90 via-[#128C7E]/40 to-transparent' />
								<div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
									<div className='flex items-center justify-between'>
										<div>
											<div className='flex items-center gap-2 mb-2'>
												<MessageCircle size={20} />
												<span className='text-xs font-semibold tracking-wider uppercase opacity-80'>
													WhatsApp
												</span>
											</div>
											<h3 className='font-serif text-xl font-semibold'>
												Chat Langsung
											</h3>
											<p className='text-sm opacity-80 mt-1'>
												Respon cepat untuk konsultasi & pemesanan
											</p>
										</div>
										<div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors'>
											<ArrowUpRight size={18} />
										</div>
									</div>
								</div>
							</div>
						</a>

						{/* Quick contact grid */}
						<div className='grid grid-cols-3 gap-3'>
							<a
								href={`https://wa.me/${WHATSAPP_NUMBER}`}
								target='_blank'
								rel='noopener noreferrer'
								className='bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] text-center card-hover cursor-pointer group'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								<div
									className='w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform'
									style={{ background: 'rgba(157, 23, 77, 0.08)' }}>
									<Phone size={18} className='text-[var(--primary)]' />
								</div>
								<p
									className='text-[10px] font-medium uppercase tracking-wider mb-1'
									style={{ color: 'var(--text-muted)' }}>
									WhatsApp
								</p>
								<p className='text-xs font-semibold'>0852-7432-0917</p>
							</a>

							<div
								className='bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] text-center'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								<div
									className='w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3'
									style={{ background: 'rgba(61, 107, 79, 0.08)' }}>
									<MapPin size={18} className='text-[var(--secondary)]' />
								</div>
								<p
									className='text-[10px] font-medium uppercase tracking-wider mb-1'
									style={{ color: 'var(--text-muted)' }}>
									Lokasi
								</p>
								<p className='text-xs font-semibold'>Ampar Putih</p>
							</div>

							<div
								className='bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] text-center'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								<div
									className='w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3'
									style={{ background: 'rgba(139, 105, 20, 0.08)' }}>
									<Clock size={18} className='text-[var(--accent)]' />
								</div>
								<p
									className='text-[10px] font-medium uppercase tracking-wider mb-1'
									style={{ color: 'var(--text-muted)' }}>
									Buka
								</p>
								<p className='text-xs font-semibold'>08:00 - 21:00</p>
							</div>
						</div>

						{/* Instagram link */}
						<a
							href='https://instagram.com/dafaflorist_'
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-4 bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] cursor-pointer group hover:border-[var(--primary)] transition-colors'
							style={{ boxShadow: 'var(--shadow-sm)' }}>
							<div
								className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0'
								style={{
									background:
										'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
								}}>
								<svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
									<rect
										x='2'
										y='2'
										width='20'
										height='20'
										rx='6'
										stroke='white'
										strokeWidth='1.8'
									/>
									<circle
										cx='12'
										cy='12'
										r='4.5'
										stroke='white'
										strokeWidth='1.8'
									/>
									<circle cx='17.5' cy='6.5' r='1.2' fill='white' />
								</svg>
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-semibold group-hover:text-[var(--primary)] transition-colors'>
									@dafaflorist_
								</p>
								<p className='text-xs' style={{ color: 'var(--text-muted)' }}>
									Lihat koleksi terbaru di Instagram
								</p>
							</div>
							<ArrowUpRight
								size={16}
								className='text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors shrink-0'
							/>
						</a>
					</div>

					{/* Right — form */}
					<div>
						<form
							onSubmit={handleSubmit}
							className='bg-[var(--bg-card)] rounded-2xl p-7 sm:p-8 border border-[var(--border)] space-y-5'
							style={{ boxShadow: 'var(--shadow-md)' }}>
							<div>
								<h3 className='font-serif text-lg font-semibold mb-1'>
									Formulir Pemesanan
								</h3>
								<p className='text-xs' style={{ color: 'var(--text-muted)' }}>
									Isi detail di bawah, kami akan hubungi via WhatsApp
								</p>
							</div>

							<div className='grid sm:grid-cols-2 gap-4'>
								<div>
									<label
										htmlFor='name'
										className='block text-xs font-semibold uppercase tracking-wider mb-2'
										style={{ color: 'var(--text-secondary)' }}>
										Nama <span className='text-[var(--primary)]'>*</span>
									</label>
									<input
										id='name'
										type='text'
										value={formState.name}
										onChange={(e) =>
											setFormState({ ...formState, name: e.target.value })
										}
										className={inputClass}
										style={{ background: 'var(--bg)' }}
										placeholder='Nama lengkap'
									/>
								</div>
								<div>
									<label
										htmlFor='phone'
										className='block text-xs font-semibold uppercase tracking-wider mb-2'
										style={{ color: 'var(--text-secondary)' }}>
										WhatsApp <span className='text-[var(--primary)]'>*</span>
									</label>
									<input
										id='phone'
										type='tel'
										value={formState.phone}
										onChange={(e) =>
											setFormState({ ...formState, phone: e.target.value })
										}
										className={inputClass}
										style={{ background: 'var(--bg)' }}
										placeholder='08xx-xxxx-xxxx'
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor='product'
									className='block text-xs font-semibold uppercase tracking-wider mb-2'
									style={{ color: 'var(--text-secondary)' }}>
									Produk <span className='text-[var(--primary)]'>*</span>
								</label>
								<select
									id='product'
									value={formState.product}
									onChange={(e) =>
										setFormState({ ...formState, product: e.target.value })
									}
									className={`${inputClass} cursor-pointer`}
									style={{ background: 'var(--bg)' }}>
									<option value=''>Pilih produk...</option>
									<option value='Papan Bunga Ucapan'>Papan Bunga Ucapan</option>
									<option value='Papan Bunga Duka Cita'>
										Papan Bunga Duka Cita
									</option>
									<option value='Bucket Bunga'>Bucket Bunga</option>
									<option value='Bunga Wisuda'>Bunga Wisuda</option>
									<option value='Dekorasi Mobil Pengantin'>
										Dekorasi Mobil Pengantin
									</option>
									<option value='Lainnya'>Lainnya</option>
								</select>
							</div>

							<div>
								<label
									htmlFor='message'
									className='block text-xs font-semibold uppercase tracking-wider mb-2'
									style={{ color: 'var(--text-secondary)' }}>
									Detail Pesanan
								</label>
								<textarea
									id='message'
									rows={3}
									value={formState.message}
									onChange={(e) =>
										setFormState({ ...formState, message: e.target.value })
									}
									className={`${inputClass} resize-none`}
									style={{ background: 'var(--bg)' }}
									placeholder='Tanggal kirim, warna, ucapan papan bunga...'
								/>
							</div>

							<button
								type='submit'
								disabled={submitted}
								className={`btn-primary w-full justify-center text-sm ${submitted ? 'opacity-80' : ''}`}>
								{submitted ? (
									<>
										<CheckCircle size={16} />
										Terkirim! Membuka WhatsApp...
									</>
								) : (
									<>
										<Send size={16} />
										Kirim & Chat via WhatsApp
									</>
								)}
							</button>

							<p
								className='text-center text-[11px]'
								style={{ color: 'var(--text-muted)' }}>
								Formulir ini akan membuka chat WhatsApp dengan detail pesanan
								Anda
							</p>
						</form>
					</div>
				</motion.div>

				{/* Google Maps */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
					className='mt-10'>
					<div className='flex items-center justify-between mb-4'>
						<div>
							<h3 className='font-serif text-lg font-semibold'>Lokasi Kami</h3>
							<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
								Ampar Putih, Pasaman Barat, Sumatera Barat
							</p>
						</div>
						<a
							href='https://maps.app.goo.gl/bu8mfdxXKyU4avVf7'
							target='_blank'
							rel='noopener noreferrer'
							className='hidden sm:inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:text-[var(--primary)] transition-colors'
							style={{ color: 'var(--text-secondary)' }}>
							Buka di Google Maps
							<ArrowUpRight size={14} />
						</a>
					</div>
					<div
						className='rounded-2xl overflow-hidden border border-[var(--border)]'
						style={{ boxShadow: 'var(--shadow-sm)' }}>
						<iframe
							src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.8!2d99.6885768!3d0.23162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302a69004e5cb967%3A0xa484932e60059f73!2sWarung%20sembako%20Ibu%20Nelvi!5e0!3m2!1sid!2sid!4v1700000000000'
							width='100%'
							height='320'
							style={{ border: 0, display: 'block' }}
							allowFullScreen
							loading='lazy'
							referrerPolicy='no-referrer-when-downgrade'
							title='Lokasi Dafa Florist di Google Maps'
						/>
					</div>
					<a
						href='https://maps.app.goo.gl/bu8mfdxXKyU4avVf7'
						target='_blank'
						rel='noopener noreferrer'
						className='sm:hidden inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:text-[var(--primary)] transition-colors mt-3'
						style={{ color: 'var(--text-secondary)' }}>
						Buka di Google Maps
						<ArrowUpRight size={14} />
					</a>
				</motion.div>
			</div>
		</section>
	);
}
