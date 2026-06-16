/**
 * Loader snap.js (client-safe). Memuat script Snap sekali dengan `clientKey`
 * lalu memanggil popup pembayaran. URL & clientKey berasal dari respons
 * `payment.createSnapTransaction` (server yang menentukan sandbox vs produksi).
 */

type SnapResult = Record<string, unknown>;

type SnapCallbacks = {
	onSuccess?: (result: SnapResult) => void;
	onPending?: (result: SnapResult) => void;
	onError?: (result: SnapResult) => void;
	onClose?: () => void;
};

type SnapGlobal = {
	pay: (token: string, callbacks: SnapCallbacks) => void;
};

declare global {
	interface Window {
		snap?: SnapGlobal;
	}
}

const SCRIPT_ID = 'midtrans-snap';

/** Inject script snap.js sekali; resolve saat `window.snap` siap. */
function loadSnapScript(url: string, clientKey: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') {
			reject(new Error('Snap hanya tersedia di browser.'));
			return;
		}
		if (window.snap) {
			resolve();
			return;
		}
		const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
		if (existing) {
			existing.addEventListener('load', () => resolve(), { once: true });
			existing.addEventListener('error', () => reject(new Error('Gagal memuat Snap.')), {
				once: true,
			});
			return;
		}
		const script = document.createElement('script');
		script.id = SCRIPT_ID;
		script.src = url;
		script.setAttribute('data-client-key', clientKey);
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Gagal memuat Snap.'));
		document.body.appendChild(script);
	});
}

/** Muat Snap (bila perlu) lalu buka popup pembayaran untuk `snapToken`. */
export async function payWithSnap(
	args: { snapJsUrl: string; clientKey: string; snapToken: string },
	callbacks: SnapCallbacks,
): Promise<void> {
	await loadSnapScript(args.snapJsUrl, args.clientKey);
	if (!window.snap) throw new Error('Snap tidak tersedia.');
	window.snap.pay(args.snapToken, callbacks);
}
