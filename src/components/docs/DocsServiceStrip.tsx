import Link from 'next/link';
import type { ServiceNode } from '@/lib/inventory';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  nodes: ServiceNode[];
}

function docUrl(node: ServiceNode): string {
  return `/docs/${node.docs.replace(/\/(README|index)\.md$/, '').replace(/\.md$/, '')}`;
}

function ServiceChip({ node }: { node: ServiceNode }) {
  return (
    <Link
      href={docUrl(node)}
      className="flex-shrink-0 flex flex-col gap-3 p-5 rounded-xl transition-all hover:border-white/20"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minWidth: '180px',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>
          {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
        </span>
        <StatusBadge monitorName={node.status_name} />
      </div>
      <p className="text-sm font-semibold text-white capitalize leading-snug">
        {node.name.replace(/-/g, ' ')}
      </p>
      <p className="font-mono text-xs" style={{ color: '#52525b' }}>{node.ip}</p>
    </Link>
  );
}

export function DocsServiceStrip({ nodes }: Props) {
  return (
    <section className="py-16 px-6" style={{ background: '#080808' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6"
          style={{ color: '#52525b' }}
        >
          Live Services
        </p>
        <div className="flex flex-wrap gap-4">
          {nodes.map((node) => (
            <ServiceChip key={node.vmid} node={node} />
          ))}
        </div>
      </div>
    </section>
  );
}
