'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type DateTimePickerProps = {
	date: Date | undefined;
	onChange: (date: Date | undefined) => void;
	minDate?: Date;
	placeholder?: string;
};

/** Slot jam acara 07:00–22:00 tiap 30 menit. */
const TIME_SLOTS: string[] = (() => {
	const slots: string[] = [];
	for (let m = 7 * 60; m <= 22 * 60; m += 30) {
		const hh = String(Math.floor(m / 60)).padStart(2, '0');
		const mm = String(m % 60).padStart(2, '0');
		slots.push(`${hh}:${mm}`);
	}
	return slots;
})();

/** Default jam saat tanggal dipilih tapi jam belum diset. */
const DEFAULT_HOUR = 7;

/** Ambil bagian jam (HH:mm) dari Date untuk nilai Select. */
function toTimeValue(date: Date | undefined): string {
	if (!date) return '';
	const hh = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	return `${hh}:${mm}`;
}

export function DateTimePicker({
	date,
	onChange,
	minDate,
	placeholder = 'Pilih tanggal',
}: DateTimePickerProps) {
	const [open, setOpen] = React.useState(false);

	// Pilih hari → set bagian tanggal, pertahankan jam yang sudah dipilih
	// (atau default 07:00 bila belum ada).
	const handleSelectDay = (day: Date | undefined) => {
		if (!day) {
			onChange(undefined);
			return;
		}
		const next = new Date(day);
		if (date) {
			next.setHours(date.getHours(), date.getMinutes(), 0, 0);
		} else {
			next.setHours(DEFAULT_HOUR, 0, 0, 0);
		}
		onChange(next);
		setOpen(false);
	};

	// Pilih jam → set bagian waktu pada tanggal terpilih (atau hari ini).
	const handleSelectTime = (value: string) => {
		const [hours, minutes] = value.split(':').map(Number);
		const base = date ? new Date(date) : new Date();
		base.setHours(hours ?? 0, minutes ?? 0, 0, 0);
		onChange(base);
	};

	return (
		<div className='flex flex-col gap-2 sm:flex-row'>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='outline'
						className={cn(
							'flex-1 justify-start text-left font-normal h-auto px-4 py-3 rounded-xl bg-muted',
							!date && 'text-muted-foreground',
						)}>
						<CalendarIcon className='size-4 shrink-0 text-primary' />
						<span className='truncate'>
							{date
								? format(date, 'EEEE, d MMMM yyyy', { locale: id })
								: placeholder}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='start'>
					<Calendar
						mode='single'
						locale={id}
						captionLayout='label'
						selected={date}
						onSelect={handleSelectDay}
						disabled={minDate ? { before: minDate } : undefined}
					/>
				</PopoverContent>
			</Popover>

			<Select
				value={toTimeValue(date) || undefined}
				onValueChange={handleSelectTime}>
				<SelectTrigger
					className='h-auto w-full rounded-xl bg-muted px-4 py-3 sm:w-36'
					aria-label='Jam acara'>
					<SelectValue placeholder='Jam' />
				</SelectTrigger>
				<SelectContent className='max-h-64'>
					{TIME_SLOTS.map((t) => (
						<SelectItem key={t} value={t}>
							{t}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
