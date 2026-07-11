'use client';

import { motion } from 'motion/react';
import type { ServiceNode } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  className?: string;
}

// viewBox 580×460 — wide enough that right-side labels never clip
const VW = 580;
const VH = 460;

// Radial positions around Proxmox hub
const LAYOUT: Record<string, { x: number; y: number; labelSide: 'left' | 'right' | 'below' }> = {
  'pi-hole':                         { x: 105, y: 85,  labelSide: 'left'  },
  'uptime-kuma':                     { x: 435, y: 85,  labelSide: 'right' },
  'home-assistant':                  { x: 475, y: 225, labelSide: 'right' },
  'media-stack':                     { x: 375, y: 360, labelSide: 'right' },
  'playground-controller':           { x: 110, y: 345, labelSide: 'left'  },
};

const NODE_COLOR: Record<string, string> = {
  'pi-hole':                         '#60a5fa',
  'uptime-kuma':                     '#a855f7',
  'home-assistant':                  '#f59e0b',
  'media-stack':                     '#22c55e',
  'playground-controller':           '#38bdf8',
};

const NODE_SHORT: Record<string, string> = {
  'pi-hole':                         'pi-hole',
  'uptime-kuma':                     'watchman',
  'home-assistant':                  'home asst.',
  'media-stack':                     'media',
  'playground-controller':           'playground',
};

// Fixed durations — no Math.random() to avoid hydration mismatch
const FLOW_DUR  = [2.2, 1.9, 2.6, 2.0, 2.4];
const PULSE_DUR = [3.2, 3.6, 2.9, 3.4, 3.0];

const HUB    = { x: 285, y: 215 };
const ROUTER = { x: 285, y: 395 };
const GAP    = 26; // px gap from node edge to label start

export function NetworkTopology({ nodes, className }: Props) {
  // Templates have no IP and aren't on the network — the topology shows
  // only live, networked nodes.
  const placed = nodes.filter((n) => !n.template).map((node, i) => ({
    node,
    layout:   LAYOUT[node.name] ?? { x: 285, y: 100, labelSide: 'below' as const },
    color:    NODE_COLOR[node.name] ?? '#a1a1aa',
    short:    NODE_SHORT[node.name] ?? node.name,
    flowDur:  FLOW_DUR[i % FLOW_DUR.length],
    pulseDur: PULSE_DUR[i % PULSE_DUR.length],
  }));

  return (
    <motion.svg
      viewBox={`0 0 ${VW} ${VH}`}
      // overflow visible so breathing pulse rings don't get hard-clipped
      style={{ overflow: 'visible', width: '100%', height: 'auto' }}
      className={className}
      role="img"
      aria-label="Network topology: Proxmox host connecting five service containers via virtual bridge"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, delay: 0.2 }}
    >
      <defs>
        <pattern id="topo-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.06)" />
        </pattern>
        <filter id="topo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" in="SourceGraphic" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="topo-hub-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" in="SourceGraphic" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="topo-pkt-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" in="SourceGraphic" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* dot grid covers the viewBox */}
      <rect x="0" y="0" width={VW} height={VH} fill="url(#topo-dots)" />

      {/* ZTE → Proxmox spine */}
      <line
        x1={ROUTER.x} y1={ROUTER.y} x2={HUB.x} y2={HUB.y}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="5 5"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="0.8s" repeatCount="indefinite" />
      </line>

      {/* service connection lines */}
      {placed.map(({ node, layout, color, flowDur }) => {
        const { x, y } = layout;
        const len = Math.hypot(x - HUB.x, y - HUB.y);
        return (
          <g key={`line-${node.vmid}`}>
            {/* base line */}
            <line x1={HUB.x} y1={HUB.y} x2={x} y2={y}
              stroke={`${color}22`} strokeWidth={1.5} />
            {/* animated flow dashes */}
            <line x1={HUB.x} y1={HUB.y} x2={x} y2={y}
              stroke={`${color}70`} strokeWidth={1.5}
              strokeDasharray={`8 ${len}`}
            >
              <animate attributeName="stroke-dashoffset"
                from="0" to={`-${len + 8}`}
                dur={`${flowDur}s`} repeatCount="indefinite" />
            </line>
            {/* data packet */}
            <circle r="2.8" fill={color} filter="url(#topo-pkt-glow)" opacity="0.95">
              <animateMotion dur={`${flowDur * 1.1}s`} repeatCount="indefinite"
                path={`M ${HUB.x} ${HUB.y} L ${x} ${y}`} />
            </circle>
          </g>
        );
      })}

      {/* ZTE router node */}
      <g>
        <circle cx={ROUTER.x} cy={ROUTER.y} r={15}
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)"
          strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={ROUTER.x} cy={ROUTER.y} r={6}
          fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.75} />
        <text x={ROUTER.x} y={ROUTER.y + 26} textAnchor="middle"
          fill="#3f3f46" fontSize={9} fontFamily="monospace">ZTE router</text>
      </g>

      {/* service nodes */}
      {placed.map(({ node, layout, color, short, pulseDur }, i) => {
        const { x, y, labelSide } = layout;
        const anchor = labelSide === 'left'  ? 'end'
                     : labelSide === 'right' ? 'start'
                     : 'middle';
        const lx  = labelSide === 'left'  ? x - GAP
                  : labelSide === 'right' ? x + GAP
                  : x;
        const ly1 = labelSide === 'below' ? y + GAP + 4  : y - 5;
        const ly2 = labelSide === 'below' ? y + GAP + 15 : y + 7;
        return (
          <g key={node.vmid}>
            {/* pulse ring */}
            <circle cx={x} cy={y} r={18} fill="none" stroke={`${color}25`} strokeWidth={1}>
              <animate attributeName="r" values="18;30;18" dur={`${pulseDur}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${pulseDur}s`} repeatCount="indefinite" />
            </circle>
            {/* glass body */}
            <circle cx={x} cy={y} r={18}
              fill={`${color}12`} stroke={`${color}55`} strokeWidth={1.2}
              filter="url(#topo-glow)" />
            {/* inner ring */}
            <circle cx={x} cy={y} r={10}
              fill={`${color}18`} stroke={`${color}90`} strokeWidth={0.75} />
            {/* center dot with blink */}
            <circle cx={x} cy={y} r={3.5} fill={color} filter="url(#topo-glow)">
              <animate attributeName="opacity" values="1;0.45;1"
                dur={`${2 + i * 0.28}s`} repeatCount="indefinite" />
            </circle>
            {/* label — positioned based on which side of the hub the node is on */}
            <text x={lx} y={ly1} textAnchor={anchor}
              fill="#a1a1aa" fontSize={9.5} fontFamily="monospace" fontWeight={600}>
              {short}
            </text>
            <text x={lx} y={ly2} textAnchor={anchor}
              fill="#52525b" fontSize={8} fontFamily="monospace">
              {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
            </text>
          </g>
        );
      })}

      {/* Proxmox hub — rendered last so it sits on top of connection lines */}
      <g>
        {/* outer breathing ring */}
        <circle cx={HUB.x} cy={HUB.y} r={44} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1}>
          <animate attributeName="r" values="44;60;44" dur="4.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="4.5s" repeatCount="indefinite" />
        </circle>
        {/* outer glass ring */}
        <circle cx={HUB.x} cy={HUB.y} r={38}
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} />
        {/* mid ring */}
        <circle cx={HUB.x} cy={HUB.y} r={27}
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.2}
          filter="url(#topo-hub-glow)" />
        {/* inner core */}
        <circle cx={HUB.x} cy={HUB.y} r={16}
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.40)" strokeWidth={1} />
        <text x={HUB.x} y={HUB.y - 3} textAnchor="middle"
          fill="#ffffff" fontSize={9} fontWeight={700} fontFamily="monospace"
          filter="url(#topo-hub-glow)">PROXMOX</text>
        <text x={HUB.x} y={HUB.y + 9} textAnchor="middle"
          fill="#a1a1aa" fontSize={7.5} fontFamily="monospace">VE 9.2 · jaysync-lab</text>
      </g>
    </motion.svg>
  );
}
