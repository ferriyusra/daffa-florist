import { z } from 'zod';

import { productCategories } from '@/lib/products';

/** Batas atas nominal — selaras dengan MAX_RUPIAH di komponen RupiahInput. */
export const MAX_PRICE = 999_999_999;

/** Batas jumlah varian ukuran per produk (selaras jumlah preset di form). */
export const MAX_SIZES = 4;

/** Batas jumlah gambar galeri per produk. */
export const MAX_GALLERY = 4;

/**
 * Schema field produk — dipakai bersama oleh router admin (validasi server) dan
 * form admin (validasi client per-field). Pesan ditulis Bahasa Indonesia.
 */
export const productFields = z.object({
	slug: z
		.string()
		.min(1, 'Slug wajib diisi.')
		.regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip.'),
	title: z.string().min(1, 'Judul wajib diisi.'),
	shortDescription: z.string().min(1, 'Deskripsi singkat wajib diisi.'),
	description: z.string().min(1, 'Deskripsi lengkap wajib diisi.'),
	category: z.enum(productCategories, { message: 'Kategori wajib dipilih.' }),
	basePrice: z
		.number()
		.int()
		.min(1, 'Harga wajib diisi.')
		.max(MAX_PRICE, 'Harga maksimal Rp 999.999.999.'),
	image: z.string().min(1, 'Gambar utama wajib diunggah.'),
	productionTime: z.string().optional(),
	images: z
		.array(z.string().min(1))
		.max(MAX_GALLERY, `Maksimal ${MAX_GALLERY} gambar galeri.`)
		.default([]),
	tags: z.array(z.string().min(1)).default([]),
	serviceAreas: z.array(z.string().min(1)).default([]),
	// Varian ukuran + harga sewa per ukuran (relasi ProductSize — lihat ERD).
	sizes: z
		.array(
			z.object({
				label: z.string().min(1, 'Label ukuran wajib diisi.'),
				price: z
					.number()
					.int()
					.min(1, 'Harga ukuran wajib diisi.')
					.max(MAX_PRICE, 'Harga maksimal Rp 999.999.999.'),
				note: z.string().optional(),
			}),
		)
		.max(MAX_SIZES, `Maksimal ${MAX_SIZES} ukuran.`)
		.superRefine((sizes, ctx) => {
			// Cegah label ukuran ganda (case-insensitive). Issue diarahkan ke baris
			// duplikatnya → tampil di input "Ukuran" baris tsb pada form.
			const seen = new Set<string>();
			sizes.forEach((s, i) => {
				const key = s.label.trim().toLowerCase();
				if (!key) return; // label kosong sudah ditangani validasi field
				if (seen.has(key)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Ukuran ini sudah ada — tidak boleh ganda.',
						path: [i, 'label'],
					});
				} else {
					seen.add(key);
				}
			});
		})
		.default([]),
});

export type ProductFormValues = z.infer<typeof productFields>;
