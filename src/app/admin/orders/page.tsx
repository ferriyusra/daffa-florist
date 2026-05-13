import { Eye, Filter, Search } from 'lucide-react';

type OrderStatus =
	| 'Selesai'
	| 'Dikirim'
	| 'Diproses'
	| 'Menunggu Pembayaran'
	| 'Dibatalkan';

const orders: {
	id: string;
	date: string;
	customer: string;
	product: string;
	area: string;
	total: string;
	status: OrderStatus;
}[] = [
	{
		id: 'DF-2026-0042',
		date: '07 Mei 2026',
		customer: 'Ibu Ratna',
		product: 'Papan Bunga Wedding',
		area: 'Ampar Putih',
		total: 'Rp 350.000',
		status: 'Diproses',
	},
	{
		id: 'DF-2026-0041',
		date: '07 Mei 2026',
		customer: 'Pak Hendra',
		product: 'Dekorasi Mobil Pengantin',
		area: 'Simpang Empat',
		total: 'Rp 500.000',
		status: 'Menunggu Pembayaran',
	},
	{
		id: 'DF-2026-0040',
		date: '06 Mei 2026',
		customer: 'Ibu Sari',
		product: 'Papan Bunga Duka Cita',
		area: 'Kinali',
		total: 'Rp 350.000',
		status: 'Dikirim',
	},
	{
		id: 'DF-2026-0039',
		date: '05 Mei 2026',
		customer: 'Pak Budi',
		product: 'Papan Bunga Premium',
		area: 'Talamau',
		total: 'Rp 500.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0038',
		date: '05 Mei 2026',
		customer: 'Ibu Lina',
		product: 'Papan Bunga Ucapan',
		area: 'Pasaman',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0037',
		date: '04 Mei 2026',
		customer: 'Pak Roni',
		product: 'Papan Bunga Wedding',
		area: 'Lembah Melintang',
		total: 'Rp 350.000',
		status: 'Dibatalkan',
	},
];

const statusStyles: Record<OrderStatus, { bg: string; color: string }> = {
	Selesai: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	Dikirim: { bg: 'rgba(168, 85, 247, 0.12)', color: '#7c3aed' },
	Diproses: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	'Menunggu Pembayaran': {
		bg: 'rgba(234, 179, 8, 0.15)',
		color: '#a16207',
	},
	Dibatalkan: { bg: 'rgba(194, 45, 45, 0.12)', color: 'var(--destructive)' },
};

const filterTabs: { label: string; count: number }[] = [
	{ label: 'Semua', count: orders.length },
	{
		label: 'Menunggu Pembayaran',
		count: orders.filter((o) => o.status === 'Menunggu Pembayaran').length,
	},
	{
		label: 'Diproses',
		count: orders.filter((o) => o.status === 'Diproses').length,
	},
	{
		label: 'Dikirim',
		count: orders.filter((o) => o.status === 'Dikirim').length,
	},
	{
		label: 'Selesai',
		count: orders.filter((o) => o.status === 'Selesai').length,
	},
];

export default function AdminOrdersPage() {
	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div className='flex items-center gap-2 flex-1 max-w-md'>
					<div
						className='flex items-center gap-2 flex-1 px-3.5 h-10 rounded-xl border border-[var(--border)]'
						style={{ background: 'var(--bg-card)' }}>
						<Search size={15} style={{ color: 'var(--text-muted)' }} />
						<input
							type='search'
							placeholder='Cari ID atau nama customer...'
							className='flex-1 bg-transparent text-sm outline-none'
						/>
					</div>
					<button
						type='button'
						className='inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[var(--border)] text-sm font-medium cursor-pointer'
						style={{
							background: 'var(--bg-card)',
							color: 'var(--text-secondary)',
						}}>
						<Filter size={14} />
						Filter
					</button>
				</div>
			</div>

			<div className='flex gap-2 flex-wrap'>
				{filterTabs.map((tab, i) => (
					<button
						type='button'
						key={tab.label}
						className='inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-xs font-semibold cursor-pointer transition-colors border'
						style={{
							background: i === 0 ? 'var(--primary)' : 'transparent',
							color: i === 0 ? 'white' : 'var(--text-secondary)',
							borderColor: i === 0 ? 'var(--primary)' : 'var(--border)',
						}}>
						{tab.label}
						<span
							className='inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold'
							style={{
								background:
									i === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(157, 23, 77, 0.1)',
								color: i === 0 ? 'white' : 'var(--primary)',
							}}>
							{tab.count}
						</span>
					</button>
				))}
			</div>

			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{
					background: 'var(--bg-card)',
					boxShadow: 'var(--shadow-sm)',
				}}>
				<div className='overflow-x-auto'>
					<table className='w-full text-sm'>
						<thead>
							<tr
								className='text-left text-xs uppercase tracking-wider'
								style={{
									background: 'rgba(157, 23, 77, 0.04)',
									color: 'var(--text-muted)',
								}}>
								<th className='px-6 py-3 font-semibold'>ID</th>
								<th className='px-6 py-3 font-semibold'>Tanggal</th>
								<th className='px-6 py-3 font-semibold'>Customer</th>
								<th className='px-6 py-3 font-semibold'>Produk</th>
								<th className='px-6 py-3 font-semibold'>Area</th>
								<th className='px-6 py-3 font-semibold'>Total</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => {
								const style = statusStyles[order.status];
								return (
									<tr
										key={order.id}
										className='border-t border-[var(--border)]'>
										<td
											className='px-6 py-4 font-mono font-semibold whitespace-nowrap'
											style={{ color: 'var(--text)' }}>
											{order.id}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap'
											style={{ color: 'var(--text-secondary)' }}>
											{order.date}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											{order.customer}
										</td>
										<td
											className='px-6 py-4'
											style={{ color: 'var(--text-secondary)' }}>
											{order.product}
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap'
											style={{ color: 'var(--text-secondary)' }}>
											{order.area}
										</td>
										<td
											className='px-6 py-4 font-semibold whitespace-nowrap'
											style={{ color: 'var(--primary)' }}>
											{order.total}
										</td>
										<td className='px-6 py-4'>
											<span
												className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap'
												style={{ background: style.bg, color: style.color }}>
												{order.status}
											</span>
										</td>
										<td className='px-6 py-4 text-right'>
											<button
												type='button'
												className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
												style={{ color: 'var(--text-secondary)' }}>
												<Eye size={12} />
												Detail
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
