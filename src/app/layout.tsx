import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Dafa Florist — Karangan Bunga Ampar Putih',
	description:
		'Dafa Florist menyediakan karangan bunga segar di Ampar Putih: papan bunga ucapan, bucket bunga, bunga wisuda, dan dekorasi mobil pengantin.',
	keywords: ['dafa florist', 'karangan bunga', 'ampar putih', 'papan bunga', 'bucket bunga', 'wisuda', 'dekorasi mobil pengantin'],
	openGraph: {
		title: 'Dafa Florist — Karangan Bunga Ampar Putih',
		description: 'Karangan bunga segar untuk setiap momen spesial Anda di Ampar Putih.',
		type: 'website',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='id'>
			<body className='antialiased'>{children}</body>
		</html>
	);
}
