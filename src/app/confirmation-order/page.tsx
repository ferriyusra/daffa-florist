import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Konfirmasi Pesanan',
	description: 'Halaman konfirmasi pesanan papan bunga Dafa Florist.',
	robots: { index: false, follow: false },
};

type SearchParams = Promise<{
	product?: string;
	price?: string;
	image?: string;
}>;

export default async function ConfirmationOrderPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { product, price, image } = await searchParams;

	const productName = product ?? 'Papan Bunga';
	const productPrice = price ?? 'Hubungi kami';
	const productImage = image ?? '/product/papan-bunga-5.PNG';

	return (
		<main className='min-h-screen floral-bg'>
			<div className='mx-auto max-w-[800px] px-6 py-16'>
				<Link
					href='/'
					className='inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors'
					style={{ color: 'var(--primary)' }}>
					<ArrowLeft size={16} />
					Kembali ke Beranda
				</Link>

				<div
					className='bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden'
					style={{ boxShadow: 'var(--shadow-sm)' }}>
					<div
						className='px-6 py-8 text-center border-b border-[var(--border)]'
						style={{ background: 'rgba(157, 23, 77, 0.05)' }}>
						<div
							className='mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4'
							style={{ background: 'rgba(157, 23, 77, 0.1)' }}>
							<CheckCircle2
								size={32}
								style={{ color: 'var(--primary)' }}
							/>
						</div>
						<h1 className='font-serif text-2xl sm:text-3xl font-bold mb-2'>
							Konfirmasi Pesanan
						</h1>
						<p
							className='text-sm'
							style={{ color: 'var(--text-secondary)' }}>
							Mohon periksa kembali detail pesanan Anda sebelum melanjutkan.
						</p>
					</div>

					<div className='p-6'>
						<div className='flex flex-col sm:flex-row gap-5 mb-6'>
							<div className='relative w-full sm:w-48 aspect-4/3 rounded-xl overflow-hidden border border-[var(--border)] shrink-0'>
								<Image
									src={productImage}
									alt={productName}
									fill
									className='object-cover'
									sizes='(max-width: 640px) 100vw, 192px'
								/>
							</div>
							<div className='flex-1'>
								<span
									className='inline-block text-xs font-semibold tracking-wider uppercase mb-2'
									style={{ color: 'var(--primary)' }}>
									Produk Dipilih
								</span>
								<h2 className='font-serif text-xl font-semibold mb-2'>
									{productName}
								</h2>
								<p
									className='text-lg font-semibold'
									style={{ color: 'var(--primary)' }}>
									{productPrice}
								</p>
							</div>
						</div>

						<div className='space-y-3 mb-6 pt-6 border-t border-[var(--border)]'>
							<h3 className='font-serif text-base font-semibold mb-3'>
								Ringkasan Pesanan
							</h3>
							<div className='flex justify-between text-sm'>
								<span style={{ color: 'var(--text-secondary)' }}>
									Produk
								</span>
								<span className='font-medium'>{productName}</span>
							</div>
							<div className='flex justify-between text-sm'>
								<span style={{ color: 'var(--text-secondary)' }}>
									Harga
								</span>
								<span className='font-medium'>{productPrice}</span>
							</div>
							<div className='flex justify-between text-sm'>
								<span style={{ color: 'var(--text-secondary)' }}>
									Status
								</span>
								<span
									className='font-medium'
									style={{ color: 'var(--primary)' }}>
									Menunggu Konfirmasi
								</span>
							</div>
						</div>

						<div
							className='rounded-xl p-4 mb-6 text-sm'
							style={{
								background: 'rgba(157, 23, 77, 0.05)',
								color: 'var(--text-secondary)',
							}}>
							Halaman ini adalah simulasi alur pemesanan. Untuk konfirmasi
							pesanan resmi, silakan hubungi kami via WhatsApp.
						</div>

						<div className='flex flex-col sm:flex-row gap-3'>
							<a
								href={`https://wa.me/6285274320917?text=${encodeURIComponent(
									`Halo Dafa Florist, saya ingin memesan ${productName} (${productPrice}).`,
								)}`}
								target='_blank'
								rel='noopener noreferrer'
								className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-transform hover:scale-[1.02]'
								style={{ background: 'var(--primary)' }}>
								Konfirmasi via WhatsApp
							</a>
							<Link
								href='/'
								className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-[var(--border)] transition-colors hover:bg-[rgba(0,0,0,0.03)]'>
								Batalkan
							</Link>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
