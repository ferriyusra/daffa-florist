'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	Pencil,
	Plus,
	Search,
	Trash2,
} from 'lucide-react';
import { api } from '@/trpc/react';
import { productCategories, type ProductCategory } from '@/lib/products';
import { formatRupiah, useToast } from '@/hooks';
import { ConfirmDialog, ProductImage, ProgressBar } from '@/components';

const PAGE_SIZE = 6;

export default function AdminProductsPage() {
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

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
				<div
					className='flex items-center gap-2 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<Search size={15} style={{ color: 'var(--text-muted)' }} />
					<input
						type='search'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Cari nama produk...'
						className='flex-1 bg-transparent text-sm outline-none'
					/>
				</div>
				<Link
					href='/admin/products/new'
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Produk
				</Link>
			</div>

			<div className='flex gap-2 flex-wrap'>
				{(['all', ...productCategories] as const).map((cat) => {
					const active = category === cat;
					return (
						<button
							type='button'
							key={cat}
							onClick={() => setCategory(cat)}
							className='inline-flex items-center px-3.5 h-9 rounded-full text-xs font-semibold cursor-pointer border transition-colors'
							style={{
								background: active ? 'var(--primary)' : 'transparent',
								color: active ? 'white' : 'var(--text-secondary)',
								borderColor: active ? 'var(--primary)' : 'var(--border)',
							}}>
							{cat === 'all' ? 'Semua' : cat}
						</button>
					);
				})}
			</div>

			<ProgressBar active={isFetching} />

			{isLoading ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className='rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] h-64 animate-pulse'
						/>
					))}
				</div>
			) : filtered.length === 0 ? (
				<div
					className='text-center py-16 rounded-2xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						Tidak ada produk yang cocok.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
					{paged.map((product) => (
						<div
							key={product.id}
							className='rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-sm)',
							}}>
							<div className='relative aspect-4/3 bg-[var(--bg-surface)]'>
								<ProductImage
									src={product.image}
									alt={product.title}
									sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
								/>
								<span
									className='absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider'
									style={{
										background: 'rgba(255, 255, 255, 0.95)',
										color: 'var(--primary)',
									}}>
									{product.category}
								</span>
							</div>

							<div className='p-5 flex flex-col flex-1 gap-3'>
								<div>
									<h3 className='font-serif text-base font-semibold mb-1 line-clamp-1'>
										{product.title}
									</h3>
									<p
										className='text-xs line-clamp-2'
										style={{ color: 'var(--text-secondary)' }}>
										{product.shortDescription}
									</p>
								</div>

								<div className='flex items-center justify-between text-xs pt-3 border-t border-[var(--border)]'>
									<div>
										<p style={{ color: 'var(--text-muted)' }}>Harga mulai</p>
										<p
											className='font-serif text-base font-semibold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(product.basePrice)}
										</p>
									</div>
									<div className='text-right'>
										<p style={{ color: 'var(--text-muted)' }}>Varian</p>
										<p
											className='font-semibold'
											style={{ color: 'var(--secondary)' }}>
											{product._count.sizes} ukuran
										</p>
									</div>
								</div>

								<div className='flex gap-2 pt-1'>
									<Link
										href={`/admin/products/${product.id}`}
										className='flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<Eye size={12} />
										Detail
									</Link>
									<Link
										href={`/admin/products/${product.id}/edit`}
										className='flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<Pencil size={12} />
										Edit
									</Link>
									<button
										type='button'
										onClick={() => setConfirmId(product.id)}
										className='inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--destructive)]'
										style={{ color: 'var(--destructive)' }}
										aria-label='Hapus produk'>
										<Trash2 size={13} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{!isLoading && totalPages > 1 && (
				<div className='flex items-center justify-center gap-1.5 pt-2'>
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
