import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/trpc';

/**
 * Tes manual CRUD galeri admin (S0.6) — guard, create → baca di galeri publik →
 * filter isActive → update → delete.
 * Jalankan: `tsx scripts/test-admin-gallery.ts` (perlu seed lebih dulu).
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

	// 1) Guard: CUSTOMER ditolak.
	let forbidden = false;
	try {
		await customer.admin.gallery.list();
	} catch (e) {
		forbidden = (e as { code?: string }).code === 'FORBIDDEN';
	}
	checks.push(`Guard adminProcedure menolak CUSTOMER: ${forbidden ? '✓' : '✗'}`);

	// 2) CREATE
	const created = await admin.admin.gallery.create({
		title: 'Uji Galeri CRUD',
		image: '/product/papan-bunga-1.PNG',
		category: 'Papan Bunga',
		sortOrder: 99,
		isActive: true,
	});
	checks.push(`Create item (id ${created.id.slice(0, 8)}…): ✓`);

	// 3) Terbaca di galeri publik (aktif).
	const pub = await admin.gallery.list();
	checks.push(
		`Terbaca di galeri publik: ${
			pub.some((g) => g.id === created.id) ? '✓' : '✗'
		}`,
	);

	// 4) UPDATE → nonaktifkan + ganti judul.
	await admin.admin.gallery.update({
		id: created.id,
		title: 'Uji Galeri CRUD (Edit)',
		image: '/product/papan-bunga-1.PNG',
		category: 'Papan Bunga',
		sortOrder: 99,
		isActive: false,
	});
	const detail = await admin.admin.gallery.getById({ id: created.id });
	const pubAfter = await admin.gallery.list();
	const updateOk =
		detail.title === 'Uji Galeri CRUD (Edit)' &&
		detail.isActive === false &&
		!pubAfter.some((g) => g.id === created.id); // nonaktif → hilang dari publik
	checks.push(`Update (judul + nonaktif → hilang dari publik): ${updateOk ? '✓' : '✗'}`);

	// 5) DELETE
	await admin.admin.gallery.delete({ id: created.id });
	const gone = await prisma.galleryItem.findUnique({ where: { id: created.id } });
	checks.push(`Delete (item hilang dari DB): ${gone === null ? '✓' : '✗'}`);

	console.log('\n── Tes CRUD galeri admin (S0.6) ──');
	for (const c of checks) console.log(`  ${c}`);
	const pass = checks.every((c) => c.endsWith('✓'));
	console.log(
		`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — CRUD galeri ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
	);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
