import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/trpc';

/**
 * Tes manual CRUD zona pengiriman admin (S0.9) — guard, list, create,
 * tolak nama ganda (CONFLICT), update, delete.
 * Jalankan: `tsx scripts/test-admin-delivery-area.ts` (perlu seed lebih dulu).
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
		await customer.admin.deliveryArea.list();
	} catch (e) {
		forbidden = (e as { code?: string }).code === 'FORBIDDEN';
	}
	checks.push(`Guard adminProcedure menolak CUSTOMER: ${forbidden ? '✓' : '✗'}`);

	// 2) LIST (≥10 hasil seed).
	const list = await admin.admin.deliveryArea.list();
	checks.push(`List (${list.length} zona, ≥10 seed): ${list.length >= 10 ? '✓' : '✗'}`);

	// 3) CREATE
	const created = await admin.admin.deliveryArea.create({
		name: 'Uji Zona CRUD',
		district: 'Pasaman Barat',
		shippingCost: 12_345,
		isActive: true,
	});
	checks.push(`Create zona (ongkir ${created.shippingCost}): ✓`);

	// 4) CONFLICT nama ganda.
	let conflict = false;
	try {
		await admin.admin.deliveryArea.create({
			name: 'Uji Zona CRUD',
			shippingCost: 1,
			isActive: true,
		});
	} catch (e) {
		conflict = (e as { code?: string }).code === 'CONFLICT';
	}
	checks.push(`Tolak nama zona ganda (CONFLICT): ${conflict ? '✓' : '✗'}`);

	// 5) UPDATE (ongkir + nonaktif).
	const updated = await admin.admin.deliveryArea.update({
		id: created.id,
		name: 'Uji Zona CRUD',
		district: 'Pasaman Barat',
		shippingCost: 99_000,
		isActive: false,
	});
	checks.push(
		`Update (ongkir 99.000 + nonaktif): ${
			updated.shippingCost === 99_000 && updated.isActive === false ? '✓' : '✗'
		}`,
	);

	// 6) DELETE
	await admin.admin.deliveryArea.delete({ id: created.id });
	const gone = await prisma.deliveryArea.findUnique({ where: { id: created.id } });
	checks.push(`Delete (zona hilang dari DB): ${gone === null ? '✓' : '✗'}`);

	console.log('\n── Tes CRUD zona pengiriman admin (S0.9) ──');
	for (const c of checks) console.log(`  ${c}`);
	const pass = checks.every((c) => c.endsWith('✓'));
	console.log(
		`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — CRUD zona ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
	);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
