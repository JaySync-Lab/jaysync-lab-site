'use client';

import { motion } from 'motion/react';
import { stagger, fadeUp } from '@/lib/motion';
import { LoadingLink } from '@/components/LoadingLink';

const GITHUB_URL = 'https://github.com/Anuja-jayasinghe/JaySync-Lab';

const WORDS: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
};

interface Props { count: number }

export function DocsHero({ count }: Props) {
  const serviceWord = WORDS[count] ?? String(count);
  return (
    <section
      className="relative min-h-[60vh] md:min-h-[72vh] flex flex-col items-center text-center px-6 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* noise texture */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />
      {/* radial depth glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03), transparent)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 max-w-3xl w-full py-12"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* status pill */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          <span className="text-xs font-mono" style={{ color: '#a1a1aa' }}>
            All systems operational
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-extrabold leading-[0.95] tracking-tight text-white"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}
        >
          A homelab,
          <br />
          <span style={{ color: '#52525b' }}>documented properly.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-lg max-w-md leading-relaxed"
          style={{ color: '#a1a1aa' }}
        >
          One box.{' '}
          <strong
            className="font-bold not-italic"
            style={{ color: '#ffffff' }}
            title={`${count} active containers`}
          >
            {serviceWord} services.
          </strong>
          {' '}Every decision written down — hardware,
          networking, and every container accounted for.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          <LoadingLink
            href="/docs/infrastructure/hardware"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: '#ffffff', color: '#000000' }}
          >
            Read the docs
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </LoadingLink>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa',
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      {/* scroll hint — in flow so it never overlaps the centered content */}
      <motion.div
        className="relative z-10 pb-6 text-center"
        style={{ color: '#52525b' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        aria-hidden="true"
      >
        <span className="block text-[10px] tracking-widest uppercase mb-1">Scroll</span>
        <span className="block motion-safe:animate-bounce">↓</span>
      </motion.div>
    </section>
  );
}
