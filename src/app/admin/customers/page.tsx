import { Mail, Phone, Search, UserPlus } from 'lucide-react';

const customers = [
	{
		name: 'Ibu Ratna Wulandari',
		email: 'ratna.w@gmail.com',
		phone: '+62 812-3456-7890',
		area: 'Ampar Putih',
		orders: 8,
		spent: 'Rp 2.800.000',
		lastOrder: '07 Mei 2026',
		tier: 'Loyal',
	},
	{
		name: 'Pak Hendra Setiawan',
		email: 'hendra.s@yahoo.com',
		phone: '+62 813-9876-5432',
		area: 'Simpang Empat',
		orders: 5,
		spent: 'Rp 2.100.000',
		lastOrder: '07 Mei 2026',
		tier: 'Loyal',
	},
	{
		name: 'Ibu Sari Lestari',
		email: 'sari.l@gmail.com',
		phone: '+62 821-1122-3344',
		area: 'Kinali',
		orders: 3,
		spent: 'Rp 1.250.000',
		lastOrder: '06 Mei 2026',
		tier: 'Reguler',
	},
	{
		name: 'Pak Budi Santoso',
		email: 'budi.s@gmail.com',
		phone: '+62 853-5566-7788',
		area: 'Talamau',
		orders: 12,
		spent: 'Rp 4.500.000',
		lastOrder: '05 Mei 2026',
		tier: 'VIP',
	},
	{
		name: 'Ibu Lina Marlina',
		email: 'lina.m@hotmail.com',
		phone: '+62 877-2233-4455',
		area: 'Pasaman',
		orders: 2,
		spent: 'Rp 700.000',
		lastOrder: '05 Mei 2026',
		tier: 'Baru',
	},
	{
		name: 'Pak Roni Hidayat',
		email: 'roni.h@gmail.com',
		phone: '+62 819-3344-5566',
		area: 'Lembah Melintang',
		orders: 1,
		spent: 'Rp 350.000',
		lastOrder: '04 Mei 2026',
		tier: 'Baru',
	},
];

const tierStyles: Record<string, { bg: string; color: string }> = {
	VIP: { bg: 'rgba(139, 105, 20, 0.15)', color: 'var(--accent)' },
	Loyal: { bg: 'rgba(157, 23, 77, 0.12)', color: 'var(--primary)' },
	Reguler: { bg: 'rgba(61, 107, 79, 0.12)', color: 'var(--secondary)' },
	Baru: { bg: 'rgba(140, 130, 121, 0.15)', color: 'var(--text-secondary)' },
};

export default function AdminCustomersPage() {
	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div
					className='flex items-center gap-2 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-[var(--border)]'
					style={{ background: 'var(--bg-card)' }}>
					<Search size={15} style={{ color: 'var(--text-muted)' }} />
					<input
						type='search'
						placeholder='Cari nama, email, atau nomor HP...'
						className='flex-1 bg-transparent text-sm outline-none'
					/>
				</div>
				<button
					type='button'
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<UserPlus size={15} />
					Tambah Customer
				</button>
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
								<th className='px-6 py-3 font-semibold'>Customer</th>
								<th className='px-6 py-3 font-semibold'>Kontak</th>
								<th className='px-6 py-3 font-semibold'>Area</th>
								<th className='px-6 py-3 font-semibold text-right'>Pesanan</th>
								<th className='px-6 py-3 font-semibold text-right'>
									Total Belanja
								</th>
								<th className='px-6 py-3 font-semibold'>Tier</th>
							</tr>
						</thead>
						<tbody>
							{customers.map((c) => {
								const tier = tierStyles[c.tier];
								return (
									<tr
										key={c.email}
										className='border-t border-[var(--border)]'>
										<td className='px-6 py-4'>
											<div className='flex items-center gap-3'>
												<span
													className='inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-xs'
													style={{
														background: 'rgba(157, 23, 77, 0.12)',
														color: 'var(--primary)',
													}}>
													{c.name
														.split(' ')
														.slice(0, 2)
														.map((p) => p[0])
														.join('')
														.toUpperCase()}
												</span>
												<div>
													<p className='font-semibold'>{c.name}</p>
													<p
														className='text-xs'
														style={{ color: 'var(--text-muted)' }}>
														Pesanan terakhir: {c.lastOrder}
													</p>
												</div>
											</div>
										</td>
										<td className='px-6 py-4'>
											<div
												className='flex flex-col gap-1 text-xs'
												style={{ color: 'var(--text-secondary)' }}>
												<span className='inline-flex items-center gap-1.5'>
													<Mail size={12} />
													{c.email}
												</span>
												<span className='inline-flex items-center gap-1.5'>
													<Phone size={12} />
													{c.phone}
												</span>
											</div>
										</td>
										<td
											className='px-6 py-4 whitespace-nowrap'
											style={{ color: 'var(--text-secondary)' }}>
											{c.area}
										</td>
										<td className='px-6 py-4 text-right font-semibold'>
											{c.orders}
										</td>
										<td
											className='px-6 py-4 text-right font-semibold whitespace-nowrap'
											style={{ color: 'var(--primary)' }}>
											{c.spent}
										</td>
										<td className='px-6 py-4'>
											<span
												className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
												style={{ background: tier.bg, color: tier.color }}>
												{c.tier}
											</span>
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
