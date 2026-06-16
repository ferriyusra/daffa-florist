'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type StepperStep = { label: string };

/**
 * Stepper horizontal gaya shadcn (utility class + token tema, bukan inline
 * style). Langkah sebelum `activeIndex` = selesai (hijau + centang),
 * `activeIndex` = aktif (primary + ring), sisanya = akan datang (muted). Garis
 * penghubung ikut terisi sampai langkah aktif. Steps melebar rata (`flex-1`).
 */
export function Stepper({
	steps,
	activeIndex,
	className,
}: {
	steps: StepperStep[];
	activeIndex: number;
	className?: string;
}) {
	return (
		<ol className={cn('flex items-start', className)}>
			{steps.map((step, i) => {
				const done = i < activeIndex;
				const current = i === activeIndex;
				const isFirst = i === 0;
				const isLast = i === steps.length - 1;

				return (
					<li
						key={step.label}
						className='flex min-w-0 flex-1 flex-col items-center'>
						<div className='flex w-full items-center'>
							<span
								className={cn(
									'h-0.5 flex-1 rounded-full',
									isFirst
										? 'opacity-0'
										: i <= activeIndex
											? 'bg-secondary'
											: 'bg-border',
								)}
							/>
							<span
								className={cn(
									'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
									done && 'border-secondary bg-secondary text-white',
									current &&
										'border-primary bg-primary text-primary-foreground ring-4 ring-primary/15',
									!done &&
										!current &&
										'border-border bg-muted text-muted-foreground',
								)}>
								{done ? <Check className='size-3.5' strokeWidth={3} /> : i + 1}
							</span>
							<span
								className={cn(
									'h-0.5 flex-1 rounded-full',
									isLast
										? 'opacity-0'
										: i < activeIndex
											? 'bg-secondary'
											: 'bg-border',
								)}
							/>
						</div>
						<span
							className={cn(
								'mt-2 px-1 text-center text-[10px] font-medium leading-tight',
								done || current
									? 'text-foreground'
									: 'text-muted-foreground',
							)}>
							{step.label}
						</span>
					</li>
				);
			})}
		</ol>
	);
}
