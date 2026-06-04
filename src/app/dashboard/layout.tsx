'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, MapPin } from 'lucide-react';
import { Footer, Navbar } from '@/components';
import { useAuth } from '@/hooks';

const tabs = [
	{ label: 'Pesanan Saya', href: '/dashboard/orders', icon: Package },
	{ label: 'Alamat Saya', href: '/dashboard/addresses', icon: MapPin },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isLoading) return;
		if (!user) {
			router.replace('/login');
		} else if (user.role === 'ADMIN') {
			router.replace('/admin'); // dashboard khusus customer
		}
	}, [isLoading, user, router]);

	if (isLoading || !user || user.role === 'ADMIN') {
		return (
			<>
				<Navbar />
				<main className='floral-bg min-h-[60vh]' />
				<Footer />
			</>
		);
	}

	return (
		<>
			<Navbar />
			<main className='floral-bg min-h-[70vh]'>
				<div className='mx-auto max-w-[1100px] px-6 py-12'>
					<div className='mb-8'>
						<span
							className='inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3'
							style={{
								background: 'rgba(157, 23, 77, 0.08)',
								color: 'var(--primary)',
							}}>
							Dashboard
						</span>
						<h1 className='font-serif text-3xl sm:text-4xl font-bold mb-2'>
							Halo, {user.name}
						</h1>
						<p
							className='text-sm sm:text-base'
							style={{ color: 'var(--text-secondary)' }}>
							Kelola pesanan dan alamat pengiriman Anda di sini.
						</p>
					</div>

					<nav className='flex gap-2 mb-6 border-b border-[var(--border)]'>
						{tabs.map((tab) => {
							const active = pathname === tab.href;
							const Icon = tab.icon;
							return (
								<Link
									key={tab.href}
									href={tab.href}
									className='inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors -mb-px border-b-2 cursor-pointer'
									style={{
										color: active
											? 'var(--primary)'
											: 'var(--text-secondary)',
										borderColor: active ? 'var(--primary)' : 'transparent',
									}}>
									<Icon size={16} />
									{tab.label}
								</Link>
							);
						})}
					</nav>

					{children}
				</div>
			</main>
			<Footer />
		</>
	);
}
