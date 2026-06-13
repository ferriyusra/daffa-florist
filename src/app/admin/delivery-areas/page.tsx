'use client';

import { type ReactNode, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah, useAdminForm, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FormModal,
	ProgressBar,
	RupiahInput,
	ToggleSwitch,
} from '@/components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { deliveryAreaFields } from '@/lib/delivery-area-schema';

type Area = RouterOutputs['admin']['deliveryArea']['list'][number];
type Form = {
	name: string;
	district: string;
	shippingCost: number;
	isActive: boolean;
};

const emptyForm: Form = {
	name: '',
	district: 'Pasaman Barat',
	shippingCost: 0,
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

export default function AdminDeliveryAreasPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const {
		data: areas = [],
		isLoading,
		isFetching,
	} = api.admin.deliveryArea.list.useQuery();

	const { form, set, reset, fieldErrors, setError, validate } =
		useAdminForm<Form>(emptyForm);
	const [editing, setEditing] = useState<Area | 'new' | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const openNew = () => {
		reset(emptyForm);
		setEditing('new');
	};
	const openEdit = (a: Area) => {
		reset({
			name: a.name,
			district: a.district ?? '',
			shippingCost: a.shippingCost,
			isActive: a.isActive,
		});
		setEditing(a);
	};

	const onSaved = async () => {
		await utils.admin.deliveryArea.list.invalidate();
		setEditing(null);
	};
	const onConflict = (e: {
		data?: { code?: string } | null;
		message: string;
	}) => {
		if (e.data?.code === 'CONFLICT') setError('name', e.message);
		toast.error(e.message);
	};
	const createMut = api.admin.deliveryArea.create.useMutation({
		onSuccess: () => {
			toast.success('Zona ditambahkan.');
			void onSaved();
		},
		onError: onConflict,
	});
	const updateMut = api.admin.deliveryArea.update.useMutation({
		onSuccess: () => {
			toast.success('Zona diperbarui.');
			void onSaved();
		},
		onError: onConflict,
	});
	const deleteMut = api.admin.deliveryArea.delete.useMutation({
		onSuccess: async () => {
			await utils.admin.deliveryArea.list.invalidate();
			setConfirmId(null);
			toast.success('Zona dihapus.');
		},
		onError: (e) => toast.error(e.message),
	});

	const save = () => {
		const data = validate(deliveryAreaFields, {
			...form,
			district: form.district.trim() || undefined,
		});
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
	const confirmArea = areas.find((a) => a.id === confirmId) ?? null;

	return (
		<div className='space-y-5'>
			<div className='flex items-center justify-between'>
				<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
					{areas.length} zona layanan
				</p>
				<Button type='button' onClick={openNew} className='h-10'>
					<Plus size={15} />
					Tambah Zona
				</Button>
			</div>

			<ProgressBar active={isFetching} />

			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<Table>
					<TableHeader>
						<TableRow
							className='hover:bg-transparent'
							style={{
								background: 'rgba(157, 23, 77, 0.04)',
								color: 'var(--text-muted)',
							}}>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Zona
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Ongkir
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Status
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Aksi
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 4 }).map((_, i) => (
								<TableRow key={`skeleton-${i}`} className='hover:bg-transparent'>
									{Array.from({ length: 4 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : areas.length === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={4}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									Belum ada zona. Klik &quot;Tambah Zona&quot; untuk menambah.
								</TableCell>
							</TableRow>
						) : (
							areas.map((a) => (
								<TableRow key={a.id} className='hover:bg-transparent'>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center gap-3'>
											<span
												className='inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0'
												style={{
													background: 'rgba(61, 107, 79, 0.12)',
													color: 'var(--secondary)',
												}}>
												<MapPin size={15} />
											</span>
											<div>
												<p className='font-semibold'>{a.name}</p>
												{a.district && (
													<p
														className='text-xs'
														style={{ color: 'var(--text-muted)' }}>
														{a.district}
													</p>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell
										className='px-6 py-4 text-right font-semibold whitespace-nowrap'
										style={{ color: 'var(--primary)' }}>
										{a.shippingCost === 0
											? 'Gratis'
											: formatRupiah(a.shippingCost)}
									</TableCell>
									<TableCell className='px-6 py-4'>
										<Badge
											className='border-transparent text-[11px] font-semibold'
											style={{
												background: a.isActive
													? 'rgba(61, 107, 79, 0.12)'
													: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
												color: a.isActive
													? 'var(--secondary)'
													: 'var(--destructive)',
											}}>
											{a.isActive ? 'Aktif' : 'Nonaktif'}
										</Badge>
									</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center justify-end gap-1.5'>
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() => openEdit(a)}
												aria-label='Edit zona'>
												<Pencil size={13} />
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() => setConfirmId(a.id)}
												aria-label='Hapus zona'
												className='text-[var(--destructive)] hover:text-[var(--destructive)] hover:border-[var(--destructive)]'>
												<Trash2 size={13} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<FormModal
				open={editing !== null}
				title={editing === 'new' ? 'Tambah Zona' : 'Edit Zona'}
				onClose={() => setEditing(null)}
				onSubmit={save}
				pending={pending}>
				<Field label='Nama zona' required error={fieldErrors.name}>
					<Input
						value={form.name}
						onChange={(e) => set('name', e.target.value)}
						aria-invalid={!!fieldErrors.name}
					/>
				</Field>
				<Field label='Wilayah induk'>
					<Input
						value={form.district}
						onChange={(e) => set('district', e.target.value)}
					/>
				</Field>
				<Field label='Ongkir' required error={fieldErrors.shippingCost}>
					<RupiahInput
						value={form.shippingCost}
						onChange={(n) => set('shippingCost', n)}
					/>
				</Field>
				<ToggleSwitch
					checked={form.isActive}
					onChange={(v) => set('isActive', v)}
					onLabel='Aktif (dipakai checkout)'
				/>
			</FormModal>

			<ConfirmDialog
				open={confirmArea !== null}
				onClose={() => setConfirmId(null)}
				onConfirm={() => confirmArea && deleteMut.mutate({ id: confirmArea.id })}
				title='Hapus zona?'
				description={
					confirmArea && (
						<>
							Zona <span className='font-semibold'>{confirmArea.name}</span> akan
							dihapus.
						</>
					)
				}
				loading={deleteMut.isPending}
				error={deleteMut.error?.message}
			/>
		</div>
	);
}
