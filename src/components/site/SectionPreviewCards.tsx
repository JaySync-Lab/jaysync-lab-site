'use client';

import { motion } from 'motion/react';
import { fadeUp } from '@/lib/motion';
import { LoadingLink } from '@/components/LoadingLink';
import Link from 'next/link';

interface Card {
  href: string;
  label: string;
  title: string;
  desc: string;
  glyph: string;
  isDoc?: boolean;
}

const CARDS: Card[] = [
  {
    href: '/docs/infrastructure/hardware',
    label: 'Documentation',
    title: 'The full handbook',
    desc: 'Hardware, networking, every service — the complete written record of the lab.',
    glyph: '▤',
    isDoc: true,
  },
  {
    href: '/services',
    label: 'Services',
    title: 'What\'s running',
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
    href: '/docs/changelog',
    label: 'Changelog',
    title: 'What changed, when',
    desc: 'A timeline of every infrastructure change since the lab came online.',
    glyph: '◷',
  },
];

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

function CardInner({ card }: { card: Card }) {
  return (
    <>
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)' }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-2xl text-white">{card.glyph}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#52525b' }}>
            {card.label}
          </span>
        </div>
        <h3 className="text-lg! font-semibold! text-white">{card.title}</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{card.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#a1a1aa' }}>
          Open
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </>
  );
}

export function SectionPreviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {CARDS.map((card) => (
        <motion.div key={card.href} variants={fadeUp}>
          {card.isDoc ? (
            <LoadingLink
              href={card.href}
              className="group relative block overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              style={{ ...cardStyle, borderColor: 'rgba(255,255,255,0.08)' } as React.CSSProperties}
            >
              <CardInner card={card} />
            </LoadingLink>
          ) : (
            <Link
              href={card.href}
              className="group relative block overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              style={cardStyle as React.CSSProperties}
            >
              <CardInner card={card} />
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );
}
