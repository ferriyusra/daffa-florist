'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	Search,
} from 'lucide-react';
import { api } from '@/trpc/react';
import { productCategories, type ProductCategory } from '@/lib/products';
import { formatRupiah, useToast } from '@/hooks';
import { ProgressBar } from '@/components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const PAGE_SIZE = 10;

/** Satu baris datar = satu (produk + ukuran). */
type StockRow = {
	productId: string;
	productTitle: string;
	category: string;
	sizeId: string;
	label: string;
	price: number;
	unitCount: number;
	inUse: number;
};

export default function AdminStockPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const {
		data,
		isLoading,
		isFetching,
	} = api.admin.unit.list.useQuery();

	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<ProductCategory | 'all'>('all');
	const [overAllocOnly, setOverAllocOnly] = useState(false);
	const [page, setPage] = useState(1);

	// Nilai stok yang sedang diedit, dikunci per `size.id`. Hanya size yang
	// nilainya berbeda dari server yang boleh disimpan.
	const [edited, setEdited] = useState<Record<string, string>>({});

	const setUnit = api.admin.unit.setUnitCount.useMutation({
		onSuccess: (_res, vars) => {
			toast.success('Stok diperbarui');
			// Lepas nilai edit lokal agar baris kembali sinkron dengan server.
			setEdited((prev) => {
				const next = { ...prev };
				delete next[vars.sizeId];
				return next;
			});
			utils.admin.unit.list.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	// Ratakan produk → baris per ukuran (satu kali per perubahan data).
	const rows = useMemo<StockRow[]>(
		() =>
			(data?.products ?? []).flatMap((p) =>
				p.sizes.map((s) => ({
					productId: p.id,
					productTitle: p.title,
					category: p.category,
					sizeId: s.id,
					label: s.label,
					price: s.price,
					unitCount: s.unitCount,
					inUse: s.inUse,
				})),
			),
		[data],
	);

	// Jumlah ukuran yang tersewa melebihi stok (lintas semua data, untuk banner).
	const overAllocCount = useMemo(
		() => rows.filter((r) => r.inUse > r.unitCount).length,
		[rows],
	);

	const term = search.trim().toLowerCase();
	const filtered = rows.filter((r) => {
		if (category !== 'all' && r.category !== category) return false;
		if (overAllocOnly && r.inUse <= r.unitCount) return false;
		if (term && !`${r.productTitle} ${r.label}`.toLowerCase().includes(term))
			return false;
		return true;
	});

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const toRow = Math.min(page * PAGE_SIZE, total);

	// Balik ke halaman 1 saat filter berubah; jaga halaman tetap valid saat menyusut.
	useEffect(() => {
		setPage(1);
	}, [search, category, overAllocOnly]);
	useEffect(() => {
		setPage((p) => Math.min(p, totalPages));
	}, [totalPages]);

	return (
		<div className='space-y-5'>
			<div>
				<h1 className='text-2xl font-bold' style={{ color: 'var(--text)' }}>
					Kelola Stok
				</h1>
				<p className='text-sm mt-1' style={{ color: 'var(--text-muted)' }}>
					Atur jumlah unit fisik tersedia per ukuran produk.
				</p>
			</div>

			{/* Banner masalah: angkat ukuran over-alokasi ke atas + filter cepat. */}
			{!isLoading && overAllocCount > 0 && (
				<button
					type='button'
					onClick={() => setOverAllocOnly((v) => !v)}
					className='flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors cursor-pointer'
					style={{
						borderColor: 'var(--destructive)',
						background: 'rgba(220, 38, 38, 0.06)',
						color: 'var(--destructive)',
					}}>
					<AlertTriangle size={16} className='shrink-0' />
					<span className='font-medium'>
						{overAllocCount} ukuran tersewa melebihi stok.
					</span>
					<span className='ml-auto font-semibold underline-offset-2 hover:underline'>
						{overAllocOnly ? 'Tampilkan semua' : 'Lihat'}
					</span>
				</button>
			)}

			{/* Pencarian */}
			<div className='relative max-w-md'>
				<Search
					size={15}
					className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2'
					style={{ color: 'var(--text-muted)' }}
				/>
				<Input
					type='search'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder='Cari produk atau ukuran...'
					className='h-10 pl-9'
				/>
			</div>

			{/* Filter kategori */}
			<div className='flex gap-2 flex-wrap'>
				{(['all', ...productCategories] as const).map((cat) => {
					const active = category === cat;
					return (
						<Button
							type='button'
							key={cat}
							variant={active ? 'default' : 'outline'}
							onClick={() => setCategory(cat)}
							className='h-9 rounded-full text-xs font-semibold'>
							{cat === 'all' ? 'Semua' : cat}
						</Button>
					);
				})}
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
								Produk
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Ukuran
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Harga
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-center'>
								Sedang Disewa
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Stok
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Aksi
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: PAGE_SIZE }).map((_, i) => (
								<TableRow key={`skeleton-${i}`} className='hover:bg-transparent'>
									{Array.from({ length: 6 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : total === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={6}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									{rows.length === 0
										? 'Belum ada produk.'
										: 'Tidak ada ukuran yang cocok.'}
								</TableCell>
							</TableRow>
						) : (
							paged.map((row) => {
								const raw = edited[row.sizeId];
								const value =
									raw !== undefined ? raw : String(row.unitCount);
								const parsed = Number(value);
								const valid =
									value.trim() !== '' &&
									Number.isInteger(parsed) &&
									parsed >= 0 &&
									parsed <= 999;
								const changed = raw !== undefined && parsed !== row.unitCount;
								const overAllocated = row.inUse > row.unitCount;
								const saving =
									setUnit.isPending &&
									setUnit.variables?.sizeId === row.sizeId;

								return (
									<TableRow key={row.sizeId} className='hover:bg-transparent'>
										<TableCell className='px-6 py-4'>
											<div className='min-w-0'>
												<p
													className='font-semibold truncate max-w-[18rem]'
													style={{ color: 'var(--text)' }}>
													{row.productTitle}
												</p>
												<Badge
													className='mt-1 border-transparent text-[11px] font-semibold'
													style={{
														background: 'rgba(157, 23, 77, 0.08)',
														color: 'var(--primary)',
													}}>
													{row.category}
												</Badge>
											</div>
										</TableCell>
										<TableCell
											className='px-6 py-4 font-medium whitespace-nowrap'
											style={{ color: 'var(--text)' }}>
											{row.label}
										</TableCell>
										<TableCell
											className='px-6 py-4 text-right whitespace-nowrap font-semibold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(row.price)}
										</TableCell>
										<TableCell className='px-6 py-4 text-center'>
											<Badge
												variant={overAllocated ? 'destructive' : 'secondary'}
												className='text-[11px] font-semibold'>
												{row.inUse}
												{overAllocated ? ' (melebihi stok)' : ''}
											</Badge>
										</TableCell>
										<TableCell className='px-6 py-4'>
											<Input
												type='number'
												min={0}
												max={999}
												value={value}
												onChange={(e) =>
													setEdited((prev) => ({
														...prev,
														[row.sizeId]: e.target.value,
													}))
												}
												className='h-9 w-24'
												aria-label={`Stok ${row.productTitle} ukuran ${row.label}`}
											/>
										</TableCell>
										<TableCell className='px-6 py-4 text-right'>
											<Button
												type='button'
												size='sm'
												className='h-9'
												disabled={!changed || !valid || saving}
												onClick={() =>
													setUnit.mutate({
														sizeId: row.sizeId,
														unitCount: parsed,
													})
												}>
												Simpan
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{!isLoading && total > 0 && (
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
					<p className='text-xs' style={{ color: 'var(--text-muted)' }}>
						Menampilkan {fromRow}–{toRow} dari {total} ukuran
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
