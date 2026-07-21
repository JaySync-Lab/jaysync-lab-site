export type StatusValue = 'up' | 'down' | 'unknown';

export interface StatusEntry {
  status: StatusValue;
  checkedAt: Date | null;
}

export interface AggregateStatus {
  upCount: number;
  totalCount: number;
  worst: StatusValue;
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

export function aggregateStatuses(statuses: Map<string, StatusEntry>): AggregateStatus {
  const totalCount = statuses.size;
  if (totalCount === 0) return { upCount: 0, totalCount: 0, worst: 'unknown' };

  let upCount = 0;
  let hasDown = false;
  let hasUnknown = false;
  for (const entry of statuses.values()) {
    if (entry.status === 'up') upCount++;
    else if (entry.status === 'down') hasDown = true;
    else hasUnknown = true;
  }

  const worst: StatusValue = hasDown ? 'down' : hasUnknown ? 'unknown' : 'up';
  return { upCount, totalCount, worst };
}

export async function fetchAllStatuses(baseUrl: string): Promise<Map<string, StatusEntry>> {
  const result = new Map<string, StatusEntry>();
  try {
    const [pageRes, hbRes] = await Promise.all([
      fetch(`${baseUrl}/api/status-page/default`),
      fetch(`${baseUrl}/api/status-page/heartbeat/default`),
    ]);
    if (!pageRes.ok || !hbRes.ok) return result;

    const page: StatusPageResponse = await pageRes.json();
    const hb: HeartbeatResponse = await hbRes.json();

    for (const group of page.publicGroupList) {
      for (const monitor of group.monitorList) {
        const beats = hb.heartbeatList[String(monitor.id)];
        if (!beats || beats.length === 0) {
          result.set(monitor.name, { status: 'unknown', checkedAt: null });
          continue;
        }
        const latest = beats[beats.length - 1];
        result.set(monitor.name, {
          status: latest.status === 1 ? 'up' : 'down',
          checkedAt: new Date(latest.time),
        });
      }
    }
  } catch {
    // network error -- return whatever was collected so far
  }
  return result;
}
