import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/context';

/**
 * Tes manual CRUD promo admin (S0.7) — guard, list, create, tolak kode ganda
 * (CONFLICT), tolak persen > 100 (validasi silang), update, delete.
 * Jalankan: `tsx scripts/test-admin-promo.ts` (perlu seed lebih dulu).
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

	// 1) Guard.
	let forbidden = false;
	try {
		await customer.admin.promo.list();
	} catch (e) {
		forbidden = (e as { code?: string }).code === 'FORBIDDEN';
	}
	checks.push(`Guard adminProcedure menolak CUSTOMER: ${forbidden ? '✓' : '✗'}`);

	// 2) LIST (≥2 seed).
	const list = await admin.admin.promo.list();
	checks.push(`List (${list.length} promo, ≥2 seed): ${list.length >= 2 ? '✓' : '✗'}`);

	// 3) CREATE (persen).
	const created = await admin.admin.promo.create({
		code: 'UJICRUD',
		description: 'Promo uji',
		type: 'PERCENT',
		value: 15,
		startsAt: null,
		endsAt: null,
		isActive: true,
	});
	checks.push(`Create promo PERCENT 15%: ${created.value === 15 ? '✓' : '✗'}`);

	// 4) CONFLICT kode ganda.
	let conflict = false;
	try {
		await admin.admin.promo.create({
			code: 'UJICRUD',
			type: 'AMOUNT',
			value: 1000,
			startsAt: null,
			endsAt: null,
			isActive: true,
		});
	} catch (e) {
		conflict = (e as { code?: string }).code === 'CONFLICT';
	}
	checks.push(`Tolak kode promo ganda (CONFLICT): ${conflict ? '✓' : '✗'}`);

	// 5) Validasi silang: PERCENT > 100 ditolak (BAD_REQUEST dari zod).
	let percentRejected = false;
	try {
		await admin.admin.promo.create({
			code: 'TERLALUBESAR',
			type: 'PERCENT',
			value: 150,
			startsAt: null,
			endsAt: null,
			isActive: true,
		});
	} catch (e) {
		percentRejected = (e as { code?: string }).code === 'BAD_REQUEST';
	}
	checks.push(`Tolak persen > 100 (validasi silang): ${percentRejected ? '✓' : '✗'}`);

	// 6) UPDATE → ganti ke nominal + nonaktif.
	const updated = await admin.admin.promo.update({
		id: created.id,
		code: 'UJICRUD',
		type: 'AMOUNT',
		value: 30_000,
		startsAt: null,
		endsAt: null,
		isActive: false,
	});
	checks.push(
		`Update (→ AMOUNT 30.000 + nonaktif): ${
			updated.type === 'AMOUNT' && updated.value === 30_000 && !updated.isActive
				? '✓'
				: '✗'
		}`,
	);

	// 7) DELETE
	await admin.admin.promo.delete({ id: created.id });
	const gone = await prisma.promo.findUnique({ where: { id: created.id } });
	checks.push(`Delete (promo hilang dari DB): ${gone === null ? '✓' : '✗'}`);

	console.log('\n── Tes CRUD promo admin (S0.7) ──');
	for (const c of checks) console.log(`  ${c}`);
	const pass = checks.every((c) => c.endsWith('✓'));
	console.log(
		`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — CRUD promo ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
	);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
