import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import Products from '@/components/products';
import About from '@/components/about';
import Gallery from '@/components/gallery';
import Testimonials from '@/components/testimonials';
import Contact from '@/components/contact';
import Footer from '@/components/footer';

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'LocalBusiness',
			'@id': 'https://daffa-florist.vercel.app/#business',
			name: 'Dafa Florist',
			alternateName: 'Karangan Bunga Ampar Putih',
			description:
				'Toko papan bunga dan karangan bunga di Ampar Putih, Pasaman Barat, Sumatera Barat. Melayani papan bunga wedding, ucapan selamat, duka cita, bucket bunga, dan dekorasi mobil pengantin.',
			url: 'https://daffa-florist.vercel.app/',
			telephone: '+6285274320917',
			image: 'https://daffa-florist.vercel.app/product/papan-bunga-5.PNG',
			priceRange: 'Rp 100.000 - Rp 1.000.000',
			currenciesAccepted: 'IDR',
			paymentAccepted: 'Cash, Transfer Bank',
			address: {
				'@type': 'PostalAddress',
				streetAddress: 'Ampar Putih',
				addressLocality: 'Pasaman Barat',
				addressRegion: 'Sumatera Barat',
				addressCountry: 'ID',
			},
			geo: {
				'@type': 'GeoCoordinates',
				latitude: 0.23162,
				longitude: 99.6885768,
			},
			openingHoursSpecification: {
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: [
					'Monday',
					'Tuesday',
					'Wednesday',
					'Thursday',
					'Friday',
					'Saturday',
					'Sunday',
				],
				opens: '08:00',
				closes: '21:00',
			},
			sameAs: [
				'https://instagram.com/dafaflorist_',
				'https://wa.me/6285274320917',
			],
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: '5.0',
				reviewCount: '10',
				bestRating: '5',
			},
			areaServed: [
				{ '@type': 'Place', name: 'Ampar Putih' },
				{ '@type': 'Place', name: 'Pasaman Barat' },
				{ '@type': 'Place', name: 'Sumatera Barat' },
			],
			hasOfferCatalog: {
				'@type': 'OfferCatalog',
				name: 'Produk Dafa Florist',
				itemListElement: [
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Product',
							name: 'Papan Bunga Wedding',
							description:
								'Papan bunga ucapan Happy Wedding dengan desain elegan, tersedia berbagai warna dan ukuran.',
							image:
								'https://daffa-florist.vercel.app/product/papan-bunga-5.PNG',
						},
						price: '350000',
						priceCurrency: 'IDR',
						availability: 'https://schema.org/InStock',
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Product',
							name: 'Papan Bunga Ucapan Selamat & Sukses',
							description:
								'Papan bunga ucapan selamat dan sukses untuk acara resmi, sertijab, dan pembukaan.',
							image:
								'https://daffa-florist.vercel.app/product/papan-bunga-4.PNG',
						},
						price: '350000',
						priceCurrency: 'IDR',
						availability: 'https://schema.org/InStock',
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Product',
							name: 'Papan Bunga Premium',
							description:
								'Papan bunga premium dengan hiasan mewah untuk momen istimewa.',
							image:
								'https://daffa-florist.vercel.app/product/papan-bunga-3.PNG',
						},
						price: '500000',
						priceCurrency: 'IDR',
						availability: 'https://schema.org/InStock',
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Product',
							name: 'Dekorasi Mobil Pengantin',
							description:
								'Dekorasi bunga untuk mobil pengantin, antar dan pasang di lokasi.',
							image:
								'https://daffa-florist.vercel.app/product/mobil-pengantin-1.PNG',
						},
						price: '500000',
						priceCurrency: 'IDR',
						availability: 'https://schema.org/InStock',
					},
				],
			},
		},
		{
			'@type': 'WebSite',
			'@id': 'https://daffa-florist.vercel.app/#website',
			url: 'https://daffa-florist.vercel.app/',
			name: 'Dafa Florist',
			description:
				'Toko papan bunga dan karangan bunga di Ampar Putih, Pasaman Barat',
			publisher: { '@id': 'https://daffa-florist.vercel.app/#business' },
			inLanguage: 'id-ID',
		},
	],
};

export default function Home() {
	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<main className='min-h-screen'>
				<Navbar />
				<Hero />
				<Products />
				<About />
				<Gallery />
				<Testimonials />
				<Contact />
				<Footer />
			</main>
		</>
	);
}
