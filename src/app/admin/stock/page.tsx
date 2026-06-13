'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { formatRupiah, useToast } from '@/hooks';
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

const SKELETON_GROUPS = 3;

export default function AdminStockPage() {
	const utils = api.useUtils();
	const toast = useToast();
	const { data, isLoading } = api.admin.unit.list.useQuery();

	// Nilai stok yang sedang diedit, dikunci per `size.id`. Hanya size yang
	// nilainya berbeda dari server yang boleh disimpan.
	const [edited, setEdited] = useState<Record<string, string>>({});

	const setUnit = api.admin.unit.setUnitCount.useMutation({
		onSuccess: () => {
			toast.success('Stok diperbarui');
			utils.admin.unit.list.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const products = data?.products ?? [];

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

			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				{isLoading ? (
					<div className='divide-y divide-[var(--border)]'>
						{Array.from({ length: SKELETON_GROUPS }).map((_, g) => (
							<div key={`skeleton-${g}`} className='p-6 space-y-4'>
								<Skeleton className='h-5 w-48' />
								<Table>
									<TableBody>
										{Array.from({ length: 2 }).map((__, r) => (
											<TableRow
												key={r}
												className='hover:bg-transparent'>
												{Array.from({ length: 5 }).map((___, c) => (
													<TableCell key={c} className='px-4 py-3'>
														<Skeleton className='h-4 w-full' />
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						))}
					</div>
				) : products.length === 0 ? (
					<div
						className='px-6 py-16 text-center text-sm'
						style={{ color: 'var(--text-muted)' }}>
						Belum ada produk.
					</div>
				) : (
					<div className='divide-y divide-[var(--border)]'>
						{products.map((product) => (
							<div key={product.id} className='p-6 space-y-4'>
								<div className='flex items-center gap-3'>
									<h2
										className='font-semibold'
										style={{ color: 'var(--text)' }}>
										{product.title}
									</h2>
									<Badge
										className='border-transparent text-[11px] font-semibold'
										style={{
											background: 'rgba(157, 23, 77, 0.08)',
											color: 'var(--primary)',
										}}>
										{product.category}
									</Badge>
								</div>

								{product.sizes.length === 0 ? (
									<p
										className='text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Produk ini belum punya ukuran.
									</p>
								) : (
									<Table>
										<TableHeader>
											<TableRow
												className='hover:bg-transparent'
												style={{
													background: 'rgba(157, 23, 77, 0.04)',
													color: 'var(--text-muted)',
												}}>
												<TableHead className='px-4 py-2.5 text-xs uppercase tracking-wider font-semibold'>
													Ukuran
												</TableHead>
												<TableHead className='px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-right'>
													Harga
												</TableHead>
												<TableHead className='px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-center'>
													Sedang Disewa
												</TableHead>
												<TableHead className='px-4 py-2.5 text-xs uppercase tracking-wider font-semibold'>
													Stok
												</TableHead>
												<TableHead className='px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-right'>
													Aksi
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{product.sizes.map((size) => {
												const raw = edited[size.id];
												const value =
													raw !== undefined ? raw : String(size.unitCount);
												const parsed = Number(value);
												const valid =
													value.trim() !== '' &&
													Number.isInteger(parsed) &&
													parsed >= 0 &&
													parsed <= 999;
												const changed =
													raw !== undefined && parsed !== size.unitCount;
												const overAllocated = size.inUse > size.unitCount;
												const saving =
													setUnit.isPending &&
													setUnit.variables?.sizeId === size.id;

												return (
													<TableRow
														key={size.id}
														className='hover:bg-transparent'>
														<TableCell
															className='px-4 py-3 font-medium'
															style={{ color: 'var(--text)' }}>
															{size.label}
														</TableCell>
														<TableCell
															className='px-4 py-3 text-right whitespace-nowrap font-semibold'
															style={{ color: 'var(--primary)' }}>
															{formatRupiah(size.price)}
														</TableCell>
														<TableCell className='px-4 py-3 text-center'>
															<Badge
																variant={
																	overAllocated ? 'destructive' : 'secondary'
																}
																className='text-[11px] font-semibold'>
																{size.inUse}
																{overAllocated ? ' (melebihi stok)' : ''}
															</Badge>
														</TableCell>
														<TableCell className='px-4 py-3'>
															<Input
																type='number'
																min={0}
																max={999}
																value={value}
																onChange={(e) =>
																	setEdited((prev) => ({
																		...prev,
																		[size.id]: e.target.value,
																	}))
																}
																className='h-9 w-24'
																aria-label={`Stok ukuran ${size.label}`}
															/>
														</TableCell>
														<TableCell className='px-4 py-3 text-right'>
															<Button
																type='button'
																size='sm'
																className='h-9'
																disabled={!changed || !valid || saving}
																onClick={() =>
																	setUnit.mutate({
																		sizeId: size.id,
																		unitCount: parsed,
																	})
																}>
																Simpan
															</Button>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
