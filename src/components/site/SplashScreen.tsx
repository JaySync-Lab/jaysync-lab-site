'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const LINES = [
  { tag: 'boot', text: 'Proxmox VE 9.2.3'   },
  { tag: 'init', text: '5 containers active' },
  { tag: 'link', text: 'Tailscale mesh up'   },
  { tag: 'stat', text: 'All systems nominal' },
];

const LINE_MS   = 320; // gap between each line appearing
const HOLD_MS   = 480; // pause after last line before exit

export function SplashScreen() {
  const [active,   setActive]   = useState(false);
  const [lineIdx,  setLineIdx]  = useState(0);
  const [exiting,  setExiting]  = useState(false);

  useEffect(() => {
    // Plays on every page load (not gated to once-per-session) -- explicit
    // choice: this is a boot-sequence animation, not a first-visit-only
    // intro, so every fresh load replays it.
    setActive(true);

    // stagger lines
    LINES.forEach((_, i) => {
      setTimeout(() => setLineIdx(i + 1), 700 + i * LINE_MS);
    });

    // exit after last line + hold
    const exitAt = 700 + LINES.length * LINE_MS + HOLD_MS;
    const t = setTimeout(() => {
      setExiting(true);
    }, exitAt);

    return () => clearTimeout(t);
  }, []);

  if (!active) return null;

  const progress = lineIdx / LINES.length;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{ background: '#080808' }}
          exit={{
            y: '-100%',
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* subtle noise overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              opacity: 0.025,
            }}
          />

          {/* ── Logo ── */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* wordmark */}
            <p
              className="font-extrabold tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 7vw, 4rem)' }}
            >
              <span className="text-white">Jay</span>
              <span style={{ color: '#52525b' }}>Sync</span>
              <span className="text-white"> Lab</span>
            </p>

            {/* sub-label */}
            <motion.p
              className="font-mono uppercase tracking-[0.35em] mt-2"
              style={{ fontSize: 10, color: '#2d2d2d' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Homelab · Documented Properly
            </motion.p>
          </motion.div>

          {/* ── separator ── */}
          <motion.div
            className="my-8"
            style={{
              width: 180,
              height: 1,
              background: 'rgba(255,255,255,0.07)',
              transformOrigin: 'center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* ── boot lines ── */}
          <div
            className="font-mono flex flex-col gap-2.5"
            style={{ width: 220, fontSize: 11 }}
          >
            {LINES.map((line, i) =>
              i < lineIdx ? (
                <motion.div
                  key={line.tag}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <span style={{ color: '#2d2d2d', minWidth: 28 }}>{line.tag}</span>
                  <span className="flex-1" style={{ color: '#71717a' }}>{line.text}</span>
                  {/* last line gets a green dot instead of text */}
                  {i === LINES.length - 1 ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
                    </span>
                  ) : (
                    <span style={{ color: '#22c55e' }}>OK</span>
                  )}
                </motion.div>
              ) : null,
            )}
          </div>

          {/* ── progress bar ── */}
          <div
            className="mt-10 rounded-full overflow-hidden"
            style={{ width: 180, height: 1, background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'rgba(255,255,255,0.28)' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
