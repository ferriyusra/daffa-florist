'use client';

/**
 * Input nominal Rupiah: menampilkan angka berformat ribuan (id-ID, mis. 350.000)
 * dengan prefix "Rp", tetapi menyimpan nilai sebagai `number` murni.
 * Mengetik selain digit diabaikan; kosong = 0.
 *
 * `className` dikenakan ke wrapper (untuk layout, mis. `flex-1`); inputnya `w-full`.
 */
type RupiahInputProps = {
	value: number;
	onChange: (value: number) => void;
	id?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	/** Nilai maksimal (default 999.999.999). Input di-clamp ke nilai ini. */
	max?: number;
	/** Bila diisi, tampil sebagai field outlined dengan floating label. */
	label?: string;
	/** Pesan error (merah) di bawah field; juga mewarnai border merah. */
	error?: string;
	className?: string;
};

/** Batas atas default: Rp 999.999.999. */
export const MAX_RUPIAH = 999_999_999;

const formatDigits = (n: number): string =>
	n > 0 ? n.toLocaleString('id-ID') : '';

export default function RupiahInput({
	value,
	onChange,
	id,
	placeholder = '0',
	required = false,
	disabled = false,
	max = MAX_RUPIAH,
	label,
	error,
	className = '',
}: RupiahInputProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = e.target.value.replace(/\D/g, '');
		const parsed = digits === '' ? 0 : Number(digits);
		onChange(Math.min(parsed, max));
	};

	const border = error
		? 'border-[var(--destructive)] focus:border-[var(--destructive)]'
		: 'border-[var(--border)] focus:border-[var(--primary)]';

	return (
		<div className={className}>
			<div className='relative'>
				<span
					className='absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none'
					style={{ color: 'var(--text-muted)' }}>
					Rp
				</span>
				<input
					id={id}
					type='text'
					inputMode='numeric'
					disabled={disabled}
					value={formatDigits(value)}
					onChange={handleChange}
					placeholder={label ? ' ' : placeholder}
					className={
						label
							? `peer w-full h-14 pl-9 pr-3 rounded-md border bg-transparent text-sm text-[var(--text)] outline-none transition-colors disabled:opacity-60 ${border}`
							: `w-full pl-9 pr-3 py-2 rounded-lg border bg-[var(--bg-surface)] text-sm focus:outline-none disabled:opacity-60 ${border}`
					}
				/>
				{label && (
					<label
						htmlFor={id}
						style={{ background: 'var(--bg-card)' }}
						className={`pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 px-1 text-xs transition-all ${
							error
								? 'text-[var(--destructive)]'
								: 'text-[var(--text-muted)] peer-focus:text-[var(--primary)]'
						}`}>
						{label}
						{required && <span style={{ color: 'var(--destructive)' }}> *</span>}
					</label>
				)}
			</div>
			{error && (
				<p className='mt-1.5 text-xs' style={{ color: 'var(--destructive)' }}>
					{error}
				</p>
			)}
		</div>
	);
}
