'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FloatingInput,
	ProgressBar,
	RupiahInput,
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

	const [editing, setEditing] = useState<Area | 'new' | null>(null);
	const [form, setForm] = useState<Form>(emptyForm);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const openNew = () => {
		setForm(emptyForm);
		setFieldErrors({});
		setEditing('new');
	};
	const openEdit = (a: Area) => {
		setForm({
			name: a.name,
			district: a.district ?? '',
			shippingCost: a.shippingCost,
			isActive: a.isActive,
		});
		setFieldErrors({});
		setEditing(a);
	};

	const onSaved = async () => {
		await utils.admin.deliveryArea.list.invalidate();
		setEditing(null);
	};
	const createMut = api.admin.deliveryArea.create.useMutation({
		onSuccess: () => {
			toast.success('Zona ditambahkan.');
			void onSaved();
		},
		onError: (e) => {
			if (e.data?.code === 'CONFLICT')
				setFieldErrors((p) => ({ ...p, name: e.message }));
			toast.error(e.message);
		},
	});
	const updateMut = api.admin.deliveryArea.update.useMutation({
		onSuccess: () => {
			toast.success('Zona diperbarui.');
			void onSaved();
		},
		onError: (e) => {
			if (e.data?.code === 'CONFLICT')
				setFieldErrors((p) => ({ ...p, name: e.message }));
			toast.error(e.message);
		},
	});
	const deleteMut = api.admin.deliveryArea.delete.useMutation({
		onSuccess: async () => {
			await utils.admin.deliveryArea.list.invalidate();
			setConfirmId(null);
			toast.success('Zona dihapus.');
		},
		onError: (e) => toast.error(e.message),
	});

	const set = <K extends keyof Form>(key: K, value: Form[K]) => {
		setForm((p) => ({ ...p, [key]: value }));
		setFieldErrors((p) => {
			if (!p[key as string]) return p;
			const next = { ...p };
			delete next[key as string];
			return next;
		});
	};

	const save = () => {
		const payload = {
			...form,
			district: form.district.trim() || undefined,
		};
		const parsed = deliveryAreaFields.safeParse(payload);
		if (!parsed.success) {
			const errs: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const k = String(issue.path[0]);
				if (k && !errs[k]) errs[k] = issue.message;
			}
			setFieldErrors(errs);
			toast.error('Periksa kembali data yang wajib diisi.');
			return;
		}
		if (editing && editing !== 'new') {
			updateMut.mutate({ id: editing.id, ...parsed.data });
		} else {
			createMut.mutate(parsed.data);
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

			{/* Modal form create/edit */}
			<AnimatePresence>
				{editing && (
					<motion.div
						className='fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={pending ? undefined : () => setEditing(null)}>
						<motion.div
							onClick={(e) => e.stopPropagation()}
							className='relative w-full max-w-md rounded-2xl p-6'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-md)',
							}}
							initial={{ opacity: 0, scale: 0.95, y: 8 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 8 }}
							transition={{ duration: 0.18, ease: 'easeOut' }}>
							<div className='flex items-center justify-between mb-5'>
								<h2 className='font-serif text-lg font-semibold'>
									{editing === 'new' ? 'Tambah Zona' : 'Edit Zona'}
								</h2>
								<button
									type='button'
									onClick={() => setEditing(null)}
									aria-label='Tutup'
									className='inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer'
									style={{ color: 'var(--text-secondary)' }}>
									<X size={18} />
								</button>
							</div>

							<div className='space-y-4'>
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
								<button
									type='button'
									onClick={() => set('isActive', !form.isActive)}
									className='inline-flex items-center gap-2 text-sm cursor-pointer'
									style={{ color: 'var(--text-secondary)' }}>
									<span
										className='inline-flex items-center w-9 h-5 rounded-full transition-colors px-0.5'
										style={{
											background: form.isActive
												? 'var(--secondary)'
												: 'var(--border)',
											justifyContent: form.isActive
												? 'flex-end'
												: 'flex-start',
										}}>
										<span className='w-4 h-4 rounded-full bg-white' />
									</span>
									{form.isActive ? 'Aktif (dipakai checkout)' : 'Nonaktif'}
								</button>
							</div>

							<div className='flex items-center justify-center gap-3 pt-6'>
								<button
									type='button'
									onClick={() => setEditing(null)}
									className='px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer'
									style={{ color: 'var(--text-secondary)' }}>
									Batal
								</button>
								<button
									type='button'
									onClick={save}
									disabled={pending}
									className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60'
									style={{ background: 'var(--primary)' }}>
									{pending ? 'Menyimpan...' : 'Simpan'}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

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
