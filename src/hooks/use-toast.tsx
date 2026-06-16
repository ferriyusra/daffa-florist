'use client';

import { GooeyToaster, gooeyToast } from 'goey-toast';
import 'goey-toast/styles.css';

type ToastApi = {
	success: (message: string) => void;
	error: (message: string) => void;
};

const api: ToastApi = {
	success: (message) => gooeyToast.success(message),
	error: (message) => gooeyToast.error(message),
};

/**
 * Provider notifikasi toaster (goey-toast). Pasang sekali di root
 * (lihat providers.tsx) untuk me-mount viewport-nya.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<GooeyToaster position='top-center' />
		</>
	);
}

/**
 * Akses API toaster: `const toast = useToast()` lalu
 * `toast.success(...)` / `toast.error(...)` di komponen mana pun.
 */
export function useToast(): ToastApi {
	return api;
}
