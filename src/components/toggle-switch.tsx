'use client';

/**
 * Sakelar aktif/nonaktif reusable (a11y `role="switch"`). Dipakai di form admin
 * (gallery, delivery-areas, promos) untuk field boolean seperti `isActive`.
 */
export function ToggleSwitch({
	checked,
	onChange,
	onLabel = 'Aktif',
	offLabel = 'Nonaktif',
}: {
	checked: boolean;
	onChange: (next: boolean) => void;
	onLabel?: string;
	offLabel?: string;
}) {
	return (
		<button
			type='button'
			role='switch'
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className='inline-flex items-center gap-2 text-sm cursor-pointer'
			style={{ color: 'var(--text-secondary)' }}>
			<span
				className='inline-flex items-center w-9 h-5 rounded-full transition-colors px-0.5'
				style={{
					background: checked ? 'var(--secondary)' : 'var(--border)',
					justifyContent: checked ? 'flex-end' : 'flex-start',
				}}>
				<span className='w-4 h-4 rounded-full bg-white' />
			</span>
			{checked ? onLabel : offLabel}
		</button>
	);
}
