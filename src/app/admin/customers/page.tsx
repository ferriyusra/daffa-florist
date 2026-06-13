'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	ChevronLeft,
	ChevronRight,
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
import { Input } from '@/components/ui/input';
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

type Customer = RouterOutputs['admin']['customer']['list']['items'][number];
type Action = { kind: 'role' | 'deactivate' | 'activate'; user: Customer };

const roleFilters = ['ALL', 'CUSTOMER', 'ADMIN'] as const;
const roleFilterLabel: Record<(typeof roleFilters)[number], string> = {
	ALL: 'Semua',
	CUSTOMER: 'Customer',
	ADMIN: 'Admin',
};

const PAGE_SIZE = 10;

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
	const router = useRouter();
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
		pageSize: PAGE_SIZE,
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
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;
	const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const toRow = Math.min(page * PAGE_SIZE, total);

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
				<div className='relative flex-1 max-w-md'>
					<Search
						size={15}
						className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'
						style={{ color: 'var(--text-muted)' }}
					/>
					<Input
						type='search'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Cari nama, email, atau nomor HP...'
						className='h-10 pl-9'
					/>
				</div>
				<Select
					value={role}
					onValueChange={(v) => {
						setRole(v as (typeof roleFilters)[number]);
						setPage(1);
					}}>
					<SelectTrigger className='h-10 sm:w-44' aria-label='Filter peran'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{roleFilters.map((r) => (
							<SelectItem key={r} value={r}>
								{roleFilterLabel[r]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
								Customer
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Kontak
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Peran
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Status
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Pesanan
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Belanja
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Bergabung
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Aksi
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: PAGE_SIZE }).map((_, i) => (
								<TableRow
									key={`skeleton-${i}`}
									className='hover:bg-transparent'>
									{Array.from({ length: 8 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : items.length === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={8}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									Tidak ada pelanggan yang cocok.
								</TableCell>
							</TableRow>
						) : (
							items.map((c) => {
								const isAdmin = c.role === 'ADMIN';
								const isSelf = me?.id === c.id;
								return (
									<TableRow
										key={c.id}
										onClick={() => router.push(`/admin/customers/${c.id}`)}
										className='cursor-pointer'>
										<TableCell className='px-6 py-4'>
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
										</TableCell>
										<TableCell
											className='px-6 py-4 text-xs whitespace-nowrap'
											style={{ color: 'var(--text-secondary)' }}>
											<span className='inline-flex items-center gap-1.5'>
												<Phone size={12} />
												{c.phone ?? '—'}
											</span>
										</TableCell>
										<TableCell className='px-6 py-4'>
											<Badge
												className='border-transparent text-[11px] font-semibold'
												style={{
													background: isAdmin
														? 'rgba(61, 107, 79, 0.12)'
														: 'rgba(140, 130, 121, 0.15)',
													color: isAdmin
														? 'var(--secondary)'
														: 'var(--text-secondary)',
												}}>
												{c.role}
											</Badge>
										</TableCell>
										<TableCell className='px-6 py-4'>
											<Badge
												className='border-transparent text-[11px] font-semibold'
												style={{
													background: c.isActive
														? 'rgba(61, 107, 79, 0.12)'
														: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
													color: c.isActive
														? 'var(--secondary)'
														: 'var(--destructive)',
												}}>
												{c.isActive ? 'Aktif' : 'Nonaktif'}
											</Badge>
										</TableCell>
										<TableCell className='px-6 py-4 text-right font-semibold'>
											{c.orderCount}
										</TableCell>
										<TableCell
											className='px-6 py-4 text-right font-semibold whitespace-nowrap'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(c.totalSpent)}
										</TableCell>
										<TableCell
											className='px-6 py-4 whitespace-nowrap text-xs'
											style={{ color: 'var(--text-secondary)' }}>
											{formatDate(c.createdAt)}
										</TableCell>
										<TableCell className='px-6 py-4'>
											<div
												className='flex items-center justify-end gap-1.5'
												onClick={(e) => e.stopPropagation()}>
												{!isSelf && (
													<>
														<Button
															type='button'
															variant='outline'
															size='icon'
															onClick={() =>
																setAction({ kind: 'role', user: c })
															}
															aria-label='Ubah peran'
															title={
																isAdmin ? 'Jadikan Customer' : 'Jadikan Admin'
															}>
															{isAdmin ? (
																<ShieldOff size={13} />
															) : (
																<ShieldCheck size={13} />
															)}
														</Button>
														<Button
															type='button'
															variant='outline'
															size='icon'
															onClick={() =>
																setAction({
																	kind: c.isActive ? 'deactivate' : 'activate',
																	user: c,
																})
															}
															aria-label={c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
															title={c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
															className={
																c.isActive
																	? 'text-[var(--destructive)] hover:text-[var(--destructive)] hover:border-[var(--destructive)]'
																	: 'text-[var(--secondary)] hover:text-[var(--secondary)] hover:border-[var(--secondary)]'
															}>
															{c.isActive ? (
																<UserX size={13} />
															) : (
																<UserCheck size={13} />
															)}
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{!isLoading && items.length > 0 && (
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
					<p className='text-xs' style={{ color: 'var(--text-muted)' }}>
						Menampilkan {fromRow}–{toRow} dari {total} pelanggan
					</p>
					<div className='flex items-center gap-1.5'>
						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							aria-label='Halaman sebelumnya'>
							<ChevronLeft size={16} />
						</Button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
							const active = n === page;
							return (
								<Button
									type='button'
									key={n}
									variant={active ? 'default' : 'outline'}
									size='icon'
									onClick={() => setPage(n)}
									aria-current={active ? 'page' : undefined}>
									{n}
								</Button>
							);
						})}
						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							aria-label='Halaman berikutnya'>
							<ChevronRight size={16} />
						</Button>
					</div>
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
