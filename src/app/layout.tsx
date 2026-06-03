import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const siteUrl = 'https://daffa-florist.vercel.app/'; // Ganti dengan domain asli

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default:
			'Dafa Florist — Papan Bunga & Karangan Bunga Ampar Putih, Pasaman Barat',
		template: '%s | Dafa Florist',
	},
	description:
		'Dafa Florist — toko papan bunga dan karangan bunga di Ampar Putih, Pasaman Barat, Sumatera Barat. Melayani papan bunga ucapan wedding, selamat & sukses, duka cita, bucket bunga, dan dekorasi mobil pengantin. Harga terjangkau, antar & pasang gratis.',
	keywords: [
		'papan bunga ampar putih',
		'karangan bunga ampar putih',
		'papan bunga pasaman barat',
		'toko bunga ampar putih',
		'papan bunga wedding pasaman',
		'papan bunga ucapan selamat',
		'papan bunga duka cita ampar putih',
		'dekorasi mobil pengantin ampar putih',
		'bucket bunga ampar putih',
		'dafa florist',
		'florist pasaman barat',
		'karangan bunga sumatera barat',
		'papan bunga murah pasaman',
		'toko bunga pasaman barat',
	],
	authors: [{ name: 'Dafa Florist' }],
	creator: 'Dafa Florist',
	publisher: 'Dafa Florist',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		title: 'Dafa Florist — Papan Bunga & Karangan Bunga Ampar Putih',
		description:
			'Toko papan bunga dan karangan bunga di Ampar Putih, Pasaman Barat. Papan bunga wedding, ucapan, duka cita, dan dekorasi mobil pengantin. Harga terjangkau!',
		type: 'website',
		locale: 'id_ID',
		url: siteUrl,
		siteName: 'Dafa Florist',
		images: [
			{
				url: '/product/papan-bunga-5.PNG',
				width: 800,
				height: 600,
				alt: 'Papan Bunga Happy Wedding dari Dafa Florist Ampar Putih',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Dafa Florist — Papan Bunga Ampar Putih',
		description:
			'Papan bunga & karangan bunga di Ampar Putih, Pasaman Barat. Harga terjangkau, antar gratis!',
		images: ['/product/papan-bunga-5.PNG'],
	},
	alternates: {
		canonical: siteUrl,
	},
	category: 'Florist',
	other: {
		'geo.region': 'ID-SB',
		'geo.placename': 'Ampar Putih, Pasaman Barat',
		'geo.position': '0.23162;99.6885768',
		ICBM: '0.23162, 99.6885768',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='id'>
			<body className='antialiased'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
