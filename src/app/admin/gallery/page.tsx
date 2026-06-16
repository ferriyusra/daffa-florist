'use client';

import { type ReactNode, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { useAdminForm, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FormModal,
	ImageUpload,
	ProductImage,
	ProgressBar,
	ToggleSwitch,
} from '@/components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
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

function Field({
	label,
	required = false,
	error,
	children,
}: {
	label: string;
	required?: boolean;
	error?: string;
	children: ReactNode;
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
				<Button type='button' onClick={openNew} className='h-10'>
					<Plus size={15} />
					Tambah Item
				</Button>
			</div>

			<ProgressBar active={isFetching} />

			{isLoading ? (
				<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className='aspect-4/3 rounded-2xl' />
					))}
				</div>
			) : items.length === 0 ? (
				<div
					className='text-center py-16 rounded-2xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						Belum ada item galeri. Klik &quot;Tambah Item&quot; untuk menambah.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'>
					{items.map((it) => (
						<Card key={it.id} className='gap-0 p-0 overflow-hidden rounded-2xl'>
							<div className='relative aspect-4/3'>
								<ProductImage
									src={it.image}
									alt={it.title}
									sizes='(max-width: 640px) 50vw, 25vw'
								/>
								{!it.isActive && (
									<Badge
										className='absolute top-2 left-2 border-transparent text-[10px] font-semibold'
										style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
										Nonaktif
									</Badge>
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
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => openEdit(it)}
										className='flex-1'>
										<Pencil size={12} />
										Edit
									</Button>
									<Button
										type='button'
										variant='outline'
										size='icon'
										onClick={() => setConfirmId(it.id)}
										aria-label='Hapus item'
										className='size-8 text-[var(--destructive)] hover:text-[var(--destructive)] hover:border-[var(--destructive)]'>
										<Trash2 size={12} />
									</Button>
								</div>
							</div>
						</Card>
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
				<Field label='Judul' required error={fieldErrors.title}>
					<Input
						value={form.title}
						onChange={(e) => set('title', e.target.value)}
						aria-invalid={!!fieldErrors.title}
					/>
				</Field>
				<div className='grid grid-cols-2 gap-4'>
					<Field label='Kategori' required error={fieldErrors.category}>
						<Select
							value={form.category}
							onValueChange={(v) => set('category', v as GalleryCategory)}>
							<SelectTrigger
								className='w-full'
								aria-invalid={!!fieldErrors.category}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{galleryCategories.map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field label='Urutan'>
						<Input
							type='number'
							min={0}
							value={String(form.sortOrder)}
							onChange={(e) =>
								set('sortOrder', Math.max(0, Math.trunc(Number(e.target.value) || 0)))
							}
						/>
					</Field>
				</div>

				<Field label='Gambar' required error={fieldErrors.image}>
					<ImageUpload
						value={form.image}
						onChange={(image) => set('image', image)}
					/>
				</Field>

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
