'use client';

import { Button } from '@/components/ui/button';

/**
 * Pemilih durasi sewa (S2.3) — chip `${n} Hari` di atas shadcn `Button`. Durasi
 * MENENTUKAN tanggal bongkar (pickup) & jendela ketersediaan, BUKAN harga.
 *
 * CATATAN HARGA (penting, jangan sampai UI bertentangan dgn backend):
 * `order.createRental` mengenakan harga FLAT per ukuran per periode sewa — harga
 * TIDAK dikalikan jumlah hari. Maka komponen ini sengaja TIDAK menampilkan harga
 * per durasi; menampilkan harga berbeda per durasi akan menyesatkan pelanggan.
 */
export function RentalDurationSelector({
	value,
	onChange,
	options = [1, 3, 7],
}: {
	value: number;
	onChange: (days: number) => void;
	options?: number[];
}) {
	return (
		<div className='flex flex-wrap gap-2'>
			{options.map((n) => (
				<Button
					key={n}
					type='button'
					variant={n === value ? 'default' : 'outline'}
					size='sm'
					onClick={() => onChange(n)}>
					{n} Hari
				</Button>
			))}
		</div>
	);
}
