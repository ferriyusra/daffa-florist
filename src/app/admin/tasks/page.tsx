'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { id } from 'date-fns/locale';
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';

import { api, type RouterOutputs } from '@/trpc/react';
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/lib/order-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Tugas Harian (S3.5): daftar pemasangan (installDate) & pengambilan
 * (pickupDate) tim lapangan untuk SATU tanggal, dengan alamat, jam acara, dan
 * detail papan.
 *
 * BASIS HARI UTC: tanggal terpilih disimpan sebagai UTC-midnight (cocok dengan
 * installDate/pickupDate) — label tanggal di-format `timeZone:'UTC'`. Jam acara
 * (eventDate) BERBEDA: ia timestamp WIB sungguhan → di-format `Asia/Jakarta`.
 */

type Task = RouterOutputs['admin']['task']['daily']['installs'][number];
type OrderStatus = (typeof ORDER_STATUSES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tengah malam UTC untuk hari kalender (y, m, d). */
const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

/** Hari ini (kalender WIB) sebagai UTC-midnight — selaras installDate/pickupDate. */
const wibTodayUtc = (): Date => {
	const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
	return utcDay(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate());
};

const formatDayLong = (d: Date) =>
	d.toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});

/** Jam acara (WIB) dari eventDate, atau "—" bila kosong. */
const formatJam = (d: Date | null) =>
	d
		? new Date(d).toLocaleTimeString('id-ID', {
				hour: '2-digit',
				minute: '2-digit',
				timeZone: 'Asia/Jakarta',
			})
		: '—';

// Warna badge status (UI-only) — selaras /admin/calendar & /admin/orders.
const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
	PENDING: { bg: 'rgba(234, 179, 8, 0.15)', color: '#a16207' },
	CONFIRMED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
	SCHEDULED: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
	INSTALLED: { bg: 'rgba(20, 184, 166, 0.14)', color: '#0d9488' },
	COMPLETED: { bg: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' },
	CANCELLED: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' },
};

// Warna per tipe tugas (pasang = blush/primary, ambil = green/secondary).
const taskStyle = {
	install: {
		bg: 'rgba(157, 23, 77, 0.10)',
		color: 'var(--primary)',
		Icon: ArrowUpFromLine,
		title: 'Pemasangan',
		empty: 'Tidak ada pemasangan pada tanggal ini.',
	},
	pickup: {
		bg: 'rgba(61, 107, 79, 0.12)',
		color: 'var(--secondary)',
		Icon: ArrowDownToLine,
		title: 'Pengambilan',
		empty: 'Tidak ada pengambilan pada tanggal ini.',
	},
} as const;

function TaskRow({ task }: { task: Task }) {
	const s = taskStyle[task.type];
	const sc = statusColors[task.status];
	const detailBits = [
		task.designTemplateName,
		task.themeColorName,
		...(task.addonNames ?? []),
	].filter(Boolean);

	return (
		<li
			className='rounded-xl border border-[var(--border)] p-3.5'
			style={{ background: 'var(--bg-card)' }}>
			{/* Jam acara + nomor pesanan + status */}
			<div className='flex items-center gap-2 flex-wrap'>
				<span
					className='inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0'
					style={{ background: s.bg, color: s.color }}>
					<s.Icon size={14} />
				</span>
				<span
					className='font-mono text-sm font-semibold'
					style={{ color: 'var(--text)' }}>
					{formatJam(task.eventDate)}
				</span>
				<Link
					href={`/admin/orders/${task.orderId}`}
					className='font-mono text-xs font-medium underline-offset-2 hover:underline cursor-pointer'
					style={{ color: s.color }}>
					{task.orderNumber}
				</Link>
				<Badge
					className='border-transparent text-[11px] font-semibold ml-auto shrink-0'
					style={{ background: sc.bg, color: sc.color }}>
					{ORDER_STATUS_LABEL[task.status]}
				</Badge>
			</div>

			{/* Papan + ukuran + qty */}
			<p
				className='mt-2 text-sm font-medium'
				style={{ color: 'var(--text)' }}>
				{task.productTitle}
				{task.sizeLabel ? ` · ${task.sizeLabel}` : ''}
				<span style={{ color: 'var(--text-muted)' }}> ×{task.quantity}</span>
			</p>

			{/* Pelanggan + kontak + alamat */}
			<div className='mt-1.5 text-xs space-y-0.5'>
				<p style={{ color: 'var(--text-secondary)' }}>
					{task.customerName}
					{task.phone ? (
						<>
							{' · '}
							<a
								href={`tel:${task.phone}`}
								className='underline-offset-2 hover:underline cursor-pointer'
								style={{ color: 'var(--text-secondary)' }}>
								{task.phone}
							</a>
						</>
					) : null}
				</p>
				{task.fullAddress ? (
					<p style={{ color: 'var(--text-secondary)' }}>
						{task.fullAddress}
						{task.city ? `, ${task.city}` : ''}
					</p>
				) : (
					<p style={{ color: 'var(--text-muted)' }}>Alamat belum diisi.</p>
				)}
			</div>

			{/* Detail opsional: desain / warna / addon / catatan */}
			{detailBits.length > 0 && (
				<p className='mt-1.5 text-[11px]' style={{ color: 'var(--text-muted)' }}>
					{detailBits.join(' · ')}
				</p>
			)}
			{task.notes ? (
				<p className='mt-1 text-[11px] italic' style={{ color: 'var(--text-muted)' }}>
					Catatan: {task.notes}
				</p>
			) : null}
		</li>
	);
}

function TaskCard({
	type,
	tasks,
	isLoading,
}: {
	type: 'install' | 'pickup';
	tasks: Task[];
	isLoading: boolean;
}) {
	const s = taskStyle[type];

	return (
		<Card>
			<CardHeader className='flex-row items-center justify-between space-y-0'>
				<CardTitle className='flex items-center gap-2 font-serif text-base'>
					<span
						className='inline-flex items-center justify-center w-7 h-7 rounded-lg'
						style={{ background: s.bg, color: s.color }}>
						<s.Icon size={15} />
					</span>
					{s.title}
				</CardTitle>
				{!isLoading && (
					<Badge
						className='border-transparent text-[11px] font-semibold'
						style={{ background: s.bg, color: s.color }}>
						{tasks.length}
					</Badge>
				)}
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<ul className='space-y-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<li
								key={i}
								className='rounded-xl border border-[var(--border)] p-3.5'>
								<Skeleton className='h-5 w-40 mb-2' />
								<Skeleton className='h-4 w-2/3 mb-1.5' />
								<Skeleton className='h-3 w-full' />
							</li>
						))}
					</ul>
				) : tasks.length === 0 ? (
					<p
						className='py-6 text-center text-sm'
						style={{ color: 'var(--text-muted)' }}>
						{s.empty}
					</p>
				) : (
					<ul className='space-y-3'>
						{tasks.map((t) => (
							<TaskRow key={t.id} task={t} />
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

export default function AdminTasksPage() {
	const [selected, setSelected] = useState<Date>(() => wibTodayUtc());
	const [open, setOpen] = useState(false);

	const todayUtc = wibTodayUtc();
	const isToday = selected.getTime() === todayUtc.getTime();

	// Kunci query distabilkan sebagai ISO `YYYY-MM-DD` (input z.coerce.date()
	// menerima string ISO) agar query-key tidak berubah tiap render.
	const isoDay = useMemo(() => selected.toISOString().slice(0, 10), [selected]);

	const { data, isLoading } = api.admin.task.daily.useQuery({ date: isoDay });

	const goPrev = () =>
		setSelected((d) => new Date(d.getTime() - DAY_MS));
	const goNext = () =>
		setSelected((d) => new Date(d.getTime() + DAY_MS));

	// Pilih hari dari kalender → simpan sebagai UTC-midnight hari itu.
	const handleSelectDay = (day: Date | undefined) => {
		if (!day) return;
		setSelected(
			utcDay(day.getFullYear(), day.getMonth(), day.getDate()),
		);
		setOpen(false);
	};

	return (
		<div className='space-y-5'>
			{/* Header */}
			<div>
				<h1
					className='font-serif text-xl font-semibold'
					style={{ color: 'var(--text)' }}>
					Tugas Harian
				</h1>
				<p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
					Daftar pemasangan &amp; pengambilan untuk tim lapangan per tanggal.
				</p>
			</div>

			{/* Navigasi tanggal */}
			<div className='flex flex-wrap items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					size='icon'
					onClick={goPrev}
					aria-label='Hari sebelumnya'>
					<ChevronLeft size={16} />
				</Button>

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='outline'
							className='justify-start text-left font-normal min-w-[16rem]'>
							<CalendarIcon className='size-4 shrink-0 text-primary' />
							<span className='truncate'>{formatDayLong(selected)}</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-auto p-0' align='start'>
						<Calendar
							mode='single'
							locale={id}
							captionLayout='label'
							selected={selected}
							onSelect={handleSelectDay}
						/>
					</PopoverContent>
				</Popover>

				<Button
					type='button'
					variant='outline'
					size='icon'
					onClick={goNext}
					aria-label='Hari berikutnya'>
					<ChevronRight size={16} />
				</Button>

				<Button
					type='button'
					variant='outline'
					onClick={() => setSelected(wibTodayUtc())}
					disabled={isToday}>
					Hari Ini
				</Button>
			</div>

			{/* Dua kolom: pemasangan & pengambilan */}
			<div className='grid gap-6 lg:grid-cols-2'>
				<TaskCard
					type='install'
					tasks={data?.installs ?? []}
					isLoading={isLoading}
				/>
				<TaskCard
					type='pickup'
					tasks={data?.pickups ?? []}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
