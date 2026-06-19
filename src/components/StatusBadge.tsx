'use client';

import { useEffect, useState } from 'react';

type StatusValue = 'up' | 'down' | 'unknown';

interface Props {
  monitorName: string;
}

interface MonitorEntry {
  id: number;
  name: string;
}

interface StatusPageResponse {
  publicGroupList: Array<{ monitorList: MonitorEntry[] }>;
}

interface HeartbeatEntry {
  status: 0 | 1;
  time: string;
}

interface HeartbeatResponse {
  heartbeatList: Record<string, HeartbeatEntry[]>;
}

async function fetchMonitorStatus(
  baseUrl: string,
  monitorName: string,
): Promise<{ status: StatusValue; checkedAt: Date | null }> {
  try {
    const [pageRes, hbRes] = await Promise.all([
      fetch(`${baseUrl}/api/status-page/default`),
      fetch(`${baseUrl}/api/status-page/heartbeat/default`),
    ]);
    if (!pageRes.ok || !hbRes.ok) return { status: 'unknown', checkedAt: null };

    const page: StatusPageResponse = await pageRes.json();
    const hb: HeartbeatResponse = await hbRes.json();

    let monitorId: number | null = null;
    for (const group of page.publicGroupList) {
      const match = group.monitorList.find((m) => m.name === monitorName);
      if (match) { monitorId = match.id; break; }
    }
    if (monitorId === null) return { status: 'unknown', checkedAt: null };

    const beats = hb.heartbeatList[String(monitorId)];
    if (!beats || beats.length === 0) return { status: 'unknown', checkedAt: null };

    const latest = beats[beats.length - 1];
    return {
      status: latest.status === 1 ? 'up' : 'down',
      checkedAt: new Date(latest.time),
    };
  } catch {
    return { status: 'unknown', checkedAt: null };
  }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const DOT: Record<StatusValue, { color: string; pulse: boolean; label: string }> = {
  up:      { color: '#22c55e', pulse: false, label: 'up' },
  down:    { color: '#ef4444', pulse: true,  label: 'down' },
  unknown: { color: '#475569', pulse: false, label: 'unknown' },
};

export function StatusBadge({ monitorName }: Props) {
  const [status, setStatus] = useState<StatusValue>('unknown');
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL;

  useEffect(() => {
    if (!baseUrl) { setLoading(false); return; }
    fetchMonitorStatus(baseUrl, monitorName).then(({ status: s, checkedAt: t }) => {
      setStatus(s);
      setCheckedAt(t);
      setLoading(false);
    });
  }, [baseUrl, monitorName]);

  if (!baseUrl) return null;

  const dot = DOT[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px]"
      aria-label={`Status: ${dot.label}`}
      title={`${monitorName}: ${dot.label}${checkedAt ? ` · checked ${timeAgo(checkedAt)}` : ''}`}
    >
      {loading ? (
        <span className="w-2 h-2 rounded-full bg-[#334155] motion-safe:animate-pulse" />
      ) : (
        <span
          className={dot.pulse ? 'w-2 h-2 rounded-full motion-safe:animate-ping' : 'w-2 h-2 rounded-full'}
          style={{ backgroundColor: dot.color }}
        />
      )}
      <span className="text-[#475569]">
        {loading ? '…' : checkedAt ? timeAgo(checkedAt) : dot.label}
      </span>
    </span>
  );
}
