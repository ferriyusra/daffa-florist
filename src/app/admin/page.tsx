import Link from 'next/link';
import {
	ArrowUpRight,
	ClipboardList,
	Package,
	TrendingUp,
	Users,
} from 'lucide-react';

const stats = [
	{
		label: 'Pesanan Hari Ini',
		value: '12',
		change: '+18%',
		positive: true,
		icon: ClipboardList,
	},
	{
		label: 'Total Pendapatan Bulan Ini',
		value: 'Rp 24.500.000',
		change: '+8.2%',
		positive: true,
		icon: TrendingUp,
	},
	{
		label: 'Customer Aktif',
		value: '186',
		change: '+12',
		positive: true,
		icon: Users,
	},
	{
		label: 'Produk Tersedia',
		value: '24',
		change: '3 stok rendah',
		positive: false,
		icon: Package,
	},
];

const recentOrders = [
	{
		id: 'DF-2026-0042',
		customer: 'Ibu Ratna',
		product: 'Papan Bunga Wedding',
		total: 'Rp 350.000',
		status: 'Diproses',
	},
	{
		id: 'DF-2026-0041',
		customer: 'Pak Hendra',
		product: 'Dekorasi Mobil Pengantin',
		total: 'Rp 500.000',
		status: 'Menunggu Pembayaran',
	},
	{
		id: 'DF-2026-0040',
		customer: 'Ibu Sari',
		product: 'Papan Bunga Duka Cita',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0039',
		customer: 'Pak Budi',
		product: 'Papan Bunga Premium',
		total: 'Rp 500.000',
		status: 'Dikirim',
	},
];

const statusStyles: Record<string, { bg: string; color: string }> = {
	Selesai: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	Diproses: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	Dikirim: { bg: 'rgba(168, 85, 247, 0.12)', color: '#7c3aed' },
	'Menunggu Pembayaran': {
		bg: 'rgba(234, 179, 8, 0.15)',
		color: '#a16207',
	},
};

export default function AdminOverviewPage() {
	return (
		<div className='space-y-8'>
			<section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className='rounded-2xl border border-[var(--border)] p-5'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-sm)',
							}}>
							<div className='flex items-start justify-between mb-4'>
								<span
									className='inline-flex items-center justify-center w-10 h-10 rounded-xl'
									style={{
										background: 'rgba(157, 23, 77, 0.1)',
										color: 'var(--primary)',
									}}>
									<Icon size={18} />
								</span>
								<span
									className='text-xs font-semibold'
									style={{
										color: stat.positive ? '#16a34a' : 'var(--text-muted)',
									}}>
									{stat.change}
								</span>
							</div>
							<p
								className='text-xs font-medium mb-1'
								style={{ color: 'var(--text-muted)' }}>
								{stat.label}
							</p>
							<p className='font-serif text-2xl font-semibold'>{stat.value}</p>
						</div>
					);
				})}
			</section>

			<section
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{
					background: 'var(--bg-card)',
					boxShadow: 'var(--shadow-sm)',
				}}>
				<div className='flex items-center justify-between px-6 py-4 border-b border-[var(--border)]'>
					<div>
						<h2 className='font-serif text-lg font-semibold'>Pesanan Terbaru</h2>
						<p
							className='text-xs mt-0.5'
							style={{ color: 'var(--text-muted)' }}>
							Pantau status pesanan masuk
						</p>
					</div>
					<Link
						href='/admin/orders'
						className='inline-flex items-center gap-1 text-sm font-medium cursor-pointer'
						style={{ color: 'var(--primary)' }}>
						Lihat semua
						<ArrowUpRight size={14} />
					</Link>
				</div>

				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead>
							<tr
								className='text-left text-xs uppercase tracking-wider'
								style={{
									background: 'rgba(157, 23, 77, 0.04)',
									color: 'var(--text-muted)',
								}}>
								<th className='px-6 py-3 font-semibold'>ID Pesanan</th>
								<th className='px-6 py-3 font-semibold'>Customer</th>
								<th className='px-6 py-3 font-semibold'>Produk</th>
								<th className='px-6 py-3 font-semibold'>Total</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
							</tr>
						</thead>
						<tbody>
							{recentOrders.map((order) => {
								const status = statusStyles[order.status];
								return (
									<tr
										key={order.id}
										className='border-t border-[var(--border)]'>
										<td
											className='px-6 py-4 font-mono font-semibold'
											style={{ color: 'var(--text)' }}>
											{order.id}
										</td>
										<td className='px-6 py-4'>{order.customer}</td>
										<td
											className='px-6 py-4'
											style={{ color: 'var(--text-secondary)' }}>
											{order.product}
										</td>
										<td
											className='px-6 py-4 font-semibold'
											style={{ color: 'var(--primary)' }}>
											{order.total}
										</td>
										<td className='px-6 py-4'>
											<span
												className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
												style={{
													background: status.bg,
													color: status.color,
												}}>
												{order.status}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
