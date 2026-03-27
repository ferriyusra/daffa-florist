'use client';

import Link from 'next/link';
import { Flower2 } from 'lucide-react';

export default function NotFound() {
	return (
		<div
			className='min-h-dvh flex items-center justify-center px-6'
			style={{ background: 'var(--bg)' }}
		>
			<div className='text-center max-w-md'>
				<Flower2 size={48} className='mx-auto mb-6 text-[var(--primary-light)]' />

				<p className='font-serif text-[clamp(80px,15vw,140px)] font-bold leading-none opacity-[0.08] select-none'>
					404
				</p>

				<h1 className='font-serif text-3xl font-bold mb-3 -mt-10'>
					Halaman Tidak Ditemukan
				</h1>

				<p className='text-[var(--text-secondary)] mb-8 leading-relaxed'>
					Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
					Mari kembali ke beranda.
				</p>

				<Link href='/' className='btn-primary inline-flex'>
					Kembali ke Beranda
				</Link>
			</div>
		</div>
	);
}
