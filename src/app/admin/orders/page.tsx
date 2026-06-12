'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Package, Search, X } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah } from '@/hooks';
import { ProgressBar } from '@/components';
import { productCategories } from '@/lib';
import { ORDER_STATUS_LABEL } from '@/lib/order-status';
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

/** Zona waktu bisnis (Pasaman Barat = WIB, UTC+7) untuk batas filter tanggal. */
const WIB_OFFSET = '+07:00';
/** `YYYY-MM-DD` → instant awal hari WIB. */
const startOfDayWib = (s: string) => new Date(`${s}T00:00:00.000${WIB_OFFSET}`);
/** `YYYY-MM-DD` → instant akhir hari WIB (inklusif). */
const endOfDayWib = (s: string) => new Date(`${s}T23:59:59.999${WIB_OFFSET}`);
/** Slug kategori → label rapi (mis. `papan-bunga` → `Papan Bunga`). */
const prettyCategory = (slug: string) =>
	slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Sentinel "semua kategori" — Radix Select melarang value string kosong. */
const CATEGORY_ALL = 'ALL';

const PAGE_SIZE = 10;

type OrderStatus =
	RouterOutputs['admin']['order']['list']['items'][number]['status'];

// Warna badge status (UI-only). Label dari modul bersama `@/lib/order-status`.
const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
	CONFIRMED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	SCHEDULED: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
	INSTALLED: { bg: 'rgba(20, 184, 166, 0.14)', color: '#0d9488' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	CANCELLED: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' },
};

const statusFilters = [
	'ALL',
	'PENDING',
	'CONFIRMED',
	'SCHEDULED',
	'INSTALLED',
	'COMPLETED',
	'CANCELLED',
] as const;

const statusFilterLabel: Record<(typeof statusFilters)[number], string> = {
	ALL: 'Semua',
	...ORDER_STATUS_LABEL,
};

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

export default function AdminOrdersPage() {
	const router = useRouter();
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [status, setStatus] = useState<(typeof statusFilters)[number]>('ALL');
	const [category, setCategory] = useState('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [page, setPage] = useState(1);

	// Debounce pencarian (tabel pesanan = join lebih berat) + reset ke halaman 1.
	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [search]);

	// Filter non-search me-reset halaman SINKRON di handler (batched) → tak ada
	// fetch ganda {filter,page:N} lalu {filter,page:1}.
	const resetPage = () => setPage(1);

	const { data, isLoading, isFetching } = api.admin.order.list.useQuery({
		search: debouncedSearch,
		status,
		category: category || undefined,
		dateFrom: dateFrom ? startOfDayWib(dateFrom) : undefined,
		dateTo: dateTo ? endOfDayWib(dateTo) : undefined,
		page,
		pageSize: PAGE_SIZE,
	});

	const items = data?.items ?? [];
	const total = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;
	const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const toRow = Math.min(page * PAGE_SIZE, total);

	const hasActiveFilters =
		search !== '' ||
		status !== 'ALL' ||
		category !== '' ||
		dateFrom !== '' ||
		dateTo !== '';

	const clearFilters = () => {
		setSearch('');
		setStatus('ALL');
		setCategory('');
		setDateFrom('');
		setDateTo('');
		setPage(1);
	};

	return (
		<div className='space-y-5'>
			<div className='flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between'>
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
						placeholder='Cari no. pesanan, nama, atau email...'
						className='h-10 pl-9'
					/>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Select
						value={status}
						onValueChange={(v) => {
							setStatus(v as (typeof statusFilters)[number]);
							resetPage();
						}}>
						<SelectTrigger className='h-10' aria-label='Filter status'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusFilters.map((s) => (
								<SelectItem key={s} value={s}>
									{statusFilterLabel[s]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={category || CATEGORY_ALL}
						onValueChange={(v) => {
							setCategory(v === CATEGORY_ALL ? '' : v);
							resetPage();
						}}>
						<SelectTrigger className='h-10' aria-label='Filter kategori'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={CATEGORY_ALL}>Semua Kategori</SelectItem>
							{productCategories.map((c) => (
								<SelectItem key={c} value={c}>
									{prettyCategory(c)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						type='date'
						value={dateFrom}
						onChange={(e) => {
							setDateFrom(e.target.value);
							resetPage();
						}}
						aria-label='Dari tanggal'
						className='h-10 w-auto'
					/>
					<span className='text-sm' style={{ color: 'var(--text-muted)' }}>
						–
					</span>
					<Input
						type='date'
						value={dateTo}
						onChange={(e) => {
							setDateTo(e.target.value);
							resetPage();
						}}
						aria-label='Sampai tanggal'
						className='h-10 w-auto'
					/>
					{hasActiveFilters && (
						<Button
							type='button'
							variant='ghost'
							onClick={clearFilters}
							className='h-10'>
							<X size={15} />
							Bersihkan
						</Button>
					)}
				</div>
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
								No. Pesanan
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Pelanggan
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Item
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Status
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Tanggal
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Total
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
									{Array.from({ length: 7 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : items.length === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={7}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									Tidak ada pesanan yang cocok.
								</TableCell>
							</TableRow>
						) : (
							items.map((o) => {
								const color = statusColors[o.status];
								return (
									<TableRow
										key={o.id}
										onClick={() => router.push(`/admin/orders/${o.id}`)}
										className='cursor-pointer'>
										<TableCell
											className='px-6 py-4 font-mono font-semibold'
											style={{ color: 'var(--text)' }}>
											{o.orderNumber}
										</TableCell>
										<TableCell className='px-6 py-4 whitespace-normal'>
											<p className='font-semibold truncate'>{o.customerName}</p>
											<p
												className='text-xs truncate'
												style={{ color: 'var(--text-muted)' }}>
												{o.customerEmail}
											</p>
										</TableCell>
										<TableCell
											className='px-6 py-4 whitespace-normal'
											style={{ color: 'var(--text-secondary)' }}>
											<span className='inline-flex items-center gap-1.5'>
												<Package size={13} />
												{o.itemCount} item
											</span>
											{o.firstProductTitle && (
												<p
													className='text-xs truncate max-w-[14rem]'
													style={{ color: 'var(--text-muted)' }}>
													{o.firstProductTitle}
													{o.itemCount > 1 ? ', …' : ''}
												</p>
											)}
										</TableCell>
										<TableCell className='px-6 py-4'>
											<Badge
												className='border-transparent text-[11px] font-semibold'
												style={{ background: color.bg, color: color.color }}>
												{ORDER_STATUS_LABEL[o.status]}
											</Badge>
										</TableCell>
										<TableCell
											className='px-6 py-4 text-xs'
											style={{ color: 'var(--text-secondary)' }}>
											{formatDate(o.createdAt)}
										</TableCell>
										<TableCell
											className='px-6 py-4 font-semibold text-right'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(o.total)}
										</TableCell>
										<TableCell className='px-6 py-4 text-right'>
											<ChevronRight
												size={18}
												className='inline-block'
												style={{ color: 'var(--text-muted)' }}
											/>
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
						Menampilkan {fromRow}–{toRow} dari {total} pesanan
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
		</div>
	);
}
