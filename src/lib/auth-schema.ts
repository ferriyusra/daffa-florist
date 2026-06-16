import { z } from 'zod';

/**
 * Schema field registrasi — dipakai bersama oleh router `auth.register` (server)
 * dan form register (validasi client per-field). Pesan Bahasa Indonesia.
 */
export const registerFields = z.object({
	name: z.string().min(1, 'Nama wajib diisi.'),
	email: z
		.string()
		.min(1, 'Email wajib diisi.')
		.email('Format email tidak valid.'),
	phone: z
		.string()
		.min(8, 'Nomor WhatsApp minimal 8 digit.')
		.regex(/^[0-9+]+$/, 'Nomor WhatsApp hanya boleh angka.'),
	password: z.string().min(6, 'Password minimal 6 karakter.'),
});

export type RegisterFields = z.infer<typeof registerFields>;
