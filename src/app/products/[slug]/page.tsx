import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Footer, Navbar } from '@/components';
import { api } from '@/trpc/server';
import ProductDetailClient from './product-detail-client';

type Params = Promise<{ slug: string }>;

/** Ambil produk dari DB; kembalikan null bila tidak ada (NOT_FOUND dari router). */
async function getProduct(slug: string) {
	try {
		return await api.product.getBySlug({ slug });
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params,
}: {
	params: Params;
}): Promise<Metadata> {
	const { slug } = await params;
	const product = await getProduct(slug);
	if (!product) return { title: 'Produk Tidak Ditemukan' };
	return {
		title: product.title,
		description: product.shortDescription,
		openGraph: {
			title: product.title,
			description: product.shortDescription,
			images: [{ url: product.image }],
		},
	};
}

export default async function ProductDetailPage({
	params,
}: {
	params: Params;
}) {
	const { slug } = await params;
	const product = await getProduct(slug);
	if (!product) notFound();

	const related = await api.product.related({ slug, limit: 3 });

	return (
		<>
			<Navbar />
			<ProductDetailClient product={product} related={related} />
			<Footer />
		</>
	);
}
