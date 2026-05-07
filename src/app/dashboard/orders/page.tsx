import Image from 'next/image';
import Link from 'next/link';
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Package,
} from 'lucide-react';

type OrderStatus = 'Selesai' | 'Diproses' | 'Menunggu Pembayaran';

const orders: {
	id: string;
	date: string;
	product: string;
	image: string;
	address: string;
	total: string;
	status: OrderStatus;
}[] = [
	{
		id: 'DF-2026-0042',
		date: '03 Mei 2026',
		product: 'Papan Bunga Wedding',
		image: '/product/papan-bunga-5.PNG',
		address: 'Jl. Melati No. 12, Ampar Putih, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0041',
		date: '28 April 2026',
		product: 'Dekorasi Mobil Pengantin',
		image: '/product/mobil-pengantin-1.PNG',
		address: 'Jl. Anggrek No. 5, Simpang Empat, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Diproses',
	},
	{
		id: 'DF-2026-0039',
		date: '15 April 2026',
		product: 'Papan Bunga Premium',
		image: '/product/papan-bunga-3.PNG',
		address: 'Jl. Mawar No. 8, Ampar Putih, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Menunggu Pembayaran',
	},
	{
		id: 'DF-2026-0035',
		date: '02 April 2026',
		product: 'Papan Bunga Ucapan',
		image: '/product/papan-bunga-4.PNG',
		address: 'Jl. Kenanga No. 21, Simpang Tiga, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0031',
		date: '20 Maret 2026',
		product: 'Papan Bunga Wedding',
		image: '/product/papan-bunga-5.PNG',
		address: 'Jl. Dahlia No. 14, Kinali, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0028',
		date: '12 Maret 2026',
		product: 'Papan Bunga Premium',
		image: '/product/papan-bunga-3.PNG',
		address: 'Jl. Cempaka No. 3, Sasak Ranah Pasisie, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0024',
		date: '05 Maret 2026',
		product: 'Papan Bunga Ucapan',
		image: '/product/papan-bunga-4.PNG',
		address: 'Jl. Flamboyan No. 17, Talamau, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0019',
		date: '18 Februari 2026',
		product: 'Dekorasi Mobil Pengantin',
		image: '/product/mobil-pengantin-1.PNG',
		address: 'Jl. Bougenville No. 9, Pasaman, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0015',
		date: '08 Februari 2026',
		product: 'Papan Bunga Wedding',
		image: '/product/papan-bunga-5.PNG',
		address: 'Jl. Teratai No. 22, Lembah Melintang, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0011',
		date: '25 Januari 2026',
		product: 'Papan Bunga Premium',
		image: '/product/papan-bunga-3.PNG',
		address: 'Jl. Kamboja No. 6, Gunung Tuleh, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0008',
		date: '14 Januari 2026',
		product: 'Papan Bunga Ucapan',
		image: '/product/papan-bunga-4.PNG',
		address: 'Jl. Sakura No. 4, Sungai Beremas, Pasaman Barat',
		total: 'Rp 350.000',
		status: 'Selesai',
	},
	{
		id: 'DF-2026-0003',
		date: '02 Januari 2026',
		product: 'Dekorasi Mobil Pengantin',
		image: '/product/mobil-pengantin-1.PNG',
		address: 'Jl. Asoka No. 11, Koto Balingka, Pasaman Barat',
		total: 'Rp 500.000',
		status: 'Selesai',
	},
];

const statusStyles: Record<OrderStatus, { bg: string; color: string }> = {
	Selesai: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	Diproses: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	'Menunggu Pembayaran': {
		bg: 'rgba(234, 179, 8, 0.15)',
		color: '#a16207',
	},
};

const PAGE_SIZE = 5;

type SearchParams = Promise<{ page?: string }>;

export default async function OrdersPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { page } = await searchParams;
	const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
	const parsed = Number.parseInt(page ?? '1', 10);
	const currentPage =
		Number.isFinite(parsed) && parsed >= 1 && parsed <= totalPages
			? parsed
			: 1;

	const start = (currentPage - 1) * PAGE_SIZE;
	const visible = orders.slice(start, start + PAGE_SIZE);
	const rangeFrom = start + 1;
	const rangeTo = start + visible.length;

	return (
		<section>
			<div className='flex items-center justify-between mb-5'>
				<h2 className='font-serif text-xl font-semibold'>Riwayat Pesanan</h2>
				<span
					className='text-xs font-medium'
					style={{ color: 'var(--text-secondary)' }}>
					{orders.length} pesanan
				</span>
			</div>

			<div className='space-y-4'>
				{visible.map((order) => {
					const status = statusStyles[order.status];
					return (
						<div
							key={order.id}
							className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
							style={{ boxShadow: 'var(--shadow-sm)' }}>
							<div
								className='flex items-center justify-between px-5 py-3 border-b border-[var(--border)] text-xs'
								style={{ background: 'rgba(157, 23, 77, 0.04)' }}>
								<div className='flex items-center gap-2'>
									<Package
										size={14}
										style={{ color: 'var(--primary)' }}
									/>
									<span
										className='font-mono font-semibold'
										style={{ color: 'var(--text)' }}>
										{order.id}
									</span>
									<span style={{ color: 'var(--text-muted)' }}>•</span>
									<span
										className='inline-flex items-center gap-1'
										style={{ color: 'var(--text-secondary)' }}>
										<CalendarDays size={12} />
										{order.date}
									</span>
								</div>
								<span
									className='inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold'
									style={{ background: status.bg, color: status.color }}>
									{order.status}
								</span>
							</div>

							<div className='p-5 flex flex-col sm:flex-row gap-4'>
								<div className='relative w-full sm:w-32 aspect-4/3 rounded-xl overflow-hidden border border-[var(--border)] shrink-0'>
									<Image
										src={order.image}
										alt={order.product}
										fill
										className='object-cover'
										sizes='(max-width: 640px) 100vw, 128px'
									/>
								</div>
								<div className='flex-1 flex flex-col justify-between gap-2'>
									<div>
										<h3 className='font-serif text-base font-semibold mb-1'>
											{order.product}
										</h3>
										<p
											className='inline-flex items-start gap-1.5 text-xs'
											style={{ color: 'var(--text-secondary)' }}>
											<MapPin
												size={12}
												className='mt-0.5 shrink-0'
											/>
											{order.address}
										</p>
									</div>
									<div className='flex items-center justify-between pt-3 border-t border-[var(--border)]'>
										<span
											className='text-xs'
											style={{ color: 'var(--text-secondary)' }}>
											Total
										</span>
										<span
											className='font-semibold text-sm'
											style={{ color: 'var(--primary)' }}>
											{order.total}
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				rangeFrom={rangeFrom}
				rangeTo={rangeTo}
				totalCount={orders.length}
			/>
		</section>
	);
}

function Pagination({
	currentPage,
	totalPages,
	rangeFrom,
	rangeTo,
	totalCount,
}: {
	currentPage: number;
	totalPages: number;
	rangeFrom: number;
	rangeTo: number;
	totalCount: number;
}) {
	if (totalPages <= 1) return null;

	const pageHref = (n: number) =>
		n === 1 ? '/dashboard/orders' : `/dashboard/orders?page=${n}`;

	return (
		<div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
			<p
				className='text-xs'
				style={{ color: 'var(--text-secondary)' }}>
				Menampilkan{' '}
				<span className='font-semibold' style={{ color: 'var(--text)' }}>
					{rangeFrom}–{rangeTo}
				</span>{' '}
				dari{' '}
				<span className='font-semibold' style={{ color: 'var(--text)' }}>
					{totalCount}
				</span>{' '}
				pesanan
			</p>

			<nav
				aria-label='Pagination'
				className='inline-flex items-center gap-1'>
				<PageLink
					href={currentPage > 1 ? pageHref(currentPage - 1) : null}
					ariaLabel='Halaman sebelumnya'>
					<ChevronLeft size={14} />
				</PageLink>

				{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
					<PageLink
						key={n}
						href={n === currentPage ? null : pageHref(n)}
						active={n === currentPage}>
						{n}
					</PageLink>
				))}

				<PageLink
					href={currentPage < totalPages ? pageHref(currentPage + 1) : null}
					ariaLabel='Halaman berikutnya'>
					<ChevronRight size={14} />
				</PageLink>
			</nav>
		</div>
	);
}

function PageLink({
	href,
	active,
	ariaLabel,
	children,
}: {
	href: string | null;
	active?: boolean;
	ariaLabel?: string;
	children: React.ReactNode;
}) {
	const baseClass =
		'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-sm font-medium border transition-colors';

	if (!href) {
		return (
			<span
				aria-current={active ? 'page' : undefined}
				aria-label={ariaLabel}
				className={`${baseClass} cursor-not-allowed`}
				style={{
					background: active ? 'var(--primary)' : 'transparent',
					color: active ? 'white' : 'var(--text-muted)',
					borderColor: active ? 'var(--primary)' : 'var(--border)',
					opacity: active ? 1 : 0.5,
				}}>
				{children}
			</span>
		);
	}

	return (
		<Link
			href={href}
			aria-label={ariaLabel}
			className={`${baseClass} cursor-pointer hover:border-[var(--primary)]`}
			style={{
				color: 'var(--text-secondary)',
				borderColor: 'var(--border)',
			}}>
			{children}
		</Link>
	);
}
