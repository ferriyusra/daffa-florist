import { z } from 'zod';

/** Kategori galeri (dipakai admin form & filter publik). */
export const galleryCategories = ['Papan Bunga', 'Mobil Pengantin'] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

/**
 * Schema field item galeri — dipakai bersama router `admin.gallery` (server) dan
 * form admin (validasi client per-field). Pesan Bahasa Indonesia.
 */
export const galleryFields = z.object({
	title: z.string().min(1, 'Judul wajib diisi.'),
	image: z.string().min(1, 'Gambar wajib diunggah.'),
	category: z.enum(galleryCategories, { message: 'Kategori wajib dipilih.' }),
	sortOrder: z.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

export type GalleryFields = z.infer<typeof galleryFields>;
