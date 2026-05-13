'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	AlertCircle,
	CheckCircle2,
	Sparkles,
	Trash2,
	Upload,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const gallery = [
	{
		id: 'g-1',
		image: '/product/papan-bunga-5.PNG',
		caption: 'Wedding Pak Andre & Bu Sinta',
		category: 'Wedding',
		date: '05 Mei 2026',
	},
	{
		id: 'g-2',
		image: '/product/mobil-pengantin-1.PNG',
		caption: 'Dekorasi Mobil Pengantin Pak Hendra',
		category: 'Dekorasi',
		date: '04 Mei 2026',
	},
	{
		id: 'g-3',
		image: '/product/papan-bunga-3.PNG',
		caption: 'Grand Opening Toko Bunga Sentosa',
		category: 'Grand Opening',
		date: '02 Mei 2026',
	},
	{
		id: 'g-4',
		image: '/product/papan-bunga-4.PNG',
		caption: 'Ucapan Selamat Wisuda Adik Rina',
		category: 'Wisuda',
		date: '28 April 2026',
	},
	{
		id: 'g-5',
		image: '/product/papan-bunga-2.PNG',
		caption: 'Duka Cita Keluarga Pak Hasan',
		category: 'Duka Cita',
		date: '25 April 2026',
	},
	{
		id: 'g-6',
		image: '/product/papan-bunga-1.PNG',
		caption: 'Wedding Bu Lina & Pak Yudi',
		category: 'Wedding',
		date: '22 April 2026',
	},
];

export default function AdminGalleryPage() {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [dragActive, setDragActive] = useState(false);
	const [rejected, setRejected] = useState<string[]>([]);

	const previews = useMemo(
		() => files.map((file) => URL.createObjectURL(file)),
		[files]
	);

	useEffect(() => {
		return () => {
			previews.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previews]);

	useEffect(() => {
		if (rejected.length === 0) return;
		const timer = window.setTimeout(() => setRejected([]), 5000);
		return () => window.clearTimeout(timer);
	}, [rejected]);

	const ingest = (incoming: File[]) => {
		const accepted: File[] = [];
		const errors: string[] = [];
		for (const file of incoming) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				errors.push(`${file.name} — format tidak didukung`);
				continue;
			}
			if (file.size > MAX_FILE_SIZE) {
				errors.push(`${file.name} — melebihi 5MB`);
				continue;
			}
			accepted.push(file);
		}
		if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
		if (errors.length) setRejected(errors);
	};

	const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		setDragActive(false);
		ingest(Array.from(e.dataTransfer.files));
	};

	const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		ingest(Array.from(e.target.files ?? []));
		e.target.value = '';
	};

	const removeFile = (idx: number) =>
		setFiles((prev) => prev.filter((_, i) => i !== idx));

	return (
		<div className='space-y-6 max-w-7xl'>
			<section
				className='rounded-2xl border border-[var(--border)] p-5 sm:p-6'
				style={{
					background: 'var(--bg-card)',
					boxShadow: 'var(--shadow-sm)',
				}}>
				<div className='mb-4 sm:mb-5'>
					<h2 className='font-serif text-lg font-semibold mb-1'>
						Upload Foto Hasil Jadi
					</h2>
					<p
						className='text-sm'
						style={{ color: 'var(--text-secondary)' }}>
						Unggah dokumentasi pesanan yang sudah selesai untuk ditampilkan di
						galeri publik.
					</p>
				</div>

				{rejected.length > 0 && (
					<div
						role='alert'
						aria-live='polite'
						className='mb-4 flex items-start gap-3 rounded-xl border px-4 py-3'
						style={{
							borderColor: 'rgba(194, 45, 45, 0.3)',
							background: 'rgba(194, 45, 45, 0.06)',
							color: 'var(--destructive)',
						}}>
						<AlertCircle size={16} className='mt-0.5 shrink-0' />
						<div className='flex-1 min-w-0 text-xs leading-relaxed'>
							<p className='font-semibold mb-1'>
								{rejected.length} foto ditolak
							</p>
							<ul className='space-y-0.5'>
								{rejected.map((msg, idx) => (
									<li key={idx} className='truncate opacity-90'>
										{msg}
									</li>
								))}
							</ul>
						</div>
					</div>
				)}

				<div className='grid gap-5 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]'>
					<label
						htmlFor='gallery-upload'
						onDragOver={(e) => {
							e.preventDefault();
							setDragActive(true);
						}}
						onDragLeave={() => setDragActive(false)}
						onDrop={onDrop}
						className='group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer px-6 py-10 sm:py-12 text-center transition-all duration-200 min-h-55 sm:min-h-65 lg:min-h-75 hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-card)] motion-reduce:transition-none'
						style={{
							borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
							background: dragActive
								? 'rgba(157, 23, 77, 0.06)'
								: 'transparent',
						}}>
						<span
							className='inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
							style={{
								background: 'rgba(157, 23, 77, 0.1)',
								color: 'var(--primary)',
							}}>
							<Upload size={20} />
						</span>
						<div>
							<p className='font-semibold text-sm mb-0.5'>
								Tarik & lepas foto di sini, atau klik untuk memilih
							</p>
							<p
								className='text-xs'
								style={{ color: 'var(--text-muted)' }}>
								Format JPG, PNG, atau WEBP. Maks. 5MB per foto.
							</p>
						</div>
						<input
							id='gallery-upload'
							ref={inputRef}
							type='file'
							accept='image/jpeg,image/png,image/webp'
							multiple
							className='sr-only'
							onChange={onSelect}
						/>
					</label>

					<aside
						className='rounded-2xl border border-[var(--border)] p-4 sm:p-5 flex flex-col'
						style={{ background: 'var(--bg-surface)' }}>
						{files.length === 0 ? (
							<div className='flex flex-col gap-3'>
								<div className='inline-flex items-center gap-2'>
									<span
										className='inline-flex items-center justify-center w-8 h-8 rounded-xl'
										style={{
											background: 'rgba(157, 23, 77, 0.1)',
											color: 'var(--primary)',
										}}>
										<Sparkles size={14} />
									</span>
									<p className='text-sm font-semibold'>Tips foto berkualitas</p>
								</div>
								<ul
									className='text-xs leading-relaxed space-y-2 list-disc pl-5'
									style={{ color: 'var(--text-secondary)' }}>
									<li>Ambil foto dengan pencahayaan terang dan jelas.</li>
									<li>Sertakan keseluruhan rangkaian, bukan close-up bagian kecil.</li>
									<li>Hindari watermark atau editan berlebihan.</li>
									<li>Rasio persegi (1:1) tampil paling rapi di galeri.</li>
								</ul>
							</div>
						) : (
							<div className='flex flex-col gap-3 flex-1'>
								<div className='flex items-center justify-between gap-3'>
									<p className='text-sm font-semibold'>
										{files.length} foto siap diunggah
									</p>
									<button
										type='button'
										onClick={() => setFiles([])}
										className='text-xs font-medium cursor-pointer rounded-md px-2 py-1 -mr-2 transition-colors hover:bg-[var(--bg-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] motion-reduce:transition-none'
										style={{ color: 'var(--text-secondary)' }}>
										Bersihkan semua
									</button>
								</div>
								<ul className='space-y-2 max-h-70 overflow-y-auto pr-1'>
									{files.map((file, idx) => (
										<li
											key={`${file.name}-${idx}`}
											className='flex items-center gap-3 p-2 rounded-xl border border-[var(--border)]'
											style={{ background: 'var(--bg-card)' }}>
											<div
												className='relative w-11 h-11 rounded-lg overflow-hidden shrink-0'
												style={{ background: 'var(--bg-surface)' }}>
												{previews[idx] && (
													<Image
														src={previews[idx]}
														alt={file.name}
														fill
														unoptimized
														sizes='44px'
														className='object-cover'
													/>
												)}
											</div>
											<div className='flex-1 min-w-0'>
												<p className='text-sm font-medium truncate'>
													{file.name}
												</p>
												<p
													className='text-xs'
													style={{ color: 'var(--text-muted)' }}>
													{(file.size / 1024).toFixed(0)} KB
												</p>
											</div>
											<button
												type='button'
												onClick={() => removeFile(idx)}
												className='inline-flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer shrink-0 transition-colors hover:bg-[rgba(194,45,45,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--destructive)] motion-reduce:transition-none'
												style={{ color: 'var(--destructive)' }}
												aria-label={`Hapus ${file.name} dari antrian`}>
												<Trash2 size={15} />
											</button>
										</li>
									))}
								</ul>
								<button
									type='button'
									className='mt-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] motion-reduce:transition-none motion-reduce:active:scale-100'
									style={{ background: 'var(--primary)', color: 'white' }}>
									<CheckCircle2 size={15} />
									Simpan ke Galeri
								</button>
							</div>
						)}
					</aside>
				</div>
			</section>

			<section>
				<div className='flex items-center justify-between mb-4'>
					<div>
						<h2 className='font-serif text-lg font-semibold'>
							Galeri Tersimpan
						</h2>
						<p
							className='text-xs mt-0.5'
							style={{ color: 'var(--text-muted)' }}>
							{gallery.length} foto tampil di halaman publik
						</p>
					</div>
				</div>

				<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'>
					{gallery.map((item) => (
						<div
							key={item.id}
							className='group rounded-2xl border border-[var(--border)] overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-md)] focus-within:shadow-[var(--shadow-md)] motion-reduce:transition-none'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-sm)',
							}}>
							<div className='relative aspect-square bg-[var(--bg-surface)]'>
								<Image
									src={item.image}
									alt={item.caption}
									fill
									className='object-cover'
									sizes='(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw'
								/>
								<button
									type='button'
									className='absolute top-2 right-2 inline-flex items-center justify-center w-11 h-11 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--destructive)] motion-reduce:transition-none'
									style={{
										background: 'rgba(255, 255, 255, 0.95)',
										color: 'var(--destructive)',
										boxShadow: 'var(--shadow-sm)',
									}}
									aria-label={`Hapus foto: ${item.caption}`}>
									<Trash2 size={15} />
								</button>
							</div>
							<div className='p-3'>
								<p
									className='text-[10px] font-semibold uppercase tracking-wider mb-1'
									style={{ color: 'var(--primary)' }}>
									{item.category}
								</p>
								<p className='text-xs font-medium line-clamp-1'>
									{item.caption}
								</p>
								<p
									className='text-[11px] mt-1'
									style={{ color: 'var(--text-muted)' }}>
									{item.date}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
