import 'dotenv/config';
import { prisma } from '@/lib/prisma';

/**
 * Backfill `OrderStatusHistory` untuk pesanan yang dibuat SEBELUM audit trail
 * diaktifkan (migrasi `add_order_status_history`). Tiap order tanpa riwayat
 * diberi SATU baris sintetis `null → status saat ini`, di-stamp pada
 * `order.createdAt` agar urutan timeline tetap masuk akal, `changedBy = null`
 * (aktor historis tak diketahui = dianggap sistem).
 *
 * Idempoten: hanya menyisipkan untuk order yang BELUM punya riwayat sama sekali,
 * jadi aman dijalankan berkali-kali. Jalankan:
 * `tsx scripts/backfill-order-status-history.ts`.
 */
async function main() {
	const orphans = await prisma.order.findMany({
		where: { statusHistory: { none: {} } },
		select: { id: true, orderNumber: true, status: true, createdAt: true },
		orderBy: { createdAt: 'asc' },
	});

	if (orphans.length === 0) {
		console.log('Tidak ada pesanan tanpa riwayat — tak ada yang di-backfill.');
		return;
	}

	console.log(`Menemukan ${orphans.length} pesanan tanpa riwayat. Mengisi...`);

	const result = await prisma.orderStatusHistory.createMany({
		data: orphans.map((o) => ({
			orderId: o.id,
			fromStatus: null,
			toStatus: o.status,
			changedBy: null,
			note: 'Backfill: status sebelum audit trail diaktifkan',
			createdAt: o.createdAt,
		})),
	});

	console.log(`Selesai. ${result.count} baris riwayat dibuat.`);
}

main()
	.catch((err) => {
		console.error('Backfill gagal:', err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
