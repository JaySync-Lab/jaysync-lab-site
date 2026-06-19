'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { fadeUp, stagger } from '@/lib/motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** When true, children using the `fadeUp` variant stagger in sequence. */
  staggerChildren?: boolean;
}

/**
 * Wraps a section and reveals it (fade + slide up) the first time it scrolls
 * into view. Set staggerChildren to orchestrate child <motion.*> elements.
 */
export function SectionReveal({ children, className, staggerChildren = false }: Props) {
  return (
    <motion.div
      className={className}
      variants={staggerChildren ? stagger : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}
