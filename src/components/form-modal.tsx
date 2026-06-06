'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal form reusable untuk admin CRUD — backdrop + animasi masuk/keluar, header
 * (judul + tombol tutup), area field (`children`), dan footer (Batal/Simpan).
 * Backdrop & tutup dinonaktifkan saat `pending`. Mengelola `AnimatePresence`
 * sendiri; pemanggil cukup mengatur `open`.
 */
export function FormModal({
	open,
	title,
	onClose,
	onSubmit,
	pending = false,
	submitLabel = 'Simpan',
	loadingLabel = 'Menyimpan...',
	maxWidth = 'max-w-md',
	children,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	onSubmit: () => void;
	pending?: boolean;
	submitLabel?: string;
	loadingLabel?: string;
	/** Kelas lebar maksimum panel (mis. `max-w-lg`). */
	maxWidth?: string;
	children: ReactNode;
}) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={pending ? undefined : onClose}>
					<motion.div
						onClick={(e) => e.stopPropagation()}
						className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl p-6`}
						style={{
							background: 'var(--bg-card)',
							boxShadow: 'var(--shadow-md)',
						}}
						initial={{ opacity: 0, scale: 0.95, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 8 }}
						transition={{ duration: 0.18, ease: 'easeOut' }}>
						<div className='flex items-center justify-between mb-5'>
							<h2 className='font-serif text-lg font-semibold'>{title}</h2>
							<button
								type='button'
								onClick={onClose}
								aria-label='Tutup'
								className='inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer'
								style={{ color: 'var(--text-secondary)' }}>
								<X size={18} />
							</button>
						</div>

						<div className='space-y-4'>{children}</div>

						<div className='flex items-center justify-center gap-3 pt-6'>
							<button
								type='button'
								onClick={onClose}
								className='px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer'
								style={{ color: 'var(--text-secondary)' }}>
								Batal
							</button>
							<button
								type='button'
								onClick={onSubmit}
								disabled={pending}
								className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60'
								style={{ background: 'var(--primary)' }}>
								{pending ? loadingLabel : submitLabel}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
