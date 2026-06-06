'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/trpc/react';
import { productCategories, type ProductCategory } from '@/lib/products';
import {
	FloatingInput,
	FloatingSelect,
	FloatingTextarea,
	ImageUpload,
	RupiahInput,
	TagsInput,
} from '@/components';
import { useToast } from '@/hooks';
import { MAX_GALLERY, MAX_SIZES, productFields } from '@/lib/product-schema';

type SizeRow = {
	label: string;
	price: number;
	unitCount: number;
	note: string;
};

type FormState = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	category: ProductCategory;
	basePrice: number;
	image: string;
	productionTime: string;
	images: string[];
	tags: string[];
	serviceAreas: string[];
	sizes: SizeRow[];
};

const emptyForm: FormState = {
	slug: '',
	title: '',
	shortDescription: '',
	description: '',
	category: productCategories[0],
	basePrice: 0,
	image: '',
	productionTime: '',
	images: [],
	tags: [],
	serviceAreas: [],
	// Tampilkan 1 baris ukuran secara default (mode tambah); bisa ditambah/dihapus.
	sizes: [{ label: '', price: 0, unitCount: 1, note: '' }],
};

// Preset ukuran umum (papan bunga sewa). Hanya saran lewat datalist — admin
// tetap boleh mengetik ukuran custom (mis. "3 meter").
const SIZE_PRESETS = ['Kecil', 'Sedang', 'Besar', 'Jumbo'];
const STANDARD_SIZES = ['Kecil', 'Sedang', 'Besar'];

/** Ubah teks bebas → slug valid (huruf kecil, angka, strip). Selaras regex zod. */
const slugify = (s: string): string =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '') // buang diakritik
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-') // non-alfanumerik → strip
		.replace(/^-+|-+$/g, ''); // rapikan strip di ujung

function Field({
	label,
	required = false,
	error,
	children,
}: {
	label: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className='block text-sm font-semibold mb-2'>
				{label}
				{required && <span style={{ color: 'var(--destructive)' }}> *</span>}
			</label>
			{children}
			{error && (
				<p className='mt-1.5 text-xs' style={{ color: 'var(--destructive)' }}>
					{error}
				</p>
			)}
		</div>
	);
}

export default function ProductForm({
	productId,
}: {
	productId: string | null;
}) {
	const isEdit = productId !== null;
	const router = useRouter();
	const toast = useToast();
	const utils = api.useUtils();
	const [form, setForm] = useState<FormState>(emptyForm);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const existing = api.admin.product.getById.useQuery(
		{ id: productId ?? '' },
		{ enabled: isEdit },
	);

	// Isi form dari data DB saat mode edit.
	useEffect(() => {
		const p = existing.data;
		if (!p) return;
		setForm({
			slug: p.slug,
			title: p.title,
			shortDescription: p.shortDescription,
			description: p.description,
			category: p.category as ProductCategory,
			basePrice: p.basePrice,
			image: p.image,
			productionTime: p.productionTime ?? '',
			images: p.images,
			tags: p.tags,
			serviceAreas: p.serviceAreas,
			sizes: p.sizes.map((s) => ({
				label: s.label,
				price: s.price,
				unitCount: s.unitCount,
				note: s.note ?? '',
			})),
		});
	}, [existing.data]);

	const onDone = async () => {
		await Promise.all([
			utils.admin.product.list.invalidate(),
			utils.product.list.invalidate(),
		]);
		router.push('/admin/products');
	};

	const createMut = api.admin.product.create.useMutation({
		onSuccess: () => {
			toast.success('Produk berhasil ditambahkan.');
			void onDone();
		},
		onError: (e) => {
			// Slug (turunan judul) bentrok → field slug disembunyikan, jadi pesan
			// ditampilkan di field Judul.
			if (e.data?.code === 'CONFLICT') {
				const msg =
					'Judul ini sudah dipakai produk lain — gunakan judul berbeda.';
				setFieldErrors((prev) => ({ ...prev, title: msg }));
				toast.error(msg);
				return;
			}
			toast.error(e.message);
		},
	});
	const updateMut = api.admin.product.update.useMutation({
		onSuccess: () => {
			toast.success('Produk berhasil diperbarui.');
			void onDone();
		},
		onError: (e) => {
			// Slug (turunan judul) bentrok → field slug disembunyikan, jadi pesan
			// ditampilkan di field Judul.
			if (e.data?.code === 'CONFLICT') {
				const msg =
					'Judul ini sudah dipakai produk lain — gunakan judul berbeda.';
				setFieldErrors((prev) => ({ ...prev, title: msg }));
				toast.error(msg);
				return;
			}
			toast.error(e.message);
		},
	});
	const pending = createMut.isPending || updateMut.isPending;

	const clearFieldError = (key: string) =>
		setFieldErrors((prev) => {
			if (!prev[key]) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		clearFieldError(key as string); // hapus error field saat diubah
	};

	const addSize = () =>
		setForm((prev) =>
			prev.sizes.length >= MAX_SIZES
				? prev
				: {
						...prev,
						sizes: [
						...prev.sizes,
						{ label: '', price: 0, unitCount: 1, note: '' },
					],
					},
		);
	const removeSize = (i: number) =>
		setForm((prev) => ({
			...prev,
			sizes: prev.sizes.filter((_, idx) => idx !== i),
		}));
	const setSize = (i: number, key: keyof SizeRow, value: string | number) => {
		setForm((prev) => ({
			...prev,
			sizes: prev.sizes.map((s, idx) =>
				idx === i ? { ...s, [key]: value } : s,
			),
		}));
		clearFieldError(`sizes.${i}.${key}`);
	};
	// Tambah preset standar (Kecil/Sedang/Besar) yang belum ada — harga diisi admin.
	const fillStandardSizes = () =>
		setForm((prev) => {
			const have = new Set(
				prev.sizes.map((s) => s.label.trim().toLowerCase()),
			);
			const room = Math.max(0, MAX_SIZES - prev.sizes.length);
			const additions = STANDARD_SIZES.filter(
				(l) => !have.has(l.toLowerCase()),
			)
				.slice(0, room)
				.map((label) => ({ label, price: 0, unitCount: 1, note: '' }));
			return { ...prev, sizes: [...prev.sizes, ...additions] };
		});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const payload = {
			...form,
			// Slug diturunkan dari judul (mode tambah). Mode edit: pertahankan slug
			// existing agar URL lama tidak berubah.
			slug: isEdit ? form.slug : slugify(form.title),
			productionTime: form.productionTime || undefined,
			sizes: form.sizes.map((s) => ({
				label: s.label.trim(),
				price: s.price,
				unitCount: s.unitCount,
				note: s.note.trim() || undefined,
			})),
		};

		// Validasi di client dengan schema zod yang sama seperti server.
		const parsed = productFields.safeParse(payload);
		if (!parsed.success) {
			const errs: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				// Slug tersembunyi (turunan judul) → arahkan error ke field Judul.
				if (issue.path[0] === 'slug') {
					if (!errs.title)
						errs.title = 'Judul harus mengandung huruf atau angka.';
					continue;
				}
				// Path bisa bersarang (mis. sizes.0.price) → gabung jadi key bertitik.
				const key = issue.path.join('.');
				if (key && !errs[key]) errs[key] = issue.message;
			}
			setFieldErrors(errs);
			toast.error('Periksa kembali data yang wajib diisi.');
			return;
		}

		setFieldErrors({});
		if (isEdit) updateMut.mutate({ id: productId, ...parsed.data });
		else createMut.mutate(parsed.data);
	};

	const loadingExisting = isEdit && existing.isLoading;

	const title = isEdit ? 'Edit Produk' : 'Tambah Produk';

	return (
		<div className='max-w-3xl'>
			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<div className='px-6 sm:px-8 py-5 border-b border-[var(--border)]'>
					<h2 className='font-serif text-xl font-semibold'>{title}</h2>
				</div>

				{loadingExisting ? (
					<div className='p-8 text-sm' style={{ color: 'var(--text-muted)' }}>
						Memuat data produk...
					</div>
				) : (
					<form onSubmit={handleSubmit} className='p-6 sm:p-8 space-y-5'>
						<FloatingInput
							label='Judul'
							required
							error={fieldErrors.title}
							value={form.title}
							onChange={(v) => set('title', v)}
						/>

						<FloatingInput
							label='Deskripsi singkat'
							required
							error={fieldErrors.shortDescription}
							value={form.shortDescription}
							onChange={(v) => set('shortDescription', v)}
						/>

						<FloatingTextarea
							label='Deskripsi lengkap'
							required
							error={fieldErrors.description}
							rows={3}
							value={form.description}
							onChange={(v) => set('description', v)}
						/>

						<div className='grid sm:grid-cols-2 gap-4'>
							<FloatingSelect
								label='Kategori'
								required
								error={fieldErrors.category}
								value={form.category}
								onChange={(v) => set('category', v as ProductCategory)}>
								{productCategories.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</FloatingSelect>
							<RupiahInput
								label='Harga sewa mulai'
								required
								error={fieldErrors.basePrice}
								value={form.basePrice}
								onChange={(n) => set('basePrice', n)}
							/>
						</div>

						<Field label='Ukuran & harga'>
							<div className='space-y-3'>
								{form.sizes.length === 0 && (
									<p
										className='text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Belum ada ukuran — tambahkan varian beserta harga
										sewanya.
									</p>
								)}
								{form.sizes.map((s, i) => (
									<div
										key={i}
										className='relative rounded-xl border border-[var(--border)] p-4 space-y-3'>
										<button
											type='button'
											onClick={() => removeSize(i)}
											aria-label='Hapus ukuran'
											className='absolute top-3 right-3 p-1.5 rounded-md cursor-pointer hover:opacity-70 transition-opacity'
											style={{ color: 'var(--destructive)' }}>
											<Trash2 size={16} />
										</button>
										<div className='grid sm:grid-cols-2 gap-3 pr-9'>
											<FloatingSelect
												label='Ukuran'
												required
												error={fieldErrors[`sizes.${i}.label`]}
												value={s.label}
												onChange={(v) => setSize(i, 'label', v)}>
												<option value=''>Pilih ukuran</option>
												{/* Label lama non-preset (data existing) tetap tampil agar tak hilang saat edit. */}
												{s.label &&
													!SIZE_PRESETS.some(
														(p) =>
															p.toLowerCase() === s.label.toLowerCase(),
													) && <option value={s.label}>{s.label}</option>}
												{SIZE_PRESETS.map((p) => (
													<option
														key={p}
														value={p}
														disabled={form.sizes.some(
															(o, idx) =>
																idx !== i &&
																o.label.toLowerCase() ===
																	p.toLowerCase(),
														)}>
														{p}
													</option>
												))}
											</FloatingSelect>
											<RupiahInput
												label='Harga'
												required
												error={fieldErrors[`sizes.${i}.price`]}
												value={s.price}
												onChange={(n) => setSize(i, 'price', n)}
											/>
										</div>
										<div className='grid sm:grid-cols-2 gap-3 pr-9'>
											<FloatingInput
												label='Stok (unit)'
												type='number'
												min={0}
												error={fieldErrors[`sizes.${i}.unitCount`]}
												value={String(s.unitCount)}
												onChange={(v) =>
													setSize(
														i,
														'unitCount',
														Math.max(0, Math.trunc(Number(v) || 0)),
													)
												}
											/>
											<FloatingInput
												label='Catatan (opsional)'
												value={s.note}
												onChange={(v) => setSize(i, 'note', v)}
											/>
										</div>
									</div>
								))}
								<div className='flex flex-wrap items-center gap-2'>
									<button
										type='button'
										onClick={addSize}
										disabled={form.sizes.length >= MAX_SIZES}
										className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
										style={{ color: 'var(--text-secondary)' }}>
										<Plus size={16} />
										Tambah ukuran
									</button>
									<button
										type='button'
										onClick={fillStandardSizes}
										disabled={form.sizes.length >= MAX_SIZES}
										className='inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
										style={{ color: 'var(--primary)' }}>
										Isi standar (Kecil/Sedang/Besar)
									</button>
									{form.sizes.length >= MAX_SIZES && (
										<span
											className='text-xs'
											style={{ color: 'var(--text-muted)' }}>
											Maksimal {MAX_SIZES} ukuran.
										</span>
									)}
								</div>
							</div>
						</Field>

						<Field label='Gambar utama' required error={fieldErrors.image}>
							<ImageUpload
								value={form.image}
								onChange={(image) => set('image', image)}
							/>
						</Field>

						<FloatingInput
							label='Waktu produksi'
							value={form.productionTime}
							onChange={(v) => set('productionTime', v)}
						/>

						<Field label='Galeri gambar'>
							<ImageUpload
								multiple
								max={MAX_GALLERY}
								value={form.images}
								onChange={(images) => set('images', images)}
							/>
						</Field>

						<TagsInput
							label='Tags'
							value={form.tags}
							onChange={(v) => set('tags', v)}
							placeholder='Ketik tag lalu Enter…'
						/>
						<TagsInput
							label='Area layanan'
							value={form.serviceAreas}
							onChange={(v) => set('serviceAreas', v)}
							placeholder='Ketik area lalu Enter…'
						/>

						<div className='flex items-center justify-center gap-3 pt-4'>
							<button
								type='button'
								onClick={() => router.push('/admin/products')}
								className='px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer'
								style={{ color: 'var(--text-secondary)' }}>
								Kembali
							</button>
							<button
								type='submit'
								disabled={pending}
								className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60'
								style={{ background: 'var(--primary)' }}>
								{pending ? 'Menyimpan...' : 'Simpan'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
