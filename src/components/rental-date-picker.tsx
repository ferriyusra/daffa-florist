'use client';

import { useEffect, useMemo, useState } from 'react';
import { id } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

/**
 * Kalender bulanan untuk memilih tanggal pasang sewa (S2.3), kini di atas
 * shadcn `Calendar` (react-day-picker, mode tunggal). Sebuah hari dinonaktifkan
 * bila lebih awal dari `minDate`, lebih akhir dari `maxDate`, atau termasuk
 * `bookedDates` (penuh).
 *
 * BATAS UTC↔LOKAL (penting): seluruh aplikasi memakai basis hari UTC, sedangkan
 * react-day-picker bekerja dalam waktu LOKAL. Karena itu input tengah-malam UTC
 * dikonversi ke hari LOKAL untuk rdp ({@link utcToLocalDay}), dan pilihan LOKAL
 * dari rdp dikonversi kembali ke tengah-malam UTC sebelum `onChange`
 * ({@link localToUtcDay}). Konversi ini berbasis komponen kalender (Y/M/D),
 * bukan offset, sehingga benar untuk SEMUA zona waktu (bukan hanya WIB).
 */

/** Tengah malam LOKAL pada hari kalender yang sama dengan tengah malam UTC `d`. */
const utcToLocalDay = (d: Date): Date =>
	new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Tengah malam UTC pada hari kalender yang sama dengan hari LOKAL `d`. */
const localToUtcDay = (d: Date): Date =>
	new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

export function RentalDatePicker({
	value,
	onChange,
	bookedDates,
	minDate,
	maxDate,
	loading = false,
}: {
	value: Date | null;
	onChange: (day: Date) => void;
	bookedDates: readonly Date[];
	minDate: Date;
	maxDate: Date;
	loading?: boolean;
}) {
	// Bulan yang ditampilkan (waktu LOKAL, terkendali). Mulai dari nilai terpilih
	// bila ada, jika tidak dari minDate.
	const [month, setMonth] = useState<Date>(() =>
		utcToLocalDay(value ?? minDate),
	);

	// Ikuti pilihan yang diset dari LUAR (mis. tombol "tersedia mulai") — pindah
	// tampilan ke bulan nilai terpilih agar hari terpilih terlihat.
	useEffect(() => {
		if (!value) return;
		setMonth(utcToLocalDay(value));
	}, [value]);

	const selected = value ? utcToLocalDay(value) : undefined;

	const startMonth = useMemo(() => utcToLocalDay(minDate), [minDate]);
	const endMonth = useMemo(() => utcToLocalDay(maxDate), [maxDate]);

	const disabled = useMemo(
		() => [
			{ before: utcToLocalDay(minDate) },
			{ after: utcToLocalDay(maxDate) },
			...bookedDates.map(utcToLocalDay),
		],
		[minDate, maxDate, bookedDates],
	);

	return (
		<div
			className={cn(
				'rounded-xl border bg-card transition-opacity',
				loading && 'opacity-50 pointer-events-none',
			)}>
			<Calendar
				mode='single'
				locale={id}
				captionLayout='label'
				selected={selected}
				month={month}
				onMonthChange={setMonth}
				startMonth={startMonth}
				endMonth={endMonth}
				disabled={disabled}
				onSelect={(day) => {
					// Halaman tak pernah ingin clear dari sini: abaikan deseleksi.
					if (!day) return;
					onChange(localToUtcDay(day));
				}}
				className='w-full'
			/>
		</div>
	);
}
