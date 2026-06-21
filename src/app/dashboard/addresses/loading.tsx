import { SkeletonBlock } from '@/components';

export default function AddressesLoading() {
	return (
		<section>
			<div className='mb-5 flex items-center justify-between'>
				<SkeletonBlock className='h-7 w-40' />
				<SkeletonBlock className='h-9 w-36 rounded-full' />
			</div>
			<div className='grid gap-4 sm:grid-cols-2'>
				{Array.from({ length: 4 }).map((_, i) => (
					<SkeletonBlock key={i} className='h-44 w-full rounded-2xl' />
				))}
			</div>
		</section>
	);
}
