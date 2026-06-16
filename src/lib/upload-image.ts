/**
 * Unggah satu gambar ke `/api/upload` (admin) dan kembalikan path publiknya.
 * Memakai XHR agar bisa melaporkan progress unggah (`onProgress`, 0–100).
 * Melempar error dengan pesan dari server bila gagal.
 */
export function uploadImage(
	file: File,
	onProgress?: (percent: number) => void,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const body = new FormData();
		body.append('file', file);

		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/upload');

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				onProgress?.(Math.round((e.loaded / e.total) * 100));
			}
		};

		xhr.onload = () => {
			let data: { url?: string; error?: string } = {};
			try {
				data = JSON.parse(xhr.responseText) as typeof data;
			} catch {
				// Respons bukan JSON valid (mis. HTML error page / body kosong).
				data = { error: 'Respons server tidak valid.' };
			}
			if (xhr.status >= 200 && xhr.status < 300 && data.url) {
				onProgress?.(100);
				resolve(data.url);
			} else {
				reject(new Error(data.error ?? 'Upload gagal.'));
			}
		};

		xhr.onerror = () => reject(new Error('Upload gagal.'));
		// Cegah upload menggantung selamanya bila koneksi stall.
		xhr.timeout = 30_000;
		xhr.ontimeout = () =>
			reject(new Error('Upload melebihi batas waktu. Coba lagi.'));
		xhr.send(body);
	});
}
