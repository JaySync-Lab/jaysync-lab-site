'use client';

import { motion } from 'motion/react';
import type { ServiceNode } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  className?: string;
}

// Fixed positions in a 500×420 viewBox — radial around Proxmox hub
const LAYOUT: Record<string, { x: number; y: number; labelOffset: { x: number; y: number } }> = {
  'pi-hole':                         { x: 95,  y: 80,  labelOffset: { x: -8, y: 0 } },
  'uptime-kuma':                     { x: 405, y: 80,  labelOffset: { x:  8, y: 0 } },
  'home-assistant':                  { x: 440, y: 220, labelOffset: { x: 10, y: 0 } },
  'media-stack':                     { x: 355, y: 345, labelOffset: { x:  4, y: 0 } },
  'production-documentation-engine': { x: 100, y: 330, labelOffset: { x: -4, y: 0 } },
};

const NODE_COLOR: Record<string, string> = {
  'pi-hole':                         '#60a5fa',
  'uptime-kuma':                     '#a855f7',
  'home-assistant':                  '#f59e0b',
  'media-stack':                     '#22c55e',
  'production-documentation-engine': '#38bdf8',
};

const NODE_SHORT: Record<string, string> = {
  'pi-hole':                         'pi-hole',
  'uptime-kuma':                     'watchman',
  'home-assistant':                  'home asst.',
  'media-stack':                     'media',
  'production-documentation-engine': 'docs',
};

// Fixed per-node animation durations to avoid hydration mismatch
const FLOW_DUR   = [2.2, 1.9, 2.6, 2.0, 2.4];
const PULSE_DUR  = [3.2, 3.6, 2.9, 3.4, 3.0];

const HUB = { x: 250, y: 205 };
const ROUTER = { x: 250, y: 370 };

export function NetworkTopology({ nodes, className }: Props) {
  const placed = nodes.map((node, i) => ({
    node,
    pos: LAYOUT[node.name] ?? { x: 250, y: 100, labelOffset: { x: 0, y: 0 } },
    color: NODE_COLOR[node.name] ?? '#a1a1aa',
    short: NODE_SHORT[node.name] ?? node.name,
    flowDur: FLOW_DUR[i % FLOW_DUR.length],
    pulseDur: PULSE_DUR[i % PULSE_DUR.length],
  }));

  return (
    <motion.svg
      viewBox="0 0 500 420"
      className={className}
      role="img"
      aria-label="Network topology: Proxmox host connecting five service containers via virtual bridge"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, delay: 0.2 }}
    >
      <defs>
        {/* dot grid pattern */}
        <pattern id="topo-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.06)" />
        </pattern>

        {/* service node glow */}
        <filter id="topo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" in="SourceGraphic" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* hub glow */}
        <filter id="topo-hub-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" in="SourceGraphic" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* packet glow */}
        <filter id="topo-pkt-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" in="SourceGraphic" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* background dot grid */}
      <rect x="0" y="0" width="500" height="420" fill="url(#topo-dots)" />

      {/* ── ZTE → Proxmox spine ── */}
      <line
        x1={ROUTER.x} y1={ROUTER.y}
        x2={HUB.x} y2={HUB.y}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
        strokeDasharray="5 5"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="0.8s" repeatCount="indefinite" />
      </line>

      {/* ── Service connection lines ── */}
      {placed.map(({ node, pos, color, flowDur }) => {
        const len = Math.hypot(pos.x - HUB.x, pos.y - HUB.y);
        return (
          <g key={`line-${node.vmid}`}>
            {/* base line */}
            <line
              x1={HUB.x} y1={HUB.y}
              x2={pos.x} y2={pos.y}
              stroke={`${color}22`}
              strokeWidth={1.5}
            />
            {/* animated flow dashes */}
            <line
              x1={HUB.x} y1={HUB.y}
              x2={pos.x} y2={pos.y}
              stroke={`${color}70`}
              strokeWidth={1.5}
              strokeDasharray={`8 ${len}`}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to={`-${len + 8}`}
                dur={`${flowDur}s`}
                repeatCount="indefinite"
              />
            </line>
            {/* data packet */}
            <circle r="2.8" fill={color} filter="url(#topo-pkt-glow)" opacity="0.95">
              <animateMotion
                dur={`${flowDur * 1.1}s`}
                repeatCount="indefinite"
                path={`M ${HUB.x} ${HUB.y} L ${pos.x} ${pos.y}`}
              />
            </circle>
          </g>
        );
      })}

      {/* ── ZTE Router node ── */}
      <g>
        <circle cx={ROUTER.x} cy={ROUTER.y} r={15}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle cx={ROUTER.x} cy={ROUTER.y} r={6}
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={0.75}
        />
        <text x={ROUTER.x} y={ROUTER.y + 26} textAnchor="middle" fill="#3f3f46" fontSize={8} fontFamily="monospace">ZTE router</text>
        <text x={ROUTER.x} y={ROUTER.y + 35} textAnchor="middle" fill="#27272a" fontSize={7} fontFamily="monospace">192.168.1.1</text>
      </g>

      {/* ── Service nodes ── */}
      {placed.map(({ node, pos, color, short, pulseDur }, i) => {
        const anchor = pos.x < 250 ? 'end' : pos.x > 350 ? 'start' : 'middle';
        const lx = pos.x + (anchor === 'end' ? -26 : anchor === 'start' ? 26 : 0);
        return (
          <g key={node.vmid}>
            {/* pulse ring */}
            <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke={`${color}25`} strokeWidth={1}>
              <animate attributeName="r" values="18;30;18" dur={`${pulseDur}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${pulseDur}s`} repeatCount="indefinite" />
            </circle>
            {/* glass body */}
            <circle cx={pos.x} cy={pos.y} r={18}
              fill={`${color}12`}
              stroke={`${color}55`}
              strokeWidth={1.2}
              filter="url(#topo-glow)"
            />
            {/* inner ring */}
            <circle cx={pos.x} cy={pos.y} r={10}
              fill={`${color}18`}
              stroke={`${color}90`}
              strokeWidth={0.75}
            />
            {/* center dot */}
            <circle cx={pos.x} cy={pos.y} r={3.5} fill={color} filter="url(#topo-glow)">
              <animate attributeName="opacity" values="1;0.45;1" dur={`${2 + i * 0.28}s`} repeatCount="indefinite" />
            </circle>
            {/* label */}
            <text x={lx} y={pos.y - 4} textAnchor={anchor} fill="#a1a1aa" fontSize={8.5} fontFamily="monospace" fontWeight={600}>
              {short}
            </text>
            <text x={lx} y={pos.y + 7} textAnchor={anchor} fill="#52525b" fontSize={7} fontFamily="monospace">
              {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid} · {node.ip}
            </text>
          </g>
        );
      })}

      {/* ── Proxmox hub (rendered last = on top) ── */}
      <g>
        {/* outer breathing ring */}
        <circle cx={HUB.x} cy={HUB.y} r={44} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1}>
          <animate attributeName="r" values="44;58;44" dur="4.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="4.5s" repeatCount="indefinite" />
        </circle>
        {/* outer glass ring */}
        <circle cx={HUB.x} cy={HUB.y} r={38}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.2}
        />
        {/* mid ring */}
        <circle cx={HUB.x} cy={HUB.y} r={27}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={1.2}
          filter="url(#topo-hub-glow)"
        />
        {/* inner core */}
        <circle cx={HUB.x} cy={HUB.y} r={16}
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.40)"
          strokeWidth={1}
        />
        {/* labels */}
        <text x={HUB.x} y={HUB.y - 3} textAnchor="middle" fill="#ffffff" fontSize={8.5} fontWeight={700} fontFamily="monospace" filter="url(#topo-hub-glow)">
          PROXMOX
        </text>
        <text x={HUB.x} y={HUB.y + 8} textAnchor="middle" fill="#a1a1aa" fontSize={7} fontFamily="monospace">
          VE 9.2 · jaysync-lab
        </text>
      </g>
    </motion.svg>
  );
}
