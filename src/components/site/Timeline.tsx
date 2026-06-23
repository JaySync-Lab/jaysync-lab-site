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
      className="relative ml-3"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {entries.map((entry, i) => (
        <motion.li key={entry.label} variants={fadeUp} className="mb-12 ml-8 last:mb-0">
          {/* dot — latest entry is white, older are dark */}
          <span
            className="absolute -left-[5px] flex h-2.5 w-2.5 items-center justify-center rounded-full"
            style={{
              backgroundColor: i === 0 ? '#ffffff' : '#080808',
              border: `1.5px solid ${i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
              boxShadow: i === 0 ? '0 0 8px rgba(255,255,255,0.25)' : 'none',
              top: '4px',
            }}
          />

          <time className="mb-3 block font-mono text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>
            {entry.label}
          </time>

          <ul className="space-y-2">
            {entry.entries.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                <span className="mt-0.5 shrink-0 text-xs" style={{ color: '#3f3f46' }}>▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ol>
  );
}
