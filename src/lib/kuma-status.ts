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
