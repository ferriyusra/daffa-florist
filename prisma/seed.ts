import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { products } from '@/lib/products';

/**
 * Seed data contoh untuk pengembangan & pengujian.
 * - Katalog produk diturunkan dari sumber kebenaran statis (src/lib/products.ts),
 *   dipetakan ke model Prisma (basePrice ← price; size/template/color/addon → relasi).
 * - Satu user uji (role CUSTOMER) untuk menguji alur pesanan terproteksi.
 *
 * Idempoten: bersihkan order & product dulu, lalu buat ulang; user di-upsert by email.
 * Jalankan: `tsx prisma/seed.ts` atau `npm run prisma:seed`.
 */
async function main() {
	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
	const prisma = new PrismaClient({ adapter });

	// Bersihkan (urutan penting): Order dulu (FK ke User bersifat restrict), lalu
	// User (cascade → Address), lalu Product (cascade → size/template/color/addon).
	await prisma.order.deleteMany();
	await prisma.user.deleteMany();
	await prisma.product.deleteMany();
	await prisma.galleryItem.deleteMany();
	await prisma.deliveryArea.deleteMany();
	await prisma.promo.deleteMany();

	for (const p of products) {
		await prisma.product.create({
			data: {
				slug: p.slug,
				title: p.title,
				shortDescription: p.shortDescription,
				description: p.description,
				category: p.category,
				basePrice: p.price,
				image: p.image,
				images: p.images,
				tags: p.tags,
				productionTime: p.productionTime,
				serviceAreas: p.serviceAreas,
				sizes: {
					create: p.sizes.map((s) => ({
						label: s.label,
						price: s.price,
						note: s.note,
					})),
				},
				designTemplates: {
					create: p.designTemplates.map((t) => ({
						name: t.name,
						image: t.image,
					})),
				},
				themeColors: {
					create: p.themeColors.map((c) => ({ name: c.name, value: c.value })),
				},
				addons: {
					create: p.addons.map((a) => ({ name: a.name, price: a.price })),
				},
			},
		});
	}

	// Dua user uji (password sama: "password123") untuk menguji proteksi role.
	const hashedPassword = await hash('password123', 10);
	const usersToSeed = [
		{
			name: 'Pelanggan Uji',
			email: 'uji@daffaflorist.test',
			phone: '081234567890',
			role: 'CUSTOMER' as const,
		},
		{
			name: 'Admin Daffa',
			email: 'admin@daffaflorist.test',
			phone: '081200000000',
			role: 'ADMIN' as const,
		},
	];

	for (const u of usersToSeed) {
		await prisma.user.upsert({
			where: { email: u.email },
			update: { role: u.role }, // jaga role tetap konsisten saat re-seed
			create: { ...u, hashedPassword },
		});
	}

	// Item galeri (hasil jadi) untuk section galeri publik.
	const galleryItems = [
		{
			title: 'Happy Wedding — Dafa Florist',
			image: '/product/papan-bunga-5.PNG',
			category: 'Papan Bunga',
		},
		{
			title: 'Selamat & Sukses — Papan Ucapan',
			image: '/product/papan-bunga-4.PNG',
			category: 'Papan Bunga',
		},
		{
			title: 'Happy Wedding — Biru Elegan',
			image: '/product/papan-bunga-3.PNG',
			category: 'Papan Bunga',
		},
		{
			title: 'Dekorasi Mobil Pengantin',
			image: '/product/mobil-pengantin-1.PNG',
			category: 'Mobil Pengantin',
		},
		{
			title: 'Happy Wedding — Pink Rose',
			image: '/product/papan-bunga-2.PNG',
			category: 'Papan Bunga',
		},
		{
			title: 'Happy Wedding — Abu Elegan',
			image: '/product/papan-bunga-1.PNG',
			category: 'Papan Bunga',
		},
	];
	await prisma.galleryItem.createMany({
		data: galleryItems.map((g, i) => ({ ...g, sortOrder: i })),
	});

	// Zona pengiriman + ongkir (Pasaman Barat).
	const deliveryAreas = [
		{ name: 'Ampar Putih', shippingCost: 0 },
		{ name: 'Simpang Empat', shippingCost: 25_000 },
		{ name: 'Kinali', shippingCost: 35_000 },
		{ name: 'Talamau', shippingCost: 40_000 },
		{ name: 'Pasaman', shippingCost: 30_000 },
		{ name: 'Lembah Melintang', shippingCost: 45_000 },
		{ name: 'Sasak Ranah Pasisie', shippingCost: 50_000 },
		{ name: 'Gunung Tuleh', shippingCost: 60_000 },
		{ name: 'Sungai Beremas', shippingCost: 65_000 },
		{ name: 'Koto Balingka', shippingCost: 55_000 },
	];
	await prisma.deliveryArea.createMany({
		data: deliveryAreas.map((a) => ({ ...a, district: 'Pasaman Barat' })),
	});

	// Promo contoh (dipakai checkout di E4).
	const promos = [
		{
			code: 'WEDDING10',
			description: 'Diskon 10% papan wedding',
			type: 'PERCENT' as const,
			value: 10,
		},
		{
			code: 'ONGKIR25',
			description: 'Potongan Rp 25.000',
			type: 'AMOUNT' as const,
			value: 25_000,
		},
	];
	await prisma.promo.createMany({ data: promos });

	console.log(
		`✓ Seed selesai: ${products.length} produk + ${usersToSeed.length} user + ${galleryItems.length} galeri + ${deliveryAreas.length} zona + ${promos.length} promo.`,
	);
	await prisma.$disconnect();
}

main().catch((err) => {
	console.error('Seed gagal:', err);
	process.exit(1);
});
