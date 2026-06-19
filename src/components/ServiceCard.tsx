import Link from 'next/link';
import type { ServiceNode } from '@/lib/inventory';
import { StatusBadge } from './StatusBadge';

interface Props {
  node: ServiceNode;
}

function docPath(node: ServiceNode): string {
  return `/docs/${node.docs.replace(/\/README\.md$/, '').replace(/\.md$/, '')}`;
}

export function ServiceCard({ node }: Props) {
  return (
    <article className="border border-[#1e293b] bg-[#0f172a] rounded-lg p-5 hover:border-[#334155] transition-colors flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-[#475569] uppercase tracking-wider mb-1">
            {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
          </p>
          <h3 className="text-[#e2e8f0] font-semibold text-base capitalize leading-snug">
            {node.name.replace(/-/g, ' ')}
          </h3>
        </div>
        <StatusBadge monitorName={node.status_name} />
      </div>

      <p className="text-[#64748b] text-sm leading-relaxed flex-1">{node.role}</p>

      <p className="font-mono text-[11px] text-[#38bdf8]">{node.ip}</p>

      <Link
        href={docPath(node)}
        className="text-xs text-[#475569] group-hover:text-[#38bdf8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded mt-1"
      >
        View docs →
      </Link>
    </article>
  );
}
