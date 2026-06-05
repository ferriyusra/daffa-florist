'use client';

import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, type LucideIcon } from 'lucide-react';

/**
 * Modal konfirmasi reusable (bergaya destruktif): ikon dalam lingkaran merah di
 * tengah, konten rata tengah, tombol aksi merah. Ikon bisa diganti (`icon`),
 * default tong sampah. Tutup lewat tombol Batal, klik backdrop, atau Escape
 * (dinonaktifkan saat `loading`).
 */
export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	icon: Icon = Trash2,
	tone = 'danger',
	confirmLabel = 'Hapus',
	cancelLabel = 'Batal',
	loadingLabel = 'Menghapus...',
	loading = false,
	error,
}: {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description?: ReactNode;
	icon?: LucideIcon;
	/** Warna aksi: `danger` (merah, default) atau `primary`. */
	tone?: 'danger' | 'primary';
	confirmLabel?: string;
	cancelLabel?: string;
	loadingLabel?: string;
	loading?: boolean;
	error?: string;
}) {
	const accent = tone === 'primary' ? 'var(--primary)' : 'var(--destructive)';
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !loading) onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, loading, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={loading ? undefined : onClose}>
					<motion.div
						role='dialog'
						aria-modal
						onClick={(e) => e.stopPropagation()}
						className='relative w-full max-w-sm rounded-2xl p-7 text-center'
						style={{
							background: 'var(--bg-card)',
							boxShadow: 'var(--shadow-md)',
						}}
						initial={{ opacity: 0, scale: 0.95, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 8 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}>
						<div
							className='mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full'
							style={{
								background: `color-mix(in srgb, ${accent} 12%, transparent)`,
							}}>
							<Icon size={26} style={{ color: accent }} />
						</div>

						<h3 className='font-serif text-lg font-semibold mb-2'>{title}</h3>
						{description && (
							<p
								className='text-sm mb-5'
								style={{ color: 'var(--text-secondary)' }}>
								{description}
							</p>
						)}
						{error && (
							<p
								className='text-sm mb-4'
								style={{ color: 'var(--destructive)' }}>
								{error}
							</p>
						)}

						<div className='flex items-center justify-center gap-3'>
							<button
								type='button'
								onClick={onClose}
								disabled={loading}
								className='px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer disabled:opacity-60'
								style={{ color: 'var(--text-secondary)' }}>
								{cancelLabel}
							</button>
							<button
								type='button'
								onClick={onConfirm}
								disabled={loading}
								className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60'
								style={{ background: accent }}>
								<Icon size={15} />
								{loading ? loadingLabel : confirmLabel}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
