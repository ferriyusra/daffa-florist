import { SkeletonBlock } from '@/components';

/**
 * Loading untuk area dashboard. DashboardLayout sudah merender Navbar/Footer
 * dan header tab, jadi skeleton ini hanya mengisi slot konten (children).
 */
export default function DashboardLoading() {
	return (
		<section>
			<div className='mb-5 flex items-center justify-between'>
				<SkeletonBlock className='h-7 w-40' />
				<SkeletonBlock className='h-4 w-20' />
			</div>
			<div className='space-y-4'>
				{Array.from({ length: 3 }).map((_, i) => (
					<SkeletonBlock key={i} className='h-40 w-full rounded-2xl' />
				))}
			</div>
		</section>
	);
}
