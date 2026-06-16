import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-status';

/**
 * Hari ini (kalender WIB, UTC+7) sebagai UTC-midnight.
 *
 * `OrderItem.installDate` disimpan sebagai UTC-midnight dari tanggal pasang.
 * Ambil instant sekarang, geser ke WIB untuk mendapat Y/M/D versi WIB, lalu
 * bangun ulang UTC-midnight dari komponen itu — sehingga cocok persis dengan
 * cara installDate disimpan.
 */
function wibTodayUtcMidnight(): { start: Date; end: Date } {
	const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
	const start = new Date(
		Date.UTC(
			nowWib.getUTCFullYear(),
			nowWib.getUTCMonth(),
			nowWib.getUTCDate(),
		),
	);
	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
	return { start, end };
}

/**
 * Rentang [start, end) sebuah bulan kalender WIB sebagai instant UTC sungguhan.
 *
 * Berbeda dari `installDate` (UTC-midnight date-only), `createdAt` adalah
 * timestamp riil — jadi batas bulan harus instant ketika kalender WIB melewati
 * tanggal 1 pukul 00:00, yaitu midnight-WIB dikurangi 7 jam (offset WIB).
 * `monthsAgo = 0` → bulan ini, `1` → bulan lalu. `Date.UTC` menangani luapan
 * bulan/tahun (mis. Januari → Desember tahun sebelumnya).
 */
function wibMonthRange(monthsAgo: number): { start: Date; end: Date } {
	const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
	const nowWib = new Date(Date.now() + WIB_OFFSET_MS);
	const y = nowWib.getUTCFullYear();
	const m = nowWib.getUTCMonth() - monthsAgo;
	const start = new Date(Date.UTC(y, m, 1) - WIB_OFFSET_MS);
	const end = new Date(Date.UTC(y, m + 1, 1) - WIB_OFFSET_MS);
	return { start, end };
}

/** Sum `total` pesanan terkonfirmasi (bukan PENDING/CANCELLED) dalam rentang createdAt. */
const CONFIRMED_REVENUE_WHERE = {
	status: { notIn: ['PENDING', 'CANCELLED'] as OrderStatus[] },
} as const;

/**
 * Ringkasan operasional dashboard admin (S?.?) — `adminProcedure`. Semua statistik
 * diambil dalam SATU round-trip via `Promise.all` (groupBy/count/aggregate/findMany,
 * tanpa N+1).
 */
export const adminDashboardRouter = createTRPCRouter({
	overview: adminProcedure.query(async ({ ctx }) => {
		const { start, end } = wibTodayUtcMidnight();
		const thisMonth = wibMonthRange(0);
		const lastMonth = wibMonthRange(1);

		const [
			statusGroups,
			todayInstalls,
			revenueAgg,
			customerCount,
			productCount,
			recentRows,
			ordersThisMonth,
			ordersLastMonth,
			revenueThisMonthAgg,
			revenueLastMonthAgg,
		] = await Promise.all([
			// Jumlah pesanan per status (1 query, bukan 6 count terpisah).
			ctx.prisma.order.groupBy({
				by: ['status'],
				_count: { _all: true },
			}),
			// Pemasangan hari ini (WIB): item dengan installDate hari ini & order
			// yang masih aktif (bukan dibatalkan/selesai).
			ctx.prisma.orderItem.count({
				where: {
					installDate: { gte: start, lt: end },
					order: { status: { notIn: ['CANCELLED', 'COMPLETED'] } },
				},
			}),
			// Nilai pesanan TERKONFIRMASI: jumlah `total` pesanan yang pembayarannya
			// sudah terverifikasi (PRD/ERD: CONFIRMED = "pembayaran terverifikasi").
			// PENDING (belum bayar/verifikasi) & CANCELLED tidak dihitung. Catatan:
			// model `Payment` belum ada, jadi ini nilai pesanan, bukan kas riil
			// (CONFIRMED bisa baru DP).
			ctx.prisma.order.aggregate({
				_sum: { total: true },
				where: CONFIRMED_REVENUE_WHERE,
			}),
			ctx.prisma.user.count({ where: { role: 'CUSTOMER' } }),
			ctx.prisma.product.count(),
			ctx.prisma.order.findMany({
				orderBy: { createdAt: 'desc' },
				take: 6,
				select: {
					id: true,
					orderNumber: true,
					status: true,
					total: true,
					createdAt: true,
					user: { select: { name: true, email: true } },
				},
			}),
			// Tren bulanan (createdAt, kalender WIB): jumlah pesanan & nilai
			// terkonfirmasi untuk bulan ini vs bulan lalu — basis panah naik/turun.
			ctx.prisma.order.count({
				where: { createdAt: { gte: thisMonth.start, lt: thisMonth.end } },
			}),
			ctx.prisma.order.count({
				where: { createdAt: { gte: lastMonth.start, lt: lastMonth.end } },
			}),
			ctx.prisma.order.aggregate({
				_sum: { total: true },
				where: {
					...CONFIRMED_REVENUE_WHERE,
					createdAt: { gte: thisMonth.start, lt: thisMonth.end },
				},
			}),
			ctx.prisma.order.aggregate({
				_sum: { total: true },
				where: {
					...CONFIRMED_REVENUE_WHERE,
					createdAt: { gte: lastMonth.start, lt: lastMonth.end },
				},
			}),
		]);

		// Reduce groupBy → objek dengan semua 6 status, default 0.
		const counts = ORDER_STATUSES.reduce(
			(acc, s) => {
				acc[s] = 0;
				return acc;
			},
			{} as Record<OrderStatus, number>,
		);
		let total = 0;
		for (const g of statusGroups) {
			const n = g._count._all;
			counts[g.status as OrderStatus] = n;
			total += n;
		}

		const recentOrders = recentRows.map((o) => ({
			id: o.id,
			orderNumber: o.orderNumber,
			status: o.status,
			total: o.total,
			createdAt: o.createdAt,
			customerName: o.user.name ?? o.user.email,
		}));

		return {
			orders: {
				total,
				pending: counts.PENDING,
				confirmed: counts.CONFIRMED,
				scheduled: counts.SCHEDULED,
				installed: counts.INSTALLED,
				completed: counts.COMPLETED,
				cancelled: counts.CANCELLED,
			},
			todayInstalls,
			revenue: revenueAgg._sum.total ?? 0,
			customerCount,
			productCount,
			recentOrders,
			// Tren bulan-berjalan vs bulan-lalu (delta % dihitung di klien).
			trends: {
				ordersThisMonth,
				ordersLastMonth,
				revenueThisMonth: revenueThisMonthAgg._sum.total ?? 0,
				revenueLastMonth: revenueLastMonthAgg._sum.total ?? 0,
			},
		};
	}),
});
