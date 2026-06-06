'use client';

import { useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah, useAdminForm, useToast } from '@/hooks';
import {
	ConfirmDialog,
	FloatingInput,
	FloatingSelect,
	FormModal,
	ProgressBar,
	RupiahInput,
	ToggleSwitch,
} from '@/components';
import { promoFields, promoTypes, type PromoTypeValue } from '@/lib/promo-schema';

type Promo = RouterOutputs['admin']['promo']['list'][number];
type Form = {
	code: string;
	description: string;
	type: PromoTypeValue;
	value: number;
	startsAt: string;
	endsAt: string;
	isActive: boolean;
};

const emptyForm: Form = {
	code: '',
	description: '',
	type: 'PERCENT',
	value: 0,
	startsAt: '',
	endsAt: '',
	isActive: true,
};

const typeLabel: Record<PromoTypeValue, string> = {
	PERCENT: 'Persen (%)',
	AMOUNT: 'Nominal (Rp)',
};

const pad = (n: number) => String(n).padStart(2, '0');

// Tanggal date-only diperlakukan di zona waktu LOKAL (admin), bukan UTC, agar
// hari kalender tak bergeser saat round-trip. startsAt = awal hari; endsAt =
// akhir hari (inklusif) supaya promo tetap berlaku sepanjang tanggal akhir.
const toDateInput = (d: Date | null) => {
	if (!d) return '';
	const dt = new Date(d);
	return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const parseStartOfDay = (s: string) => (s ? new Date(`${s}T00:00:00`) : null);
const parseEndOfDay = (s: string) => (s ? new Date(`${s}T23:59:59.999`) : null);

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

const formatDiscount = (p: Promo) =>
	p.type === 'PERCENT' ? `${p.value}%` : formatRupiah(p.value);

const formatPeriod = (p: Promo) => {
	if (!p.startsAt && !p.endsAt) return 'Tanpa batas';
	return `${p.startsAt ? formatDate(p.startsAt) : '…'} – ${
		p.endsAt ? formatDate(p.endsAt) : '…'
	}`;
};

export default function AdminPromosPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const {
		data: promos = [],
		isLoading,
		isFetching,
	} = api.admin.promo.list.useQuery();

	const { form, set, reset, fieldErrors, setError, validate } =
		useAdminForm<Form>(emptyForm);
	const [editing, setEditing] = useState<Promo | 'new' | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const openNew = () => {
		reset(emptyForm);
		setEditing('new');
	};
	const openEdit = (p: Promo) => {
		reset({
			code: p.code,
			description: p.description ?? '',
			type: p.type,
			value: p.value,
			startsAt: toDateInput(p.startsAt),
			endsAt: toDateInput(p.endsAt),
			isActive: p.isActive,
		});
		setEditing(p);
	};

	const onSaved = async () => {
		await utils.admin.promo.list.invalidate();
		setEditing(null);
	};
	const onConflict = (e: {
		data?: { code?: string } | null;
		message: string;
	}) => {
		if (e.data?.code === 'CONFLICT') setError('code', e.message);
		toast.error(e.message);
	};
	const createMut = api.admin.promo.create.useMutation({
		onSuccess: () => {
			toast.success('Promo ditambahkan.');
			void onSaved();
		},
		onError: onConflict,
	});
	const updateMut = api.admin.promo.update.useMutation({
		onSuccess: () => {
			toast.success('Promo diperbarui.');
			void onSaved();
		},
		onError: onConflict,
	});
	const deleteMut = api.admin.promo.delete.useMutation({
		onSuccess: async () => {
			await utils.admin.promo.list.invalidate();
			setConfirmId(null);
			toast.success('Promo dihapus.');
		},
		onError: (e) => toast.error(e.message),
	});

	const save = () => {
		const data = validate(promoFields, {
			code: form.code.trim(),
			description: form.description.trim() || undefined,
			type: form.type,
			value: form.value,
			startsAt: parseStartOfDay(form.startsAt),
			endsAt: parseEndOfDay(form.endsAt),
			isActive: form.isActive,
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
	const confirmPromo = promos.find((p) => p.id === confirmId) ?? null;

	return (
		<div className='space-y-5'>
			<div className='flex items-center justify-between'>
				<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
					{promos.length} promo
				</p>
				<button
					type='button'
					onClick={openNew}
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Promo
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
								<th className='px-6 py-3 font-semibold'>Kode</th>
								<th className='px-6 py-3 font-semibold text-right'>Diskon</th>
								<th className='px-6 py-3 font-semibold'>Periode</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={5}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Memuat data...
									</td>
								</tr>
							) : promos.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Belum ada promo. Klik "Tambah Promo" untuk menambah.
									</td>
								</tr>
							) : (
								promos.map((p) => (
									<tr key={p.id} className='border-t border-[var(--border)]'>
										<td className='px-6 py-4'>
											<div className='flex items-center gap-3'>
												<span
													className='inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0'
													style={{
														background: 'rgba(139, 105, 20, 0.12)',
														color: 'var(--accent)',
													}}>
													<Tag size={15} />
												</span>
												<div>
													<p className='font-semibold font-mono'>{p.code}</p>
													{p.description && (
														<p
															className='text-xs'
															style={{ color: 'var(--text-muted)' }}>
															{p.description}
														</p>
													)}
												</div>
											</div>
										</td>
										<td
											className='px-6 py-4 text-right font-semibold whitespace-nowrap'
											style={{ color: 'var(--primary)' }}>
											{formatDiscount(p)}
										</td>
										<td
											className='px-6 py-4 text-xs whitespace-nowrap'
											style={{ color: 'var(--text-secondary)' }}>
											{formatPeriod(p)}
										</td>
										<td className='px-6 py-4'>
											<span
												className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
												style={{
													background: p.isActive
														? 'rgba(61, 107, 79, 0.12)'
														: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
													color: p.isActive
														? 'var(--secondary)'
														: 'var(--destructive)',
												}}>
												{p.isActive ? 'Aktif' : 'Nonaktif'}
											</span>
										</td>
										<td className='px-6 py-4'>
											<div className='flex items-center justify-end gap-1.5'>
												<button
													type='button'
													onClick={() => openEdit(p)}
													aria-label='Edit promo'
													className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
													style={{ color: 'var(--text-secondary)' }}>
													<Pencil size={13} />
												</button>
												<button
													type='button'
													onClick={() => setConfirmId(p.id)}
													aria-label='Hapus promo'
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
				title={editing === 'new' ? 'Tambah Promo' : 'Edit Promo'}
				onClose={() => setEditing(null)}
				onSubmit={save}
				pending={pending}
				maxWidth='max-w-lg'>
				<FloatingInput
					label='Kode promo'
					required
					error={fieldErrors.code}
					value={form.code}
					onChange={(v) => set('code', v.toUpperCase())}
				/>
				<FloatingInput
					label='Deskripsi (opsional)'
					value={form.description}
					onChange={(v) => set('description', v)}
				/>
				<div className='grid grid-cols-2 gap-4'>
					<FloatingSelect
						label='Tipe diskon'
						required
						error={fieldErrors.type}
						value={form.type}
						onChange={(v) => {
							set('type', v as PromoTypeValue);
							set('value', 0); // makna value berbeda per tipe
						}}>
						{promoTypes.map((t) => (
							<option key={t} value={t}>
								{typeLabel[t]}
							</option>
						))}
					</FloatingSelect>
					{form.type === 'AMOUNT' ? (
						<RupiahInput
							label='Nominal diskon'
							required
							error={fieldErrors.value}
							value={form.value}
							onChange={(n) => set('value', n)}
						/>
					) : (
						<FloatingInput
							label='Diskon (%)'
							type='number'
							min={1}
							required
							error={fieldErrors.value}
							value={String(form.value)}
							onChange={(v) =>
								set('value', Math.min(100, Math.max(0, Number(v) || 0)))
							}
						/>
					)}
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<FloatingInput
						label='Mulai'
						type='date'
						error={fieldErrors.startsAt}
						value={form.startsAt}
						onChange={(v) => set('startsAt', v)}
					/>
					<FloatingInput
						label='Berakhir'
						type='date'
						error={fieldErrors.endsAt}
						value={form.endsAt}
						onChange={(v) => set('endsAt', v)}
					/>
				</div>
				<ToggleSwitch
					checked={form.isActive}
					onChange={(v) => set('isActive', v)}
				/>
			</FormModal>

			<ConfirmDialog
				open={confirmPromo !== null}
				onClose={() => setConfirmId(null)}
				onConfirm={() =>
					confirmPromo && deleteMut.mutate({ id: confirmPromo.id })
				}
				title='Hapus promo?'
				description={
					confirmPromo && (
						<>
							Promo <span className='font-semibold'>{confirmPromo.code}</span>{' '}
							akan dihapus.
						</>
					)
				}
				loading={deleteMut.isPending}
				error={deleteMut.error?.message}
			/>
		</div>
	);
}
