import { describe, it, expect } from 'vitest';
import { aggregateStatuses, type StatusEntry } from '@/lib/kuma-status';

describe('aggregateStatuses', () => {
  it('returns unknown/0/0 for an empty map', () => {
    const result = aggregateStatuses(new Map());
    expect(result).toEqual({ upCount: 0, totalCount: 0, worst: 'unknown' });
  });

  it('returns up/N/N when every entry is up', () => {
    const statuses = new Map<string, StatusEntry>([
      ['Pi-hole', { status: 'up', checkedAt: new Date() }],
      ['Uptime Kuma', { status: 'up', checkedAt: new Date() }],
    ]);
    const result = aggregateStatuses(statuses);
    expect(result).toEqual({ upCount: 2, totalCount: 2, worst: 'up' });
  });

  it('worst is down when any entry is down, even with others up', () => {
    const statuses = new Map<string, StatusEntry>([
      ['Pi-hole', { status: 'up', checkedAt: new Date() }],
      ['Home Assistant', { status: 'down', checkedAt: new Date() }],
    ]);
    const result = aggregateStatuses(statuses);
    expect(result).toEqual({ upCount: 1, totalCount: 2, worst: 'down' });
  });

  it('worst is unknown when no entry is down but one is unknown', () => {
    const statuses = new Map<string, StatusEntry>([
      ['Pi-hole', { status: 'up', checkedAt: new Date() }],
      ['Grafana', { status: 'unknown', checkedAt: null }],
    ]);
    const result = aggregateStatuses(statuses);
    expect(result).toEqual({ upCount: 1, totalCount: 2, worst: 'unknown' });
  });
});
