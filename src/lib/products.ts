export const productCategories = [
	'Wedding',
	'Ucapan',
	'Dekorasi',
	'Premium',
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	features: string[];
	specs: { label: string; value: string }[];
	price: number;
	priceLabel: string;
	category: ProductCategory;
	image: string;
	images: string[];
	color: string;
	tags: string[];
};

export const products: Product[] = [
	{
		slug: 'papan-bunga-wedding-klasik',
		title: 'Papan Bunga Wedding Klasik',
		shortDescription:
			'Papan bunga ucapan Happy Wedding dengan desain elegan dan ukuran standar.',
		description:
			'Rangkaian papan bunga klasik untuk ucapan pernikahan. Desain elegan dengan bunga segar dan tulisan custom sesuai permintaan. Cocok untuk gedung resepsi maupun rumah.',
		features: ['Ucapan custom', 'Ukuran 1.5m - 2m', 'Antar & pasang gratis'],
		specs: [
			{ label: 'Ukuran', value: '1.5m × 2m' },
			{ label: 'Bahan', value: 'Bunga segar & artificial' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: '1-2 hari kerja' },
		],
		price: 350000,
		priceLabel: 'Rp 350.000',
		category: 'Wedding',
		image: '/product/papan-bunga-5.PNG',
		images: [
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-4.PNG',
		],
		color: 'var(--primary)',
		tags: ['wedding', 'pernikahan', 'happy wedding', 'klasik'],
	},
	{
		slug: 'papan-bunga-wedding-royale',
		title: 'Papan Bunga Wedding Royale',
		shortDescription:
			'Papan bunga premium untuk pernikahan dengan hiasan mewah & rangkaian khusus.',
		description:
			'Papan bunga edisi premium dengan rangkaian bunga lebih padat dan dekorasi tambahan. Cocok untuk pernikahan eksklusif yang ingin tampil istimewa di hari spesial.',
		features: ['Hiasan premium', 'Bunga padat & mewah', 'Stand kayu eksklusif'],
		specs: [
			{ label: 'Ukuran', value: '2m × 2.5m' },
			{ label: 'Bahan', value: 'Bunga segar premium' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: '2-3 hari kerja' },
		],
		price: 750000,
		priceLabel: 'Rp 750.000',
		category: 'Wedding',
		image: '/product/papan-bunga-3.PNG',
		images: [
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-1.PNG',
		],
		color: 'var(--primary)',
		tags: ['wedding', 'premium', 'royale', 'mewah'],
	},
	{
		slug: 'papan-bunga-ucapan-selamat',
		title: 'Papan Bunga Ucapan Selamat',
		shortDescription:
			'Papan bunga ucapan selamat & sukses untuk acara resmi dan momen istimewa.',
		description:
			'Papan bunga dengan tulisan ucapan selamat custom untuk berbagai keperluan: ulang tahun, kelulusan, promosi jabatan, dan pencapaian lainnya.',
		features: ['Desain profesional', 'Warna custom', 'Pengiriman tepat waktu'],
		specs: [
			{ label: 'Ukuran', value: '1.5m × 2m' },
			{ label: 'Bahan', value: 'Bunga segar & artificial' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: '1 hari kerja' },
		],
		price: 350000,
		priceLabel: 'Rp 350.000',
		category: 'Ucapan',
		image: '/product/papan-bunga-4.PNG',
		images: [
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-5.PNG',
		],
		color: 'var(--accent)',
		tags: ['selamat', 'sukses', 'ucapan'],
	},
	{
		slug: 'papan-bunga-grand-opening',
		title: 'Papan Bunga Grand Opening',
		shortDescription:
			'Papan bunga ucapan untuk pembukaan toko, restoran, atau usaha baru.',
		description:
			'Papan bunga eksklusif untuk grand opening usaha. Desain mencolok dengan kombinasi warna cerah agar terlihat menonjol dan menarik perhatian pelanggan.',
		features: ['Warna cerah & mencolok', 'Tulisan eye-catching', 'Cepat sampai'],
		specs: [
			{ label: 'Ukuran', value: '1.5m × 2m' },
			{ label: 'Bahan', value: 'Bunga segar & artificial' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: '1 hari kerja' },
		],
		price: 400000,
		priceLabel: 'Rp 400.000',
		category: 'Ucapan',
		image: '/product/papan-bunga-1.PNG',
		images: [
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-3.PNG',
		],
		color: 'var(--accent)',
		tags: ['grand opening', 'pembukaan', 'usaha'],
	},
	{
		slug: 'papan-bunga-duka-cita',
		title: 'Papan Bunga Duka Cita',
		shortDescription:
			'Papan bunga ucapan duka cita dengan desain sopan dan tulisan menyentuh.',
		description:
			'Papan bunga ucapan duka cita untuk menyampaikan belasungkawa dengan tulus. Desain dipilih sopan dengan warna lembut yang sesuai untuk momen berkabung.',
		features: ['Warna lembut', 'Tulisan menyentuh', 'Pengiriman cepat'],
		specs: [
			{ label: 'Ukuran', value: '1.5m × 2m' },
			{ label: 'Bahan', value: 'Bunga segar & artificial' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: 'Same day' },
		],
		price: 400000,
		priceLabel: 'Rp 400.000',
		category: 'Ucapan',
		image: '/product/papan-bunga-2.PNG',
		images: [
			'/product/papan-bunga-2.PNG',
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-1.PNG',
		],
		color: 'var(--accent)',
		tags: ['duka cita', 'belasungkawa', 'turut berduka'],
	},
	{
		slug: 'papan-bunga-sertijab',
		title: 'Papan Bunga Sertijab',
		shortDescription:
			'Papan bunga untuk acara serah terima jabatan, formal dan elegan.',
		description:
			'Papan bunga khusus acara serah terima jabatan dengan desain formal. Cocok untuk instansi pemerintahan, militer, kepolisian, dan korporasi.',
		features: ['Desain formal', 'Warna sesuai instansi', 'Tepat waktu'],
		specs: [
			{ label: 'Ukuran', value: '1.5m × 2m' },
			{ label: 'Bahan', value: 'Bunga segar & artificial' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: '1 hari kerja' },
		],
		price: 350000,
		priceLabel: 'Rp 350.000',
		category: 'Ucapan',
		image: '/product/papan-bunga-4.PNG',
		images: [
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-2.PNG',
		],
		color: 'var(--accent)',
		tags: ['sertijab', 'serah terima jabatan', 'formal'],
	},
	{
		slug: 'dekorasi-mobil-pengantin',
		title: 'Dekorasi Mobil Pengantin',
		shortDescription:
			'Dekorasi bunga untuk mobil pengantin yang cantik dan mewah di hari bahagia.',
		description:
			'Dekorasi mobil pengantin dengan rangkaian bunga romantis. Tim kami akan datang ke lokasi untuk memasang dekorasi sebelum prosesi dimulai.',
		features: ['Desain romantis', 'Rangkaian indah', 'Pasang di lokasi'],
		specs: [
			{ label: 'Tipe Mobil', value: 'Sedan, SUV, MPV' },
			{ label: 'Bahan', value: 'Bunga segar & ribbon' },
			{ label: 'Pengiriman', value: 'Pasang di lokasi' },
			{ label: 'Estimasi', value: '2-3 jam pemasangan' },
		],
		price: 500000,
		priceLabel: 'Rp 500.000',
		category: 'Dekorasi',
		image: '/product/mobil-pengantin-1.PNG',
		images: ['/product/mobil-pengantin-1.PNG', '/product/papan-bunga-5.PNG'],
		color: 'var(--primary-dark)',
		tags: ['mobil pengantin', 'dekorasi', 'wedding car'],
	},
	{
		slug: 'bucket-bunga-premium',
		title: 'Bucket Bunga Premium',
		shortDescription:
			'Bucket bunga eksklusif untuk hadiah istimewa orang tersayang.',
		description:
			'Bucket bunga premium dengan rangkaian mawar, lily, dan baby breath. Dibungkus elegan, cocok untuk anniversary, wisuda, atau hadiah spesial.',
		features: ['Bunga segar premium', 'Pembungkus eksklusif', 'Kartu ucapan'],
		specs: [
			{ label: 'Ukuran', value: 'Medium - Large' },
			{ label: 'Bahan', value: 'Mawar, lily, baby breath' },
			{ label: 'Pengiriman', value: 'Gratis area Pasaman Barat' },
			{ label: 'Estimasi', value: 'Same day' },
		],
		price: 250000,
		priceLabel: 'Rp 250.000',
		category: 'Premium',
		image: '/product/papan-bunga-3.PNG',
		images: [
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-5.PNG',
		],
		color: 'var(--secondary)',
		tags: ['bucket', 'hadiah', 'wisuda', 'anniversary'],
	},
];

export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
	const current = getProductBySlug(slug);
	if (!current) return [];
	return products
		.filter((p) => p.slug !== slug && p.category === current.category)
		.slice(0, limit);
}
