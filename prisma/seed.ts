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

	// Bersihkan (urutan penting): Order cascade → OrderItem; Product cascade → size/template/color/addon.
	await prisma.order.deleteMany();
	await prisma.product.deleteMany();

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
				features: p.features,
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

	const user = await prisma.user.upsert({
		where: { email: 'uji@daffaflorist.test' },
		update: {},
		create: {
			name: 'Pelanggan Uji',
			email: 'uji@daffaflorist.test',
			phone: '081234567890',
			hashedPassword: await hash('password123', 10),
			role: 'CUSTOMER',
		},
	});

	console.log(`✓ Seed selesai: ${products.length} produk + user "${user.email}".`);
	await prisma.$disconnect();
}

main().catch((err) => {
	console.error('Seed gagal:', err);
	process.exit(1);
});
