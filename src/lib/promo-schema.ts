import { z } from 'zod';

/** Tipe diskon promo. */
export const promoTypes = ['PERCENT', 'AMOUNT'] as const;
export type PromoTypeValue = (typeof promoTypes)[number];

/** Batas atas nominal diskon — selaras MAX_RUPIAH di RupiahInput. */
export const MAX_PROMO_AMOUNT = 999_999_999;

const promoBase = z.object({
	code: z
		.string()
		.min(1, 'Kode wajib diisi.')
		.regex(/^[A-Z0-9]+$/, 'Kode hanya huruf kapital & angka (tanpa spasi).'),
	description: z.string().optional(),
	type: z.enum(promoTypes, { message: 'Tipe diskon wajib dipilih.' }),
	value: z.number().int().min(1, 'Nilai diskon wajib diisi.'),
	startsAt: z.date().nullable().default(null),
	endsAt: z.date().nullable().default(null),
	isActive: z.boolean().default(true),
});

/** Validasi silang: nilai sesuai tipe, dan rentang tanggal masuk akal. */
const promoRefine = (v: z.infer<typeof promoBase>, ctx: z.RefinementCtx) => {
	if (v.type === 'PERCENT' && v.value > 100) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['value'],
			message: 'Diskon persen maksimal 100%.',
		});
	}
	if (v.type === 'AMOUNT' && v.value > MAX_PROMO_AMOUNT) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['value'],
			message: 'Nominal maksimal Rp 999.999.999.',
		});
	}
	if (v.startsAt && v.endsAt && v.endsAt < v.startsAt) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['endsAt'],
			message: 'Tanggal akhir harus setelah tanggal mulai.',
		});
	}
};

/**
 * Schema field promo — dipakai bersama router `admin.promo` (server) & form admin
 * (validasi client per-field). `promoUpdateFields` = versi + `id` untuk update.
 */
export const promoFields = promoBase.superRefine(promoRefine);
export const promoUpdateFields = promoBase
	.extend({ id: z.string().min(1) })
	.superRefine(promoRefine);

export type PromoFields = z.infer<typeof promoFields>;
