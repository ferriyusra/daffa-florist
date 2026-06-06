import { Repeat } from 'lucide-react';

export function RentalBadge({ className = '' }: { className?: string }) {
	return (
		<span
			className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}
			style={{
				background: 'rgba(255, 255, 255, 0.95)',
				color: 'var(--primary)',
			}}>
			<Repeat size={11} />
			Sewa
		</span>
	);
}
