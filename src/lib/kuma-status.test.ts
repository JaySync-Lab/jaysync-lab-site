import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { aggregateStatuses, fetchAllStatuses, type StatusEntry } from '@/lib/kuma-status';

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

describe('fetchAllStatuses', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses a successful response into a name-keyed map', async () => {
    const pageResponse = {
      publicGroupList: [
        { monitorList: [{ id: 1, name: 'Pi-hole' }, { id: 2, name: 'Uptime Kuma' }] },
      ],
    };
    const heartbeatResponse = {
      heartbeatList: {
        '1': [{ status: 1, time: '2026-07-21T00:00:00Z' }],
        '2': [{ status: 0, time: '2026-07-21T00:01:00Z' }],
      },
    };
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => pageResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => heartbeatResponse });

    const result = await fetchAllStatuses('https://kuma.example.com');

    expect(result.get('Pi-hole')?.status).toBe('up');
    expect(result.get('Uptime Kuma')?.status).toBe('down');
    expect(result.size).toBe(2);
  });

  it('returns an empty map when a monitor has no heartbeat data', async () => {
    const pageResponse = { publicGroupList: [{ monitorList: [{ id: 1, name: 'Pi-hole' }] }] };
    const heartbeatResponse = { heartbeatList: {} };
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => pageResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => heartbeatResponse });

    const result = await fetchAllStatuses('https://kuma.example.com');

    expect(result.get('Pi-hole')).toEqual({ status: 'unknown', checkedAt: null });
  });

  it('returns an empty map when the status-page request fails', async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ heartbeatList: {} }) });

    const result = await fetchAllStatuses('https://kuma.example.com');

    expect(result.size).toBe(0);
  });

  it('returns an empty map when fetch throws', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));

    const result = await fetchAllStatuses('https://kuma.example.com');

    expect(result.size).toBe(0);
  });
});
