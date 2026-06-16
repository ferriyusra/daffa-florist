'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

/**
 * Input multi-tag (chip) untuk daftar string (mis. tags, area layanan).
 * Ketik lalu **Enter** / **koma** untuk menambah; klik **×** atau **Backspace**
 * (saat input kosong) untuk menghapus. Duplikat (case-insensitive) diabaikan.
 */
export function TagsInput({
	label,
	value,
	onChange,
	placeholder = 'Ketik lalu tekan Enter…',
	required = false,
	error,
}: {
	label: string;
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
}) {
	const [draft, setDraft] = useState('');

	const add = (raw: string) => {
		const tag = raw.trim();
		setDraft('');
		if (!tag) return;
		if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
		onChange([...value, tag]);
	};

	const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			add(draft);
		} else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
			removeAt(value.length - 1);
		}
	};

	return (
		<div>
			<label className='block text-sm font-semibold mb-2'>
				{label}
				{required && <span style={{ color: 'var(--destructive)' }}> *</span>}
			</label>
			<div
				className={`flex flex-wrap items-center gap-2 rounded-md border px-2.5 py-2 min-h-[3rem] transition-colors focus-within:border-[var(--primary)] ${
					error
						? 'border-[var(--destructive)]'
						: 'border-[var(--border)]'
				}`}
				style={{ background: 'var(--bg-card)' }}>
				{value.map((tag, i) => (
					<span
						key={tag}
						className='inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-xs border border-[var(--border)]'
						style={{
							background: 'var(--bg-surface)',
							color: 'var(--text-secondary)',
						}}>
						{tag}
						<button
							type='button'
							onClick={() => removeAt(i)}
							aria-label={`Hapus ${tag}`}
							className='rounded-full p-0.5 cursor-pointer hover:opacity-70 transition-opacity'>
							<X size={13} />
						</button>
					</span>
				))}
				<input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={onKeyDown}
					onBlur={() => add(draft)}
					placeholder={value.length === 0 ? placeholder : ''}
					className='flex-1 min-w-[8rem] bg-transparent text-sm outline-none py-1'
				/>
			</div>
			{error && (
				<p className='mt-1.5 text-xs' style={{ color: 'var(--destructive)' }}>
					{error}
				</p>
			)}
		</div>
	);
}
