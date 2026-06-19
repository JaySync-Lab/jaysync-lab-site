'use client';

import { motion } from 'motion/react';
import type { ChangelogEntry } from '@/lib/changelog';
import { fadeUp, stagger } from '@/lib/motion';

interface Props {
  entries: ChangelogEntry[];
}

export function Timeline({ entries }: Props) {
  return (
    <motion.ol
      className="relative border-l-2 border-[#1e293b] ml-3"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {entries.map((entry, i) => (
        <motion.li key={entry.label} variants={fadeUp} className="mb-12 ml-8 last:mb-0">
          {/* Dot — latest entry glows blue */}
          <span
            className="absolute -left-[7px] flex h-3 w-3 items-center justify-center rounded-full"
            style={{
              backgroundColor: i === 0 ? '#2563eb' : '#0a0f1f',
              border: `2px solid ${i === 0 ? '#60a5fa' : '#334155'}`,
              boxShadow: i === 0 ? '0 0 12px rgba(37,99,235,0.7)' : 'none',
              top: '4px',
            }}
          />

          <time className="mb-3 block font-mono text-[10px] uppercase tracking-wider text-[#475569]">
            {entry.label}
          </time>

          <ul className="space-y-2">
            {entry.entries.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-[#cbd5e1]">
                <span className="mt-0.5 shrink-0 text-xs text-[#60a5fa]">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ol>
  );
}
