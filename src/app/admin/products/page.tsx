'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	Search,
	Trash2,
} from 'lucide-react';
import { api } from '@/trpc/react';
import { productCategories, type ProductCategory } from '@/lib/products';
import { formatRupiah, useToast } from '@/hooks';
import { ConfirmDialog, ProductImage, ProgressBar } from '@/components';
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

export default function AdminProductsPage() {
	const router = useRouter();
	const utils = api.useUtils();
	const toast = useToast();
	const { data: products = [], isLoading, isFetching } =
		api.admin.product.list.useQuery();

	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<ProductCategory | 'all'>('all');
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const deleteMut = api.admin.product.delete.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.admin.product.list.invalidate(),
				utils.product.list.invalidate(),
			]);
			setConfirmId(null);
			toast.success('Produk berhasil dihapus.');
		},
		onError: (e) => toast.error(e.message),
	});

	const term = search.trim().toLowerCase();
	const filtered = products.filter((p) => {
		if (category !== 'all' && p.category !== category) return false;
		if (term && !`${p.title} ${p.shortDescription}`.toLowerCase().includes(term))
			return false;
		return true;
	});

	const confirmProduct = products.find((p) => p.id === confirmId) ?? null;

	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const toRow = Math.min(page * PAGE_SIZE, total);

	// Balik ke halaman 1 saat filter berubah; jaga halaman tetap valid saat data menyusut.
	useEffect(() => {
		setPage(1);
	}, [search, category]);
	useEffect(() => {
		setPage((p) => Math.min(p, totalPages));
	}, [totalPages]);

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
						placeholder='Cari nama produk...'
						className='h-10 pl-9'
					/>
				</div>
				<Button asChild className='h-10'>
					<Link href='/admin/products/new'>
						<Plus size={15} />
						Tambah Produk
					</Link>
				</Button>
			</div>

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
								Kategori
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold text-right'>
								Harga Mulai
							</TableHead>
							<TableHead className='px-6 py-3 text-xs uppercase tracking-wider font-semibold'>
								Varian
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
									{Array.from({ length: 5 }).map((__, c) => (
										<TableCell key={c} className='px-6 py-4'>
											<Skeleton className='h-4 w-full' />
										</TableCell>
									))}
								</TableRow>
							))
						) : total === 0 ? (
							<TableRow className='hover:bg-transparent'>
								<TableCell
									colSpan={5}
									className='px-6 py-12 text-center text-sm'
									style={{ color: 'var(--text-muted)' }}>
									Tidak ada produk yang cocok.
								</TableCell>
							</TableRow>
						) : (
							paged.map((product) => (
								<TableRow
									key={product.id}
									onClick={() => router.push(`/admin/products/${product.id}`)}
									className='cursor-pointer'>
									<TableCell className='px-6 py-4'>
										<div className='flex items-center gap-3'>
											<div className='relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--bg-surface)]'>
												<ProductImage
													src={product.image}
													alt={product.title}
													sizes='48px'
												/>
											</div>
											<div className='min-w-0'>
												<p className='font-semibold truncate'>{product.title}</p>
												<p
													className='text-xs truncate max-w-[18rem]'
													style={{ color: 'var(--text-muted)' }}>
													{product.shortDescription}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell className='px-6 py-4'>
										<Badge
											className='border-transparent text-[11px] font-semibold'
											style={{
												background: 'rgba(157, 23, 77, 0.08)',
												color: 'var(--primary)',
											}}>
											{product.category}
										</Badge>
									</TableCell>
									<TableCell
										className='px-6 py-4 font-semibold text-right whitespace-nowrap'
										style={{ color: 'var(--primary)' }}>
										{formatRupiah(product.basePrice)}
									</TableCell>
									<TableCell
										className='px-6 py-4 whitespace-nowrap'
										style={{ color: 'var(--text-secondary)' }}>
										{product._count.sizes} ukuran
									</TableCell>
									<TableCell className='px-6 py-4'>
										<div
											className='flex items-center justify-end gap-1.5'
											onClick={(e) => e.stopPropagation()}>
											<Button
												asChild
												variant='outline'
												size='icon'
												aria-label='Edit produk'>
												<Link href={`/admin/products/${product.id}/edit`}>
													<Pencil size={13} />
												</Link>
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() => setConfirmId(product.id)}
												aria-label='Hapus produk'
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

			{!isLoading && total > 0 && (
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
					<p className='text-xs' style={{ color: 'var(--text-muted)' }}>
						Menampilkan {fromRow}–{toRow} dari {total} produk
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

			<ConfirmDialog
				open={confirmProduct !== null}
				onClose={() => setConfirmId(null)}
				onConfirm={() =>
					confirmProduct && deleteMut.mutate({ id: confirmProduct.id })
				}
				title='Hapus produk?'
				description={
					confirmProduct && (
						<>
							Produk{' '}
							<span className='font-semibold'>{confirmProduct.title}</span> akan
							dihapus permanen beserta ukuran, template, warna, dan add-on-nya.
						</>
					)
				}
				loading={deleteMut.isPending}
				error={deleteMut.error?.message}
			/>
		</div>
	);
}
