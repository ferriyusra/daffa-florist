import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

const areas = [
	{
		name: 'Ampar Putih',
		district: 'Pasaman Barat',
		fee: 'Rp 0',
		eta: '1–2 jam',
		active: true,
	},
	{
		name: 'Simpang Empat',
		district: 'Pasaman Barat',
		fee: 'Rp 25.000',
		eta: '1–2 jam',
		active: true,
	},
	{
		name: 'Kinali',
		district: 'Pasaman Barat',
		fee: 'Rp 35.000',
		eta: '2–3 jam',
		active: true,
	},
	{
		name: 'Talamau',
		district: 'Pasaman Barat',
		fee: 'Rp 40.000',
		eta: '2–3 jam',
		active: true,
	},
	{
		name: 'Pasaman',
		district: 'Pasaman Barat',
		fee: 'Rp 30.000',
		eta: '2 jam',
		active: true,
	},
	{
		name: 'Lembah Melintang',
		district: 'Pasaman Barat',
		fee: 'Rp 45.000',
		eta: '3 jam',
		active: true,
	},
	{
		name: 'Sasak Ranah Pasisie',
		district: 'Pasaman Barat',
		fee: 'Rp 50.000',
		eta: '3 jam',
		active: true,
	},
	{
		name: 'Gunung Tuleh',
		district: 'Pasaman Barat',
		fee: 'Rp 60.000',
		eta: '3–4 jam',
		active: false,
	},
	{
		name: 'Sungai Beremas',
		district: 'Pasaman Barat',
		fee: 'Rp 65.000',
		eta: '4 jam',
		active: false,
	},
	{
		name: 'Koto Balingka',
		district: 'Pasaman Barat',
		fee: 'Rp 55.000',
		eta: '3–4 jam',
		active: true,
	},
];

export default function AdminDeliveryAreasPage() {
	const activeCount = areas.filter((a) => a.active).length;

	return (
		<div className='space-y-5'>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
				<div className='flex items-center gap-2'>
					<span
						className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold'
						style={{
							background: 'rgba(61, 107, 79, 0.12)',
							color: 'var(--secondary)',
						}}>
						<MapPin size={12} />
						{activeCount} area aktif
					</span>
					<span
						className='text-xs'
						style={{ color: 'var(--text-muted)' }}>
						dari {areas.length} total area
					</span>
				</div>
				<button
					type='button'
					className='inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold cursor-pointer'
					style={{ background: 'var(--primary)', color: 'white' }}>
					<Plus size={15} />
					Tambah Area
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
								<th className='px-6 py-3 font-semibold'>Nama Area</th>
								<th className='px-6 py-3 font-semibold'>Kecamatan</th>
								<th className='px-6 py-3 font-semibold text-right'>
									Ongkir
								</th>
								<th className='px-6 py-3 font-semibold'>Estimasi</th>
								<th className='px-6 py-3 font-semibold'>Status</th>
								<th className='px-6 py-3 font-semibold text-right'>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{areas.map((area) => (
								<tr
									key={area.name}
									className='border-t border-[var(--border)]'>
									<td className='px-6 py-4 font-semibold'>
										<span className='inline-flex items-center gap-2'>
											<MapPin
												size={14}
												style={{ color: 'var(--primary)' }}
											/>
											{area.name}
										</span>
									</td>
									<td
										className='px-6 py-4 whitespace-nowrap'
										style={{ color: 'var(--text-secondary)' }}>
										{area.district}
									</td>
									<td
										className='px-6 py-4 text-right font-semibold whitespace-nowrap'
										style={{ color: 'var(--primary)' }}>
										{area.fee}
									</td>
									<td
										className='px-6 py-4 whitespace-nowrap'
										style={{ color: 'var(--text-secondary)' }}>
										{area.eta}
									</td>
									<td className='px-6 py-4'>
										<span
											className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
											style={{
												background: area.active
													? 'rgba(34, 197, 94, 0.12)'
													: 'rgba(140, 130, 121, 0.15)',
												color: area.active
													? '#16a34a'
													: 'var(--text-muted)',
											}}>
											{area.active ? 'Aktif' : 'Nonaktif'}
										</span>
									</td>
									<td className='px-6 py-4 text-right'>
										<div className='inline-flex gap-2'>
											<button
												type='button'
												className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
												style={{ color: 'var(--text-secondary)' }}
												aria-label='Edit area'>
												<Pencil size={12} />
											</button>
											<button
												type='button'
												className='inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer transition-colors'
												style={{ color: 'var(--destructive)' }}
												aria-label='Hapus area'>
												<Trash2 size={12} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
