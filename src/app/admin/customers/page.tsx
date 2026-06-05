'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	Mail,
	Phone,
	Search,
	ShieldCheck,
	ShieldOff,
	UserCheck,
	UserX,
} from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah, useAuth, useToast } from '@/hooks';
import { ConfirmDialog, ProgressBar } from '@/components';

type Customer = RouterOutputs['admin']['customer']['list']['items'][number];
type Action = { kind: 'role' | 'deactivate' | 'activate'; user: Customer };

const roleFilters = ['ALL', 'CUSTOMER', 'ADMIN'] as const;
const roleFilterLabel: Record<string, string> = {
	ALL: 'Semua',
	CUSTOMER: 'Customer',
	ADMIN: 'Admin',
};

const initials = (name: string | null, email: string) =>
	(name ?? email)
		.split(' ')
		.slice(0, 2)
		.map((p) => p[0])
		.join('')
		.toUpperCase();

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

export default function AdminCustomersPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const { user: me } = useAuth();

	const [search, setSearch] = useState('');
	const [role, setRole] = useState<(typeof roleFilters)[number]>('ALL');
	const [page, setPage] = useState(1);
	const [action, setAction] = useState<Action | null>(null);

	const { data, isLoading, isFetching } = api.admin.customer.list.useQuery({
		search,
		role,
		page,
		pageSize: 10,
	});

	const updateMut = api.admin.customer.update.useMutation({
		onSuccess: async () => {
			await utils.admin.customer.list.invalidate();
			setAction(null);
			toast.success('Perubahan tersimpan.');
		},
		onError: (e) => toast.error(e.message),
	});

	useEffect(() => {
		setPage(1);
	}, [search, role]);

	const items = data?.items ?? [];
	const totalPages = data?.totalPages ?? 1;

	// Dialog konfirmasi diturunkan dari aksi terpilih.
	const dialog = (() => {
		if (!action) return null;
		const name = action.user.name ?? action.user.email;
		if (action.kind === 'role') {
			const next = action.user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
			return {
				icon: ShieldCheck,
				tone: 'primary' as const,
				title: 'Ubah peran?',
				description: (
					<>
						Jadikan <span className='font-semibold'>{name}</span> sebagai{' '}
						<span className='font-semibold'>{next}</span>?
					</>
				),
				confirmLabel: 'Ubah peran',
				run: () => updateMut.mutate({ id: action.user.id, role: next }),
			};
		}
		if (action.kind === 'deactivate') {
			return {
				icon: UserX,
				tone: 'danger' as const,
				title: 'Nonaktifkan akun?',
				description: (
					<>
						<span className='font-semibold'>{name}</span> tidak akan bisa login
						sampai diaktifkan kembali.
					</>
				),
				confirmLabel: 'Nonaktifkan',
				run: () => updateMut.mutate({ id: action.user.id, isActive: false }),
			};
		}
		return {
			icon: UserCheck,
			tone: 'primary' as const,
			title: 'Aktifkan akun?',
			description: (
				<>
					<span className='font-semibold'>{name}</span> bisa login kembali.
				</>
			),
			confirmLabel: 'Aktifkan',
			run: () => updateMut.mutate({ id: action.user.id, isActive: true }),
		};
	})();

	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div
					className='flex items-center gap-2 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<Search size={15} style={{ color: 'var(--text-muted)' }} />
					<input
						type='search'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Cari nama, email, atau nomor HP...'
						className='flex-1 bg-transparent text-sm outline-none'
					/>
				</div>
				<div className='flex gap-2'>
					{roleFilters.map((r) => {
						const active = role === r;
						return (
							<button
								type='button'
								key={r}
								onClick={() => setRole(r)}
								className='inline-flex items-center px-3.5 h-10 rounded-xl text-xs font-semibold cursor-pointer border transition-colors'
								style={{
									background: active ? 'var(--primary)' : 'transparent',
									color: active ? 'white' : 'var(--text-secondary)',
									borderColor: active ? 'var(--primary)' : 'var(--border)',
								}}>
								{roleFilterLabel[r]}
							</button>
						);
					})}
				</div>
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
								<th className='px-6 py-3 font-semibold'>Customer</th>
								<th className='px-6 py-3 font-semibold'>Kontak</th>
								<th className='px-6 py-3 font-semibold'>Peran</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold text-right'>Pesanan</th>
								<th className='px-6 py-3 font-semibold text-right'>Belanja</th>
								<th className='px-6 py-3 font-semibold'>Bergabung</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={8}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Memuat data...
									</td>
								</tr>
							) : items.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Tidak ada customer yang cocok.
									</td>
								</tr>
							) : (
								items.map((c) => {
									const isAdmin = c.role === 'ADMIN';
									const isSelf = me?.id === c.id;
									return (
										<tr
											key={c.id}
											className='border-t border-[var(--border)]'>
											<td className='px-6 py-4'>
												<div className='flex items-center gap-3'>
													<span
														className='inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-xs shrink-0'
														style={{
															background: 'rgba(157, 23, 77, 0.12)',
															color: 'var(--primary)',
														}}>
														{initials(c.name, c.email)}
													</span>
													<div className='min-w-0'>
														<p className='font-semibold truncate'>
															{c.name ?? '—'}
															{isSelf && (
																<span
																	className='ml-1.5 text-[10px] font-medium'
																	style={{ color: 'var(--text-muted)' }}>
																	(Anda)
																</span>
															)}
														</p>
														<p
															className='text-xs inline-flex items-center gap-1.5 truncate'
															style={{ color: 'var(--text-muted)' }}>
															<Mail size={11} />
															{c.email}
														</p>
													</div>
												</div>
											</td>
											<td
												className='px-6 py-4 text-xs whitespace-nowrap'
												style={{ color: 'var(--text-secondary)' }}>
												<span className='inline-flex items-center gap-1.5'>
													<Phone size={12} />
													{c.phone ?? '—'}
												</span>
											</td>
											<td className='px-6 py-4'>
												<span
													className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
													style={{
														background: isAdmin
															? 'rgba(61, 107, 79, 0.12)'
															: 'rgba(140, 130, 121, 0.15)',
														color: isAdmin
															? 'var(--secondary)'
															: 'var(--text-secondary)',
													}}>
													{c.role}
												</span>
											</td>
											<td className='px-6 py-4'>
												<span
													className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
													style={{
														background: c.isActive
															? 'rgba(61, 107, 79, 0.12)'
															: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
														color: c.isActive
															? 'var(--secondary)'
															: 'var(--destructive)',
													}}>
													{c.isActive ? 'Aktif' : 'Nonaktif'}
												</span>
											</td>
											<td className='px-6 py-4 text-right font-semibold'>
												{c.orderCount}
											</td>
											<td
												className='px-6 py-4 text-right font-semibold whitespace-nowrap'
												style={{ color: 'var(--primary)' }}>
												{formatRupiah(c.totalSpent)}
											</td>
											<td
												className='px-6 py-4 whitespace-nowrap text-xs'
												style={{ color: 'var(--text-secondary)' }}>
												{formatDate(c.createdAt)}
											</td>
											<td className='px-6 py-4'>
												<div className='flex items-center justify-end gap-1.5'>
													<Link
														href={`/admin/customers/${c.id}`}
														aria-label='Detail customer'
														title='Detail'
														className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
														style={{ color: 'var(--text-secondary)' }}>
														<Eye size={13} />
													</Link>
													{!isSelf && (
														<>
															<button
																type='button'
																onClick={() =>
																	setAction({ kind: 'role', user: c })
																}
																aria-label='Ubah peran'
																title={
																	isAdmin
																		? 'Jadikan Customer'
																		: 'Jadikan Admin'
																}
																className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
																style={{ color: 'var(--text-secondary)' }}>
																{isAdmin ? (
																	<ShieldOff size={13} />
																) : (
																	<ShieldCheck size={13} />
																)}
															</button>
															<button
																type='button'
																onClick={() =>
																	setAction({
																		kind: c.isActive
																			? 'deactivate'
																			: 'activate',
																		user: c,
																	})
																}
																aria-label={
																	c.isActive
																		? 'Nonaktifkan'
																		: 'Aktifkan'
																}
																title={
																	c.isActive
																		? 'Nonaktifkan'
																		: 'Aktifkan'
																}
																className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors'
																style={{
																	color: c.isActive
																		? 'var(--destructive)'
																		: 'var(--secondary)',
																}}>
																{c.isActive ? (
																	<UserX size={13} />
																) : (
																	<UserCheck size={13} />
																)}
															</button>
														</>
													)}
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{!isLoading && totalPages > 1 && (
				<div className='flex items-center justify-center gap-1.5'>
					<button
						type='button'
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						aria-label='Halaman sebelumnya'
						className='inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
						style={{ color: 'var(--text-secondary)' }}>
						<ChevronLeft size={16} />
					</button>
					<span className='px-3 text-sm' style={{ color: 'var(--text-secondary)' }}>
						{page} / {totalPages}
					</span>
					<button
						type='button'
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
						aria-label='Halaman berikutnya'
						className='inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
						style={{ color: 'var(--text-secondary)' }}>
						<ChevronRight size={16} />
					</button>
				</div>
			)}

			{dialog && (
				<ConfirmDialog
					open={action !== null}
					onClose={() => setAction(null)}
					onConfirm={dialog.run}
					icon={dialog.icon}
					tone={dialog.tone}
					title={dialog.title}
					description={dialog.description}
					confirmLabel={dialog.confirmLabel}
					loadingLabel='Menyimpan...'
					loading={updateMut.isPending}
					error={updateMut.error?.message}
				/>
			)}
		</div>
	);
}
