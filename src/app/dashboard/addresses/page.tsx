import { Home, Briefcase, Phone, Star, Plus } from 'lucide-react';

const addresses: {
	id: string;
	label: string;
	icon: typeof Home;
	recipient: string;
	phone: string;
	full: string;
	isDefault: boolean;
}[] = [
	{
		id: 'addr-1',
		label: 'Rumah',
		icon: Home,
		recipient: 'Pengguna Demo',
		phone: '0852-7432-0917',
		full: 'Jl. Melati No. 12, RT 02 / RW 03, Ampar Putih, Pasaman Barat, Sumatera Barat 26566',
		isDefault: true,
	},
	{
		id: 'addr-2',
		label: 'Kantor',
		icon: Briefcase,
		recipient: 'Pengguna Demo',
		phone: '0852-7432-0918',
		full: 'Komplek Perkantoran Pasaman Indah Blok C-7, Simpang Empat, Pasaman Barat, Sumatera Barat 26566',
		isDefault: false,
	},
	{
		id: 'addr-3',
		label: 'Rumah Orang Tua',
		icon: Home,
		recipient: 'Ibu Sari',
		phone: '0813-6789-1234',
		full: 'Jl. Anggrek No. 5, Simpang Tiga, Pasaman Barat, Sumatera Barat 26566',
		isDefault: false,
	},
];

export default function AddressesPage() {
	return (
		<section>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='font-serif text-xl font-semibold'>Daftar Alamat</h2>
				<button
					type='button'
					className='inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-[1.02] cursor-pointer'
					style={{ background: 'var(--primary)' }}>
					<Plus size={14} />
					Tambah Alamat
				</button>
			</div>

			<div className='grid sm:grid-cols-2 gap-4'>
				{addresses.map((addr) => {
					const Icon = addr.icon;
					return (
						<div
							key={addr.id}
							className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3'
							style={{ boxShadow: 'var(--shadow-sm)' }}>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div
										className='w-9 h-9 rounded-full flex items-center justify-center'
										style={{
											background: 'rgba(157, 23, 77, 0.08)',
											color: 'var(--primary)',
										}}>
										<Icon size={16} />
									</div>
									<span className='font-semibold text-sm'>{addr.label}</span>
								</div>
								{addr.isDefault && (
									<span
										className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold'
										style={{
											background: 'rgba(157, 23, 77, 0.1)',
											color: 'var(--primary)',
										}}>
										<Star size={10} />
										Utama
									</span>
								)}
							</div>

							<div className='space-y-1'>
								<p className='text-sm font-medium'>{addr.recipient}</p>
								<p
									className='inline-flex items-center gap-1.5 text-xs'
									style={{ color: 'var(--text-secondary)' }}>
									<Phone size={12} />
									{addr.phone}
								</p>
							</div>

							<p
								className='text-sm leading-relaxed'
								style={{ color: 'var(--text-secondary)' }}>
								{addr.full}
							</p>

							<div className='flex gap-2 pt-3 border-t border-[var(--border)] mt-auto'>
								<button
									type='button'
									className='flex-1 px-3 py-2 rounded-full text-xs font-medium border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer'>
									Ubah
								</button>
								{!addr.isDefault && (
									<button
										type='button'
										className='flex-1 px-3 py-2 rounded-full text-xs font-medium border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer'
										style={{ color: 'var(--primary)' }}>
										Jadikan Utama
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
