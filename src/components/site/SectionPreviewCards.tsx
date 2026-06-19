'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { fadeUp } from '@/lib/motion';

interface Card {
  href: string;
  label: string;
  title: string;
  desc: string;
  glyph: string;
}

const CARDS: Card[] = [
  {
    href: '/docs',
    label: 'Documentation',
    title: 'The full handbook',
    desc: 'Hardware, networking, every service — the complete written record of the lab.',
    glyph: '▤',
  },
  {
    href: '/services',
    label: 'Services',
    title: 'What’s running',
    desc: 'Live grid of every container and VM, with status pulled from Uptime Kuma.',
    glyph: '◈',
  },
  {
    href: '/architecture',
    label: 'Architecture',
    title: 'How it fits together',
    desc: 'The network topology and the VMID banding scheme that keeps it organised.',
    glyph: '⬡',
  },
  {
    href: '/changelog',
    label: 'Changelog',
    title: 'What changed, when',
    desc: 'A timeline of every infrastructure change since the lab came online.',
    glyph: '◷',
  },
];

export function SectionPreviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {CARDS.map((card) => (
        <motion.div key={card.href} variants={fadeUp}>
          <Link
            href={card.href}
            className="group relative block overflow-hidden rounded-2xl border border-[#1e293b] bg-[#111726] p-6 transition-all duration-300 hover:border-[#2563eb]/50 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          >
            {/* hover glow */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.35), transparent 70%)' }}
            />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-2xl text-[#3b82f6]">{card.glyph}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#475569]">
                  {card.label}
                </span>
              </div>
              <h3 className="text-lg! font-semibold! text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">{card.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#60a5fa]">
                Open
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
