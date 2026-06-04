'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Field gaya "outlined + floating label" (Material): label menempel di garis
 * atas saat fokus/terisi, dan turun ke tengah sebagai placeholder saat kosong.
 *
 * - `required` hanya menampilkan asterisk merah (TIDAK memakai attribute HTML
 *   `required`); validasi dilakukan oleh zod di submit.
 * - `error` mewarnai border/label merah dan menampilkan pesan di bawah field.
 */
const FIELD =
	'peer w-full rounded-md border bg-transparent text-sm text-[var(--text)] outline-none transition-colors';
const NORMAL = 'border-[var(--border)] focus:border-[var(--primary)]';
const INVALID = 'border-[var(--destructive)] focus:border-[var(--destructive)]';

const LABEL =
	'pointer-events-none absolute left-2.5 px-1 -translate-y-1/2 transition-all';
const LABEL_NORMAL = 'text-[var(--text-muted)] peer-focus:text-[var(--primary)]';
const LABEL_INVALID = 'text-[var(--destructive)]';

const labelBg = { background: 'var(--bg-card)' };

function Asterisk() {
	return <span style={{ color: 'var(--destructive)' }}> *</span>;
}

function FieldError({ error }: { error?: string }) {
	if (!error) return null;
	return (
		<p className='mt-1.5 text-xs' style={{ color: 'var(--destructive)' }}>
			{error}
		</p>
	);
}

export function FloatingInput({
	id,
	label,
	value,
	onChange,
	type = 'text',
	required = false,
	error,
	list,
}: {
	id?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	error?: string;
	list?: string;
}) {
	return (
		<div>
			<div className='relative'>
				<input
					id={id}
					type={type}
					list={list}
					value={value}
					placeholder=' '
					onChange={(e) => onChange(e.target.value)}
					className={`${FIELD} h-14 px-3 ${error ? INVALID : NORMAL}`}
				/>
				<label
					htmlFor={id}
					style={labelBg}
					className={`${LABEL} ${error ? LABEL_INVALID : LABEL_NORMAL} top-0 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs`}>
					{label}
					{required && <Asterisk />}
				</label>
			</div>
			<FieldError error={error} />
		</div>
	);
}

export function FloatingTextarea({
	id,
	label,
	value,
	onChange,
	rows = 3,
	required = false,
	error,
}: {
	id?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	rows?: number;
	required?: boolean;
	error?: string;
}) {
	return (
		<div>
			<div className='relative'>
				<textarea
					id={id}
					rows={rows}
					value={value}
					placeholder=' '
					onChange={(e) => onChange(e.target.value)}
					className={`${FIELD} px-3 py-3 resize-none leading-relaxed ${error ? INVALID : NORMAL}`}
				/>
				<label
					htmlFor={id}
					style={labelBg}
					className={`${LABEL} ${error ? LABEL_INVALID : LABEL_NORMAL} top-0 text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs`}>
					{label}
					{required && <Asterisk />}
				</label>
			</div>
			<FieldError error={error} />
		</div>
	);
}

export function FloatingSelect({
	id,
	label,
	value,
	onChange,
	children,
	required = false,
	error,
}: {
	id?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	children: ReactNode;
	required?: boolean;
	error?: string;
}) {
	return (
		<div>
			<div className='relative'>
				<select
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={`${FIELD} h-14 pl-3 pr-9 cursor-pointer appearance-none ${error ? INVALID : NORMAL}`}>
					{children}
				</select>
				<label
					htmlFor={id}
					style={labelBg}
					className={`${LABEL} ${error ? LABEL_INVALID : LABEL_NORMAL} top-0 text-xs`}>
					{label}
					{required && <Asterisk />}
				</label>
				<ChevronDown
					size={16}
					className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'
					style={{ color: 'var(--text-muted)' }}
				/>
			</div>
			<FieldError error={error} />
		</div>
	);
}
