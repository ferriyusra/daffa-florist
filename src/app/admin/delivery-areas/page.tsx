'use client';

import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah, useAdminForm, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FloatingInput,
	FormModal,
	ProgressBar,
	RupiahInput,
	ToggleSwitch,
} from '@/components';
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
				<button
					type='button'
					onClick={openNew}
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Zona
				</button>
			</div>

			<ProgressBar active={isFetching} />

			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead>
							<tr
								className='text-left text-xs uppercase tracking-wider'
								style={{
									background: 'rgba(157, 23, 77, 0.04)',
									color: 'var(--text-muted)',
								}}>
								<th className='px-6 py-3 font-semibold'>Zona</th>
								<th className='px-6 py-3 font-semibold text-right'>Ongkir</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={4}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Memuat data...
									</td>
								</tr>
							) : areas.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Belum ada zona. Klik "Tambah Zona" untuk menambah.
									</td>
								</tr>
							) : (
								areas.map((a) => (
									<tr key={a.id} className='border-t border-[var(--border)]'>
										<td className='px-6 py-4'>
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
										</td>
										<td
											className='px-6 py-4 text-right font-semibold whitespace-nowrap'
											style={{ color: 'var(--primary)' }}>
											{a.shippingCost === 0
												? 'Gratis'
												: formatRupiah(a.shippingCost)}
										</td>
										<td className='px-6 py-4'>
											<span
												className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
												style={{
													background: a.isActive
														? 'rgba(61, 107, 79, 0.12)'
														: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
													color: a.isActive
														? 'var(--secondary)'
														: 'var(--destructive)',
												}}>
												{a.isActive ? 'Aktif' : 'Nonaktif'}
											</span>
										</td>
										<td className='px-6 py-4'>
											<div className='flex items-center justify-end gap-1.5'>
												<button
													type='button'
													onClick={() => openEdit(a)}
													aria-label='Edit zona'
													className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
													style={{ color: 'var(--text-secondary)' }}>
													<Pencil size={13} />
												</button>
												<button
													type='button'
													onClick={() => setConfirmId(a.id)}
													aria-label='Hapus zona'
													className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--destructive)]'
													style={{ color: 'var(--destructive)' }}>
													<Trash2 size={13} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<FormModal
				open={editing !== null}
				title={editing === 'new' ? 'Tambah Zona' : 'Edit Zona'}
				onClose={() => setEditing(null)}
				onSubmit={save}
				pending={pending}>
				<FloatingInput
					label='Nama zona'
					required
					error={fieldErrors.name}
					value={form.name}
					onChange={(v) => set('name', v)}
				/>
				<FloatingInput
					label='Wilayah induk'
					value={form.district}
					onChange={(v) => set('district', v)}
				/>
				<RupiahInput
					label='Ongkir'
					required
					error={fieldErrors.shippingCost}
					value={form.shippingCost}
					onChange={(n) => set('shippingCost', n)}
				/>
				<ToggleSwitch
					checked={form.isActive}
					onChange={(v) => set('isActive', v)}
					onLabel='Aktif (dipakai checkout)'
				/>
			</FormModal>

			<ConfirmDialog
				open={confirmArea !== null}
				onClose={() => setConfirmId(null)}
				onConfirm={() =>
					confirmArea && deleteMut.mutate({ id: confirmArea.id })
				}
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
