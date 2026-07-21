'use client';

import { useEffect, useState } from 'react';
import { fetchAllStatuses, aggregateStatuses, type StatusEntry, type AggregateStatus } from '@/lib/kuma-status';
import { type ServiceNode } from '@/lib/inventory';

const DOT_COLOR: Record<StatusEntry['status'], string> = {
  up: '#22c55e',
  down: '#ef4444',
  unknown: '#475569',
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

interface StatusPageClientProps {
  liveNodes: ServiceNode[];
}

export function StatusPageClient({ liveNodes }: StatusPageClientProps) {
  const [statuses, setStatuses] = useState<Map<string, StatusEntry>>(new Map());
  const [aggregate, setAggregate] = useState<AggregateStatus | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL;

  useEffect(() => {
    if (!baseUrl) return;
    fetchAllStatuses(baseUrl).then((result) => {
      setStatuses(result);
      setAggregate(aggregateStatuses(result));
    });
  }, [baseUrl]);

  return (
    <>
      {aggregate && (
        <div
          className="flex items-center gap-3 rounded-xl p-4 mb-8 font-mono text-sm"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DOT_COLOR[aggregate.worst] }} />
          <span className="text-white font-semibold">
            {aggregate.upCount}/{aggregate.totalCount} services up
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {liveNodes.map((node) => {
          const entry = statuses.get(node.status_name);
          const status = entry?.status ?? 'unknown';
          return (
            <div
              key={node.vmid}
              className="flex items-center justify-between px-4 py-3 rounded-lg font-mono text-sm"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DOT_COLOR[status] }} />
                <span className="text-white">{node.status_name}</span>
              </div>
              <span style={{ color: '#52525b' }}>
                {entry?.checkedAt ? `checked ${timeAgo(entry.checkedAt)}` : status}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
