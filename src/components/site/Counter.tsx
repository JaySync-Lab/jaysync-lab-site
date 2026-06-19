'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

interface Props {
  /** Numeric portion to count up to. */
  value: number;
  /** Optional decimal places (e.g. 1 for "99.9"). */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts from 0 → value when scrolled into view. Honours reduced-motion by
 * snapping straight to the final value.
 */
export function Counter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  durationMs = 1200,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
