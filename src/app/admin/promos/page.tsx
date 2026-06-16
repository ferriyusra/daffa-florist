'use client';

import { type ReactNode, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
				<Button type='button' onClick={openNew} className='h-10'>
					<Plus size={15} />
					Tambah Promo
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
								Kode
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Diskon
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Periode
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
									{Array.from({ length: 5 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : promos.length === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={5}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									Belum ada promo. Klik &quot;Tambah Promo&quot; untuk menambah.
								</TableCell>
							</TableRow>
						) : (
							promos.map((p) => (
								<TableRow key={p.id} className='hover:bg-transparent'>
									<TableCell className='px-6 py-4'>
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
									</TableCell>
									<TableCell
										className='px-6 py-4 text-right font-semibold whitespace-nowrap'
										style={{ color: 'var(--primary)' }}>
										{formatDiscount(p)}
									</TableCell>
									<TableCell
										className='px-6 py-4 text-xs whitespace-nowrap'
										style={{ color: 'var(--text-secondary)' }}>
										{formatPeriod(p)}
									</TableCell>
									<TableCell className='px-6 py-4'>
										<Badge
											className='border-transparent text-[11px] font-semibold'
											style={{
												background: p.isActive
													? 'rgba(61, 107, 79, 0.12)'
													: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
												color: p.isActive
													? 'var(--secondary)'
													: 'var(--destructive)',
											}}>
											{p.isActive ? 'Aktif' : 'Nonaktif'}
										</Badge>
									</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center justify-end gap-1.5'>
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() => openEdit(p)}
												aria-label='Edit promo'>
												<Pencil size={13} />
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() => setConfirmId(p.id)}
												aria-label='Hapus promo'
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
				title={editing === 'new' ? 'Tambah Promo' : 'Edit Promo'}
				onClose={() => setEditing(null)}
				onSubmit={save}
				pending={pending}
				maxWidth='max-w-lg'>
				<Field label='Kode promo' required error={fieldErrors.code}>
					<Input
						value={form.code}
						onChange={(e) => set('code', e.target.value.toUpperCase())}
						aria-invalid={!!fieldErrors.code}
					/>
				</Field>
				<Field label='Deskripsi (opsional)'>
					<Input
						value={form.description}
						onChange={(e) => set('description', e.target.value)}
					/>
				</Field>
				<div className='grid grid-cols-2 gap-4'>
					<Field label='Tipe diskon' required error={fieldErrors.type}>
						<Select
							value={form.type}
							onValueChange={(v) => {
								set('type', v as PromoTypeValue);
								set('value', 0); // makna value berbeda per tipe
							}}>
							<SelectTrigger
								className='w-full'
								aria-invalid={!!fieldErrors.type}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{promoTypes.map((t) => (
									<SelectItem key={t} value={t}>
										{typeLabel[t]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					{form.type === 'AMOUNT' ? (
						<Field label='Nominal diskon' required error={fieldErrors.value}>
							<RupiahInput
								value={form.value}
								onChange={(n) => set('value', n)}
							/>
						</Field>
					) : (
						<Field label='Diskon (%)' required error={fieldErrors.value}>
							<Input
								type='number'
								min={1}
								value={String(form.value)}
								onChange={(e) =>
									set(
										'value',
										Math.min(
											100,
											Math.max(0, Math.trunc(Number(e.target.value) || 0)),
										),
									)
								}
								aria-invalid={!!fieldErrors.value}
							/>
						</Field>
					)}
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<Field label='Mulai' error={fieldErrors.startsAt}>
						<Input
							type='date'
							value={form.startsAt}
							onChange={(e) => set('startsAt', e.target.value)}
							aria-invalid={!!fieldErrors.startsAt}
						/>
					</Field>
					<Field label='Berakhir' error={fieldErrors.endsAt}>
						<Input
							type='date'
							value={form.endsAt}
							onChange={(e) => set('endsAt', e.target.value)}
							aria-invalid={!!fieldErrors.endsAt}
						/>
					</Field>
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
