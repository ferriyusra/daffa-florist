'use client';

import { Switch } from '@/components/ui/switch';

/**
 * Sakelar aktif/nonaktif reusable di atas shadcn `Switch`. Dipakai di form admin
 * (gallery, delivery-areas, promos) untuk field boolean seperti `isActive`.
 * API prop (`checked`/`onChange`/`onLabel`/`offLabel`) tidak berubah — adaptasi
 * `onCheckedChange` shadcn ke `onChange` dilakukan di dalam.
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
		<label
			className='inline-flex items-center gap-2 text-sm cursor-pointer'
			style={{ color: 'var(--text-secondary)' }}>
			<Switch checked={checked} onCheckedChange={onChange} />
			{checked ? onLabel : offLabel}
		</label>
	);
}
