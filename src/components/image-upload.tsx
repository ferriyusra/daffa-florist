'use client';

import { useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { uploadImage } from '@/lib/upload-image';
import ProductImage from './product-image';

/**
 * Field unggah gambar reusable — mode **tunggal** (`<ImageUpload />`) atau
 * **galeri** (`<ImageUpload multiple />`). Mengunggah ke `/api/upload` (admin)
 * dengan **progress bar animasi** per file (XHR), klik & drag-drop, pratinjau,
 * dan hapus per item.
 */
type SingleProps = {
	multiple?: false;
	value: string;
	onChange: (url: string) => void;
	max?: never;
};
type GalleryProps = {
	multiple: true;
	value: string[];
	onChange: (urls: string[]) => void;
	/** Batas jumlah gambar (opsional, default tanpa batas). */
	max?: number;
};
type Pending = { id: string; progress: number };

const ACCEPT = 'image/png,image/jpeg,image/webp';

export default function ImageUpload(props: SingleProps | GalleryProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [pending, setPending] = useState<Pending[]>([]);
	const [error, setError] = useState('');
	const [dragOver, setDragOver] = useState(false);

	const urls = props.multiple ? props.value : props.value ? [props.value] : [];
	const max = props.multiple ? props.max : 1;
	const busy = pending.length > 0;

	const handleFiles = async (fileList: FileList | null) => {
		let files = fileList ? Array.from(fileList) : [];
		if (!files.length || busy) return;
		if (!props.multiple) files = files.slice(0, 1);
		if (max != null) {
			const room = max - urls.length;
			if (room <= 0) {
				setError(`Maksimal ${max} gambar.`);
				return;
			}
			files = files.slice(0, room);
		}

		setError('');
		const entries: Pending[] = files.map(() => ({
			id: crypto.randomUUID(),
			progress: 0,
		}));
		setPending(entries);

		const results = await Promise.allSettled(
			files.map((file, i) =>
				uploadImage(file, (pct) =>
					setPending((p) =>
						p.map((e) => (e.id === entries[i].id ? { ...e, progress: pct } : e)),
					),
				),
			),
		);

		const ok = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
		const failed = results.find((r) => r.status === 'rejected') as
			| PromiseRejectedResult
			| undefined;

		if (ok.length) {
			if (props.multiple) props.onChange([...props.value, ...ok]);
			else props.onChange(ok[0]);
		}
		if (failed) {
			setError(
				failed.reason instanceof Error
					? failed.reason.message
					: 'Upload gagal.',
			);
		}
		setPending([]);
		if (inputRef.current) inputRef.current.value = '';
	};

	const removeAt = (i: number) => {
		if (props.multiple)
			props.onChange(props.value.filter((_, idx) => idx !== i));
		else props.onChange('');
	};

	const dropHandlers = {
		onDragOver: (e: DragEvent) => {
			e.preventDefault();
			setDragOver(true);
		},
		onDragLeave: () => setDragOver(false),
		onDrop: (e: DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			void handleFiles(e.dataTransfer.files);
		},
	};

	const fileInput = (
		<input
			ref={inputRef}
			type='file'
			accept={ACCEPT}
			multiple={props.multiple}
			className='hidden'
			onChange={(e) => void handleFiles(e.target.files)}
		/>
	);

	const errorNode = error && (
		<p className='text-xs mt-2' style={{ color: 'var(--destructive)' }}>
			{error}
		</p>
	);

	if (props.multiple) {
		const full = max != null && urls.length >= max;
		return (
			<div>
				{fileInput}
				<div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
					{urls.map((url, index) => (
						<motion.div
							key={`${url}-${index}`}
							initial={{ opacity: 0, scale: 0.92 }}
							animate={{ opacity: 1, scale: 1 }}
							className='relative aspect-square rounded-lg overflow-hidden border border-[var(--border)]'>
							<ProductImage
								src={url}
								alt={`Galeri ${index + 1}`}
								sizes='(max-width: 640px) 33vw, 120px'
							/>
							<button
								type='button'
								onClick={() => removeAt(index)}
								aria-label='Hapus gambar'
								className='absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer opacity-90 hover:opacity-100 transition-opacity'
								style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>
								<X size={13} />
							</button>
						</motion.div>
					))}

					{pending.map((p) => (
						<UploadingTile key={p.id} progress={p.progress} />
					))}

					{!full && !busy && (
						<button
							type='button'
							onClick={() => inputRef.current?.click()}
							{...dropHandlers}
							className='aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors'
							style={{
								background: 'var(--bg-surface)',
								borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
							}}>
							<Plus size={18} style={{ color: 'var(--text-muted)' }} />
							<span
								className='text-xs'
								style={{ color: 'var(--text-secondary)' }}>
								Tambah
							</span>
						</button>
					)}
				</div>
				{errorNode}
			</div>
		);
	}

	const single = urls[0];
	return (
		<div>
			{fileInput}
			{busy ? (
				<UploadingBox progress={pending[0]?.progress ?? 0} />
			) : single ? (
				<div className='flex items-center gap-4'>
					<motion.div
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						className='relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border)] shrink-0'>
						<ProductImage src={single} alt='Pratinjau gambar' sizes='96px' />
					</motion.div>
					<div className='flex flex-col items-start gap-2'>
						<button
							type='button'
							onClick={() => inputRef.current?.click()}
							className='inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
							style={{ color: 'var(--text-secondary)' }}>
							<UploadCloud size={14} />
							Ganti gambar
						</button>
						<button
							type='button'
							onClick={() => removeAt(0)}
							className='inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer'
							style={{ color: 'var(--destructive)' }}>
							<Trash2 size={12} />
							Hapus
						</button>
					</div>
				</div>
			) : (
				<button
					type='button'
					onClick={() => inputRef.current?.click()}
					{...dropHandlers}
					className='w-full flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors'
					style={{
						background: 'var(--bg-surface)',
						borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
					}}>
					<UploadCloud size={22} style={{ color: 'var(--text-muted)' }} />
					<span className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						Klik atau tarik gambar ke sini
					</span>
					<span className='text-xs' style={{ color: 'var(--text-muted)' }}>
						PNG, JPG, WEBP · maks 5MB
					</span>
				</button>
			)}
			{errorNode}
		</div>
	);
}

/** Bar progress animasi (framer-motion) di tepi bawah container. */
function UploadProgress({ progress }: { progress: number }) {
	return (
		<div
			className='absolute bottom-0 left-0 right-0 h-1'
			style={{ background: 'var(--border)' }}>
			<motion.div
				className='h-full'
				style={{ background: 'var(--primary)' }}
				animate={{ width: `${progress}%` }}
				transition={{ ease: 'easeOut', duration: 0.2 }}
			/>
		</div>
	);
}

/** Placeholder kotak (galeri) saat sebuah file sedang diunggah. */
function UploadingTile({ progress }: { progress: number }) {
	return (
		<div
			className='relative aspect-square rounded-lg overflow-hidden border flex flex-col items-center justify-center gap-1.5'
			style={{ background: 'var(--bg-surface)', borderColor: 'var(--primary)' }}>
			<Loader2
				size={18}
				className='animate-spin'
				style={{ color: 'var(--primary)' }}
			/>
			<span
				className='text-[11px] font-medium'
				style={{ color: 'var(--text-secondary)' }}>
				{progress}%
			</span>
			<UploadProgress progress={progress} />
		</div>
	);
}

/** Dropzone (mode tunggal) saat file sedang diunggah. */
function UploadingBox({ progress }: { progress: number }) {
	return (
		<div
			className='relative w-full overflow-hidden flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-lg border-2 border-dashed'
			style={{ background: 'var(--bg-surface)', borderColor: 'var(--primary)' }}>
			<Loader2
				size={22}
				className='animate-spin'
				style={{ color: 'var(--primary)' }}
			/>
			<span className='text-sm' style={{ color: 'var(--text-secondary)' }}>
				Mengunggah {progress}%
			</span>
			<UploadProgress progress={progress} />
		</div>
	);
}
