'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/trpc/react';
import { productCategories, type ProductCategory } from '@/lib/products';
import { ImageUpload, RupiahInput, TagsInput } from '@/components';
import { useToast } from '@/hooks';
import { MAX_GALLERY, MAX_SIZES, productFields } from '@/lib/product-schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

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

// Preset ukuran umum (papan bunga sewa). Hanya saran lewat dropdown — admin
// tetap boleh mengetik ukuran custom (mis. "3 meter") lewat data existing.
// Preset mengikuti skema nyata katalog: papan bunga (1.25m/2m/Custom),
// dekorasi (Mini/Standard/Premium), buket (Kecil/Sedang/Besar). Label di luar
// daftar ini tetap bisa dipakai lewat data existing.
const SIZE_PRESETS = [
	'1.25m',
	'2m',
	'Custom',
	'Mini',
	'Standard',
	'Premium',
	'Kecil',
	'Sedang',
	'Besar',
];
// Isi-cepat untuk produk papan bunga (skema dominan di katalog).
const STANDARD_SIZES = ['1.25m', '2m', 'Custom'];

// Radix Select melarang value string kosong → sentinel untuk opsi "Pilih ukuran".
const SIZE_PLACEHOLDER = '__none__';

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
			<Label className='mb-2 font-semibold'>
				{label}
				{required && <span style={{ color: 'var(--destructive)' }}>*</span>}
			</Label>
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

	// Area layanan dipilih dari data DeliveryArea (CRUD admin), bukan ketik bebas.
	const deliveryAreas = api.admin.deliveryArea.list.useQuery();
	const activeAreas = (deliveryAreas.data ?? []).filter((a) => a.isActive);
	// Opsi = area aktif ∪ area yang sudah terpilih (agar nama lama/nonaktif yang
	// pernah dipilih tetap tampil & bisa dilepas).
	const areaOptions = Array.from(
		new Set([...activeAreas.map((a) => a.name), ...form.serviceAreas]),
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

	const toggleArea = (name: string) =>
		set(
			'serviceAreas',
			form.serviceAreas.includes(name)
				? form.serviceAreas.filter((a) => a !== name)
				: [...form.serviceAreas, name],
		);

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
	// Tambah preset papan bunga (1.25m/2m/Custom) yang belum ada — harga diisi admin.
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
						<Field label='Judul' required error={fieldErrors.title}>
							<Input
								value={form.title}
								onChange={(e) => set('title', e.target.value)}
								aria-invalid={!!fieldErrors.title}
							/>
						</Field>

						<Field
							label='Deskripsi singkat'
							required
							error={fieldErrors.shortDescription}>
							<Input
								value={form.shortDescription}
								onChange={(e) => set('shortDescription', e.target.value)}
								aria-invalid={!!fieldErrors.shortDescription}
							/>
						</Field>

						<Field
							label='Deskripsi lengkap'
							required
							error={fieldErrors.description}>
							<Textarea
								rows={3}
								value={form.description}
								onChange={(e) => set('description', e.target.value)}
								aria-invalid={!!fieldErrors.description}
							/>
						</Field>

						<div className='grid sm:grid-cols-2 gap-4'>
							<Field label='Kategori' required error={fieldErrors.category}>
								<Select
									value={form.category}
									onValueChange={(v) => set('category', v as ProductCategory)}>
									<SelectTrigger
										className='w-full'
										aria-invalid={!!fieldErrors.category}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{productCategories.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
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
										<Button
											type='button'
											variant='ghost'
											size='icon'
											onClick={() => removeSize(i)}
											aria-label='Hapus ukuran'
											className='absolute top-3 right-3 size-8 text-[var(--destructive)] hover:text-[var(--destructive)]'>
											<Trash2 size={16} />
										</Button>
										<div className='grid sm:grid-cols-2 gap-3 pr-9'>
											<Field
												label='Ukuran'
												required
												error={fieldErrors[`sizes.${i}.label`]}>
												<Select
													value={s.label || SIZE_PLACEHOLDER}
													onValueChange={(v) =>
														setSize(
															i,
															'label',
															v === SIZE_PLACEHOLDER ? '' : v,
														)
													}>
													<SelectTrigger
														className='w-full'
														aria-invalid={
															!!fieldErrors[`sizes.${i}.label`]
														}>
														<SelectValue placeholder='Pilih ukuran' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value={SIZE_PLACEHOLDER}>
															Pilih ukuran
														</SelectItem>
														{/* Label lama non-preset (data existing) tetap tampil agar tak hilang saat edit. */}
														{s.label &&
															!SIZE_PRESETS.some(
																(p) =>
																	p.toLowerCase() ===
																	s.label.toLowerCase(),
															) && (
																<SelectItem value={s.label}>
																	{s.label}
																</SelectItem>
															)}
														{SIZE_PRESETS.map((p) => (
															<SelectItem
																key={p}
																value={p}
																disabled={form.sizes.some(
																	(o, idx) =>
																		idx !== i &&
																		o.label.toLowerCase() ===
																			p.toLowerCase(),
																)}>
																{p}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</Field>
											<RupiahInput
												label='Harga'
												required
												error={fieldErrors[`sizes.${i}.price`]}
												value={s.price}
												onChange={(n) => setSize(i, 'price', n)}
											/>
										</div>
										<div className='grid sm:grid-cols-2 gap-3 pr-9'>
											<Field
												label='Stok (unit)'
												error={fieldErrors[`sizes.${i}.unitCount`]}>
												<Input
													type='number'
													min={0}
													value={String(s.unitCount)}
													onChange={(e) =>
														setSize(
															i,
															'unitCount',
															Math.max(
																0,
																Math.trunc(Number(e.target.value) || 0),
															),
														)
													}
													aria-invalid={
														!!fieldErrors[`sizes.${i}.unitCount`]
													}
												/>
											</Field>
											<Field label='Catatan (opsional)'>
												<Input
													value={s.note}
													onChange={(e) => setSize(i, 'note', e.target.value)}
												/>
											</Field>
										</div>
									</div>
								))}
								<div className='flex flex-wrap items-center gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={addSize}
										disabled={form.sizes.length >= MAX_SIZES}>
										<Plus size={16} />
										Tambah ukuran
									</Button>
									<Button
										type='button'
										variant='ghost'
										onClick={fillStandardSizes}
										disabled={form.sizes.length >= MAX_SIZES}
										className='text-[var(--primary)] hover:text-[var(--primary)]'>
										Isi standar (1.25m/2m/Custom)
									</Button>
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

						<Field label='Waktu produksi'>
							<Input
								value={form.productionTime}
								onChange={(e) => set('productionTime', e.target.value)}
							/>
						</Field>

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
						<Field label='Area layanan'>
							{deliveryAreas.isLoading ? (
								<p
									className='text-xs'
									style={{ color: 'var(--text-muted)' }}>
									Memuat area…
								</p>
							) : areaOptions.length === 0 ? (
								<p
									className='text-xs'
									style={{ color: 'var(--text-muted)' }}>
									Belum ada area pengiriman. Tambahkan dulu di menu{' '}
									<span className='font-medium'>Area Pengiriman</span>.
								</p>
							) : (
								<div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
									{areaOptions.map((name) => {
										const active = form.serviceAreas.includes(name);
										return (
											<label
												key={name}
												className='flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors'
												style={{
													borderColor: active
														? 'var(--primary)'
														: 'var(--border)',
													background: active
														? 'rgba(157, 23, 77, 0.04)'
														: 'var(--bg-surface)',
												}}>
												<Checkbox
													checked={active}
													onCheckedChange={() => toggleArea(name)}
													className='shrink-0'
												/>
												<span className='truncate'>{name}</span>
											</label>
										);
									})}
								</div>
							)}
						</Field>

						<div className='flex items-center justify-center gap-3 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => router.push('/admin/products')}>
								Kembali
							</Button>
							<Button type='submit' disabled={pending}>
								{pending ? 'Menyimpan...' : 'Simpan'}
							</Button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
