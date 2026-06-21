'use client';

import { Flower2 } from 'lucide-react';

/**
 * Komponen loading reusable bertema Daffa Florist.
 * Dipakai oleh file `loading.tsx` di tiap route untuk transisi halaman yang halus.
 * WAJIB pakai CSS custom properties dari globals.css (jangan hardcode hex).
 */

/** Spinner bunga berputar dengan label Bahasa Indonesia. */
export function PageLoader({ label = 'Memuat…' }: { label?: string }) {
	return (
		<div
			className='floral-bg flex min-h-[70vh] flex-col items-center justify-center gap-4'
			role='status'
			aria-live='polite'>
			<span className='relative inline-flex h-14 w-14 items-center justify-center'>
				<span
					className='absolute inset-0 animate-spin rounded-full border-2 border-transparent'
					style={{
						borderTopColor: 'var(--primary)',
						borderRightColor: 'var(--primary-light)',
						animationDuration: '900ms',
					}}
				/>
				<Flower2
					size={24}
					className='animate-float'
					style={{ color: 'var(--primary)' }}
				/>
			</span>
			<p
				className='text-sm font-medium'
				style={{ color: 'var(--text-secondary)' }}>
				{label}
			</p>
		</div>
	);
}

/** Blok skeleton dasar dengan animasi pulse memakai token warna situs. */
export function SkeletonBlock({ className = '' }: { className?: string }) {
	return (
		<div
			className={`animate-pulse rounded-md ${className}`}
			style={{ background: 'var(--bg-surface)' }}
		/>
	);
}

/** Skeleton untuk satu kartu produk (gambar + judul + deskripsi). */
export function ProductCardSkeleton() {
	return (
		<div
			className='flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]'
			style={{ boxShadow: 'var(--shadow-sm)' }}>
			<SkeletonBlock className='aspect-4/3 w-full rounded-none' />
			<div className='flex flex-1 flex-col gap-3 p-5'>
				<SkeletonBlock className='h-5 w-3/4' />
				<SkeletonBlock className='h-4 w-full' />
				<SkeletonBlock className='h-4 w-2/3' />
				<SkeletonBlock className='mt-2 h-4 w-24' />
			</div>
		</div>
	);
}

/** Grid skeleton kartu produk untuk halaman katalog/landing. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
			{Array.from({ length: count }).map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</div>
	);
}
