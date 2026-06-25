'use client';

import { useState } from 'react';
import { LoadingLink } from '@/components/LoadingLink';
import Link from 'next/link';

// ── viewport ─────────────────────────────────────
const VW = 560, VH = 380;

// ── gateway device ───────────────────────────────
const GX = 280, GY = 190, GW = 176, GH = 66;
const GPX = GX - GW / 2;   // 192
const GPY = GY - GH / 2;   // 157

// ── destination nodes ────────────────────────────
const NW = 132, NH = 72;

interface NavNode {
  id: string; glyph: string; label: string;
  title: string; desc: string; proto: string;
  href: string; isDoc?: boolean;
  cx: number; cy: number;
  // orthogonal SVG path from gateway centre → node centre
  route: string;
  // where to draw the telemetry tag on the line
  tag: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
}

const NODES: NavNode[] = [
  {
    id: 'docs', glyph: '▤', label: '/docs/',
    title: 'The full handbook', desc: 'Hardware · Net · Services', proto: 'HTTPS · 2ms',
    href: '/docs/infrastructure/hardware', isDoc: true,
    cx: 82, cy: 74,
    // exit gateway top at x=210 → go up → go left → arrive at node centre
    route: 'M 280,190 H 210 V 95 H 82 V 74',
    tag: { x: 218, y: 124, anchor: 'start' },
  },
  {
    id: 'services', glyph: '◈', label: '/services',
    title: "What's running", desc: 'Containers · VMs · Status', proto: 'WSS · live',
    href: '/services',
    cx: 478, cy: 74,
    // exit gateway right edge at y=190 → go right → go up → arrive at node centre
    route: 'M 280,190 H 368 V 74 H 478',
    tag: { x: 376, y: 112, anchor: 'start' },
  },
  {
    id: 'architecture', glyph: '⬡', label: '/architecture/',
    title: 'How it fits together', desc: 'Topology · VMID · Subnets', proto: 'ICMP · 1ms',
    href: '/architecture',
    cx: 82, cy: 306,
    // exit gateway bottom at centre x=280 → go down → go left → arrive at node centre
    route: 'M 280,190 V 270 H 82 V 306',
    tag: { x: 204, y: 265, anchor: 'end' },
  },
  {
    id: 'changelog', glyph: '◷', label: '/changelog',
    title: 'What changed, when', desc: 'Timeline · Decisions', proto: 'GIT · 5ms',
    href: '/docs/changelog',
    cx: 478, cy: 306,
    // exit gateway bottom at x=328 (offset right) → go down → go right → arrive at node centre
    route: 'M 280,190 H 328 V 270 H 478',
    tag: { x: 368, y: 265, anchor: 'start' },
  },
];

const ACCENT: Record<string, string> = {
  docs:         '#60a5fa',
  services:     '#a855f7',
  architecture: '#22c55e',
  changelog:    '#f59e0b',
};

// SVG coord → percentage for the HTML link overlay
const toP = (v: number, total: number) => `${(v / total) * 100}%`;

// ── gateway SVG ──────────────────────────────────
function Gateway() {
  const portW = 15, portH = 10, gap = 4, nPorts = 6;
  const span  = nPorts * portW + (nPorts - 1) * gap;
  const portX = GX - span / 2;
  const portY = GPY + GH - portH - 8;

  return (
    <g>
      {/* antennas */}
      {([-44, 44] as const).map((dx, i) => {
        const bx = GX + dx, by = GPY + 6;
        const tx = GX + dx + (dx < 0 ? -8 : 8), ty = GPY - 18;
        return (
          <g key={i}>
            <line x1={bx} y1={by} x2={tx} y2={ty}
              stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" />
            <circle cx={tx} cy={ty} r={2.6} fill="rgba(255,255,255,0.35)" />
          </g>
        );
      })}

      {/* body */}
      <rect x={GPX} y={GPY} width={GW} height={GH} rx={7}
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

      {/* status LED */}
      <circle cx={GPX + 13} cy={GPY + 15} r={3.5}
        fill="#22c55e" filter="url(#nn-glow)" className="nn-pulse" />

      {/* label */}
      <text x={GPX + 24} y={GPY + 19}
        fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700}
        fill="rgba(255,255,255,0.65)">
        JAYSYNC-GW
      </text>

      {/* throughput bars (top-right corner of body) */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="nn-bar"
          x={330 + i * 7} y={GPY + 4} width={4} height={15} rx={1}
          fill="#22c55e" opacity={0.75}
          style={{ animationDelay: `${i * 0.18}s` }} />
      ))}

      {/* separator */}
      <line x1={GPX + 10} y1={GPY + 28} x2={GPX + GW - 10} y2={GPY + 28}
        stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />

      {/* ethernet ports */}
      {Array.from({ length: nPorts }).map((_, i) => {
        const x = portX + i * (portW + gap), active = i < 4;
        return (
          <g key={i}>
            <rect x={x} y={portY} width={portW} height={portH} rx={2}
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
            <rect x={x + 3.5} y={portY + 2.5} width={8} height={5} rx={1}
              fill={active ? '#22c55e' : '#161616'} opacity={active ? 0.9 : 1}
              filter={active ? 'url(#nn-glow)' : undefined}
              className={active ? 'nn-pulse' : ''} />
          </g>
        );
      })}

      {/* IP caption */}
      <text x={GX} y={GPY + GH + 16} textAnchor="middle"
        fontSize={8.5} fontFamily="ui-monospace, monospace"
        fill="rgba(255,255,255,0.22)"
        style={{
          paintOrder: 'stroke', stroke: '#080808',
          strokeWidth: 3, strokeLinejoin: 'round',
        } as React.CSSProperties}>
        192.168.1.100 · gateway
      </text>
    </g>
  );
}

// ── main export ──────────────────────────────────
export function NetworkNav() {
  const [hot, setHot] = useState<string | null>(null);

  return (
    <div
      className="relative w-full max-w-[680px] overflow-hidden rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
      }}
    >
      {/* ── header chrome ── */}
      <div className="flex items-center justify-between px-4 py-2.5 font-mono text-[11px]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="flex items-center gap-2">
          <span style={{ color: '#60a5fa' }}>◉</span>
          <span style={{ color: '#a1a1aa' }}>topology</span>
          <span style={{ color: '#2d2d2d' }}>.map</span>
        </span>
        <span className="flex items-center gap-2" style={{ color: '#3f3f46' }}>
          <span className="h-1.5 w-1.5 rounded-full nn-pulse" style={{ background: '#22c55e' }} />
          <span style={{ color: '#52525b' }}>LIVE</span>
          <span>·</span>
          <span>{NODES.length} routes</span>
        </span>
      </div>

      {/* ── diagram ── */}
      <div className="relative p-2 sm:p-3">

        {/* HUD corner brackets */}
        {([
          { t: 8, l: 8, bt: 1, bl: 1 }, { t: 8, r: 8, bt: 1, br: 1 },
          { b: 8, l: 8, bb: 1, bl: 1 }, { b: 8, r: 8, bb: 1, br: 1 },
        ] as Array<Record<string, number>>).map((c, i) => (
          <span key={i} className="pointer-events-none absolute z-20" style={{
            width: 13, height: 13,
            top: c.t, left: c.l, right: c.r, bottom: c.b,
            borderTop:    c.bt ? '1.5px solid rgba(255,255,255,0.22)' : undefined,
            borderBottom: c.bb ? '1.5px solid rgba(255,255,255,0.22)' : undefined,
            borderLeft:   c.bl ? '1.5px solid rgba(255,255,255,0.22)' : undefined,
            borderRight:  c.br ? '1.5px solid rgba(255,255,255,0.22)' : undefined,
          }} />
        ))}

        {/* SVG: lines, gateway, node outlines */}
        <svg viewBox={`0 0 ${VW} ${VH}`}
          className="pointer-events-none w-full h-full" aria-hidden>

          <defs>
            <filter id="nn-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="nn-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(96,165,250,0.10)" />
              <stop offset="60%"  stopColor="rgba(96,165,250,0.02)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <pattern id="nn-grid" width={26} height={26} patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none"
                stroke="rgba(255,255,255,0.032)" strokeWidth={0.5} />
            </pattern>
          </defs>

          <style>{`
            @keyframes nn-flow  { from { stroke-dashoffset: 18 } to { stroke-dashoffset: 0 } }
            @keyframes nn-pulse { 0%,100% { opacity:.45 } 50% { opacity:1 } }
            @keyframes nn-bar   { from { transform:scaleY(.25) } to { transform:scaleY(1) } }
            .nn-flow  { animation: nn-flow 1.6s linear infinite }
            .nn-pulse { animation: nn-pulse 2.2s ease-in-out infinite }
            .nn-bar   {
              transform-box: fill-box; transform-origin: bottom;
              animation: nn-bar 1.1s ease-in-out infinite alternate;
            }
          `}</style>

          {/* blueprint grid + centre glow */}
          <rect x={0} y={0} width={VW} height={VH} fill="url(#nn-grid)" />
          <circle cx={GX} cy={GY} r={155} fill="url(#nn-core)" />

          {/* ── orthogonal connection lines + travelling packets ── */}
          {NODES.map((n, i) => {
            const isHot = hot === n.id;
            const col   = ACCENT[n.id];
            return (
              <g key={n.id}>
                {/* dashed route line */}
                <path
                  d={n.route}
                  className="nn-flow"
                  fill="none"
                  stroke={isHot ? col : 'rgba(255,255,255,0.07)'}
                  strokeWidth={isHot ? 1.6 : 0.75}
                  strokeDasharray="5 4"
                  strokeLinejoin="round"
                  style={{
                    transition: 'stroke .18s, stroke-width .18s',
                    filter: isHot ? `drop-shadow(0 0 5px ${col}90)` : 'none',
                  }}
                />

                {/* travelling packet dot */}
                <circle r={isHot ? 3.2 : 2.4}
                  fill={col}
                  opacity={isHot ? 1 : 0.45}
                  filter={isHot ? 'url(#nn-glow)' : undefined}>
                  <animateMotion
                    dur="2.6s"
                    begin={`${i * 0.55}s`}
                    repeatCount="indefinite"
                    path={n.route}
                    calcMode="linear"
                  />
                </circle>
              </g>
            );
          })}

          {/* ── per-route telemetry tags ── */}
          {NODES.map((n) => {
            const isHot = hot === n.id;
            return (
              <text key={n.id}
                x={n.tag.x} y={n.tag.y}
                textAnchor={n.tag.anchor}
                fontSize={8.5} fontFamily="ui-monospace, monospace"
                fill={isHot ? ACCENT[n.id] : 'rgba(255,255,255,0.18)'}
                style={{
                  transition: 'fill .18s',
                  paintOrder: 'stroke',
                  stroke: '#080808',
                  strokeWidth: 3,
                  strokeLinejoin: 'round',
                } as React.CSSProperties}>
                {n.proto}
              </text>
            );
          })}

          {/* ── node frames (SVG draws border/bg; HTML overlay provides the link) ── */}
          {NODES.map((n) => {
            const isHot = hot === n.id;
            const col   = ACCENT[n.id];
            return (
              <rect key={n.id}
                x={n.cx - NW / 2} y={n.cy - NH / 2}
                width={NW} height={NH} rx={8}
                fill={isHot ? `${col}14` : 'rgba(255,255,255,0.025)'}
                stroke={isHot ? col : 'rgba(255,255,255,0.09)'}
                strokeWidth={isHot ? 1 : 0.5}
                style={{ transition: 'fill .18s, stroke .18s' }}
              />
            );
          })}

          <Gateway />
        </svg>

        {/* ── HTML link overlays (positioned over each node) ── */}
        {NODES.map((n) => {
          const isHot  = hot === n.id;
          const col    = ACCENT[n.id];
          const cls    = 'block h-full w-full rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20';

          const inner = (
            <div className="flex h-full w-full flex-col items-center justify-center gap-[2px] px-2 text-center font-mono">
              <span className="text-base leading-none transition-colors duration-200"
                style={{ color: isHot ? col : 'rgba(255,255,255,0.25)' }}>
                {n.glyph}
              </span>
              <span className="text-[10px] font-semibold leading-tight transition-colors duration-200 sm:text-[11px]"
                style={{ color: isHot ? '#ffffff' : '#71717a' }}>
                {n.label}
              </span>
              <span className="hidden text-[8px] leading-tight transition-colors duration-200 sm:block sm:text-[9px]"
                style={{ color: isHot ? '#52525b' : '#2d2d2d' }}>
                {n.desc}
              </span>
            </div>
          );

          return (
            <div key={n.id}
              className="absolute"
              style={{
                left:   toP(n.cx - NW / 2, VW),
                top:    toP(n.cy - NH / 2, VH),
                width:  toP(NW, VW),
                height: toP(NH, VH),
              }}
              onMouseEnter={() => setHot(n.id)}
              onMouseLeave={() => setHot(null)}>
              {n.isDoc
                ? <LoadingLink href={n.href} className={cls}>{inner}</LoadingLink>
                : <Link       href={n.href} className={cls}>{inner}</Link>}
            </div>
          );
        })}
      </div>

      {/* ── footer chrome ── */}
      <div className="flex items-center justify-between px-4 py-2 font-mono text-[10px]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#2d2d2d' }}>
        <span>hover a node to trace its route · click to open</span>
        <span className="hidden sm:inline">uplink ▲ 1 Gb/s</span>
      </div>
    </div>
  );
}
