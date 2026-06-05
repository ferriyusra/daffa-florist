import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/trpc';

/**
 * Tes manual manajemen customer admin (S0.8) — guard, list (tanpa password),
 * getById, ubah peran & aktif/nonaktif, dan guard "akun sendiri".
 * Jalankan: `tsx scripts/test-admin-customer.ts` (perlu seed lebih dulu).
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
	const adminUser = await prisma.user.findUniqueOrThrow({
		where: { email: 'admin@daffaflorist.test' },
	});
	const ujiUser = await prisma.user.findUniqueOrThrow({
		where: { email: 'uji@daffaflorist.test' },
	});
	const checks: string[] = [];

	// 1) Guard: CUSTOMER ditolak.
	let forbidden = false;
	try {
		await customer.admin.customer.list({});
	} catch (e) {
		forbidden = (e as { code?: string }).code === 'FORBIDDEN';
	}
	checks.push(`Guard adminProcedure menolak CUSTOMER: ${forbidden ? '✓' : '✗'}`);

	// 2) list: ≥2 user, tanpa hashedPassword, ada orderCount/totalSpent.
	const list = await admin.admin.customer.list({});
	const first = list.items[0] as Record<string, unknown> | undefined;
	const listOk =
		list.total >= 2 &&
		first !== undefined &&
		!('hashedPassword' in first) &&
		'orderCount' in first &&
		'totalSpent' in first;
	checks.push(
		`List (${list.total} user, tanpa password, +orderCount/totalSpent): ${listOk ? '✓' : '✗'}`,
	);

	// 3) Cari (search by email).
	const searched = await admin.admin.customer.list({ search: 'uji@' });
	checks.push(
		`Cari "uji@" menemukan customer: ${
			searched.items.some((u) => u.id === ujiUser.id) ? '✓' : '✗'
		}`,
	);

	// 4) getById tanpa password.
	const detail = (await admin.admin.customer.getById({
		id: ujiUser.id,
	})) as Record<string, unknown>;
	checks.push(
		`getById (email cocok, tanpa password, ada addresses/orders): ${
			detail.email === ujiUser.email &&
			!('hashedPassword' in detail) &&
			'addresses' in detail &&
			'orders' in detail
				? '✓'
				: '✗'
		}`,
	);

	// 5) Ubah peran CUSTOMER→ADMIN→CUSTOMER.
	const toAdmin = await admin.admin.customer.update({
		id: ujiUser.id,
		role: 'ADMIN',
	});
	const toCustomer = await admin.admin.customer.update({
		id: ujiUser.id,
		role: 'CUSTOMER',
	});
	checks.push(
		`Ubah peran ADMIN→CUSTOMER: ${
			toAdmin.role === 'ADMIN' && toCustomer.role === 'CUSTOMER' ? '✓' : '✗'
		}`,
	);

	// 6) Nonaktifkan lalu aktifkan kembali.
	const off = await admin.admin.customer.update({
		id: ujiUser.id,
		isActive: false,
	});
	const on = await admin.admin.customer.update({
		id: ujiUser.id,
		isActive: true,
	});
	checks.push(
		`Nonaktif→Aktif: ${off.isActive === false && on.isActive === true ? '✓' : '✗'}`,
	);

	// 7) Guard akun sendiri.
	let selfBlocked = false;
	try {
		await admin.admin.customer.update({ id: adminUser.id, role: 'CUSTOMER' });
	} catch (e) {
		selfBlocked = (e as { code?: string }).code === 'BAD_REQUEST';
	}
	checks.push(`Tolak ubah akun sendiri: ${selfBlocked ? '✓' : '✗'}`);

	console.log('\n── Tes manajemen customer admin (S0.8) ──');
	for (const c of checks) console.log(`  ${c}`);
	const pass = checks.every((c) => c.endsWith('✓'));
	console.log(
		`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — manajemen customer ${pass ? 'berfungsi.' : 'bermasalah.'}\n`,
	);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
