import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { auth } from '@/server/auth';
import { logger } from '@/lib/logger';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT_BY_TYPE: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
};

/**
 * Upload gambar (admin only) → simpan ke `public/uploads/` dan kembalikan
 * path publiknya (`/uploads/<uuid>.<ext>`). Penyimpanan lokal sementara;
 * nantinya bisa diganti ke object storage tanpa mengubah pemanggil.
 */
export async function POST(req: Request) {
	const session = await auth();
	if (session?.user?.role !== 'ADMIN') {
		return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
	}

	const formData = await req.formData();
	const file = formData.get('file');
	if (!(file instanceof File)) {
		return NextResponse.json(
			{ error: 'File tidak ditemukan.' },
			{ status: 400 },
		);
	}

	const ext = EXT_BY_TYPE[file.type];
	if (!ext) {
		return NextResponse.json(
			{ error: 'Tipe tidak didukung (hanya JPG, PNG, WEBP).' },
			{ status: 400 },
		);
	}
	if (file.size > MAX_BYTES) {
		return NextResponse.json(
			{ error: 'Ukuran file maksimal 5MB.' },
			{ status: 400 },
		);
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const filename = `${randomUUID()}.${ext}`;
	const dir = path.join(process.cwd(), 'public', 'uploads');
	await mkdir(dir, { recursive: true });
	await writeFile(path.join(dir, filename), buffer);

	logger.info(
		{ filename, type: file.type, size: file.size, userId: session.user.id },
		'Gambar produk diunggah',
	);

	return NextResponse.json({ url: `/uploads/${filename}` });
}
