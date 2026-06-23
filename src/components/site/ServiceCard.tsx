'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { ServiceNode } from '@/lib/inventory';
import { StatusBadge } from '@/components/StatusBadge';
import { fadeUp } from '@/lib/motion';

interface Props {
  node: ServiceNode;
}

const ACCENT: Record<string, string> = {
  'pi-hole':                         '#60a5fa',
  'uptime-kuma':                     '#a855f7',
  'home-assistant':                  '#f59e0b',
  'media-stack':                     '#22c55e',
  'production-documentation-engine': '#38bdf8',
};

function docPath(node: ServiceNode): string {
  return `/docs/${node.docs.replace(/\/(README|index)\.md$/, '').replace(/\.md$/, '')}`;
}

export function ServiceCard({ node }: Props) {
  const accent = ACCENT[node.name] ?? '#a1a1aa';

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={docPath(node)}
        className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* subtle accent glow on hover */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
        />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: '#52525b' }}>
              {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
            </p>
            <h3 className="text-lg! font-semibold! capitalize leading-snug text-white">
              {node.name.replace(/-/g, ' ')}
            </h3>
          </div>
          <StatusBadge monitorName={node.status_name} />
        </div>

        <p className="relative z-10 flex-1 text-sm leading-relaxed" style={{ color: '#71717a' }}>
          {node.role}
        </p>

        <div className="relative z-10 flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: accent }}>{node.ip}</span>
          <span
            className="inline-flex items-center gap-1 text-xs transition-colors"
            style={{ color: '#52525b' }}
          >
            docs
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
