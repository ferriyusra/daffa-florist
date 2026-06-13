'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ClipboardList,
	AlertCircle,
	CalendarCheck,
	Wallet,
	Users,
	Package,
	ChevronRight,
	ArrowRight,
} from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { formatRupiah } from '@/hooks';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/order-status';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

// Warna badge status (UI-only). Label dari modul bersama `@/lib/order-status`.
const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
	CONFIRMED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	SCHEDULED: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
	INSTALLED: { bg: 'rgba(20, 184, 166, 0.14)', color: '#0d9488' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	CANCELLED: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' },
};

const formatDate = (d: Date) =>
	new Date(d).toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

type Overview = RouterOutputs['admin']['dashboard']['overview'];

/** Definisi tiap kartu statistik (ikon, label, aken warna). */
type StatTone = 'neutral' | 'primary' | 'accent' | 'secondary';

const toneStyles: Record<
	StatTone,
	{ chipBg: string; chipColor: string }
> = {
	neutral: {
		chipBg: 'rgba(157, 23, 77, 0.08)',
		chipColor: 'var(--primary)',
	},
	primary: {
		chipBg: 'rgba(157, 23, 77, 0.12)',
		chipColor: 'var(--primary)',
	},
	accent: {
		chipBg: 'rgba(139, 105, 20, 0.14)',
		chipColor: 'var(--accent)',
	},
	secondary: {
		chipBg: 'rgba(61, 107, 79, 0.14)',
		chipColor: 'var(--secondary)',
	},
};

function StatCard({
	icon: Icon,
	label,
	value,
	tone = 'neutral',
	href,
}: {
	icon: typeof ClipboardList;
	label: string;
	value: string | number;
	tone?: StatTone;
	href?: string;
}) {
	const s = toneStyles[tone];
	const body = (
		<Card
			className='flex flex-row items-center gap-4 p-5 transition-shadow'
			style={{
				background: 'var(--bg-card)',
				borderColor: 'var(--border)',
				boxShadow: 'var(--shadow-sm)',
			}}>
			<span
				className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'
				style={{ background: s.chipBg, color: s.chipColor }}>
				<Icon size={20} />
			</span>
			<div className='min-w-0 flex-1'>
				<p
					className='font-serif text-2xl font-bold leading-tight'
					style={{ color: 'var(--text)' }}>
					{value}
				</p>
				<p
					className='truncate text-sm'
					style={{ color: 'var(--text-muted)' }}>
					{label}
				</p>
			</div>
			{href && (
				<ChevronRight
					size={18}
					className='shrink-0'
					style={{ color: 'var(--text-muted)' }}
				/>
			)}
		</Card>
	);

	if (href) {
		return (
			<Link
				href={href}
				className='block cursor-pointer transition-opacity hover:opacity-90'>
				{body}
			</Link>
		);
	}
	return body;
}

function StatSkeleton() {
	return (
		<Card
			className='flex flex-row items-center gap-4 p-5'
			style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
			<Skeleton className='h-11 w-11 rounded-xl' />
			<div className='flex-1 space-y-2'>
				<Skeleton className='h-6 w-20' />
				<Skeleton className='h-4 w-28' />
			</div>
		</Card>
	);
}

function StatGrid({ data }: { data: Overview }) {
	return (
		<div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
			<StatCard
				icon={ClipboardList}
				label='Total Pesanan'
				value={data.orders.total}
			/>
			<StatCard
				icon={AlertCircle}
				label='Menunggu Konfirmasi'
				value={data.orders.pending}
				tone={data.orders.pending > 0 ? 'accent' : 'neutral'}
				href='/admin/orders'
			/>
			<StatCard
				icon={CalendarCheck}
				label='Pasang Hari Ini'
				value={data.todayInstalls}
			/>
			<StatCard
				icon={Wallet}
				label='Nilai Terkonfirmasi'
				value={formatRupiah(data.revenue)}
				tone='secondary'
			/>
			<StatCard
				icon={Users}
				label='Pelanggan'
				value={data.customerCount}
			/>
			<StatCard icon={Package} label='Produk' value={data.productCount} />
		</div>
	);
}

/** Item status pipeline (urutan daur hidup sewa). */
const PIPELINE: { key: keyof Overview['orders']; status: OrderStatus }[] = [
	{ key: 'pending', status: 'PENDING' },
	{ key: 'confirmed', status: 'CONFIRMED' },
	{ key: 'scheduled', status: 'SCHEDULED' },
	{ key: 'installed', status: 'INSTALLED' },
	{ key: 'completed', status: 'COMPLETED' },
	{ key: 'cancelled', status: 'CANCELLED' },
];

function StatusPipeline({ orders }: { orders: Overview['orders'] }) {
	return (
		<Card
			className='p-5'
			style={{
				background: 'var(--bg-card)',
				borderColor: 'var(--border)',
				boxShadow: 'var(--shadow-sm)',
			}}>
			<p
				className='mb-4 font-serif text-sm font-bold'
				style={{ color: 'var(--text)' }}>
				Status Pesanan
			</p>
			<div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
				{PIPELINE.map(({ key, status }) => {
					const c = statusColors[status];
					return (
						<div key={status} className='flex flex-col gap-1'>
							<span className='flex items-center gap-1.5'>
								<span
									className='h-2 w-2 shrink-0 rounded-full'
									style={{ background: c.color }}
								/>
								<span
									className='font-serif text-xl font-bold leading-none'
									style={{ color: 'var(--text)' }}>
									{orders[key]}
								</span>
							</span>
							<span
								className='text-[11px] leading-tight'
								style={{ color: 'var(--text-muted)' }}>
								{ORDER_STATUS_LABEL[status]}
							</span>
						</div>
					);
				})}
			</div>
		</Card>
	);
}

function StatusPipelineSkeleton() {
	return (
		<Card
			className='p-5'
			style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
			<Skeleton className='mb-4 h-4 w-28' />
			<div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className='space-y-1.5'>
						<Skeleton className='h-5 w-10' />
						<Skeleton className='h-3 w-16' />
					</div>
				))}
			</div>
		</Card>
	);
}

export default function AdminDashboardPage() {
	const router = useRouter();
	const { data, isLoading } = api.admin.dashboard.overview.useQuery();

	return (
		<div className='space-y-6'>
			<div>
				<h1
					className='font-serif text-xl font-bold'
					style={{ color: 'var(--text)' }}>
					Ringkasan
				</h1>
				<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
					Pantau pesanan, jadwal pemasangan, dan performa toko.
				</p>
			</div>

			{isLoading || !data ? (
				<div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, i) => (
						<StatSkeleton key={i} />
					))}
				</div>
			) : (
				<StatGrid data={data} />
			)}

			{isLoading || !data ? (
				<StatusPipelineSkeleton />
			) : (
				<StatusPipeline orders={data.orders} />
			)}

			<section className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h2
						className='font-serif text-lg font-bold'
						style={{ color: 'var(--text)' }}>
						Pesanan Terbaru
					</h2>
					<Button
						asChild
						variant='ghost'
						size='sm'
						className='cursor-pointer'>
						<Link href='/admin/orders'>
							Lihat semua
							<ArrowRight size={14} />
						</Link>
					</Button>
				</div>

				<div
					className='overflow-hidden rounded-2xl border border-[var(--border)]'
					style={{
						background: 'var(--bg-card)',
						boxShadow: 'var(--shadow-sm)',
					}}>
					<Table>
						<TableHeader>
							<TableRow
								className='hover:bg-transparent'
								style={{
									background: 'rgba(157, 23, 77, 0.04)',
									color: 'var(--text-muted)',
								}}>
								<TableHead className='px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
									No. Pesanan
								</TableHead>
								<TableHead className='px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
									Pelanggan
								</TableHead>
								<TableHead className='px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
									Status
								</TableHead>
								<TableHead className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider'>
									Total
								</TableHead>
								<TableHead className='px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
									Tanggal
								</TableHead>
								<TableHead className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider'>
									Aksi
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading || !data ? (
								Array.from({ length: 6 }).map((_, i) => (
									<TableRow
										key={`skeleton-${i}`}
										className='hover:bg-transparent'>
										{Array.from({ length: 6 }).map((__, c) => (
											<TableCell key={c} className='px-6 py-4'>
												<Skeleton className='h-4 w-full' />
											</TableCell>
										))}
									</TableRow>
								))
							) : data.recentOrders.length === 0 ? (
								<TableRow className='hover:bg-transparent'>
									<TableCell
										colSpan={6}
										className='px-6 py-12 text-center text-sm'
										style={{ color: 'var(--text-muted)' }}>
										Belum ada pesanan.
									</TableCell>
								</TableRow>
							) : (
								data.recentOrders.map((o) => {
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
											<TableCell className='px-6 py-4'>
												<p className='truncate font-semibold'>
													{o.customerName}
												</p>
											</TableCell>
											<TableCell className='px-6 py-4'>
												<Badge
													className='border-transparent text-[11px] font-semibold'
													style={{ background: color.bg, color: color.color }}>
													{ORDER_STATUS_LABEL[o.status]}
												</Badge>
											</TableCell>
											<TableCell
												className='px-6 py-4 text-right font-semibold'
												style={{ color: 'var(--primary)' }}>
												{formatRupiah(o.total)}
											</TableCell>
											<TableCell
												className='px-6 py-4 text-xs'
												style={{ color: 'var(--text-secondary)' }}>
												{formatDate(o.createdAt)}
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
			</section>
		</div>
	);
}
