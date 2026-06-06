'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { useAdminForm, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FloatingInput,
	FloatingSelect,
	FormModal,
	ImageUpload,
	ProductImage,
	ProgressBar,
	ToggleSwitch,
} from '@/components';
import {
	galleryCategories,
	galleryFields,
	type GalleryCategory,
} from '@/lib/gallery-schema';

type Item = RouterOutputs['admin']['gallery']['list'][number];
type Form = {
	title: string;
	image: string;
	category: GalleryCategory;
	sortOrder: number;
	isActive: boolean;
};

const emptyForm: Form = {
	title: '',
	image: '',
	category: galleryCategories[0],
	sortOrder: 0,
	isActive: true,
};

export default function AdminGalleryPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const {
		data: items = [],
		isLoading,
		isFetching,
	} = api.admin.gallery.list.useQuery();

	const { form, set, reset, fieldErrors, validate } =
		useAdminForm<Form>(emptyForm);
	const [editing, setEditing] = useState<Item | 'new' | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const openNew = () => {
		reset(emptyForm);
		setEditing('new');
	};
	const openEdit = (it: Item) => {
		reset({
			title: it.title,
			image: it.image,
			category: it.category as GalleryCategory,
			sortOrder: it.sortOrder,
			isActive: it.isActive,
		});
		setEditing(it);
	};

	const refresh = () =>
		Promise.all([
			utils.admin.gallery.list.invalidate(),
			utils.gallery.list.invalidate(),
		]);

	const createMut = api.admin.gallery.create.useMutation({
		onSuccess: async () => {
			await refresh();
			setEditing(null);
			toast.success('Item galeri ditambahkan.');
		},
		onError: (e) => toast.error(e.message),
	});
	const updateMut = api.admin.gallery.update.useMutation({
		onSuccess: async () => {
			await refresh();
			setEditing(null);
			toast.success('Item galeri diperbarui.');
		},
		onError: (e) => toast.error(e.message),
	});
	const deleteMut = api.admin.gallery.delete.useMutation({
		onSuccess: async () => {
			await refresh();
			setConfirmId(null);
			toast.success('Item galeri dihapus.');
		},
		onError: (e) => toast.error(e.message),
	});

	const save = () => {
		const data = validate(galleryFields, form);
		if (!data) {
			toast.error('Periksa kembali data yang wajib diisi.');
			return;
		}
		if (editing && editing !== 'new') {
			updateMut.mutate({ id: editing.id, ...data });
		} else {
			createMut.mutate(data);
		}
	};

	const pending = createMut.isPending || updateMut.isPending;
	const confirmItem = items.find((i) => i.id === confirmId) ?? null;

	return (
		<div className='space-y-5'>
			<div className='flex items-center justify-between'>
				<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
					{items.length} item · tampil di galeri publik
				</p>
				<button
					type='button'
					onClick={openNew}
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Item
				</button>
			</div>

			<ProgressBar active={isFetching} />

			{isLoading ? (
				<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className='aspect-4/3 rounded-2xl border border-[var(--border)] animate-pulse'
							style={{ background: 'var(--bg-card)' }}
						/>
					))}
				</div>
			) : items.length === 0 ? (
				<div
					className='text-center py-16 rounded-2xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						Belum ada item galeri. Klik "Tambah Item" untuk menambah.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'>
					{items.map((it) => (
						<div
							key={it.id}
							className='rounded-2xl border border-[var(--border)] overflow-hidden'
							style={{ background: 'var(--bg-card)' }}>
							<div className='relative aspect-4/3'>
								<ProductImage
									src={it.image}
									alt={it.title}
									sizes='(max-width: 640px) 50vw, 25vw'
								/>
								{!it.isActive && (
									<span
										className='absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold'
										style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
										Nonaktif
									</span>
								)}
							</div>
							<div className='p-3'>
								<p className='text-sm font-semibold line-clamp-1'>{it.title}</p>
								<p
									className='text-xs mb-2'
									style={{ color: 'var(--text-muted)' }}>
									{it.category}
								</p>
								<div className='flex gap-2'>
									<button
										type='button'
										onClick={() => openEdit(it)}
										className='flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
										style={{ color: 'var(--text-secondary)' }}>
										<Pencil size={12} />
										Edit
									</button>
									<button
										type='button'
										onClick={() => setConfirmId(it.id)}
										aria-label='Hapus item'
										className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--destructive)]'
										style={{ color: 'var(--destructive)' }}>
										<Trash2 size={12} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<FormModal
				open={editing !== null}
				title={editing === 'new' ? 'Tambah Item Galeri' : 'Edit Item Galeri'}
				onClose={() => setEditing(null)}
				onSubmit={save}
				pending={pending}
				maxWidth='max-w-lg'>
				<FloatingInput
					label='Judul'
					required
					error={fieldErrors.title}
					value={form.title}
					onChange={(v) => set('title', v)}
				/>
				<div className='grid grid-cols-2 gap-4'>
					<FloatingSelect
						label='Kategori'
						required
						error={fieldErrors.category}
						value={form.category}
						onChange={(v) => set('category', v as GalleryCategory)}>
						{galleryCategories.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</FloatingSelect>
					<FloatingInput
						label='Urutan'
						type='number'
						min={0}
						value={String(form.sortOrder)}
						onChange={(v) =>
							set('sortOrder', Math.max(0, Math.trunc(Number(v) || 0)))
						}
					/>
				</div>

				<div>
					<label className='block text-sm font-semibold mb-2'>
						Gambar
						<span style={{ color: 'var(--destructive)' }}> *</span>
					</label>
					<ImageUpload
						value={form.image}
						onChange={(image) => set('image', image)}
					/>
					{fieldErrors.image && (
						<p
							className='mt-1.5 text-xs'
							style={{ color: 'var(--destructive)' }}>
							{fieldErrors.image}
						</p>
					)}
				</div>

				<ToggleSwitch
					checked={form.isActive}
					onChange={(v) => set('isActive', v)}
					onLabel='Tampil di galeri'
					offLabel='Disembunyikan'
				/>
			</FormModal>

			<ConfirmDialog
				open={confirmItem !== null}
				onClose={() => setConfirmId(null)}
				onConfirm={() => confirmItem && deleteMut.mutate({ id: confirmItem.id })}
				title='Hapus item galeri?'
				description={
					confirmItem && (
						<>
							<span className='font-semibold'>{confirmItem.title}</span> akan
							dihapus dari galeri.
						</>
					)
				}
				loading={deleteMut.isPending}
				error={deleteMut.error?.message}
			/>
		</div>
	);
}
