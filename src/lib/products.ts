export const productCategories = [
	'Pernikahan',
	'Duka Cita',
	'Peresmian',
	'Ucapan Selamat',
	'Wisuda',
	'Dekorasi',
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type ProductSize = {
	id: string;
	label: string;
	price: number;
	priceLabel: string;
	note?: string;
};

export type ProductTemplate = {
	id: string;
	name: string;
	image: string;
};

export type ProductThemeColor = {
	id: string;
	name: string;
	value: string;
};

export type ProductAddon = {
	id: string;
	name: string;
	price: number;
	priceLabel: string;
};

export type Product = {
	/**
	 * UUID produk dari DB. OPSIONAL pada tipe karena sumber seed statis di file
	 * ini membentuk objek `Product` tanpa id (id dibuat DB). Saat runtime,
	 * `mapProduct` (router) SELALU mengisinya dari baris DB, sehingga konsumen
	 * sewa (checkAvailability/getBookedDates) bisa mengandalkannya.
	 */
	id?: string;
	slug: string;
	title: string;
	shortDescription: string;
	description: string;
	price: number;
	priceLabel: string;
	category: ProductCategory;
	image: string;
	images: string[];
	tags: string[];
	sizes: ProductSize[];
	designTemplates: ProductTemplate[];
	themeColors: ProductThemeColor[];
	addons: ProductAddon[];
	productionTime: string;
	serviceAreas: string[];
};

const formatPrice = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const standardServiceAreas = [
	'Simpang Empat',
	'Talu',
	'Ujung Gading',
	'Kinali',
	'Sasak Ranah Pasisie',
	'Pasaman',
];

const defaultAddons = (): ProductAddon[] => [
	{
		id: 'standing-flower',
		name: 'Standing Flower',
		price: 150_000,
		priceLabel: formatPrice(150_000),
	},
	{
		id: 'lampu',
		name: 'Lampu Hias',
		price: 75_000,
		priceLabel: formatPrice(75_000),
	},
	{
		id: 'custom-ribbon',
		name: 'Custom Ribbon',
		price: 50_000,
		priceLabel: formatPrice(50_000),
	},
	{
		id: 'ucapan-premium',
		name: 'Ucapan Premium',
		price: 100_000,
		priceLabel: formatPrice(100_000),
	},
];

const papanBungaSizes = (basePrice: number): ProductSize[] => [
	{
		id: 'kecil',
		label: 'Kecil',
		price: basePrice,
		priceLabel: formatPrice(basePrice),
	},
	{
		id: 'sedang',
		label: 'Sedang',
		price: Math.round(basePrice * 1.5),
		priceLabel: formatPrice(Math.round(basePrice * 1.5)),
	},
	{
		id: 'besar',
		label: 'Besar',
		price: Math.round(basePrice * 1.7),
		priceLabel: formatPrice(Math.round(basePrice * 1.7)),
		note: 'Ukuran besar/custom dikonfirmasi via WhatsApp',
	},
];

export const products: Product[] = [
	{
		slug: 'papan-bunga-pernikahan-klasik',
		title: 'Papan Bunga Pernikahan Klasik',
		shortDescription:
			'Papan bunga ucapan Happy Wedding dengan desain elegan dan ukuran standar.',
		description:
			'Rangkaian papan bunga klasik untuk ucapan pernikahan. Desain elegan dengan bunga segar dan tulisan custom sesuai permintaan. Cocok untuk gedung resepsi maupun rumah.',
		price: 350_000,
		priceLabel: 'Rp 350.000',
		category: 'Pernikahan',
		image: '/product/papan-bunga-5.PNG',
		images: [
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-4.PNG',
		],
		tags: ['wedding', 'pernikahan', 'happy wedding', 'klasik'],
		sizes: papanBungaSizes(350_000),
		designTemplates: [
			{
				id: 'klasik-rose',
				name: 'Klasik Rose',
				image: '/product/papan-bunga-5.PNG',
			},
			{
				id: 'klasik-elegan',
				name: 'Elegan Pastel',
				image: '/product/papan-bunga-3.PNG',
			},
			{
				id: 'klasik-romantis',
				name: 'Romantis Putih',
				image: '/product/papan-bunga-4.PNG',
			},
		],
		themeColors: [
			{ id: 'rose', name: 'Rose', value: '#e11d48' },
			{ id: 'pastel', name: 'Pastel', value: '#fbcfe8' },
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
			{ id: 'maroon', name: 'Maroon', value: '#7f1d1d' },
		],
		addons: defaultAddons(),
		productionTime: '1-2 hari kerja',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'papan-bunga-pernikahan-mewah',
		title: 'Papan Bunga Pernikahan Mewah',
		shortDescription:
			'Papan bunga premium untuk pernikahan dengan hiasan mewah & rangkaian khusus.',
		description:
			'Papan bunga edisi premium dengan rangkaian bunga lebih padat dan dekorasi tambahan. Cocok untuk pernikahan eksklusif yang ingin tampil istimewa di hari spesial.',
		price: 750_000,
		priceLabel: 'Rp 750.000',
		category: 'Pernikahan',
		image: '/product/papan-bunga-3.PNG',
		images: [
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-1.PNG',
		],
		tags: ['wedding', 'premium', 'royale', 'mewah'],
		sizes: papanBungaSizes(750_000),
		designTemplates: [
			{
				id: 'royale-mewah',
				name: 'Royale Mewah',
				image: '/product/papan-bunga-3.PNG',
			},
			{
				id: 'royale-eksklusif',
				name: 'Eksklusif Emas',
				image: '/product/papan-bunga-5.PNG',
			},
			{
				id: 'royale-glamour',
				name: 'Glamour Marun',
				image: '/product/papan-bunga-1.PNG',
			},
		],
		themeColors: [
			{ id: 'maroon', name: 'Maroon', value: '#7f1d1d' },
			{ id: 'emas', name: 'Emas', value: '#d4af37' },
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
			{ id: 'rose', name: 'Rose', value: '#e11d48' },
		],
		addons: defaultAddons(),
		productionTime: '2-3 hari kerja',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'papan-bunga-ucapan-selamat',
		title: 'Papan Bunga Ucapan Selamat',
		shortDescription:
			'Papan bunga ucapan selamat & sukses untuk acara resmi dan momen istimewa.',
		description:
			'Papan bunga dengan tulisan ucapan selamat custom untuk berbagai keperluan: ulang tahun, kelulusan, promosi jabatan, dan pencapaian lainnya.',
		price: 350_000,
		priceLabel: 'Rp 350.000',
		category: 'Ucapan Selamat',
		image: '/product/papan-bunga-4.PNG',
		images: [
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-5.PNG',
		],
		tags: ['selamat', 'sukses', 'ucapan', 'congratulations'],
		sizes: papanBungaSizes(350_000),
		designTemplates: [
			{
				id: 'selamat-formal',
				name: 'Formal Cerah',
				image: '/product/papan-bunga-4.PNG',
			},
			{
				id: 'selamat-fresh',
				name: 'Fresh Pastel',
				image: '/product/papan-bunga-1.PNG',
			},
			{
				id: 'selamat-elegan',
				name: 'Elegan Putih',
				image: '/product/papan-bunga-5.PNG',
			},
		],
		themeColors: [
			{ id: 'pink', name: 'Pink', value: '#ec4899' },
			{ id: 'kuning', name: 'Kuning', value: '#facc15' },
			{ id: 'biru', name: 'Biru', value: '#3b82f6' },
			{ id: 'ungu', name: 'Ungu', value: '#a855f7' },
		],
		addons: defaultAddons(),
		productionTime: '1 hari kerja',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'papan-bunga-peresmian',
		title: 'Papan Bunga Peresmian',
		shortDescription:
			'Papan bunga ucapan untuk pembukaan toko, restoran, atau usaha baru.',
		description:
			'Papan bunga eksklusif untuk grand opening usaha. Desain mencolok dengan kombinasi warna cerah agar terlihat menonjol dan menarik perhatian pelanggan.',
		price: 400_000,
		priceLabel: 'Rp 400.000',
		category: 'Peresmian',
		image: '/product/papan-bunga-1.PNG',
		images: [
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-3.PNG',
		],
		tags: ['grand opening', 'pembukaan', 'usaha'],
		sizes: papanBungaSizes(400_000),
		designTemplates: [
			{
				id: 'go-vibrant',
				name: 'Vibrant Cerah',
				image: '/product/papan-bunga-1.PNG',
			},
			{
				id: 'go-modern',
				name: 'Modern Bold',
				image: '/product/papan-bunga-4.PNG',
			},
			{
				id: 'go-festive',
				name: 'Festive Mix',
				image: '/product/papan-bunga-3.PNG',
			},
		],
		themeColors: [
			{ id: 'merah', name: 'Merah', value: '#dc2626' },
			{ id: 'oranye', name: 'Oranye', value: '#f97316' },
			{ id: 'kuning', name: 'Kuning', value: '#facc15' },
			{ id: 'hijau', name: 'Hijau', value: '#16a34a' },
		],
		addons: defaultAddons(),
		productionTime: '1 hari kerja',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'papan-bunga-duka-cita',
		title: 'Papan Bunga Duka Cita',
		shortDescription:
			'Papan bunga ucapan duka cita dengan desain sopan dan tulisan menyentuh.',
		description:
			'Papan bunga ucapan duka cita untuk menyampaikan belasungkawa dengan tulus. Desain dipilih sopan dengan warna lembut yang sesuai untuk momen berkabung.',
		price: 400_000,
		priceLabel: 'Rp 400.000',
		category: 'Duka Cita',
		image: '/product/papan-bunga-2.PNG',
		images: [
			'/product/papan-bunga-2.PNG',
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-1.PNG',
		],
		tags: ['duka cita', 'belasungkawa', 'turut berduka'],
		sizes: papanBungaSizes(400_000),
		designTemplates: [
			{
				id: 'duka-sopan',
				name: 'Sopan Lembut',
				image: '/product/papan-bunga-2.PNG',
			},
			{
				id: 'duka-minimalis',
				name: 'Minimalis Putih',
				image: '/product/papan-bunga-4.PNG',
			},
			{
				id: 'duka-tulus',
				name: 'Tulus Krem',
				image: '/product/papan-bunga-1.PNG',
			},
		],
		themeColors: [
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
			{ id: 'krem', name: 'Krem', value: '#f5f5dc' },
			{ id: 'lavender', name: 'Lavender', value: '#c4b5fd' },
			{ id: 'hijau-lembut', name: 'Hijau Lembut', value: '#bbf7d0' },
		],
		addons: defaultAddons(),
		productionTime: 'Same day',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'papan-bunga-sertijab',
		title: 'Papan Bunga Sertijab',
		shortDescription:
			'Papan bunga untuk acara serah terima jabatan, formal dan elegan.',
		description:
			'Papan bunga khusus acara serah terima jabatan dengan desain formal. Cocok untuk instansi pemerintahan, militer, kepolisian, dan korporasi.',
		price: 350_000,
		priceLabel: 'Rp 350.000',
		category: 'Ucapan Selamat',
		image: '/product/papan-bunga-4.PNG',
		images: [
			'/product/papan-bunga-4.PNG',
			'/product/papan-bunga-5.PNG',
			'/product/papan-bunga-2.PNG',
		],
		tags: ['sertijab', 'serah terima jabatan', 'formal'],
		sizes: papanBungaSizes(350_000),
		designTemplates: [
			{
				id: 'sertijab-formal',
				name: 'Formal Korporat',
				image: '/product/papan-bunga-4.PNG',
			},
			{
				id: 'sertijab-instansi',
				name: 'Instansi Resmi',
				image: '/product/papan-bunga-5.PNG',
			},
			{
				id: 'sertijab-elegan',
				name: 'Elegan Klasik',
				image: '/product/papan-bunga-2.PNG',
			},
		],
		themeColors: [
			{ id: 'biru-tua', name: 'Biru Tua', value: '#1e3a8a' },
			{ id: 'merah', name: 'Merah', value: '#dc2626' },
			{ id: 'hijau-tua', name: 'Hijau Tua', value: '#166534' },
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
		],
		addons: defaultAddons(),
		productionTime: '1 hari kerja',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'dekorasi-mobil-pengantin',
		title: 'Dekorasi Mobil Pengantin',
		shortDescription:
			'Dekorasi bunga untuk mobil pengantin yang cantik dan mewah di hari bahagia.',
		description:
			'Dekorasi mobil pengantin dengan rangkaian bunga romantis. Tim kami akan datang ke lokasi untuk memasang dekorasi sebelum prosesi dimulai.',
		price: 500_000,
		priceLabel: 'Rp 500.000',
		category: 'Dekorasi',
		image: '/product/mobil-pengantin-1.PNG',
		images: ['/product/mobil-pengantin-1.PNG', '/product/papan-bunga-5.PNG'],
		tags: ['mobil pengantin', 'dekorasi', 'wedding car'],
		sizes: [
			{
				id: 'kecil',
				label: 'Kecil',
				price: 500_000,
				priceLabel: formatPrice(500_000),
			},
			{
				id: 'sedang',
				label: 'Sedang',
				price: 750_000,
				priceLabel: formatPrice(750_000),
			},
			{
				id: 'besar',
				label: 'Besar',
				price: 1_000_000,
				priceLabel: formatPrice(1_000_000),
			},
		],
		designTemplates: [
			{
				id: 'mobil-romantis',
				name: 'Romantis Klasik',
				image: '/product/mobil-pengantin-1.PNG',
			},
			{
				id: 'mobil-mewah',
				name: 'Mewah Eksklusif',
				image: '/product/papan-bunga-5.PNG',
			},
		],
		themeColors: [
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
			{ id: 'rose', name: 'Rose', value: '#e11d48' },
			{ id: 'pastel', name: 'Pastel', value: '#fbcfe8' },
			{ id: 'krem', name: 'Krem', value: '#f5f5dc' },
		],
		addons: defaultAddons(),
		productionTime: '2-3 jam pemasangan',
		serviceAreas: standardServiceAreas,
	},
	{
		slug: 'buket-bunga-eksklusif',
		title: 'Buket Bunga Eksklusif',
		shortDescription:
			'Bucket bunga eksklusif untuk wisuda, anniversary, atau hadiah istimewa.',
		description:
			'Bucket bunga premium dengan rangkaian mawar, lily, dan baby breath. Dibungkus elegan, cocok untuk wisuda, anniversary, atau hadiah spesial.',
		price: 250_000,
		priceLabel: 'Rp 250.000',
		category: 'Wisuda',
		image: '/product/papan-bunga-3.PNG',
		images: [
			'/product/papan-bunga-3.PNG',
			'/product/papan-bunga-1.PNG',
			'/product/papan-bunga-5.PNG',
		],
		tags: ['bucket', 'hadiah', 'wisuda', 'anniversary'],
		sizes: [
			{
				id: 'kecil',
				label: 'Kecil',
				price: 250_000,
				priceLabel: formatPrice(250_000),
			},
			{
				id: 'sedang',
				label: 'Sedang',
				price: 350_000,
				priceLabel: formatPrice(350_000),
			},
			{
				id: 'besar',
				label: 'Besar',
				price: 500_000,
				priceLabel: formatPrice(500_000),
			},
		],
		designTemplates: [
			{
				id: 'bucket-mawar',
				name: 'Mawar Premium',
				image: '/product/papan-bunga-3.PNG',
			},
			{
				id: 'bucket-mix',
				name: 'Mix Pastel',
				image: '/product/papan-bunga-1.PNG',
			},
			{
				id: 'bucket-eksklusif',
				name: 'Eksklusif Wisuda',
				image: '/product/papan-bunga-5.PNG',
			},
		],
		themeColors: [
			{ id: 'pink', name: 'Pink', value: '#ec4899' },
			{ id: 'rose', name: 'Rose', value: '#e11d48' },
			{ id: 'putih', name: 'Putih', value: '#fafafa' },
			{ id: 'kuning', name: 'Kuning', value: '#facc15' },
		],
		addons: defaultAddons(),
		productionTime: 'Same day',
		serviceAreas: standardServiceAreas,
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
