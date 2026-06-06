'use client';

/**
 * Pemilih durasi sewa (S2.3) — chip `${n} Hari`. Durasi MENENTUKAN tanggal
 * bongkar (pickup) & jendela ketersediaan, BUKAN harga.
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
			{options.map((n) => {
				const active = n === value;
				return (
					<button
						key={n}
						type='button'
						onClick={() => onChange(n)}
						className='px-4 py-2 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all'
						style={{
							borderColor: active ? 'var(--primary)' : 'var(--border)',
							background: active
								? 'rgba(157, 23, 77, 0.06)'
								: 'var(--bg-surface)',
							color: active ? 'var(--primary)' : 'var(--text)',
						}}>
						{n} Hari
					</button>
				);
			})}
		</div>
	);
}
