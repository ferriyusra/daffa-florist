'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
	ArrowRight,
	Filter,
	PackageSearch,
	Search,
	SlidersHorizontal,
	X,
} from 'lucide-react';
import { Footer, Navbar, ProductImage, RentalBadge } from '@/components';
import { productCategories, type ProductCategory } from '@/lib';
import { formatRupiah } from '@/hooks';
import { api } from '@/trpc/react';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name';

const sortOptions: { id: SortOption; label: string }[] = [
	{ id: 'recommended', label: 'Rekomendasi' },
	{ id: 'price-asc', label: 'Harga Terendah' },
	{ id: 'price-desc', label: 'Harga Tertinggi' },
	{ id: 'name', label: 'Nama A-Z' },
];

export default function ProductsCatalogPage() {
	return (
		<>
			<Navbar />
			<CatalogScreen />
			<Footer />
		</>
	);
}

function CatalogScreen() {
	const [search, setSearch] = useState('');
	const [activeCategories, setActiveCategories] = useState<ProductCategory[]>(
		[],
	);
	const [maxPrice, setMaxPrice] = useState<number>(1_000_000);
	const [sort, setSort] = useState<SortOption>('recommended');
	const [filtersOpen, setFiltersOpen] = useState(false);

	const { data: products = [], isLoading } = api.product.list.useQuery();

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		const matches = products.filter((p) => {
			if (
				activeCategories.length > 0 &&
				!activeCategories.includes(p.category)
			)
				return false;
			if (p.price > maxPrice) return false;
			if (term) {
				const haystack = [
					p.title,
					p.shortDescription,
					p.description,
					p.category,
					...p.tags,
				]
					.join(' ')
					.toLowerCase();
				if (!haystack.includes(term)) return false;
			}
			return true;
		});

		const sorted = [...matches];
		if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
		else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
		else if (sort === 'name')
			sorted.sort((a, b) => a.title.localeCompare(b.title));

		return sorted;
	}, [products, search, activeCategories, maxPrice, sort]);

	const toggleCategory = (cat: ProductCategory) => {
		setActiveCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
		);
	};

	const resetFilters = () => {
		setSearch('');
		setActiveCategories([]);
		setMaxPrice(1_000_000);
		setSort('recommended');
	};

	const activeFilterCount =
		activeCategories.length +
		(maxPrice < 1_000_000 ? 1 : 0) +
		(search ? 1 : 0);

	return (
		<main className='floral-bg min-h-[70vh]'>
			<div className='mx-auto max-w-[1200px] px-6 py-12'>
				<div className='mb-8'>
					<span
						className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3'
						style={{
							background: 'rgba(157, 23, 77, 0.08)',
							color: 'var(--primary)',
						}}>
						Katalog Produk
					</span>
					<h1 className='font-serif text-3xl sm:text-4xl font-bold mb-2'>
						Semua Produk
					</h1>
					<p
						className='text-sm sm:text-base'
						style={{ color: 'var(--text-secondary)' }}>
						Telusuri semua papan bunga dan rangkaian bunga Dafa Florist.
					</p>
				</div>

				<div className='flex flex-col sm:flex-row gap-3 mb-6'>
					<div className='relative flex-1'>
						<Search
							size={16}
							className='absolute left-4 top-1/2 -translate-y-1/2'
							style={{ color: 'var(--text-muted)' }}
						/>
						<input
							type='search'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Cari produk, kategori, atau kata kunci...'
							className='w-full pl-11 pr-4 py-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors'
						/>
					</div>

					<button
						type='button'
						onClick={() => setFiltersOpen((v) => !v)}
						className='lg:hidden inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[var(--border)] text-sm font-medium cursor-pointer'
						style={{ background: 'var(--bg-card)' }}>
						<SlidersHorizontal size={14} />
						Filter
						{activeFilterCount > 0 && (
							<span
								className='inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold text-white'
								style={{ background: 'var(--primary)' }}>
								{activeFilterCount}
							</span>
						)}
					</button>

					<div className='relative inline-flex'>
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortOption)}
							className='appearance-none pl-4 pr-10 py-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm font-medium cursor-pointer focus:outline-none focus:border-[var(--primary)]'>
							{sortOptions.map((opt) => (
								<option key={opt.id} value={opt.id}>
									Urutkan: {opt.label}
								</option>
							))}
						</select>
						<ArrowRight
							size={14}
							className='absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none'
							style={{ color: 'var(--text-muted)' }}
						/>
					</div>
				</div>

				<div className='grid lg:grid-cols-[260px_1fr] gap-6'>
					<aside
						className={`${
							filtersOpen ? 'block' : 'hidden'
						} lg:block lg:sticky lg:top-24 self-start`}>
						<div
							className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
							style={{ boxShadow: 'var(--shadow-sm)' }}>
							<div className='px-5 py-4 border-b border-[var(--border)] flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Filter
										size={14}
										style={{ color: 'var(--primary)' }}
									/>
									<h2 className='font-serif text-sm font-semibold'>
										Filter
									</h2>
								</div>
								{activeFilterCount > 0 && (
									<button
										type='button'
										onClick={resetFilters}
										className='text-xs font-semibold cursor-pointer'
										style={{ color: 'var(--primary)' }}>
										Reset
									</button>
								)}
							</div>

							<div className='p-5 space-y-6'>
								<div>
									<h3 className='text-xs font-semibold uppercase tracking-wider mb-3'>
										Kategori
									</h3>
									<div className='space-y-2'>
										{productCategories.map((cat) => {
											const checked = activeCategories.includes(cat);
											const count = products.filter(
												(p) => p.category === cat,
											).length;
											return (
												<label
													key={cat}
													className='flex items-center justify-between gap-2 cursor-pointer text-sm'>
													<span className='flex items-center gap-2'>
														<input
															type='checkbox'
															checked={checked}
															onChange={() => toggleCategory(cat)}
															className='w-4 h-4 rounded border-[var(--border)] cursor-pointer'
															style={{ accentColor: 'var(--primary)' }}
														/>
														<span
															style={{
																color: checked
																	? 'var(--primary)'
																	: 'var(--text)',
																fontWeight: checked ? 600 : 400,
															}}>
															{cat}
														</span>
													</span>
													<span
														className='text-xs'
														style={{ color: 'var(--text-muted)' }}>
														{count}
													</span>
												</label>
											);
										})}
									</div>
								</div>

								<div>
									<h3 className='text-xs font-semibold uppercase tracking-wider mb-3'>
										Harga Maksimal
									</h3>
									<input
										type='range'
										min={250_000}
										max={1_000_000}
										step={50_000}
										value={maxPrice}
										onChange={(e) => setMaxPrice(Number(e.target.value))}
										className='w-full cursor-pointer'
										style={{ accentColor: 'var(--primary)' }}
									/>
									<div
										className='mt-2 text-xs flex justify-between'
										style={{ color: 'var(--text-secondary)' }}>
										<span>Rp 250rb</span>
										<span
											className='font-semibold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(maxPrice)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</aside>

					<div>
						{(activeCategories.length > 0 || search) && (
							<div className='flex flex-wrap items-center gap-2 mb-4'>
								<span
									className='text-xs font-medium'
									style={{ color: 'var(--text-secondary)' }}>
									Filter aktif:
								</span>
								{search && (
									<FilterChip
										label={`"${search}"`}
										onRemove={() => setSearch('')}
									/>
								)}
								{activeCategories.map((cat) => (
									<FilterChip
										key={cat}
										label={cat}
										onRemove={() => toggleCategory(cat)}
									/>
								))}
							</div>
						)}

						<div className='flex items-center justify-between mb-4'>
							<p
								className='text-sm'
								style={{ color: 'var(--text-secondary)' }}>
								Menampilkan{' '}
								<span
									className='font-semibold'
									style={{ color: 'var(--text)' }}>
									{filtered.length}
								</span>{' '}
								dari{' '}
								<span
									className='font-semibold'
									style={{ color: 'var(--text)' }}>
									{products.length}
								</span>{' '}
								produk
							</p>
						</div>

						{isLoading ? (
							<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-5'>
								{Array.from({ length: 6 }).map((_, i) => (
									<div
										key={i}
										className='rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] aspect-4/3 animate-pulse'
										style={{ boxShadow: 'var(--shadow-sm)' }}
									/>
								))}
							</div>
						) : filtered.length === 0 ? (
							<div
								className='text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]'
								style={{ boxShadow: 'var(--shadow-sm)' }}>
								<div
									className='mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4'
									style={{ background: 'rgba(157, 23, 77, 0.08)' }}>
									<PackageSearch
										size={28}
										style={{ color: 'var(--primary)' }}
									/>
								</div>
								<h3 className='font-serif text-lg font-semibold mb-1'>
									Produk tidak ditemukan
								</h3>
								<p
									className='text-sm mb-4'
									style={{ color: 'var(--text-secondary)' }}>
									Coba ubah kata kunci atau filter Anda.
								</p>
								<button
									type='button'
									onClick={resetFilters}
									className='text-sm font-semibold cursor-pointer'
									style={{ color: 'var(--primary)' }}>
									Reset semua filter
								</button>
							</div>
						) : (
							<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-5'>
								{filtered.map((p) => (
									<Link
										key={p.slug}
										href={`/products/${p.slug}`}
										className='group bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] card-hover flex flex-col'
										style={{ boxShadow: 'var(--shadow-sm)' }}>
										<div className='relative aspect-4/3 overflow-hidden'>
											<ProductImage
												src={p.image}
												alt={p.title}
												className='object-cover transition-transform duration-500 group-hover:scale-105'
												sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
											/>
											<div className='absolute top-3 left-3 flex flex-col items-start gap-1.5'>
												<span
													className='inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider'
													style={{
														background: 'rgba(255, 255, 255, 0.95)',
														color: 'var(--primary)',
													}}>
													{p.category}
												</span>
												<RentalBadge />
											</div>
											<div className='absolute top-3 right-3 glass rounded-full px-3 py-1.5'>
												<p
													className='text-xs font-semibold'
													style={{ color: 'var(--text)' }}>
													{p.priceLabel}
												</p>
											</div>
										</div>

										<div className='p-5 flex flex-col flex-1'>
											<h3 className='font-serif text-lg font-semibold mb-1.5 group-hover:text-[var(--primary)] transition-colors'>
												{p.title}
											</h3>
											<p
												className='text-sm leading-relaxed flex-1'
												style={{ color: 'var(--text-secondary)' }}>
												{p.shortDescription}
											</p>
											<div
												className='mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1'
												style={{ color: 'var(--primary)' }}>
												Lihat Detail
												<ArrowRight size={14} />
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}

function FilterChip({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onRemove}
			className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors'
			style={{
				background: 'rgba(157, 23, 77, 0.1)',
				color: 'var(--primary)',
			}}>
			{label}
			<X size={12} />
		</button>
	);
}
