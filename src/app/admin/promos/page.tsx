import { CalendarDays, Pencil, Plus, Tag, Trash2 } from 'lucide-react';

const promos = [
	{
		code: 'WEDDING2026',
		name: 'Diskon Wedding Season',
		type: 'Persentase',
		value: '15%',
		minOrder: 'Rp 500.000',
		period: '01 – 31 Mei 2026',
		used: 24,
		quota: 100,
		status: 'Aktif',
	},
	{
		code: 'NEWCUSTOMER',
		name: 'Promo Pelanggan Baru',
		type: 'Nominal',
		value: 'Rp 50.000',
		minOrder: 'Rp 350.000',
		period: 'Berlaku terus',
		used: 87,
		quota: 0,
		status: 'Aktif',
	},
	{
		code: 'GRANDOPEN50',
		name: 'Grand Opening Special',
		type: 'Persentase',
		value: '10%',
		minOrder: 'Rp 700.000',
		period: '15 – 30 April 2026',
		used: 42,
		quota: 50,
		status: 'Berakhir',
	},
	{
		code: 'DUKA350',
		name: 'Solidaritas Duka Cita',
		type: 'Nominal',
		value: 'Rp 35.000',
		minOrder: 'Rp 350.000',
		period: 'Berlaku terus',
		used: 19,
		quota: 0,
		status: 'Aktif',
	},
	{
		code: 'PREMIUM20',
		name: 'Premium Diskon',
		type: 'Persentase',
		value: '20%',
		minOrder: 'Rp 1.000.000',
		period: '10 Mei – 10 Juni 2026',
		used: 0,
		quota: 30,
		status: 'Terjadwal',
	},
];

const statusStyles: Record<string, { bg: string; color: string }> = {
	Aktif: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	Terjadwal: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	Berakhir: { bg: 'rgba(140, 130, 121, 0.15)', color: 'var(--text-muted)' },
};

export default function AdminPromosPage() {
	const activeCount = promos.filter((p) => p.status === 'Aktif').length;

	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div className='flex items-center gap-2'>
					<span
						className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold'
						style={{
							background: 'rgba(157, 23, 77, 0.1)',
							color: 'var(--primary)',
						}}>
						<Tag size={12} />
						{activeCount} promo aktif
					</span>
					<span
						className='text-xs'
						style={{ color: 'var(--text-muted)' }}>
						dari {promos.length} total
					</span>
				</div>
				<button
					type='button'
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Promo
				</button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				{promos.map((promo) => {
					const style = statusStyles[promo.status];
					const usagePct =
						promo.quota === 0 ? 0 : Math.min(100, (promo.used / promo.quota) * 100);
					return (
						<div
							key={promo.code}
							className='rounded-2xl border border-[var(--border)] overflow-hidden'
							style={{
								background: 'var(--bg-card)',
								boxShadow: 'var(--shadow-sm)',
							}}>
							<div
								className='flex items-center justify-between px-5 py-3 border-b border-[var(--border)]'
								style={{ background: 'rgba(157, 23, 77, 0.04)' }}>
								<div className='flex items-center gap-2'>
									<Tag size={14} style={{ color: 'var(--primary)' }} />
									<span
										className='font-mono font-semibold text-sm'
										style={{ color: 'var(--text)' }}>
										{promo.code}
									</span>
								</div>
								<span
									className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
									style={{ background: style.bg, color: style.color }}>
									{promo.status}
								</span>
							</div>

							<div className='p-5 space-y-4'>
								<div>
									<h3 className='font-serif text-base font-semibold mb-1'>
										{promo.name}
									</h3>
									<p
										className='inline-flex items-center gap-1.5 text-xs'
										style={{ color: 'var(--text-secondary)' }}>
										<CalendarDays size={12} />
										{promo.period}
									</p>
								</div>

								<div className='grid grid-cols-3 gap-3 text-xs'>
									<div>
										<p style={{ color: 'var(--text-muted)' }}>Tipe</p>
										<p className='font-semibold mt-0.5'>{promo.type}</p>
									</div>
									<div>
										<p style={{ color: 'var(--text-muted)' }}>Nilai</p>
										<p
											className='font-semibold mt-0.5'
											style={{ color: 'var(--primary)' }}>
											{promo.value}
										</p>
									</div>
									<div>
										<p style={{ color: 'var(--text-muted)' }}>Min. Order</p>
										<p className='font-semibold mt-0.5'>{promo.minOrder}</p>
									</div>
								</div>

								<div>
									<div className='flex items-center justify-between text-xs mb-1.5'>
										<span style={{ color: 'var(--text-muted)' }}>
											Pemakaian
										</span>
										<span className='font-semibold'>
											{promo.used}
											{promo.quota > 0 ? ` / ${promo.quota}` : ' kali'}
										</span>
									</div>
									{promo.quota > 0 && (
										<div
											className='h-1.5 rounded-full overflow-hidden'
											style={{ background: 'var(--bg-surface)' }}>
											<div
												className='h-full'
												style={{
													width: `${usagePct}%`,
													background: 'var(--primary)',
												}}
											/>
										</div>
									)}
								</div>

								<div className='flex gap-2 pt-2 border-t border-[var(--border)]'>
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
										aria-label='Hapus promo'>
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
