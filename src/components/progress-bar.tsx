'use client';

import { motion } from 'framer-motion';

/**
 * Progress bar indeterminate (efek "memuat data") — tampil hanya saat `active`.
 * Segmen primary bergerak menyusuri track tipis tanpa henti.
 */
export default function ProgressBar({ active }: { active: boolean }) {
	if (!active) return null;

	return (
		<div
			role='progressbar'
			aria-busy='true'
			aria-label='Memuat data'
			className='relative h-1 w-full overflow-hidden rounded-full'
			style={{ background: 'rgba(157, 23, 77, 0.12)' }}>
			<motion.div
				className='absolute inset-y-0 w-2/5 rounded-full'
				style={{ background: 'var(--primary)' }}
				initial={{ x: '-100%' }}
				animate={{ x: '250%' }}
				transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity }}
			/>
		</div>
	);
}
