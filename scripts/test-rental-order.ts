import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma';
import { products } from '@/lib/products';
import { createCaller } from '@/server/api/root';
import type { createTRPCContext } from '@/server/api/context';

/**
 * Tes manual alur data sewa (S1.2) — menjalankan mutation `order.create` SUNGGUHAN
 * lewat tRPC caller, lalu memverifikasi pickupDate dihitung server (installDate + rentalDays)
 * dan status default PENDING (enum sewa baru).
 *
 * Prasyarat: `tsx prisma/seed.ts` sudah dijalankan (butuh user uji).
 * Jalankan: `tsx scripts/test-rental-order.ts`.
 */
type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
	const prisma = new PrismaClient({ adapter });

	const user = await prisma.user.findUnique({
		where: { email: 'uji@daffaflorist.test' },
	});
	if (!user) {
		throw new Error('User uji belum ada. Jalankan dulu: tsx prisma/seed.ts');
	}

	// Konteks tRPC palsu dengan sesi user uji (lewati auth() asli).
	const session = {
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
		expires: new Date(Date.now() + 86_400_000).toISOString(),
	} as NonNullable<Ctx['session']>;
	const caller = createCaller({ session, prisma, headers: new Headers() });

	// Pilih produk & ukuran nyata dari katalog sebagai snapshot item.
	const product = products[0];
	const size = product.sizes[0];

	const installDate = new Date();
	installDate.setDate(installDate.getDate() + 7); // pasang H+7
	const rentalDays = 3; // tampil 3 hari

	const order = await caller.order.create({
		shippingCost: 50_000,
		notes: 'Pesanan uji sewa (S1.2).',
		items: [
			{
				productSlug: product.slug,
				productTitle: product.title,
				productImage: product.image,
				sizeLabel: size.label,
				price: size.price,
				quantity: 1,
				addonNames: [],
				installDate,
				rentalDays,
			},
		],
	});

	// Baca ulang lewat caller (round-trip) untuk memastikan tersimpan & terbaca.
	const readback = await caller.order.getById({ id: order.id });
	const item = readback.items[0];

	const expectedPickup = new Date(installDate);
	expectedPickup.setDate(expectedPickup.getDate() + rentalDays);
	const pickupOk = item.pickupDate.getTime() === expectedPickup.getTime();
	const statusOk = readback.status === 'PENDING';

	console.log('\n── Hasil tes order sewa (S1.2) ──');
	console.log(`orderNumber : ${readback.orderNumber}`);
	console.log(`status      : ${readback.status}  ${statusOk ? '✓ (default PENDING)' : '✗'}`);
	console.log(`produk      : ${item.productTitle} — ${item.sizeLabel}`);
	console.log(`installDate : ${iso(item.installDate)}`);
	console.log(`rentalDays  : ${item.rentalDays}`);
	console.log(`pickupDate  : ${iso(item.pickupDate)}  ${pickupOk ? `✓ (= install + ${rentalDays}h)` : `✗ (harusnya ${iso(expectedPickup)})`}`);
	console.log(`total       : Rp ${readback.total.toLocaleString('id-ID')} (subtotal ${readback.subtotal.toLocaleString('id-ID')} + ongkir ${readback.shippingCost.toLocaleString('id-ID')})`);
	console.log(`unitId      : ${item.unitId ?? 'null (dialokasikan admin nanti — S3.3)'}`);

	const pass = pickupOk && statusOk;
	console.log(`\n${pass ? '✓ LULUS' : '✗ GAGAL'} — alur data sewa S1.2 ${pass ? 'berfungsi.' : 'bermasalah.'}\n`);

	await prisma.$disconnect();
	if (!pass) process.exit(1);
}

main().catch((err) => {
	console.error('Tes gagal:', err);
	process.exit(1);
});
