'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { api } from '@/trpc/react';
import { formatRupiah } from '@/hooks';
import { ProductImage } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export default function ProductDetail({ productId }: { productId: string }) {
	const { data: product, isLoading } = api.admin.product.getById.useQuery({
		id: productId,
	});

	if (isLoading) {
		return (
			<div className='max-w-4xl'>
				<div className='h-96 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse' />
			</div>
		);
	}

	if (!product) {
		return (
			<div className='max-w-4xl'>
				<div
					className='rounded-2xl border border-[var(--border)] p-10 text-center'
					style={{ background: 'var(--bg-card)' }}>
					<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
						Produk tidak ditemukan.
					</p>
					<Link
						href='/admin/products'
						className='inline-block mt-3 text-sm font-semibold'
						style={{ color: 'var(--primary)' }}>
						Kembali ke daftar
					</Link>
				</div>
			</div>
		);
	}

	const gallery = [
		product.image,
		...product.images.filter((img) => img !== product.image),
	];

	return (
		<div className='max-w-4xl'>
			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 sm:px-8 py-5 border-b border-[var(--border)]'>
					<div>
						<Badge
							className='border-transparent text-[10px] font-semibold uppercase tracking-wider mb-2'
							style={{
								background: 'rgba(157, 23, 77, 0.08)',
								color: 'var(--primary)',
							}}>
							{product.category}
						</Badge>
						<h2 className='font-serif text-xl font-semibold'>{product.title}</h2>
						<p
							className='text-xs font-mono mt-0.5'
							style={{ color: 'var(--text-muted)' }}>
							/{product.slug}
						</p>
					</div>
					<div className='flex items-center gap-2 shrink-0'>
						<Button asChild variant='outline'>
							<Link href='/admin/products'>
								<ArrowLeft size={14} />
								Kembali
							</Link>
						</Button>
						<Button asChild>
							<Link href={`/admin/products/${product.id}/edit`}>
								<Pencil size={14} />
								Edit
							</Link>
						</Button>
					</div>
				</div>

				<div className='p-6 sm:p-8 space-y-6'>
					<div className='grid sm:grid-cols-[2fr_1fr] gap-4'>
						<div className='relative aspect-4/3 rounded-xl overflow-hidden border border-[var(--border)]'>
							<ProductImage
								src={product.image}
								alt={product.title}
								sizes='(max-width: 640px) 100vw, 60vw'
							/>
						</div>
						{gallery.length > 1 && (
							<div className='grid grid-cols-3 sm:grid-cols-2 gap-2 content-start'>
								{gallery.slice(0, 6).map((img, i) => (
									<div
										key={`${img}-${i}`}
										className='relative aspect-square rounded-lg overflow-hidden border border-[var(--border)]'>
										<ProductImage
											src={img}
											alt={`Galeri ${i + 1}`}
											sizes='120px'
										/>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
						<Info
							label='Harga mulai'
							value={formatRupiah(product.basePrice)}
							highlight
						/>
						<Info label='Kategori' value={product.category} />
						<Info
							label='Waktu produksi'
							value={product.productionTime ?? '—'}
						/>
					</div>

					<Section title='Deskripsi'>
						<p className='text-sm font-medium mb-2'>
							{product.shortDescription}
						</p>
						<p
							className='text-sm leading-relaxed'
							style={{ color: 'var(--text-secondary)' }}>
							{product.description}
						</p>
					</Section>

					{product.tags.length > 0 && (
						<Section title='Tags'>
							<ChipList items={product.tags} />
						</Section>
					)}

					{product.serviceAreas.length > 0 && (
						<Section title='Area layanan'>
							<ChipList items={product.serviceAreas} />
						</Section>
					)}

					{product.sizes.length > 0 && (
						<Section title='Ukuran & harga'>
							<div className='rounded-lg border border-[var(--border)] overflow-hidden'>
								<Table>
									<TableHeader>
										<TableRow
											className='hover:bg-transparent text-xs'
											style={{
												background: 'rgba(157, 23, 77, 0.04)',
												color: 'var(--text-muted)',
											}}>
											<TableHead className='px-4 py-2 font-semibold'>
												Label
											</TableHead>
											<TableHead className='px-4 py-2 font-semibold'>
												Harga
											</TableHead>
											<TableHead className='px-4 py-2 font-semibold'>
												Stok
											</TableHead>
											<TableHead className='px-4 py-2 font-semibold'>
												Catatan
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{product.sizes.map((s) => (
											<TableRow key={s.id} className='hover:bg-transparent'>
												<TableCell className='px-4 py-2 font-medium'>
													{s.label}
												</TableCell>
												<TableCell
													className='px-4 py-2 font-semibold'
													style={{ color: 'var(--primary)' }}>
													{formatRupiah(s.price)}
												</TableCell>
												<TableCell className='px-4 py-2 font-medium'>
													{s.unitCount} unit
												</TableCell>
												<TableCell
													className='px-4 py-2'
													style={{ color: 'var(--text-muted)' }}>
													{s.note ?? '—'}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</Section>
					)}

					{product.designTemplates.length > 0 && (
						<Section title='Template desain'>
							<div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
								{product.designTemplates.map((t) => (
									<div key={t.id}>
										<div className='relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] mb-1'>
											<ProductImage
												src={t.image}
												alt={t.name}
												sizes='120px'
											/>
										</div>
										<p className='text-xs text-center truncate'>{t.name}</p>
									</div>
								))}
							</div>
						</Section>
					)}

					{product.themeColors.length > 0 && (
						<Section title='Warna tema'>
							<div className='flex flex-wrap gap-3'>
								{product.themeColors.map((c) => (
									<div key={c.id} className='flex items-center gap-2'>
										<span
											className='w-6 h-6 rounded-full border border-[var(--border)]'
											style={{ background: c.value }}
										/>
										<span className='text-sm'>{c.name}</span>
									</div>
								))}
							</div>
						</Section>
					)}

					{product.addons.length > 0 && (
						<Section title='Add-on'>
							<ul className='space-y-1.5'>
								{product.addons.map((a) => (
									<li
										key={a.id}
										className='flex items-center justify-between text-sm border-b border-[var(--border)] pb-1.5 last:border-0 last:pb-0'>
										<span>{a.name}</span>
										<span
											className='font-semibold'
											style={{ color: 'var(--primary)' }}>
											{formatRupiah(a.price)}
										</span>
									</li>
								))}
							</ul>
						</Section>
					)}
				</div>
			</div>
		</div>
	);
}

function Info({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<div>
			<p className='text-xs mb-0.5' style={{ color: 'var(--text-muted)' }}>
				{label}
			</p>
			<p
				className={`font-semibold ${highlight ? 'font-serif text-base' : 'text-sm'}`}
				style={highlight ? { color: 'var(--primary)' } : undefined}>
				{value}
			</p>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className='pt-5 border-t border-[var(--border)]'>
			<h3 className='text-sm font-semibold mb-3'>{title}</h3>
			{children}
		</div>
	);
}

function ChipList({ items }: { items: string[] }) {
	return (
		<div className='flex flex-wrap gap-2'>
			{items.map((item) => (
				<span
					key={item}
					className='inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-[var(--border)]'
					style={{
						background: 'var(--bg-surface)',
						color: 'var(--text-secondary)',
					}}>
					{item}
				</span>
			))}
		</div>
	);
}
