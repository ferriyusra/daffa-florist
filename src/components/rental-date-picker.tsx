'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { floorToUtcDay } from '@/lib/rental';

/**
 * Kalender bulanan mandiri untuk memilih tanggal pasang sewa (S2.3) — TANPA
 * dependensi npm baru, hanya Date math via helper `@/lib/rental` (client-safe).
 *
 * Basis hari = UTC: semua perbandingan & emit memakai {@link floorToUtcDay}, dan
 * `onChange` mengembalikan Date tengah-malam UTC. Sebuah hari dinonaktifkan bila
 * lebih awal dari `minDate`, lebih akhir dari `maxDate`, atau termasuk
 * `bookedDates` (penuh).
 */

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
const MONTHS = [
	'Januari',
	'Februari',
	'Maret',
	'April',
	'Mei',
	'Juni',
	'Juli',
	'Agustus',
	'September',
	'Oktober',
	'November',
	'Desember',
] as const;

/** Indeks bulan absolut (tahun*12 + bulan, basis UTC) untuk pembanding navigasi. */
const monthIndex = (d: Date): number => d.getUTCFullYear() * 12 + d.getUTCMonth();

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
	// Bulan yang sedang ditampilkan (basis UTC, tengah malam tgl 1). Mulai dari
	// nilai terpilih bila ada, jika tidak dari minDate.
	const [viewMonth, setViewMonth] = useState<Date>(() => {
		const base = value ?? minDate;
		return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
	});

	// Ikuti pilihan yang diset dari LUAR (mis. tombol "tersedia mulai") — pindah
	// tampilan ke bulan nilai terpilih bila berbeda, agar hari terpilih terlihat.
	useEffect(() => {
		if (!value) return;
		const vm = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
		setViewMonth((prev) => (prev.getTime() === vm.getTime() ? prev : vm));
	}, [value]);

	const bookedSet = useMemo(
		() => new Set(bookedDates.map((d) => floorToUtcDay(d).getTime())),
		[bookedDates],
	);

	const minMs = useMemo(() => floorToUtcDay(minDate).getTime(), [minDate]);
	const maxMs = useMemo(() => floorToUtcDay(maxDate).getTime(), [maxDate]);
	const selectedMs = value ? floorToUtcDay(value).getTime() : null;

	const year = viewMonth.getUTCFullYear();
	const month = viewMonth.getUTCMonth();

	// Hari pertama bulan ini & jumlah hari di bulan ini (UTC).
	const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
	const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

	const cells: (Date | null)[] = [];
	for (let i = 0; i < firstWeekday; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) {
		cells.push(new Date(Date.UTC(year, month, d)));
	}

	const prevDisabled = monthIndex(viewMonth) <= monthIndex(minDate);
	const nextDisabled = monthIndex(viewMonth) >= monthIndex(maxDate);

	const goPrev = () => {
		if (prevDisabled) return;
		setViewMonth(new Date(Date.UTC(year, month - 1, 1)));
	};
	const goNext = () => {
		if (nextDisabled) return;
		setViewMonth(new Date(Date.UTC(year, month + 1, 1)));
	};

	return (
		<div
			className='rounded-xl border p-4'
			style={{
				borderColor: 'var(--border)',
				background: 'var(--bg-surface)',
			}}>
			<div className='flex items-center justify-between mb-3'>
				<button
					type='button'
					onClick={goPrev}
					disabled={prevDisabled}
					aria-label='Bulan sebelumnya'
					className='inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed'
					style={{ color: 'var(--text-secondary)' }}>
					<ChevronLeft size={16} />
				</button>
				<span className='text-sm font-semibold'>
					{MONTHS[month]} {year}
				</span>
				<button
					type='button'
					onClick={goNext}
					disabled={nextDisabled}
					aria-label='Bulan berikutnya'
					className='inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed'
					style={{ color: 'var(--text-secondary)' }}>
					<ChevronRight size={16} />
				</button>
			</div>

			<div
				className='grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-semibold uppercase tracking-wider'
				style={{ color: 'var(--text-muted)' }}>
				{WEEKDAYS.map((w) => (
					<div key={w}>{w}</div>
				))}
			</div>

			<div
				className='grid grid-cols-7 gap-1 transition-opacity'
				style={{ opacity: loading ? 0.5 : 1 }}>
				{cells.map((day, i) => {
					if (!day) return <div key={`blank-${i}`} />;

					const ms = day.getTime();
					const full = bookedSet.has(ms);
					const disabled = loading || ms < minMs || ms > maxMs || full;
					const selected = selectedMs === ms;
					const label = `${day.getUTCDate()} ${MONTHS[month]} ${year}${
						full ? ' — penuh' : ms < minMs || ms > maxMs ? ' — di luar jangkauan' : ''
					}`;

					return (
						<button
							key={ms}
							type='button'
							disabled={disabled}
							aria-label={label}
							onClick={() => onChange(day)}
							className='aspect-square inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all'
							style={{
								background: selected
									? 'var(--primary)'
									: 'transparent',
								color: selected
									? '#fff'
									: disabled
										? 'var(--text-muted)'
										: 'var(--text)',
								opacity: disabled && !selected ? 0.4 : 1,
								cursor: disabled ? 'not-allowed' : 'pointer',
							}}>
							{day.getUTCDate()}
						</button>
					);
				})}
			</div>
		</div>
	);
}
