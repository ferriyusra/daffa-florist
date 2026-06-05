import { z } from 'zod';

/** Batas atas ongkir — selaras MAX_RUPIAH di komponen RupiahInput. */
export const MAX_SHIPPING_COST = 999_999_999;

/**
 * Schema field zona pengiriman — dipakai bersama router `admin.deliveryArea`
 * (server) dan form admin (validasi client per-field). Pesan Bahasa Indonesia.
 */
export const deliveryAreaFields = z.object({
	name: z.string().min(1, 'Nama zona wajib diisi.'),
	district: z.string().optional(),
	shippingCost: z
		.number()
		.int()
		.min(0, 'Ongkir tidak boleh negatif.')
		.max(MAX_SHIPPING_COST, 'Ongkir maksimal Rp 999.999.999.'),
	isActive: z.boolean().default(true),
});

export type DeliveryAreaFields = z.infer<typeof deliveryAreaFields>;
