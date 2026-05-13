import Image from 'next/image';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { products, productCategories } from '@/lib/products';

export default function AdminProductsPage() {
	const lowStockThreshold = 5;

	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div
					className='flex items-center gap-2 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<Search size={15} style={{ color: 'var(--text-muted)' }} />
					<input
						type='search'
						placeholder='Cari nama produk...'
						className='flex-1 bg-transparent text-sm outline-none'
					/>
				</div>
				<button
					type='button'
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Produk
				</button>
			</div>

			<div className='flex gap-2 flex-wrap'>
				<button
					type='button'
					className='inline-flex items-center px-3.5 h-9 rounded-full text-xs font-semibold cursor-pointer border'
					style={{
						background: 'var(--primary)',
						color: 'white',
						borderColor: 'var(--primary)',
					}}>
					Semua
				</button>
				{productCategories.map((cat) => (
					<button
						type='button'
						key={cat}
						className='inline-flex items-center px-3.5 h-9 rounded-full text-xs font-semibold cursor-pointer border'
						style={{
							background: 'transparent',
							color: 'var(--text-secondary)',
							borderColor: 'var(--border)',
						}}>
						{cat}
					</button>
				))}
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
				{products.map((product, idx) => {
					const stock = (idx * 7 + 3) % 18;
					const lowStock = stock <= lowStockThreshold;
					return (
						<div
							key={product.slug}
							className='rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-sm)',
							}}>
							<div className='relative aspect-4/3 bg-[var(--bg-surface)]'>
								<Image
									src={product.image}
									alt={product.title}
									fill
									className='object-cover'
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
											{product.priceLabel}
										</p>
									</div>
									<div className='text-right'>
										<p style={{ color: 'var(--text-muted)' }}>Stok</p>
										<p
											className='font-semibold'
											style={{
												color: lowStock
													? 'var(--destructive)'
													: 'var(--secondary)',
											}}>
											{stock} unit
										</p>
									</div>
								</div>

								<div className='flex gap-2 pt-1'>
									<button
										type='button'
										className='flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
										style={{ color: 'var(--text-secondary)' }}>
										<Pencil size={12} />
										Edit
									</button>
									<button
										type='button'
										className='inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer transition-colors'
										style={{ color: 'var(--destructive)' }}
										aria-label='Hapus produk'>
										<Trash2 size={13} />
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
