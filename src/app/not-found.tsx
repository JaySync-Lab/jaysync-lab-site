'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

const LINES = [
  'GET /[path] — resource not found on this host',
  'VMID 404 does not exist in inventory',
  'Container may have been decommissioned or never created',
];

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center font-mono"
      style={{ background: '#080808' }}
    >
      {/* noise */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      <motion.div
        className="relative z-10 max-w-lg w-full"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* error code */}
        <motion.p
          className="text-[10px] uppercase tracking-[0.3em] mb-4"
          style={{ color: '#3f3f46' }}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        >
          jaysync-lab · proxmox
        </motion.p>

        <motion.h1
          className="font-extrabold leading-none tracking-tight text-white mb-2"
          style={{ fontSize: 'clamp(5rem, 20vw, 10rem)' }}
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-sm uppercase tracking-[0.2em] mb-8"
          style={{ color: '#52525b' }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        >
          VMID not found
        </motion.p>

        {/* terminal block */}
        <motion.div
          className="text-left rounded-xl mb-8 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        >
          {/* terminal title bar */}
          <div
            className="flex items-center gap-1.5 px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {['#ef4444', '#f59e0b', '#3f3f46'].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-2 text-[10px] tracking-wider" style={{ color: '#3f3f46' }}>
              jaysync@proxmox:~$
            </span>
          </div>

          {/* lines */}
          <div className="px-4 py-4 flex flex-col gap-2">
            {LINES.map((line, i) => (
              <motion.p
                key={i}
                className="text-[11px] leading-relaxed flex gap-2"
                style={{ color: i === 0 ? '#ef4444' : '#52525b' }}
                variants={{ hidden: { opacity: 0, x: -4 }, show: { opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.12 } } }}
              >
                <span style={{ color: '#3f3f46' }}>{'>'}</span>
                {line}
              </motion.p>
            ))}

            {/* blinking cursor */}
            <motion.p
              className="text-[11px] flex gap-2 mt-1"
              style={{ color: '#3f3f46' }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.7 } } }}
            >
              <span>{'>'}</span>
              <span
                className="inline-block w-[6px] h-[0.9em] align-middle"
                style={{ background: '#3f3f46', animation: 'blink 1.1s step-end infinite' }}
              />
            </motion.p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            ← Home
          </Link>
          <Link
            href="/docs/infrastructure/hardware"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: '#ffffff', color: '#000000' }}
          >
            Browse docs →
          </Link>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
