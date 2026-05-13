import {
	ArrowDownRight,
	ArrowUpRight,
	Download,
	ShoppingBag,
	TrendingUp,
	Users,
	Wallet,
} from 'lucide-react';

const summary = [
	{
		label: 'Total Pendapatan',
		value: 'Rp 24.500.000',
		change: '+8.2%',
		positive: true,
		icon: Wallet,
	},
	{
		label: 'Total Pesanan',
		value: '76',
		change: '+12.1%',
		positive: true,
		icon: ShoppingBag,
	},
	{
		label: 'Rata-rata Order',
		value: 'Rp 322.000',
		change: '-2.4%',
		positive: false,
		icon: TrendingUp,
	},
	{
		label: 'Customer Baru',
		value: '34',
		change: '+18',
		positive: true,
		icon: Users,
	},
];

const monthly = [
	{ month: 'Jan', revenue: 12_500_000 },
	{ month: 'Feb', revenue: 14_200_000 },
	{ month: 'Mar', revenue: 18_800_000 },
	{ month: 'Apr', revenue: 22_650_000 },
	{ month: 'Mei', revenue: 24_500_000 },
];

const topProducts = [
	{
		name: 'Papan Bunga Wedding Klasik',
		sold: 24,
		revenue: 'Rp 8.400.000',
		share: 34,
	},
	{
		name: 'Papan Bunga Premium',
		sold: 18,
		revenue: 'Rp 9.000.000',
		share: 24,
	},
	{
		name: 'Papan Bunga Ucapan',
		sold: 14,
		revenue: 'Rp 4.900.000',
		share: 18,
	},
	{
		name: 'Dekorasi Mobil Pengantin',
		sold: 12,
		revenue: 'Rp 6.000.000',
		share: 16,
	},
	{
		name: 'Papan Bunga Duka Cita',
		sold: 8,
		revenue: 'Rp 2.800.000',
		share: 8,
	},
];

const formatRupiahShort = (n: number) => `Rp ${(n / 1_000_000).toFixed(1)} Jt`;

export default function AdminReportsPage() {
	const maxRevenue = Math.max(...monthly.map((m) => m.revenue));

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div>
					<p
						className='text-xs font-semibold uppercase tracking-wider mb-1'
						style={{ color: 'var(--text-muted)' }}>
						Periode
					</p>
					<p className='text-sm font-semibold'>1 – 31 Mei 2026</p>
				</div>
				<div className='flex items-center gap-2'>
					<select
						className='h-10 px-3.5 rounded-xl border border-[var(--border)] text-sm font-medium cursor-pointer outline-none'
						style={{ background: 'var(--bg-card)' }}
						defaultValue='month'>
						<option value='week'>Minggu Ini</option>
						<option value='month'>Bulan Ini</option>
						<option value='quarter'>Kuartal Ini</option>
						<option value='year'>Tahun Ini</option>
					</select>
					<button
						type='button'
						className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
						style={{ background: 'var(--primary)', color: 'white' }}>
						<Download size={14} />
						Export
					</button>
				</div>
			</div>

			<section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
				{summary.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.label}
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
									className='inline-flex items-center gap-0.5 text-xs font-semibold'
									style={{
										color: item.positive ? '#16a34a' : 'var(--destructive)',
									}}>
									{item.positive ? (
										<ArrowUpRight size={12} />
									) : (
										<ArrowDownRight size={12} />
									)}
									{item.change}
								</span>
							</div>
							<p
								className='text-xs font-medium mb-1'
								style={{ color: 'var(--text-muted)' }}>
								{item.label}
							</p>
							<p className='font-serif text-2xl font-semibold'>{item.value}</p>
						</div>
					);
				})}
			</section>

			<div className='grid grid-cols-1 xl:grid-cols-3 gap-5'>
				<section
					className='xl:col-span-2 rounded-2xl border border-[var(--border)] p-6 flex flex-col'
					style={{
						background: 'var(--bg-card)',
						boxShadow: 'var(--shadow-sm)',
					}}>
					<div className='flex items-start justify-between mb-6'>
						<div>
							<h2 className='font-serif text-lg font-semibold'>
								Tren Pendapatan
							</h2>
							<p
								className='text-xs mt-0.5'
								style={{ color: 'var(--text-muted)' }}>
								5 bulan terakhir
							</p>
						</div>
						<div className='text-right'>
							<p
								className='text-[10px] font-semibold uppercase tracking-wider'
								style={{ color: 'var(--text-muted)' }}>
								Puncak
							</p>
							<p
								className='text-sm font-semibold tabular-nums'
								style={{ color: 'var(--primary)' }}>
								{formatRupiahShort(maxRevenue)}
							</p>
						</div>
					</div>

					<div className='flex-1 flex flex-col min-h-[280px]'>
						<div className='relative flex-1 flex'>
							<div
								className='flex flex-col justify-between pr-3 py-1 text-[10px] font-medium tabular-nums text-right'
								style={{ color: 'var(--text-muted)' }}>
								<span>{formatRupiahShort(maxRevenue)}</span>
								<span>{formatRupiahShort(maxRevenue * 0.75)}</span>
								<span>{formatRupiahShort(maxRevenue * 0.5)}</span>
								<span>{formatRupiahShort(maxRevenue * 0.25)}</span>
								<span>Rp 0</span>
							</div>
							<div className='relative flex-1'>
								<div className='absolute inset-0 flex flex-col justify-between pointer-events-none'>
									{[0, 1, 2, 3, 4].map((i) => (
										<div
											key={`grid-${i}`}
											className='w-full border-t'
											style={{ borderColor: 'var(--border)', opacity: 0.6 }}
										/>
									))}
								</div>
								<div className='relative h-full flex items-end gap-3 sm:gap-5 px-1'>
									{monthly.map((m) => {
										const heightPct = (m.revenue / maxRevenue) * 100;
										const isPeak = m.revenue === maxRevenue;
										return (
											<div
												key={`bar-${m.month}`}
												className='group flex-1 h-full flex flex-col justify-end items-center'>
												<span
													className='text-[10px] font-semibold tabular-nums whitespace-nowrap mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
													style={{ color: 'var(--text-secondary)' }}>
													{formatRupiahShort(m.revenue)}
												</span>
												<div
													className='w-full rounded-t-md transition-all duration-300 hover:opacity-90'
													style={{
														height: `${heightPct}%`,
														background: isPeak
															? 'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)'
															: 'linear-gradient(180deg, var(--primary-light) 0%, var(--primary) 100%)',
														minHeight: '8px',
													}}
													title={`${m.month}: ${formatRupiahShort(m.revenue)}`}
												/>
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<div className='flex gap-3 sm:gap-5 mt-3 pt-3 border-t border-[var(--border)] pl-[68px]'>
							{monthly.map((m) => (
								<span
									key={`label-${m.month}`}
									className='flex-1 text-center text-xs font-semibold'
									style={{ color: 'var(--text-secondary)' }}>
									{m.month}
								</span>
							))}
						</div>
					</div>
				</section>

				<section
					className='rounded-2xl border border-[var(--border)] p-6 flex flex-col'
					style={{
						background: 'var(--bg-card)',
						boxShadow: 'var(--shadow-sm)',
					}}>
					<div className='flex items-start justify-between mb-5'>
						<div>
							<h2 className='font-serif text-lg font-semibold'>
								Produk Terlaris
							</h2>
							<p
								className='text-xs mt-0.5'
								style={{ color: 'var(--text-muted)' }}>
								Berdasarkan jumlah pesanan
							</p>
						</div>
					</div>

					<ul className='flex-1 flex flex-col gap-3'>
						{topProducts.map((p, i) => (
							<li
								key={p.name}
								className='rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-[var(--bg-surface)]'>
								<div className='flex items-center gap-3'>
									<span
										className='inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0'
										style={{
											background:
												i === 0
													? 'var(--primary)'
													: 'rgba(157, 23, 77, 0.08)',
											color: i === 0 ? 'white' : 'var(--primary)',
										}}>
										{i + 1}
									</span>
									<div className='flex-1 min-w-0'>
										<div className='flex items-baseline justify-between gap-2 mb-1'>
											<p className='text-sm font-semibold truncate'>
												{p.name}
											</p>
											<p
												className='text-sm font-semibold tabular-nums whitespace-nowrap'
												style={{ color: 'var(--primary)' }}>
												{p.revenue}
											</p>
										</div>
										<div className='flex items-center gap-2.5'>
											<div
												className='flex-1 h-1.5 rounded-full overflow-hidden'
												style={{ background: 'var(--bg-surface)' }}>
												<div
													className='h-full rounded-full transition-all duration-300'
													style={{
														width: `${p.share}%`,
														background:
															i === 0
																? 'var(--primary)'
																: 'var(--primary-light)',
													}}
												/>
											</div>
											<span
												className='text-[11px] font-semibold tabular-nums whitespace-nowrap'
												style={{ color: 'var(--text-muted)' }}>
												{p.sold} pesanan
											</span>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
