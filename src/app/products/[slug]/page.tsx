import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import {
	getProductBySlug,
	getRelatedProducts,
	products,
} from '@/lib/products';
import ProductDetailClient from './product-detail-client';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
	return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Params;
}): Promise<Metadata> {
	const { slug } = await params;
	const product = getProductBySlug(slug);
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
	const product = getProductBySlug(slug);
	if (!product) notFound();

	const related = getRelatedProducts(slug, 3);

	return (
		<>
			<Navbar />
			<ProductDetailClient product={product} related={related} />
			<Footer />
		</>
	);
}
