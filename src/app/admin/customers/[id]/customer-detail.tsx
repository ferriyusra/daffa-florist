'use client';

import Link from 'next/link';
import { ArrowLeft, ClipboardList, MapPin, Wallet } from 'lucide-react';
import { api } from '@/trpc/react';
import { formatRupiah } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

function Section({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: typeof MapPin;
	children: React.ReactNode;
}) {
	return (
		<Card
			className='gap-0 py-6 rounded-2xl border-[var(--border)]'
			style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
			<CardContent>
				<div className='flex items-center gap-2 mb-4'>
					<Icon size={16} style={{ color: 'var(--primary)' }} />
					<h2 className='font-serif text-base font-semibold'>{title}</h2>
				</div>
				{children}
			</CardContent>
		</Card>
	);
}

export default function CustomerDetail({ id }: { id: string }) {
	const { data: c, isLoading, error } = api.admin.customer.getById.useQuery({
		id,
	});

	const back = (
		<Button asChild variant='ghost' size='sm' className='-ml-2'>
			<Link href='/admin/customers'>
				<ArrowLeft size={15} />
				Kembali
			</Link>
		</Button>
	);

	if (isLoading) {
		return (
			<div className='space-y-5'>
				{back}
				<Card
					className='rounded-2xl border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<CardContent className='space-y-3'>
						<Skeleton className='h-14 w-14 rounded-full' />
						<Skeleton className='h-5 w-48' />
						<Skeleton className='h-4 w-64' />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !c) {
		return (
			<div className='space-y-5'>
				{back}
				<p className='text-sm' style={{ color: 'var(--destructive)' }}>
					{error?.message ?? 'Customer tidak ditemukan.'}
				</p>
			</div>
		);
	}

	const initials = (c.name ?? c.email)
		.split(' ')
		.slice(0, 2)
		.map((p) => p[0])
		.join('')
		.toUpperCase();
	const isAdmin = c.role === 'ADMIN';

	return (
		<div className='space-y-5 max-w-3xl'>
			{back}

			{/* Profil */}
			<Card
				className='gap-0 py-6 rounded-2xl border-[var(--border)]'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<CardContent>
					<div className='flex items-start gap-4'>
						<span
							className='inline-flex items-center justify-center w-14 h-14 rounded-full font-semibold shrink-0'
							style={{
								background: 'rgba(157, 23, 77, 0.12)',
								color: 'var(--primary)',
							}}>
							{initials}
						</span>
						<div className='min-w-0 flex-1'>
							<h1 className='font-serif text-xl font-semibold'>
								{c.name ?? '—'}
							</h1>
							<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
								{c.email}
								{c.phone ? ` · ${c.phone}` : ''}
							</p>
							<div className='flex flex-wrap gap-2 mt-3'>
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
							</div>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-3 mt-5'>
						{[
							{
								label: 'Pesanan',
								value: `${c.orderCount}`,
								icon: ClipboardList,
							},
							{
								label: 'Total Belanja',
								value: formatRupiah(c.totalSpent),
								icon: Wallet,
							},
							{
								label: 'Bergabung',
								value: formatDate(c.createdAt),
								icon: MapPin,
							},
						].map((s) => (
							<div
								key={s.label}
								className='rounded-xl border border-[var(--border)] p-3'>
								<p
									className='text-[11px] uppercase tracking-wider mb-1'
									style={{ color: 'var(--text-muted)' }}>
									{s.label}
								</p>
								<p className='text-sm font-semibold'>{s.value}</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Alamat */}
			<Section title='Alamat' icon={MapPin}>
				{c.addresses.length === 0 ? (
					<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
						Belum ada alamat tersimpan.
					</p>
				) : (
					<ul className='space-y-3'>
						{c.addresses.map((a) => (
							<li
								key={a.id}
								className='rounded-xl border border-[var(--border)] p-4'>
								<div className='flex items-center gap-2 mb-1'>
									<p className='text-sm font-semibold'>{a.recipientName}</p>
									{a.isDefault && (
										<Badge
											className='border-transparent text-[11px] font-semibold'
											style={{
												background: 'rgba(157, 23, 77, 0.1)',
												color: 'var(--primary)',
											}}>
											Utama
										</Badge>
									)}
								</div>
								<p
									className='text-xs'
									style={{ color: 'var(--text-secondary)' }}>
									{a.phone} · {a.fullAddress}, {a.city}
									{a.province ? `, ${a.province}` : ''}
								</p>
							</li>
						))}
					</ul>
				)}
			</Section>

			{/* Riwayat pesanan */}
			<Section title='Pesanan Terakhir' icon={ClipboardList}>
				{c.orders.length === 0 ? (
					<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
						Belum ada pesanan.
					</p>
				) : (
					<ul className='divide-y divide-[var(--border)]'>
						{c.orders.map((o) => (
							<li
								key={o.id}
								className='flex items-center justify-between py-3 gap-3'>
								<div className='min-w-0'>
									<p className='text-sm font-semibold truncate'>
										{o.orderNumber}
									</p>
									<p
										className='text-xs'
										style={{ color: 'var(--text-muted)' }}>
										{formatDate(o.createdAt)} · {o.status}
									</p>
								</div>
								<p
									className='text-sm font-semibold whitespace-nowrap'
									style={{ color: 'var(--primary)' }}>
									{formatRupiah(o.total)}
								</p>
							</li>
						))}
					</ul>
				)}
			</Section>
		</div>
	);
}
