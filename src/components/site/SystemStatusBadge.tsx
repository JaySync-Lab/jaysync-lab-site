'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllStatuses, aggregateStatuses, type AggregateStatus } from '@/lib/kuma-status';

const DOT_COLOR: Record<AggregateStatus['worst'], string> = {
  up: '#22c55e',
  down: '#ef4444',
  unknown: '#475569',
};

export function SystemStatusBadge() {
  const [aggregate, setAggregate] = useState<AggregateStatus | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL;

  useEffect(() => {
    if (!baseUrl) return;
    fetchAllStatuses(baseUrl).then((statuses) => {
      setAggregate(aggregateStatuses(statuses));
    });
  }, [baseUrl]);

  if (!baseUrl || !aggregate) return null;

  return (
    <Link
      href="/status"
      className="inline-flex items-center gap-2 font-mono text-xs transition-opacity hover:opacity-80"
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: DOT_COLOR[aggregate.worst] }}
      />
      <span style={{ color: '#71717a' }}>
        {aggregate.upCount}/{aggregate.totalCount} services up
      </span>
    </Link>
  );
}
