'use client';

import { motion } from 'motion/react';
import { fadeUp, stagger } from '@/lib/motion';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
}

/** Consistent animated header for the blue site-zone pages. */
export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mb-14">
      <motion.p variants={fadeUp} className="font-mono text-[#60a5fa] text-xs uppercase tracking-widest mb-4">
        {eyebrow}
      </motion.p>
      <motion.h1 variants={fadeUp} className="text-4xl! sm:text-5xl! font-extrabold! tracking-tight text-white">
        {title}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-4 max-w-xl text-[#94a3b8] leading-relaxed">
        {description}
      </motion.p>
    </motion.div>
  );
}
