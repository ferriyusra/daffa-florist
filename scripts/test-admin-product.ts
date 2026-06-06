import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/trpc';

/**
 * Tes manual CRUD produk admin (S0.5) — create → baca di katalog publik →
 * update → delete, plus cek guard `adminProcedure` menolak CUSTOMER.
 * Jalankan: `tsx scripts/test-admin-product.ts` (perlu seed lebih dulu).
 */
type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

async function main() {
	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	});

	const callerFor = (email: string) => async () => {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error(`User ${email} belum ada — jalankan seed.`);
		const session = {
			user: { id: user.id, name: user.name, email: user.email, role: user.role },
			expires: new Date(Date.now() + 86_400_000).toISOString(),
		} as NonNullable<Ctx['session']>;
		return createCaller({ session, prisma, headers: new Headers() });
	};

	const admin = await callerFor('admin@daffaflorist.test')();
	const customer = await callerFor('uji@daffaflorist.test')();
	const checks: string[] = [];

	let forbidden = false;
	try {
		await customer.admin.product.create({
			slug: 'x',
			title: 'x',
			shortDescription: 'x',
			description: 'x',
			category: 'Wedding',
			basePrice: 1,
			image: '/x.png',
		});
	} catch (e) {
		forbidden = (e as { code?: string }).code === 'FORBIDDEN';
	}
	checks.push(`Guard adminProcedure menolak CUSTOMER: ${forbidden ? '✓' : '✗'}`);

	const created = await admin.admin.product.create({
		slug: 'produk-uji-crud',
		title: 'Produk Uji CRUD',
		shortDescription: 'Produk untuk tes CRUD admin.',
		description: 'Deskripsi panjang produk uji.',
		category: 'Grand Opening',
		basePrice: 333_000,
		image: '/product/papan-bunga-1.PNG',
		sizes: [
			{ label: 'Sedang', price: 350_000, unitCount: 5, note: 'tinggi 2m' },
			{ label: 'Besar', price: 500_000, unitCount: 2 },
		],
	});
	checks.push(`Create produk (id ${created.id.slice(0, 8)}…): ✓`);
	const createSizesOk =
		created.sizes.length === 2 &&
		created.sizes[0].label === 'Sedang' &&
		created.sizes[0].unitCount === 5; // stok per ukuran (S1.3) tersimpan
	checks.push(
		`  └ 2 ukuran + stok tersimpan (ProductSize.unitCount): ${createSizesOk ? '✓' : '✗'}`,
	);

	const pub = await admin.product.getBySlug({ slug: 'produk-uji-crud' });
	const pubOk =
		pub.title === 'Produk Uji CRUD' &&
		pub.priceLabel === 'Rp 333.000';
	checks.push(`Terbaca di katalog publik (priceLabel "${pub.priceLabel}"): ${pubOk ? '✓' : '✗'}`);

	await admin.admin.product.update({
		id: created.id,
		slug: 'produk-uji-crud',
		title: 'Produk Uji CRUD (Edit)',
		shortDescription: 'Diperbarui.',
		description: 'Deskripsi diperbarui.',
		category: 'Grand Opening',
		basePrice: 444_000,
		image: '/product/papan-bunga-1.PNG',
		sizes: [{ label: 'Jumbo', price: 600_000 }],
	});
	const afterUpdate = await admin.product.getBySlug({ slug: 'produk-uji-crud' });
	const updateOk =
		afterUpdate.title === 'Produk Uji CRUD (Edit)' &&
		afterUpdate.price === 444_000;
	checks.push(`Update (judul/harga): ${updateOk ? '✓' : '✗'}`);
	const detail = await admin.admin.product.getById({ id: created.id });
	const replaceOk =
		detail.sizes.length === 1 && detail.sizes[0].label === 'Jumbo';
	checks.push(
		`  └ Ukuran diganti wholesale (1 ukuran "Jumbo"): ${replaceOk ? '✓' : '✗'}`,
	);

	await admin.admin.product.delete({ id: created.id });
	const gone = await prisma.product.findUnique({ where: { id: created.id } });
	checks.push(`Delete (produk hilang dari DB): ${gone === null ? '✓' : '✗'}`);

	console.log('\n── Tes CRUD produk admin (S0.5) ──');
	for (const c of checks) console.log(`  ${c}`);
	const pass = checks.every((c) => c.endsWith('✓'));
	console.log(`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — CRUD produk admin ${pass ? 'berfungsi.' : 'bermasalah.'}\n`);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
