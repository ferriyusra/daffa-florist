'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionDivider() {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-20px' });

	return (
		<div ref={ref} className='flex items-center justify-center gap-4 py-4' aria-hidden='true'>
			{/* Left line */}
			<motion.div
				className='h-px flex-1 max-w-[80px]'
				style={{ background: 'var(--border)' }}
				initial={{ scaleX: 0, originX: 1 }}
				animate={inView ? { scaleX: 1 } : {}}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			/>

			{/* Center flower */}
			<motion.svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				initial={{ scale: 0, rotate: -90 }}
				animate={inView ? { scale: 1, rotate: 0 } : {}}
				transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
			>
				{/* 5 petals */}
				{[0, 72, 144, 216, 288].map((angle) => (
					<ellipse
						key={angle}
						cx='12'
						cy='6'
						rx='3'
						ry='5'
						fill='var(--primary-light)'
						opacity={0.6}
						transform={`rotate(${angle} 12 12)`}
					/>
				))}
				{/* Center */}
				<circle cx='12' cy='12' r='2.5' fill='var(--accent-light)' />
			</motion.svg>

			{/* Right line */}
			<motion.div
				className='h-px flex-1 max-w-[80px]'
				style={{ background: 'var(--border)' }}
				initial={{ scaleX: 0, originX: 0 }}
				animate={inView ? { scaleX: 1 } : {}}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			/>
		</div>
	);
}
