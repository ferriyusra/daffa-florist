import { z } from 'zod';

import type { Prisma } from '@/generated/prisma';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { floorToUtcDay } from '@/lib/rental';

/**
 * Tugas harian tim lapangan (S3.5) — `adminProcedure`. Untuk SATU tanggal,
 * memuat `OrderItem` yang harus DIPASANG (installDate) dan yang harus DIAMBIL
 * (pickupDate) pada hari itu, lengkap dengan alamat, kontak, dan detail papan —
 * varian satu-hari & detail-kaya dari kalender operasional (calendar.ts).
 *
 * BASIS HARI UTC: installDate/pickupDate disimpan tengah-malam UTC (date-only),
 * jadi tanggal di-floor ke UTC-midnight dan rentang harian memakai [start, end)
 * (start + 24 jam) yang half-open. `eventDate` BERBEDA: ia membawa jam acara WIB
 * sehingga di klien di-format dengan `timeZone:'Asia/Jakarta'` untuk urutan jam.
 * Pesanan CANCELLED dilewati (bukan tugas lapangan); status lain — termasuk
 * COMPLETED — tetap dirender agar hari yang sudah lewat tetap tampil.
 */
export const adminTaskRouter = createTRPCRouter({
	daily: adminProcedure
		.input(z.object({ date: z.coerce.date() }))
		.query(async ({ ctx, input }) => {
			const start = floorToUtcDay(input.date);
			const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

			const select = {
				id: true,
				productTitle: true,
				sizeLabel: true,
				quantity: true,
				designTemplateName: true,
				themeColorName: true,
				addonNames: true,
				installDate: true,
				pickupDate: true,
				order: {
					select: {
						id: true,
						orderNumber: true,
						status: true,
						eventDate: true,
						notes: true,
						user: { select: { name: true, email: true } },
						address: {
							select: {
								recipientName: true,
								phone: true,
								fullAddress: true,
								city: true,
							},
						},
					},
				},
			} satisfies Prisma.OrderItemSelect;

			// Urutkan per jam acara (eventDate) lalu id — semua berbagi hari UTC yang
			// sama, jadi yang menentukan urutan tampil adalah jam acara WIB.
			const orderBy = [
				{ order: { eventDate: 'asc' } },
				{ id: 'asc' },
			] satisfies Prisma.OrderItemOrderByWithRelationInput[];

			const [installs, pickups] = await Promise.all([
				ctx.prisma.orderItem.findMany({
					where: {
						installDate: { gte: start, lt: end },
						order: { status: { not: 'CANCELLED' } },
					},
					select,
					orderBy,
				}),
				ctx.prisma.orderItem.findMany({
					where: {
						pickupDate: { gte: start, lt: end },
						order: { status: { not: 'CANCELLED' } },
					},
					select,
					orderBy,
				}),
			]);

			type Row = (typeof installs)[number];
			const toTask = (item: Row, type: 'install' | 'pickup') => {
				const { order } = item;
				const address = order.address;
				return {
					id: `${item.id}-${type}`,
					type,
					orderId: order.id,
					orderNumber: order.orderNumber,
					status: order.status,
					eventDate: order.eventDate,
					customerName:
						address?.recipientName ?? order.user.name ?? order.user.email,
					phone: address?.phone ?? null,
					fullAddress: address?.fullAddress ?? null,
					city: address?.city ?? null,
					productTitle: item.productTitle,
					sizeLabel: item.sizeLabel,
					quantity: item.quantity,
					designTemplateName: item.designTemplateName,
					themeColorName: item.themeColorName,
					addonNames: item.addonNames,
					notes: order.notes,
				};
			};

			return {
				date: start,
				installs: installs.map((i) => toTask(i, 'install')),
				pickups: pickups.map((i) => toTask(i, 'pickup')),
			};
		}),
});
