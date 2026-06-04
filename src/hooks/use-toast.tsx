'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

type ToastVariant = 'success' | 'error';
type Toast = { id: number; message: string; variant: ToastVariant };

type ToastApi = {
	success: (message: string) => void;
	error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 4000;

/**
 * Provider notifikasi toaster. Pasang sekali di root (lihat providers.tsx),
 * lalu panggil `const toast = useToast()` di komponen mana pun untuk
 * `toast.success(...)` / `toast.error(...)`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const idRef = useRef(0);

	const remove = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const push = useCallback(
		(message: string, variant: ToastVariant) => {
			const id = (idRef.current += 1);
			setToasts((prev) => [...prev, { id, message, variant }]);
			setTimeout(() => remove(id), AUTO_DISMISS_MS);
		},
		[remove],
	);

	const api = useMemo<ToastApi>(
		() => ({
			success: (message) => push(message, 'success'),
			error: (message) => push(message, 'error'),
		}),
		[push],
	);

	return (
		<ToastContext.Provider value={api}>
			{children}
			<ToastViewport toasts={toasts} onClose={remove} />
		</ToastContext.Provider>
	);
}

export function useToast(): ToastApi {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToast harus dipakai di dalam <ToastProvider>.');
	}
	return ctx;
}

function ToastViewport({
	toasts,
	onClose,
}: {
	toasts: Toast[];
	onClose: (id: number) => void;
}) {
	return (
		<div className='fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-md pointer-events-none'>
			<AnimatePresence initial={false}>
				{toasts.map((t) => (
					<motion.div
						key={t.id}
						layout
						initial={{ opacity: 0, y: -12, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -12, scale: 0.97 }}
						transition={{ duration: 0.2, ease: 'easeOut' as const }}
						className='pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl border'
						style={{
							background: 'var(--bg-card)',
							borderColor: 'var(--border)',
							boxShadow: 'var(--shadow-md)',
						}}>
						{t.variant === 'success' ? (
							<CheckCircle2
								size={22}
								className='shrink-0 mt-0.5'
								style={{ color: 'var(--secondary)' }}
							/>
						) : (
							<AlertCircle
								size={22}
								className='shrink-0 mt-0.5'
								style={{ color: 'var(--destructive)' }}
							/>
						)}
						<p
							className='flex-1 text-base font-medium'
							style={{ color: 'var(--text)' }}>
							{t.message}
						</p>
						<button
							type='button'
							onClick={() => onClose(t.id)}
							aria-label='Tutup notifikasi'
							className='shrink-0 cursor-pointer transition-opacity hover:opacity-70'
							style={{ color: 'var(--text-muted)' }}>
							<X size={16} />
						</button>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
