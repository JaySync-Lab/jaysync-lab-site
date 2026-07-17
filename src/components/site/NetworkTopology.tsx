'use client';

import { motion } from 'motion/react';
import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
  className?: string;
}

// viewBox — sized generously now that this diagram gets a full-width slot
// on the Architecture page instead of half a 2-col grid. Margins here are
// deliberately wide: verified numerically (not just eyeballed) that even
// a 4-node branch with the longest current label ("Playground Controller")
// stays within bounds on either side, with room to spare as bands grow.
const VW = 800;
const VH = 620;

const HUB    = { x: 400, y: 290 };
const ROUTER = { x: 400, y: 470 }; // fixed, straight down from the hub

// Band branches are distributed around the hub, avoiding a wedge reserved
// for the router spine (centered on the router's own angle, 90°).
const ROUTER_ANGLE = 90;
const ROUTER_GAP   = 70; // degrees kept clear around the router spine
const BRANCH_START = ROUTER_ANGLE + ROUTER_GAP / 2;
const BRANCH_ARC   = 360 - ROUTER_GAP;

const JUNCTION_RADIUS = 58;
const NODE_BASE_RADIUS = 96;
const NODE_STEP = 46;
const GAP = 24; // px gap from node edge to label start

// One distinct color per band — the same grouping already driving the
// VMID band diagram below this component, now visualized as branch color.
const BAND_COLOR: Record<string, string> = {
  'core-network':            '#60a5fa',
  'automation-utilities':    '#a855f7',
  'specialized-controllers': '#f59e0b',
  'media-streaming':         '#22c55e',
  'sandboxes-testing':       '#38bdf8',
};

const BAND_SHORT: Record<string, string> = {
  'core-network':            'core network',
  'automation-utilities':    'automation',
  'specialized-controllers': 'controllers',
  'media-streaming':         'media',
  'sandboxes-testing':       'sandboxes',
};

// Individual node accent colors — deliberately a different palette from
// the band colors above, cycled by stable (vmid-sorted) index, so each
// node stays visually distinct from its own branch's tint.
const NODE_PALETTE = ['#f472b6', '#facc15', '#34d399', '#818cf8', '#fb7185', '#2dd4bf', '#c084fc', '#fbbf24'];

// Fixed durations — no Math.random() to avoid hydration mismatch
const FLOW_DUR  = [2.2, 1.9, 2.6, 2.0, 2.4, 2.1, 2.7, 1.8];
const PULSE_DUR = [3.2, 3.6, 2.9, 3.4, 3.0, 3.5, 3.1, 3.3];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function NetworkTopology({ nodes, bands, className }: Props) {
  // Templates have no IP and aren't on the network — the topology shows
  // only live, networked nodes.
  const liveNodes = nodes.filter((n) => !n.template);

  // Only bands with at least one live node get a branch — an empty band
  // (e.g. sandboxes-testing today) simply doesn't appear.
  const activeBands = bands.filter((b) => liveNodes.some((n) => n.band === b.id));

  const branches = activeBands.map((band, i) => {
    const angleDeg = BRANCH_START + (i + 0.5) * (BRANCH_ARC / activeBands.length);
    const angleRad = toRad(angleDeg);
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const color = BAND_COLOR[band.id] ?? '#a1a1aa';
    const bandNodes = liveNodes
      .filter((n) => n.band === band.id)
      .sort((a, b2) => a.vmid - b2.vmid);

    return {
      band,
      color,
      dirX,
      dirY,
      junction: { x: HUB.x + dirX * JUNCTION_RADIUS, y: HUB.y + dirY * JUNCTION_RADIUS },
      nodes: bandNodes.map((node, j) => ({
        node,
        x: HUB.x + dirX * (NODE_BASE_RADIUS + j * NODE_STEP),
        y: HUB.y + dirY * (NODE_BASE_RADIUS + j * NODE_STEP),
        labelSide: (dirX >= 0 ? 'right' : 'left') as 'left' | 'right',
      })),
    };
  });

  // Flattened, globally-indexed for stable per-node color/animation timing
  // regardless of which branch a node lands in.
  const withIndex = branches
    .flatMap((b) => b.nodes.map((n) => ({ ...n, branchColor: b.color })))
    .map((p, gi) => ({ ...p, gi }));

  return (
    <motion.svg
      viewBox={`0 0 ${VW} ${VH}`}
      // overflow visible so breathing pulse rings/labels don't get hard-clipped
      style={{ overflow: 'visible', width: '100%', height: 'auto' }}
      className={className}
      role="img"
      aria-label="Network topology: Proxmox host connecting service containers, grouped by VMID band"
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

      {/* branch spines: hub -> junction -> each node, colored per band */}
      {branches.map(({ band, color, junction, nodes: bandNodes }) => (
        <g key={`branch-${band.id}`}>
          <line x1={HUB.x} y1={HUB.y} x2={junction.x} y2={junction.y}
            stroke={`${color}50`} strokeWidth={1.5} />
          {bandNodes.map(({ node, x, y }, j) => {
            const from = j === 0 ? junction : bandNodes[j - 1];
            return (
              <line key={`seg-${node.vmid}`} x1={from.x} y1={from.y} x2={x} y2={y}
                stroke={`${color}35`} strokeWidth={1.5} />
            );
          })}
        </g>
      ))}

      {/* animated flow + data packet, hub straight to each node */}
      {withIndex.map(({ node, x, y, branchColor, gi: idx }) => {
        const len = Math.hypot(x - HUB.x, y - HUB.y);
        const flowDur = FLOW_DUR[idx % FLOW_DUR.length];
        return (
          <g key={`flow-${node.vmid}`}>
            <line x1={HUB.x} y1={HUB.y} x2={x} y2={y}
              stroke={`${branchColor}45`} strokeWidth={1}
              strokeDasharray={`6 ${len}`}
            >
              <animate attributeName="stroke-dashoffset"
                from="0" to={`-${len + 6}`}
                dur={`${flowDur}s`} repeatCount="indefinite" />
            </line>
            <circle r="2.6" fill={branchColor} filter="url(#topo-pkt-glow)" opacity="0.9">
              <animateMotion dur={`${flowDur * 1.1}s`} repeatCount="indefinite"
                path={`M ${HUB.x} ${HUB.y} L ${x} ${y}`} />
            </circle>
          </g>
        );
      })}

      {/* band junctions */}
      {branches.map(({ band, color, junction }) => {
        const short = BAND_SHORT[band.id] ?? band.label;
        return (
          <g key={`junction-${band.id}`}>
            <circle cx={junction.x} cy={junction.y} r={5}
              fill={`${color}30`} stroke={color} strokeWidth={1.2} filter="url(#topo-glow)" />
            <text x={junction.x} y={junction.y - 11} textAnchor="middle"
              fill={color} fontSize={8} fontFamily="monospace" fontWeight={700}
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {short}
            </text>
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
      {withIndex.map(({ node, x, y, labelSide, gi: idx }) => {
        const color = NODE_PALETTE[idx % NODE_PALETTE.length];
        const pulseDur = PULSE_DUR[idx % PULSE_DUR.length];
        const anchor = labelSide === 'left' ? 'end' : 'start';
        const lx = labelSide === 'left' ? x - GAP : x + GAP;
        return (
          <g key={node.vmid}>
            {/* pulse ring */}
            <circle cx={x} cy={y} r={16} fill="none" stroke={`${color}25`} strokeWidth={1}>
              <animate attributeName="r" values="16;27;16" dur={`${pulseDur}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${pulseDur}s`} repeatCount="indefinite" />
            </circle>
            {/* glass body */}
            <circle cx={x} cy={y} r={16}
              fill={`${color}12`} stroke={`${color}55`} strokeWidth={1.2}
              filter="url(#topo-glow)" />
            {/* inner ring */}
            <circle cx={x} cy={y} r={9}
              fill={`${color}18`} stroke={`${color}90`} strokeWidth={0.75} />
            {/* center dot with blink */}
            <circle cx={x} cy={y} r={3.2} fill={color} filter="url(#topo-glow)">
              <animate attributeName="opacity" values="1;0.45;1"
                dur={`${2 + idx * 0.28}s`} repeatCount="indefinite" />
            </circle>
            {/* label */}
            <text x={lx} y={y - 5} textAnchor={anchor}
              fill="#a1a1aa" fontSize={9.5} fontFamily="monospace" fontWeight={600}>
              {node.status_name}
            </text>
            <text x={lx} y={y + 7} textAnchor={anchor}
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
