'use client';

const petals = [
	{ delay: 0, duration: 12, left: 8, size: 18, opacity: 0.4, color: 0 },
	{ delay: 2.5, duration: 15, left: 22, size: 14, opacity: 0.3, color: 1 },
	{ delay: 5, duration: 18, left: 45, size: 20, opacity: 0.35, color: 2 },
	{ delay: 1.2, duration: 14, left: 62, size: 16, opacity: 0.25, color: 0 },
	{ delay: 7, duration: 16, left: 78, size: 12, opacity: 0.3, color: 1 },
	{ delay: 3.5, duration: 13, left: 92, size: 15, opacity: 0.35, color: 2 },
	{ delay: 9, duration: 17, left: 35, size: 10, opacity: 0.2, color: 0 },
	{ delay: 4, duration: 11, left: 55, size: 17, opacity: 0.3, color: 1 },
	{ delay: 6.5, duration: 19, left: 15, size: 13, opacity: 0.25, color: 2 },
	{ delay: 8, duration: 14, left: 70, size: 11, opacity: 0.2, color: 0 },
];

const colors = ['var(--primary-light)', 'var(--secondary-light)', 'var(--accent-light)'];

function PetalSVG({ size, color }: { size: number; color: string }) {
	return (
		<svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
			<path
				d='M12 2C12 2 4 8 4 14C4 18.4 7.6 22 12 22C16.4 22 20 18.4 20 14C20 8 12 2 12 2Z'
				fill={color}
			/>
		</svg>
	);
}

export default function FloatingPetals() {
	return (
		<div className='floating-petals-container' aria-hidden='true'>
			{petals.map((p, i) => (
				<div
					key={i}
					className='floating-petal'
					style={{
						left: `${p.left}%`,
						animationDelay: `${p.delay}s, ${p.delay * 0.7}s`,
						animationDuration: `${p.duration}s, ${3 + (i % 3)}s`,
						'--petal-opacity': p.opacity,
					} as React.CSSProperties}
				>
					<PetalSVG size={p.size} color={colors[p.color]} />
				</div>
			))}
		</div>
	);
}
