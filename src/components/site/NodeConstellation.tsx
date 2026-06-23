'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ServiceNode } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  className?: string;
}

const NODE_COLOR: Record<string, string> = {
  'pi-hole': '#60a5fa',
  'uptime-kuma': '#a855f7',
  'home-assistant': '#f59e0b',
  'media-stack': '#22c55e',
  'production-documentation-engine': '#38bdf8',
};

const ORBIT = [
  { x: 90, y: 70 },
  { x: 280, y: 80 },
  { x: 70, y: 210 },
  { x: 290, y: 200 },
  { x: 140, y: 300 },
];

const CENTER = { x: 180, y: 165 };

export function NodeConstellation({ nodes, className }: Props) {
  const reduced = useReducedMotion();
  const placed = nodes.slice(0, ORBIT.length).map((node, i) => ({
    node,
    pos: ORBIT[i],
    color: NODE_COLOR[node.name] ?? '#a1a1aa',
  }));

  return (
    <svg
      viewBox="0 0 360 360"
      className={className}
      role="img"
      aria-label="Network topology: ZTE router connects to the Proxmox host, which runs five containers and VMs."
    >
      {/* connection lines */}
      {placed.map(({ pos, node }) => {
        const len = Math.hypot(pos.x - CENTER.x, pos.y - CENTER.y);
        return (
          <motion.line
            key={`line-${node.vmid}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={pos.x}
            y2={pos.y}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
            initial={reduced ? false : { strokeDasharray: len, strokeDashoffset: len }}
            whileInView={reduced ? undefined : { strokeDashoffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        );
      })}

      {/* router → proxmox spine */}
      <line
        x1={CENTER.x}
        y1={CENTER.y}
        x2={CENTER.x}
        y2={335}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <rect
        x={148} y={335} width={64} height={20} rx={5}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={0.5}
      />
      <text x={180} y={348} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">
        ZTE · .1.1
      </text>

      {/* central Proxmox node */}
      <motion.g
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.3 }}
        style={{ originX: '180px', originY: '165px' }}
      >
        <circle cx={CENTER.x} cy={CENTER.y} r={30}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
        />
        <circle cx={CENTER.x} cy={CENTER.y} r={20}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth={1}
        />
        <text x={CENTER.x} y={CENTER.y - 2} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight={700} fontFamily="monospace">
          PROXMOX
        </text>
        <text x={CENTER.x} y={CENTER.y + 9} textAnchor="middle" fill="#a1a1aa" fontSize={7} fontFamily="monospace">
          VE 9.2
        </text>
      </motion.g>

      {/* service nodes — keep colored dots for identity */}
      {placed.map(({ node, pos, color }, i) => (
        <motion.g
          key={node.vmid}
          initial={reduced ? false : { scale: 0, opacity: 0 }}
          whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.5 + i * 0.1 }}
          style={{ originX: `${pos.x}px`, originY: `${pos.y}px` }}
        >
          <circle cx={pos.x} cy={pos.y} r={16}
            fill={`${color}12`}
            stroke={`${color}40`}
            strokeWidth={1}
          />
          <circle cx={pos.x} cy={pos.y} r={4.5} fill={color}>
            {!reduced && (
              <animate attributeName="opacity" values="1;0.4;1" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            )}
          </circle>
          <text x={pos.x} y={pos.y + 30} textAnchor="middle" fill="#a1a1aa" fontSize={8} fontFamily="monospace">
            {node.name.replace('production-documentation-engine', 'docs-engine')}
          </text>
          <text x={pos.x} y={pos.y + 40} textAnchor="middle" fill="#52525b" fontSize={7} fontFamily="monospace">
            {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
