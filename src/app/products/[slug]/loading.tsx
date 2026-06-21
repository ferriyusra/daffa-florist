import {
	Footer,
	Navbar,
	ProductGridSkeleton,
	SkeletonBlock,
} from '@/components';

export default function ProductDetailLoading() {
	return (
		<>
			<Navbar />
			<main className='floral-bg min-h-[70vh]'>
				<div className='mx-auto max-w-[1200px] px-6 py-12'>
					<SkeletonBlock className='mb-6 h-4 w-56' />

					<div className='grid gap-10 lg:grid-cols-2'>
						<div className='flex flex-col gap-4'>
							<SkeletonBlock className='aspect-4/3 w-full rounded-2xl' />
							<div className='grid grid-cols-4 gap-3'>
								{Array.from({ length: 4 }).map((_, i) => (
									<SkeletonBlock
										key={i}
										className='aspect-square w-full rounded-xl'
									/>
								))}
							</div>
						</div>

						<div className='flex flex-col gap-4'>
							<SkeletonBlock className='h-6 w-24 rounded-full' />
							<SkeletonBlock className='h-9 w-3/4' />
							<SkeletonBlock className='h-7 w-40' />
							<SkeletonBlock className='h-4 w-full' />
							<SkeletonBlock className='h-4 w-full' />
							<SkeletonBlock className='h-4 w-2/3' />
							<SkeletonBlock className='mt-2 h-12 w-full rounded-xl' />
							<SkeletonBlock className='h-12 w-full rounded-xl' />
							<SkeletonBlock className='mt-2 h-14 w-full rounded-full' />
						</div>
					</div>

					<div className='mt-16'>
						<SkeletonBlock className='mb-6 h-7 w-48' />
						<ProductGridSkeleton count={3} />
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
