'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import type { ServiceNode, HostSpec } from '@/lib/inventory';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  nodes: ServiceNode[];
  host:  HostSpec;
}

const ACCENT: Record<string, string> = {
  'pi-hole':                         '#60a5fa',
  'uptime-kuma':                     '#a855f7',
  'home-assistant':                  '#f59e0b',
  'media-stack':                     '#22c55e',
  'playground-controller':           '#38bdf8',
};

function docUrl(node: ServiceNode): string {
  return `/docs/${node.docs.replace(/\/(README|index)\.md$/, '').replace(/\.md$/, '')}`;
}

/* ── Rack ear — decorative side panel with mounting holes ── */
function RackEar({ side }: { side: 'left' | 'right' }) {
  const holes = [0, 1, 2, 3, 4];
  return (
    <div
      className="hidden sm:flex flex-col justify-around py-2 shrink-0"
      style={{
        width: 22,
        background: '#0c0c0c',
        borderRight: side === 'left'  ? '1px solid #222' : undefined,
        borderLeft:  side === 'right' ? '1px solid #222' : undefined,
      }}
    >
      {holes.map((i) => (
        <div
          key={i}
          className="mx-auto rounded-full"
          style={{
            width: 8, height: 8,
            background: '#060606',
            border: '1px solid #2a2a2a',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)',
          }}
        />
      ))}
    </div>
  );
}

/* ── Header unit — shows host identity (1U top of rack) ── */
function HostHeaderUnit({ host }: { host: HostSpec }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      style={{ borderBottom: '1px solid #202020', background: '#0f0f0f' }}
    >
      {/* Power LED */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-50 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
      </span>

      {/* rack label */}
      <span
        className="font-mono text-[11px] font-bold tracking-widest uppercase text-white"
        style={{ letterSpacing: '0.2em' }}
      >
        JAYSYNC-LAB
      </span>

      {/* spacer */}
      <div className="flex-1 mx-2" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* host spec */}
      <span className="font-mono text-[10px] hidden sm:inline" style={{ color: '#3f3f46' }}>
        {host.model}
      </span>
      <span
        className="font-mono text-[10px] px-1.5 py-0.5 rounded"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#52525b',
        }}
      >
        PVE {host.proxmox_version}
      </span>
    </div>
  );
}

/* ── Individual rack unit (1U per service) ── */
function RackUnit({ node, index }: { node: ServiceNode; index: number }) {
  const [open, setOpen] = useState(false);
  const accent = ACCENT[node.name] ?? '#52525b';
  const url = docUrl(node);
  const isLast = false; // caller sets border

  return (
    <div>
      {/* collapsed bar */}
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
        className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 cursor-pointer select-none transition-colors"
        style={{
          background: open ? 'rgba(255,255,255,0.025)' : undefined,
          borderLeft: `2px solid ${open ? accent : 'transparent'}`,
        }}
        aria-expanded={open}
      >
        {/* U number */}
        <span
          className="shrink-0 font-mono text-[9px] tabular-nums"
          style={{ color: '#2d2d2d', minWidth: 18 }}
        >
          {String(index + 1).padStart(2, '0')}U
        </span>

        {/* Live status dot from Uptime Kuma */}
        <span className="shrink-0">
          <StatusBadge monitorName={node.status_name} />
        </span>

        {/* Service name */}
        <span className="flex-1 font-mono text-[13px] font-semibold text-white capitalize truncate">
          {node.name.replace(/-/g, ' ')}
        </span>

        {/* Type badge */}
        <span
          className="shrink-0 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded hidden xs:inline"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#3f3f46',
          }}
        >
          {node.type === 'vm' ? 'VM' : 'CT'}&nbsp;{node.vmid}
        </span>

        {/* IP — hidden on small screens */}
        <span
          className="shrink-0 font-mono text-[11px] hidden md:inline tabular-nums"
          style={{ color: '#2d2d2d', minWidth: 108, textAlign: 'right' }}
        >
          {node.ip}
        </span>

        {/* chevron */}
        <motion.span
          className="shrink-0 font-mono text-base leading-none"
          style={{ color: '#3f3f46' }}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          ›
        </motion.span>
      </div>

      {/* expanded detail panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div
              className="flex flex-col sm:flex-row gap-4 sm:items-end px-8 py-4"
              style={{
                background: 'rgba(255,255,255,0.015)',
                borderLeft: `2px solid ${accent}`,
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* role */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] mb-1.5" style={{ color: '#3f3f46' }}>
                  Role
                </p>
                <p className="text-sm text-white leading-snug">{node.role}</p>
              </div>

              {/* band + type */}
              <div className="shrink-0 hidden sm:block">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] mb-1.5" style={{ color: '#3f3f46' }}>
                  Band
                </p>
                <p className="font-mono text-[11px]" style={{ color: '#52525b' }}>
                  {node.band}
                </p>
              </div>

              {/* IP on mobile */}
              <div className="shrink-0 md:hidden">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] mb-1.5" style={{ color: '#3f3f46' }}>
                  IP
                </p>
                <p className="font-mono text-[11px]" style={{ color: '#52525b' }}>{node.ip}</p>
              </div>

              {/* docs link */}
              <div className="shrink-0">
                <Link
                  href={url}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: accent }}
                >
                  Read docs <span>→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Blank panel (empty rack slot filler) ── */
function BlankPanel() {
  return (
    <div
      className="flex items-center px-3 py-2"
      style={{ borderTop: '1px solid #161616' }}
    >
      <span className="font-mono text-[9px]" style={{ color: '#1a1a1a', minWidth: 18 }}>
        ──U
      </span>
      <div
        className="flex-1 h-px ml-3"
        style={{
          background: 'repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 4px, transparent 4px, transparent 8px)',
        }}
      />
      <span className="font-mono text-[9px] ml-3" style={{ color: '#1a1a1a' }}>EMPTY</span>
    </div>
  );
}

/* ── Rack enclosure ── */
function ServerRack({ nodes, host }: Props) {
  return (
    <div
      className="w-full"
      style={{
        background: '#080808',
        border: '1px solid #1e1e1e',
        borderRadius: 6,
        boxShadow: '0 0 0 3px #0a0a0a, 0 0 0 4px #1a1a1a, 0 16px 40px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
    >
      <div className="flex">
        <RackEar side="left" />

        {/* main body */}
        <div className="flex-1 min-w-0">
          <HostHeaderUnit host={host} />

          {/* "Live Services" — templates aren't running, so they don't
              belong in the rack (they're documented on /services and the
              VMID band diagram instead). */}
          {nodes.filter((n) => !n.template).map((node, i) => (
            <div key={node.vmid} style={{ borderTop: '1px solid #161616' }}>
              <RackUnit node={node} index={i} />
            </div>
          ))}

          <BlankPanel />
        </div>

        <RackEar side="right" />
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
export function DocsServiceStrip({ nodes, host }: Props) {
  return (
    <section className="py-8 md:py-10 px-4 sm:px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4"
          style={{ color: '#3f3f46' }}
        >
          Live Services
        </p>
        <ServerRack nodes={nodes} host={host} />
      </div>
    </section>
  );
}
