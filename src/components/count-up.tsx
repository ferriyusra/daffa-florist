'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export default function CountUp({
	target,
	suffix = '',
	duration = 1.5,
}: {
	target: number;
	suffix?: string;
	duration?: number;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: '-40px' });
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!inView) return;

		let start = 0;
		const startTime = performance.now();
		const ms = duration * 1000;

		function tick(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / ms, 1);
			// ease-out cubic
			const eased = 1 - Math.pow(1 - progress, 3);
			const current = Math.round(eased * target);

			if (current !== start) {
				start = current;
				setCount(current);
			}

			if (progress < 1) {
				requestAnimationFrame(tick);
			}
		}

		requestAnimationFrame(tick);
	}, [inView, target, duration]);

	return (
		<span ref={ref}>
			{count}
			{suffix}
		</span>
	);
}
