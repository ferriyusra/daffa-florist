'use client';

import { type ReactNode } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Modal form reusable untuk admin CRUD — kini di atas shadcn `Dialog` (overlay,
 * focus trap, Esc-to-close), dengan header (judul + tombol tutup bawaan Dialog),
 * area field (`children`), dan footer (Batal/Simpan). Tutup dinonaktifkan saat
 * `pending`. Pemanggil cukup mengatur `open`; API prop tidak berubah.
 */
export function FormModal({
	open,
	title,
	onClose,
	onSubmit,
	pending = false,
	submitLabel = 'Simpan',
	loadingLabel = 'Menyimpan...',
	maxWidth = 'max-w-md',
	children,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	onSubmit: () => void;
	pending?: boolean;
	submitLabel?: string;
	loadingLabel?: string;
	/** Kelas lebar maksimum panel (mis. `max-w-lg`). */
	maxWidth?: string;
	children: ReactNode;
}) {
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next && !pending) onClose();
			}}>
			<DialogContent
				className={`w-full ${maxWidth}`}
				onInteractOutside={(e) => {
					if (pending) e.preventDefault();
				}}
				onEscapeKeyDown={(e) => {
					if (pending) e.preventDefault();
				}}>
				<DialogHeader>
					<DialogTitle className='font-serif'>{title}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit();
					}}>
					<div className='space-y-4'>{children}</div>

					<DialogFooter className='sm:justify-center pt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={pending}>
							Batal
						</Button>
						<Button type='submit' disabled={pending}>
							{pending ? loadingLabel : submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
