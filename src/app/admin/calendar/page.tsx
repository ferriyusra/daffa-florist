'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { productCategories } from '@/lib';
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/lib/order-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Kalender operasional admin (S3.4): grid bulanan event PASANG (installDate) &
 * BONGKAR (pickupDate) per papan, dengan filter status & kategori.
 *
 * BASIS HARI UTC (penting): installDate/pickupDate disimpan tengah-malam UTC.
 * Seluruh perhitungan grid memakai getter/`Date.UTC` UTC sehingga sebuah papan
 * yang dipasang pada hari kalender tertentu muncul di hari itu untuk SEMUA zona
 * waktu (tak bergeser). Label tanggal di-format dengan `timeZone:'UTC'`.
 */

type CalEvent = RouterOutputs['admin']['calendar']['events']['events'][number];
type OrderStatus = (typeof ORDER_STATUSES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CHIPS = 3;
const CATEGORY_ALL = 'ALL';

/** Tengah malam UTC untuk hari kalender (y, m, d). */
const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));
/** Kunci hari UTC `YYYY-MM-DD` untuk grouping. */
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const MONTHS_ID = [
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
];
const WEEKDAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Warna badge status (UI-only) — selaras halaman /admin/orders.
const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
	CONFIRMED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	SCHEDULED: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
	INSTALLED: { bg: 'rgba(20, 184, 166, 0.14)', color: '#0d9488' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	CANCELLED: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' },
};

const statusFilters = ['ALL', ...ORDER_STATUSES] as const;
const statusFilterLabel: Record<(typeof statusFilters)[number], string> = {
	ALL: 'Semua',
	...ORDER_STATUS_LABEL,
};

const prettyCategory = (slug: string) =>
	slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDayLong = (d: Date) =>
	d.toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});

// Warna chip per tipe event (pasang = blush/primary, bongkar = green/secondary).
const eventStyle = {
	install: {
		bg: 'rgba(157, 23, 77, 0.10)',
		color: 'var(--primary)',
		dot: 'var(--primary)',
		Icon: ArrowUpFromLine,
		label: 'Pasang',
	},
	pickup: {
		bg: 'rgba(61, 107, 79, 0.12)',
		color: 'var(--secondary)',
		dot: 'var(--secondary)',
		Icon: ArrowDownToLine,
		label: 'Bongkar',
	},
} as const;

export default function AdminCalendarPage() {
	const router = useRouter();

	// Bulan yang ditampilkan — tengah malam UTC pada tanggal 1 (basis hari UTC).
	const [viewMonth, setViewMonth] = useState<Date>(() => {
		const now = new Date();
		return utcDay(now.getUTCFullYear(), now.getUTCMonth(), 1);
	});
	const [status, setStatus] = useState<(typeof statusFilters)[number]>('ALL');
	const [category, setCategory] = useState('');
	const [selectedKey, setSelectedKey] = useState<string | null>(null);

	const year = viewMonth.getUTCFullYear();
	const month = viewMonth.getUTCMonth();

	// Grid 6 minggu (42 sel) mulai dari Minggu pada/sebelum tanggal 1.
	const gridStart = useMemo(() => {
		const first = utcDay(year, month, 1);
		return new Date(first.getTime() - first.getUTCDay() * DAY_MS);
	}, [year, month]);

	const cells = useMemo(
		() =>
			Array.from(
				{ length: 42 },
				(_, i) => new Date(gridStart.getTime() + i * DAY_MS),
			),
		[gridStart],
	);

	// Rentang query distabilkan via ISO string agar query-key tidak berubah
	// (objek Date baru setiap render akan men-trigger refetch). `to` = sel
	// terakhir + 1 hari (eksklusif).
	const fromISO = gridStart.toISOString();
	const toISO = new Date(gridStart.getTime() + 42 * DAY_MS).toISOString();

	const { data, isLoading } = api.admin.calendar.events.useQuery({
		from: fromISO,
		to: toISO,
		status,
		category: category || undefined,
	});

	// Group event per hari UTC.
	const eventsByDay = useMemo(() => {
		const map = new Map<string, CalEvent[]>();
		for (const ev of data?.events ?? []) {
			const key = dayKey(new Date(ev.date));
			const list = map.get(key);
			if (list) list.push(ev);
			else map.set(key, [ev]);
		}
		return map;
	}, [data]);

	// "Hari ini" pada basis UTC-day (sama dgn penempatan event) — sengaja pakai
	// getUTC* agar konsisten dengan installDate/pickupDate (UTC-midnight). Jangan
	// ubah ke getFullYear/getMonth/getDate: highlight & sel event akan tak sinkron.
	const todayKey = dayKey(
		(() => {
			const n = new Date();
			return utcDay(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
		})(),
	);

	const selectedEvents = selectedKey
		? (eventsByDay.get(selectedKey) ?? [])
		: [];

	const goPrev = () => {
		setSelectedKey(null);
		setViewMonth(utcDay(year, month - 1, 1));
	};
	const goNext = () => {
		setSelectedKey(null);
		setViewMonth(utcDay(year, month + 1, 1));
	};

	return (
		<div className='space-y-5'>
			{/* Header: navigasi bulan + filter + legend */}
			<div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						onClick={goPrev}
						aria-label='Bulan sebelumnya'>
						<ChevronLeft size={16} />
					</Button>
					<h2
						className='font-serif text-lg font-semibold min-w-[10rem] text-center'
						style={{ color: 'var(--text)' }}>
						{MONTHS_ID[month]} {year}
					</h2>
					<Button
						type='button'
						variant='outline'
						size='icon'
						onClick={goNext}
						aria-label='Bulan berikutnya'>
						<ChevronRight size={16} />
					</Button>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<Select
						value={status}
						onValueChange={(v) => {
							setStatus(v as (typeof statusFilters)[number]);
							setSelectedKey(null);
						}}>
						<SelectTrigger className='h-10' aria-label='Filter status'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusFilters.map((s) => (
								<SelectItem key={s} value={s}>
									{statusFilterLabel[s]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={category || CATEGORY_ALL}
						onValueChange={(v) => {
							setCategory(v === CATEGORY_ALL ? '' : v);
							setSelectedKey(null);
						}}>
						<SelectTrigger className='h-10' aria-label='Filter kategori'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={CATEGORY_ALL}>Semua Kategori</SelectItem>
							{productCategories.map((c) => (
								<SelectItem key={c} value={c}>
									{prettyCategory(c)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Legend */}
			<div className='flex items-center gap-4 text-xs'>
				<span className='inline-flex items-center gap-1.5'>
					<span
						className='inline-block w-2.5 h-2.5 rounded-full'
						style={{ background: 'var(--primary)' }}
					/>
					<span style={{ color: 'var(--text-secondary)' }}>Pasang</span>
				</span>
				<span className='inline-flex items-center gap-1.5'>
					<span
						className='inline-block w-2.5 h-2.5 rounded-full'
						style={{ background: 'var(--secondary)' }}
					/>
					<span style={{ color: 'var(--text-secondary)' }}>Bongkar</span>
				</span>
			</div>

			{/* Grid */}
			<div
				className='rounded-2xl border border-[var(--border)] overflow-hidden'
				style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
				<div className='overflow-x-auto'>
					<div className='min-w-[44rem]'>
						{/* Header hari */}
						<div className='grid grid-cols-7'>
							{WEEKDAYS_ID.map((w) => (
								<div
									key={w}
									className='px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider border-b border-[var(--border)]'
									style={{
										background: 'rgba(157, 23, 77, 0.04)',
										color: 'var(--text-muted)',
									}}>
									{w}
								</div>
							))}
						</div>

						{isLoading ? (
							<div className='grid grid-cols-7'>
								{Array.from({ length: 42 }).map((_, i) => (
									<div
										key={i}
										className='h-28 border-b border-r border-[var(--border)] p-2'>
										<Skeleton className='h-4 w-6 mb-2' />
										<Skeleton className='h-4 w-full mb-1' />
										<Skeleton className='h-4 w-3/4' />
									</div>
								))}
							</div>
						) : (
							<div className='grid grid-cols-7'>
								{cells.map((cell) => {
									const key = dayKey(cell);
									const dayEvents = eventsByDay.get(key) ?? [];
									const inMonth = cell.getUTCMonth() === month;
									const isToday = key === todayKey;
									const isSelected = key === selectedKey;
									const shown = dayEvents.slice(0, MAX_CHIPS);
									const extra = dayEvents.length - shown.length;

									return (
										<div
											key={key}
											onClick={() =>
												setSelectedKey(
													dayEvents.length > 0
														? isSelected
															? null
															: key
														: null,
												)
											}
											className={cn(
												'h-28 border-b border-r border-[var(--border)] p-1.5 flex flex-col gap-1 transition-colors',
												dayEvents.length > 0 && 'cursor-pointer',
												isSelected && 'ring-2 ring-inset',
											)}
											style={{
												background: inMonth
													? 'transparent'
													: 'rgba(0,0,0,0.015)',
												...(isSelected
													? ({
															'--tw-ring-color': 'var(--primary)',
														} as React.CSSProperties)
													: {}),
											}}>
											<div className='flex items-center justify-between'>
												<span
													className={cn(
														'inline-flex items-center justify-center text-xs font-semibold w-6 h-6 rounded-full',
														isToday && 'text-white',
													)}
													style={{
														background: isToday
															? 'var(--primary)'
															: 'transparent',
														color: isToday
															? 'white'
															: inMonth
																? 'var(--text)'
																: 'var(--text-muted)',
													}}>
													{cell.getUTCDate()}
												</span>
											</div>

											<div className='flex flex-col gap-0.5 overflow-hidden'>
												{shown.map((ev) => {
													const s = eventStyle[ev.type];
													const ChipIcon = s.Icon;
													return (
														<button
															key={ev.id}
															type='button'
															onClick={(e) => {
																e.stopPropagation();
																router.push(`/admin/orders/${ev.orderId}`);
															}}
															className='flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer'
															style={{ background: s.bg, color: s.color }}
															title={`${s.label} · ${ev.orderNumber} · ${ev.customerName}`}>
															<ChipIcon size={10} className='shrink-0' />
															<span className='truncate'>
																{ev.orderNumber}
															</span>
														</button>
													);
												})}
												{extra > 0 && (
													<span
														className='px-1.5 text-[10px] font-medium'
														style={{ color: 'var(--text-muted)' }}>
														+{extra} lainnya
													</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Detail hari terpilih */}
			{selectedKey && selectedEvents.length > 0 && (
				<div
					className='rounded-2xl border border-[var(--border)] p-5'
					style={{
						background: 'var(--bg-card)',
						boxShadow: 'var(--shadow-sm)',
					}}>
					<h3
						className='font-serif text-base font-semibold mb-3'
						style={{ color: 'var(--text)' }}>
						{formatDayLong(new Date(`${selectedKey}T00:00:00.000Z`))}
					</h3>
					<ul className='space-y-2'>
						{selectedEvents.map((ev) => {
							const s = eventStyle[ev.type];
							const sc = statusColors[ev.status];
							const EvIcon = s.Icon;
							return (
								<li key={ev.id}>
									<button
										type='button'
										onClick={() => router.push(`/admin/orders/${ev.orderId}`)}
										className='w-full flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5 text-left cursor-pointer transition-colors hover:border-[var(--primary)]'>
										<span
											className='inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0'
											style={{ background: s.bg, color: s.color }}>
											<EvIcon size={15} />
										</span>
										<div className='min-w-0 flex-1'>
											<div className='flex items-center gap-2'>
												<span
													className='font-mono text-sm font-semibold'
													style={{ color: 'var(--text)' }}>
													{ev.orderNumber}
												</span>
												<span
													className='text-[11px] font-medium'
													style={{ color: s.color }}>
													{s.label}
												</span>
											</div>
											<p
												className='text-xs truncate'
												style={{ color: 'var(--text-secondary)' }}>
												{ev.customerName} · {ev.productTitle}
												{ev.sizeLabel ? ` · ${ev.sizeLabel}` : ''}
											</p>
										</div>
										<Badge
											className='border-transparent text-[11px] font-semibold shrink-0'
											style={{ background: sc.bg, color: sc.color }}>
											{ORDER_STATUS_LABEL[ev.status]}
										</Badge>
										<ChevronRight
											size={16}
											className='shrink-0'
											style={{ color: 'var(--text-muted)' }}
										/>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
