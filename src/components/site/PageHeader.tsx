'use client';

import { motion } from 'motion/react';
import { fadeUp, stagger } from '@/lib/motion';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mb-14">
      <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#52525b' }}>
        {eyebrow}
      </motion.p>
      <motion.h1 variants={fadeUp} className="text-4xl! sm:text-5xl! font-extrabold! tracking-tight text-white">
        {title}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-4 max-w-xl leading-relaxed" style={{ color: '#71717a' }}>
        {description}
      </motion.p>
    </motion.div>
  );
}
