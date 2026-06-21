import { Footer, Navbar, ProductGridSkeleton, SkeletonBlock } from '@/components';

export default function ProductsLoading() {
	return (
		<>
			<Navbar />
			<main className='floral-bg min-h-[70vh]'>
				<div className='mx-auto max-w-[1200px] px-6 py-12'>
					<div className='mb-8'>
						<SkeletonBlock className='mb-3 h-6 w-28 rounded-full' />
						<SkeletonBlock className='mb-2 h-9 w-64' />
						<SkeletonBlock className='h-4 w-80 max-w-full' />
					</div>

					<div className='mb-6 flex flex-col gap-3 sm:flex-row'>
						<SkeletonBlock className='h-12 flex-1 rounded-full' />
						<SkeletonBlock className='h-12 w-44 rounded-full' />
					</div>

					<div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
						<aside className='hidden lg:block'>
							<SkeletonBlock className='h-80 w-full rounded-2xl' />
						</aside>
						<ProductGridSkeleton count={6} />
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
