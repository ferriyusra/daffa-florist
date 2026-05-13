'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
	BarChart3,
	Bell,
	ClipboardList,
	Flower2,
	ImagePlus,
	LayoutDashboard,
	LogOut,
	Map,
	Menu,
	Package,
	Tag,
	Users,
	X,
} from 'lucide-react';
import { useAuth } from '@/hooks';

const navGroups = [
	{
		title: 'Ringkasan',
		items: [
			{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
		],
	},
	{
		title: 'Operasional',
		items: [
			{ label: 'Manage Order', href: '/admin/orders', icon: ClipboardList },
			{ label: 'Manage Produk', href: '/admin/products', icon: Package },
			{ label: 'Manage Customer', href: '/admin/customers', icon: Users },
			{
				label: 'Area Pengiriman',
				href: '/admin/delivery-areas',
				icon: Map,
			},
			{ label: 'Manage Promo', href: '/admin/promos', icon: Tag },
		],
	},
	{
		title: 'Konten & Laporan',
		items: [
			{
				label: 'Upload Foto Hasil Jadi',
				href: '/admin/gallery',
				icon: ImagePlus,
			},
			{
				label: 'Laporan Penjualan',
				href: '/admin/reports',
				icon: BarChart3,
			},
		],
	},
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isLoading, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace('/login?redirect=/admin');
		}
	}, [isLoading, user, router]);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	if (isLoading || !user) {
		return <div className='min-h-screen' style={{ background: 'var(--bg)' }} />;
	}

	const activeLabel = (() => {
		for (const group of navGroups) {
			for (const item of group.items) {
				if (item.href === pathname) return item.label;
				if (item.href !== '/admin' && pathname.startsWith(item.href)) {
					return item.label;
				}
			}
		}
		return 'Dashboard';
	})();

	return (
		<div className='min-h-screen flex' style={{ background: 'var(--bg)' }}>
			<Sidebar
				pathname={pathname}
				onClose={() => setMobileOpen(false)}
				mobileOpen={mobileOpen}
				onLogout={() => {
					logout();
					router.replace('/login');
				}}
				userName={user.name}
				userEmail={user.email}
			/>

			<div className='flex-1 flex flex-col min-w-0 lg:ml-72'>
				<header
					className='sticky top-0 z-30 border-b border-[var(--border)] backdrop-blur-md'
					style={{ background: 'rgba(245, 235, 228, 0.85)' }}>
					<div className='flex items-center gap-3 px-5 sm:px-8 h-16'>
						<button
							type='button'
							onClick={() => setMobileOpen(true)}
							className='lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer'
							style={{ color: 'var(--text-secondary)' }}
							aria-label='Buka menu'>
							<Menu size={18} />
						</button>

						<div className='flex-1 min-w-0'>
							<p
								className='text-[11px] font-semibold uppercase tracking-wider'
								style={{ color: 'var(--text-muted)' }}>
								Admin Panel
							</p>
							<h1 className='font-serif text-lg sm:text-xl font-semibold truncate'>
								{activeLabel}
							</h1>
						</div>

						<button
							type='button'
							className='inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] cursor-pointer'
							style={{ color: 'var(--text-secondary)' }}
							aria-label='Notifikasi'>
							<Bell size={16} />
						</button>
					</div>
				</header>

				<main className='flex-1 px-5 sm:px-8 py-8'>{children}</main>
			</div>

			{mobileOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/40 lg:hidden'
					onClick={() => setMobileOpen(false)}
					aria-hidden
				/>
			)}
		</div>
	);
}

function Sidebar({
	pathname,
	mobileOpen,
	onClose,
	onLogout,
	userName,
	userEmail,
}: {
	pathname: string;
	mobileOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
	userName: string;
	userEmail: string;
}) {
	return (
		<aside
			className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border)] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
				mobileOpen ? 'translate-x-0' : '-translate-x-full'
			}`}
			style={{ background: 'var(--bg-card)' }}>
			<div className='flex items-center justify-between px-5 h-16 border-b border-[var(--border)]'>
				<Link
					href='/admin'
					className='inline-flex items-center gap-2 cursor-pointer'>
					<span
						className='inline-flex items-center justify-center w-9 h-9 rounded-xl'
						style={{ background: 'var(--primary)', color: 'white' }}>
						<Flower2 size={18} />
					</span>
					<span className='leading-tight'>
						<span
							className='block font-serif text-base font-semibold'
							style={{ color: 'var(--text)' }}>
							Daffa Florist
						</span>
						<span
							className='block text-[11px] font-medium uppercase tracking-wider'
							style={{ color: 'var(--text-muted)' }}>
							Admin
						</span>
					</span>
				</Link>
				<button
					type='button'
					onClick={onClose}
					className='lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer'
					style={{ color: 'var(--text-secondary)' }}
					aria-label='Tutup menu'>
					<X size={18} />
				</button>
			</div>

			<nav className='flex-1 overflow-y-auto px-3 py-5'>
				{navGroups.map((group) => (
					<div key={group.title} className='mb-5'>
						<p
							className='px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider'
							style={{ color: 'var(--text-muted)' }}>
							{group.title}
						</p>
						<ul className='space-y-1'>
							{group.items.map((item) => {
								const Icon = item.icon;
								const active =
									item.href === '/admin'
										? pathname === '/admin'
										: pathname === item.href ||
										  pathname.startsWith(`${item.href}/`);
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer'
											style={{
												background: active
													? 'rgba(157, 23, 77, 0.1)'
													: 'transparent',
												color: active
													? 'var(--primary)'
													: 'var(--text-secondary)',
											}}>
											<Icon size={16} />
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>

			<div className='border-t border-[var(--border)] p-4'>
				<div className='flex items-center gap-3 mb-3'>
					<span
						className='inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold'
						style={{
							background: 'rgba(157, 23, 77, 0.12)',
							color: 'var(--primary)',
						}}>
						{userName.slice(0, 1).toUpperCase()}
					</span>
					<div className='min-w-0'>
						<p
							className='text-sm font-semibold truncate'
							style={{ color: 'var(--text)' }}>
							{userName}
						</p>
						<p
							className='text-xs truncate'
							style={{ color: 'var(--text-muted)' }}>
							{userEmail}
						</p>
					</div>
				</div>
				<button
					type='button'
					onClick={onLogout}
					className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--primary)]'
					style={{ color: 'var(--text-secondary)' }}>
					<LogOut size={14} />
					Keluar
				</button>
			</div>
		</aside>
	);
}
