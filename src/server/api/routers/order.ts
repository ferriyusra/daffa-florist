import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import {
	createTRPCRouter,
	protectedProcedure,
} from '@/server/api/trpc';
import { Prisma } from '@/generated/prisma';
import { checkSizeAvailability } from '@/server/rental';
import {
	addDays,
	computePickupDate,
	floorToUtcDay,
	MAX_BOOKED_RANGE_DAYS,
} from '@/lib/rental';
import { MIN_LEAD_TIME_DAYS } from '@/lib/constant';

const orderItemInput = z.object({
	productSlug: z.string().min(1),
	productTitle: z.string().min(1),
	productImage: z.string().min(1),
	sizeLabel: z.string().optional(),
	price: z.number().int().nonnegative(),
	quantity: z.number().int().positive(),
	designTemplateName: z.string().optional(),
	themeColorName: z.string().optional(),
	addonNames: z.array(z.string()).default([]),
	// Periode sewa (PRD §7.3): pelanggan memilih tanggal pasang + durasi tampil.
	installDate: z.coerce.date(),
	rentalDays: z.number().int().positive(),
});

function generateOrderNumber() {
	const ts = Date.now().toString(36).toUpperCase();
	const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
	return `DF-${ts}-${rnd}`;
}

/** Maksimum percobaan pembuatan order bila `orderNumber` bentrok (P2002). */
const MAX_ORDER_NUMBER_ATTEMPTS = 5;

/** Format tanggal ke `YYYY-MM-DD` memakai getter UTC (basis date-only domain sewa). */
function formatUtcDate(date: Date): string {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, '0');
	const d = String(date.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Item sewa yang sudah dinormalisasi server (tanggal di-floor ke hari UTC). */
type RentalItemInput = z.infer<typeof rentalItemInput>;

const rentalItemInput = z.object({
	productId: z.string().uuid(),
	// Ketersediaan sewa dihitung per ukuran → sizeLabel WAJIB.
	sizeLabel: z.string().min(1),
	quantity: z.number().int().positive().default(1),
	installDate: z.coerce.date(),
	rentalDays: z.number().int().positive().max(MAX_BOOKED_RANGE_DAYS),
	designTemplateName: z.string().optional(),
	themeColorName: z.string().optional(),
	addonNames: z.array(z.string()).default([]),
});

export const orderRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				addressId: z.string().optional(),
				items: z.array(orderItemInput).min(1),
				shippingCost: z.number().int().nonnegative().default(0),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const subtotal = input.items.reduce(
				(sum, i) => sum + i.price * i.quantity,
				0,
			);
			const total = subtotal + input.shippingCost;

			// Cegah IDOR: alamat (bila diberikan) harus milik pengguna ini.
			if (input.addressId) {
				const address = await ctx.prisma.address.findFirst({
					where: { id: input.addressId, userId: ctx.session.user.id },
					select: { id: true },
				});
				if (!address) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Alamat tidak ditemukan.',
					});
				}
			}

			const order = await ctx.prisma.order.create({
				data: {
					orderNumber: generateOrderNumber(),
					userId: ctx.session.user.id,
					addressId: input.addressId,
					subtotal,
					shippingCost: input.shippingCost,
					total,
					notes: input.notes,
					items: {
						create: input.items.map((i) => ({
							productSlug: i.productSlug,
							productTitle: i.productTitle,
							productImage: i.productImage,
							sizeLabel: i.sizeLabel,
							price: i.price,
							quantity: i.quantity,
							designTemplateName: i.designTemplateName,
							themeColorName: i.themeColorName,
							addonNames: i.addonNames,
							installDate: i.installDate,
							rentalDays: i.rentalDays,
							pickupDate: computePickupDate(i.installDate, i.rentalDays),
						})),
					},
				},
				include: { items: true },
			});

			return order;
		}),

	list: protectedProcedure.query(({ ctx }) =>
		ctx.prisma.order.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: 'desc' },
			include: { items: true, address: true },
		}),
	),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findUnique({
				where: { id: input.id },
				include: { items: true, address: true },
			});
			if (!order || order.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}
			return order;
		}),

	/**
	 * Membuat pesanan SEWA (PENDING) + OrderItem-nya, dengan RE-VALIDASI
	 * ketersediaan di DALAM satu transaksi DB sehingga dua permintaan
	 * bersamaan untuk unit terakhir → hanya SATU yang berhasil (S2.6, AC inti
	 * anti double-booking, ERD §4).
	 *
	 * Keamanan: semua field uang/denormalisasi (price/title/slug/image)
	 * DITURUNKAN dari DB — input klien untuk harga TIDAK pernah dipercaya.
	 *
	 * Konkurensi: sebelum membaca ketersediaan, transaksi mengambil Postgres
	 * advisory lock per (productId + sizeLabel) sehingga createRental
	 * bersamaan pada ukuran yang sama DISERIALKAN — re-check + insert jadi
	 * atomik terhadap transaksi lain. Lock auto-release di akhir transaksi.
	 */
	createRental: protectedProcedure
		.input(
			z.object({
				addressId: z.string().uuid().optional(),
				notes: z.string().optional(),
				shippingCost: z.number().int().nonnegative().default(0),
				eventDate: z.coerce.date().optional(),
				items: z.array(rentalItemInput).min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// (1) Validasi lead time SEBELUM transaksi. Di sini `new Date()`
			// boleh dipakai (bukan helper murni). Normalisasi tanggal pasang
			// ke tengah malam UTC agar konsisten dengan domain date-only.
			const today = floorToUtcDay(new Date());
			const minInstall = addDays(today, MIN_LEAD_TIME_DAYS);

			const items: RentalItemInput[] = input.items.map((item) => ({
				...item,
				installDate: floorToUtcDay(item.installDate),
			}));

			for (const item of items) {
				if (item.installDate.getTime() < minInstall.getTime()) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: `Tanggal pasang paling cepat ${formatUtcDate(
							minInstall,
						)} (lead time ${MIN_LEAD_TIME_DAYS} hari).`,
					});
				}
			}

			// (2) Cegah IDOR: alamat (bila diberikan) WAJIB milik pengguna ini —
			// jangan connect addressId milik orang lain.
			if (input.addressId) {
				const address = await ctx.prisma.address.findFirst({
					where: { id: input.addressId, userId: ctx.session.user.id },
					select: { id: true },
				});
				if (!address) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Alamat tidak ditemukan.',
					});
				}
			}

			return ctx.prisma.$transaction(async (tx) => {
				// (3) Advisory lock per (productId|sizeLabel). Urutkan kunci agar
				// stabil → mencegah deadlock antar transaksi. Diambil SEBELUM
				// membaca ketersediaan supaya re-check + insert atomik.
				const lockKeys = [
					...new Set(items.map((i) => `${i.productId}|${i.sizeLabel}`)),
				].sort();
				for (const key of lockKeys) {
					await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
				}

				// (4) Muat data otoritatif di dalam transaksi.
				const productIds = [...new Set(items.map((i) => i.productId))];
				const products = await tx.product.findMany({
					where: { id: { in: productIds } },
					include: { sizes: true, addons: true },
				});
				const productById = new Map(products.map((p) => [p.id, p]));

				type PreparedItem = {
					input: RentalItemInput;
					price: number;
					productSlug: string;
					productTitle: string;
					productImage: string;
					pickupDate: Date;
				};
				const prepared: PreparedItem[] = items.map((item) => {
					const product = productById.get(item.productId);
					if (!product) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: `Produk ${item.productId} tidak ditemukan.`,
						});
					}
					const size = product.sizes.find(
						(s) => s.label === item.sizeLabel,
					);
					if (!size) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: `Ukuran "${item.sizeLabel}" tidak ditemukan untuk produk ${product.title}.`,
						});
					}
					// Harga sewa per UKURAN (bukan basePrice) + total addon terpilih.
					let price = size.price;
					for (const addonName of item.addonNames) {
						const addon = product.addons.find((a) => a.name === addonName);
						if (!addon) {
							throw new TRPCError({
								code: 'NOT_FOUND',
								message: `Add-on "${addonName}" tidak ditemukan untuk produk ${product.title}.`,
							});
						}
						price += addon.price;
					}
					return {
						input: item,
						price,
						productSlug: product.slug,
						productTitle: product.title,
						productImage: product.image,
						pickupDate: computePickupDate(item.installDate, item.rentalDays),
					};
				});

				// (5) Re-check ketersediaan di dalam transaksi. Item dalam ORDER
				// INI yang berbagi komposit (productId, sizeLabel, installDate(ms),
				// rentalDays) dikelompokkan agar SUM(quantity) grup <= remainingUnits
				// untuk periode grup (remainingUnits identik dalam satu grup karena
				// periode sama).
				//
				// LIMITASI yang diketahui: dua periode BERBEDA namun saling tumpang
				// tindih untuk ukuran yang SAMA dalam SATU order TIDAK dicek silang
				// (kasus langka). Keamanan lintas-order — perhatian utama —
				// terjaga oleh advisory lock + re-check per periode di sini.
				const groups = new Map<string, RentalItemInput[]>();
				for (const item of items) {
					const key = `${item.productId}|${item.sizeLabel}|${item.installDate.getTime()}|${item.rentalDays}`;
					const group = groups.get(key);
					if (group) group.push(item);
					else groups.set(key, [item]);
				}

				for (const group of groups.values()) {
					const first = group[0]!;
					const requestedQty = group.reduce((sum, i) => sum + i.quantity, 0);
					const availability = await checkSizeAvailability(tx, {
						productId: first.productId,
						sizeLabel: first.sizeLabel,
						installDate: first.installDate,
						rentalDays: first.rentalDays,
					});
					if (availability.remainingUnits < requestedQty) {
						const next = availability.nextAvailableDate
							? ` Tersedia lagi mulai ${formatUtcDate(availability.nextAvailableDate)}.`
							: '';
						const product = productById.get(first.productId);
						throw new TRPCError({
							code: 'CONFLICT',
							message: `Unit ukuran "${first.sizeLabel}"${
								product ? ` (${product.title})` : ''
							} tidak cukup untuk periode pasang ${formatUtcDate(
								first.installDate,
							)} (diminta ${requestedQty}, tersisa ${availability.remainingUnits}).${next}`,
						});
					}
				}

				// (6) Buat order. subtotal = Σ(price*qty); total = subtotal +
				// shippingCost (TANPA deposit). Status default PENDING.
				const subtotal = prepared.reduce(
					(sum, p) => sum + p.price * p.input.quantity,
					0,
				);
				const total = subtotal + input.shippingCost;

				const data = (orderNumber: string): Prisma.OrderCreateInput => ({
					orderNumber,
					user: { connect: { id: ctx.session.user.id } },
					...(input.addressId
						? { address: { connect: { id: input.addressId } } }
						: {}),
					subtotal,
					shippingCost: input.shippingCost,
					total,
					notes: input.notes,
					eventDate: input.eventDate,
					items: {
						create: prepared.map((p) => ({
							product: { connect: { id: p.input.productId } },
							productSlug: p.productSlug,
							productTitle: p.productTitle,
							productImage: p.productImage,
							sizeLabel: p.input.sizeLabel,
							price: p.price,
							quantity: p.input.quantity,
							designTemplateName: p.input.designTemplateName,
							themeColorName: p.input.themeColorName,
							addonNames: p.input.addonNames,
							installDate: p.input.installDate,
							rentalDays: p.input.rentalDays,
							pickupDate: p.pickupDate,
						})),
					},
				});

				// Guard unique constraint orderNumber: bila P2002, coba lagi
				// dengan nomor baru (loop terbatas) — jangan gagalkan booking.
				for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
					try {
						return await tx.order.create({
							data: data(generateOrderNumber()),
							include: { items: true, address: true },
						});
					} catch (err) {
						// Hanya retry bila bentrok justru pada `orderNumber` — jangan
						// telan P2002 dari unique constraint lain (mis. alokasi unit).
						const target =
							err instanceof Prisma.PrismaClientKnownRequestError &&
							err.code === 'P2002'
								? ((err.meta?.target as string[] | undefined) ?? [])
								: null;
						if (
							target?.includes('orderNumber') &&
							attempt < MAX_ORDER_NUMBER_ATTEMPTS - 1
						) {
							continue;
						}
						throw err;
					}
				}
				// Tak terjangkau (loop selalu return/throw), tapi memuaskan tipe.
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Gagal membuat nomor pesanan unik.',
				});
			});
		}),

	/**
	 * Daftar pesanan milik pengguna saat ini (dipakai dashboard, S2.6).
	 * Fungsional sama dengan `list`; `listMine` adalah nama kanoniknya.
	 */
	listMine: protectedProcedure.query(({ ctx }) =>
		ctx.prisma.order.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: 'desc' },
			include: { items: true, address: true },
		}),
	),
});
