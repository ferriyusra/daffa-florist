'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, Package, Search } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah } from '@/hooks';
import { ProgressBar } from '@/components';
import { productCategories } from '@/lib';
import { ORDER_STATUS_LABEL } from '@/lib/order-status';

/** Zona waktu bisnis (Pasaman Barat = WIB, UTC+7) untuk batas filter tanggal. */
const WIB_OFFSET = '+07:00';
/** `YYYY-MM-DD` → instant awal hari WIB. */
const startOfDayWib = (s: string) => new Date(`${s}T00:00:00.000${WIB_OFFSET}`);
/** `YYYY-MM-DD` → instant akhir hari WIB (inklusif). */
const endOfDayWib = (s: string) => new Date(`${s}T23:59:59.999${WIB_OFFSET}`);
/** Slug kategori → label rapi (mis. `papan-bunga` → `Papan Bunga`). */
const prettyCategory = (slug: string) =>
	slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
		pageSize: 10,
	});

	const items = data?.items ?? [];
	const totalPages = data?.totalPages ?? 1;

	return (
		<div className='space-y-5'>
			<div className='flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between'>
				<div
					className='flex items-center gap-2 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<Search size={15} style={{ color: 'var(--text-muted)' }} />
					<input
						type='search'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Cari no. pesanan, nama, atau email...'
						className='flex-1 bg-transparent text-sm outline-none'
					/>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value as (typeof statusFilters)[number]);
							resetPage();
						}}
						className='h-10 px-3 rounded-xl border border-[var(--border)] text-sm font-medium cursor-pointer outline-none'
						style={{
							background: 'var(--bg-card)',
							color: 'var(--text-secondary)',
						}}>
						{statusFilters.map((s) => (
							<option key={s} value={s}>
								{statusFilterLabel[s]}
							</option>
						))}
					</select>
					<select
						value={category}
						onChange={(e) => {
							setCategory(e.target.value);
							resetPage();
						}}
						aria-label='Filter kategori'
						className='h-10 px-3 rounded-xl border border-[var(--border)] text-sm font-medium cursor-pointer outline-none'
						style={{
							background: 'var(--bg-card)',
							color: 'var(--text-secondary)',
						}}>
						<option value=''>Semua Kategori</option>
						{productCategories.map((c) => (
							<option key={c} value={c}>
								{prettyCategory(c)}
							</option>
						))}
					</select>
					<input
						type='date'
						value={dateFrom}
						onChange={(e) => {
							setDateFrom(e.target.value);
							resetPage();
						}}
						aria-label='Dari tanggal'
						className='h-10 px-3 rounded-xl border border-[var(--border)] text-sm cursor-pointer outline-none'
						style={{
							background: 'var(--bg-card)',
							color: 'var(--text-secondary)',
						}}
					/>
					<span className='text-sm' style={{ color: 'var(--text-muted)' }}>
						–
					</span>
					<input
						type='date'
						value={dateTo}
						onChange={(e) => {
							setDateTo(e.target.value);
							resetPage();
						}}
						aria-label='Sampai tanggal'
						className='h-10 px-3 rounded-xl border border-[var(--border)] text-sm cursor-pointer outline-none'
						style={{
							background: 'var(--bg-card)',
							color: 'var(--text-secondary)',
						}}
					/>
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
								<th className='px-6 py-3 font-semibold'>No. Pesanan</th>
								<th className='px-6 py-3 font-semibold'>Pelanggan</th>
								<th className='px-6 py-3 font-semibold'>Item</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold'>Tanggal</th>
								<th className='px-6 py-3 font-semibold text-right'>Total</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td
										colSpan={7}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Memuat data...
									</td>
								</tr>
							) : items.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Tidak ada pesanan yang cocok.
									</td>
								</tr>
							) : (
								items.map((o) => {
									const color = statusColors[o.status];
									return (
										<tr
											key={o.id}
											className='border-t border-[var(--border)]'>
											<td
												className='px-6 py-4 font-mono font-semibold whitespace-nowrap'
												style={{ color: 'var(--text)' }}>
												{o.orderNumber}
											</td>
											<td className='px-6 py-4'>
												<p className='font-semibold truncate'>
													{o.customerName}
												</p>
												<p
													className='text-xs truncate'
													style={{ color: 'var(--text-muted)' }}>
													{o.customerEmail}
												</p>
											</td>
											<td
												className='px-6 py-4'
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
											</td>
											<td className='px-6 py-4'>
												<span
													className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap'
													style={{ background: color.bg, color: color.color }}>
													{ORDER_STATUS_LABEL[o.status]}
												</span>
											</td>
											<td
												className='px-6 py-4 whitespace-nowrap text-xs'
												style={{ color: 'var(--text-secondary)' }}>
												{formatDate(o.createdAt)}
											</td>
											<td
												className='px-6 py-4 font-semibold whitespace-nowrap text-right'
												style={{ color: 'var(--primary)' }}>
												{formatRupiah(o.total)}
											</td>
											<td className='px-6 py-4 text-right'>
												<Link
													href={`/admin/orders/${o.id}`}
													className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
													style={{ color: 'var(--text-secondary)' }}>
													<Eye size={12} />
													Lihat
												</Link>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{!isLoading && items.length > 0 && (
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
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
						const active = n === page;
						return (
							<button
								type='button'
								key={n}
								onClick={() => setPage(n)}
								className='inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-sm font-semibold cursor-pointer border transition-colors'
								style={{
									background: active ? 'var(--primary)' : 'transparent',
									color: active ? 'white' : 'var(--text-secondary)',
									borderColor: active ? 'var(--primary)' : 'var(--border)',
								}}>
								{n}
							</button>
						);
					})}
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
		</div>
	);
}
