# Site Status API + Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the per-service Kuma-fetching logic already in `StatusBadge.tsx` into a shared module, add it a real aggregate ("N/M services up"), and surface that aggregate as a homepage badge plus a dedicated `/status` page.

**Architecture:** A new `src/lib/kuma-status.ts` module owns fetching Kuma's public status-page + heartbeat endpoints and computing per-monitor and aggregate status, client-side, same as the existing `StatusBadge` pattern — no new backend. `StatusBadge` is refactored to consume it instead of its own inline fetch; two new components (`SystemStatusBadge`, `/status` page) consume it for the aggregate view.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Vitest (new — no test runner exists in this repo yet).

**Repo:** `jaysync-lab-site`.

## Global Constraints

- No new backend/API route — every fetch goes straight from the browser to Kuma's existing public status-page endpoints (`NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL`), matching `StatusBadge`'s current pattern.
- A Kuma fetch failure (network error, non-OK response) must never throw past the shared module — callers always get a usable (possibly `unknown`) result, never an exception.
- `StatusBadge`'s external behavior (props, rendering, the `title`/`aria-label` text) must not change — this is a refactor of its data source, not its behavior. Verify by comparing before/after render output for the same inputs.
- Automated tests are scoped to `src/lib/kuma-status.ts` (pure/async logic, no DOM needed). The three UI components (`StatusBadge`, `SystemStatusBadge`, `/status` page) are verified manually in a browser against production after merge, per this repo's existing convention (Vercel previews sit behind SSO; this project has no component-testing precedent to extend).

---

## Task 1: Add Vitest and write `aggregateStatuses`

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `src/lib/kuma-status.ts`
- Create: `src/lib/kuma-status.test.ts`

**Interfaces:**
- Produces: `StatusValue = 'up' | 'down' | 'unknown'`; `StatusEntry { status: StatusValue; checkedAt: Date | null }`; `AggregateStatus { upCount: number; totalCount: number; worst: StatusValue }`; `aggregateStatuses(statuses: Map<string, StatusEntry>): AggregateStatus`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest
```

- [ ] **Step 2: Add the test script and Vitest config**

Modify `package.json`, add to `"scripts"`:

```json
    "test": "vitest run"
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/kuma-status.test.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/lib/kuma-status.ts` doesn't exist yet

- [ ] **Step 5: Write minimal implementation**

Create `src/lib/kuma-status.ts`:

```typescript
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/kuma-status.ts src/lib/kuma-status.test.ts
git commit -m "Add Vitest, aggregateStatuses() for the new system-wide status view"
```

---

## Task 2: `fetchAllStatuses`

**Files:**
- Modify: `src/lib/kuma-status.ts`
- Modify: `src/lib/kuma-status.test.ts`

**Interfaces:**
- Consumes: `StatusEntry` (Task 1)
- Produces: `fetchAllStatuses(baseUrl: string): Promise<Map<string, StatusEntry>>` — key is the Kuma monitor's display name (matches `ServiceNode.status_name`)

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/kuma-status.test.ts`:

```typescript
import { fetchAllStatuses } from '@/lib/kuma-status';
import { vi, beforeEach, afterEach } from 'vitest';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `fetchAllStatuses` is not exported

- [ ] **Step 3: Write minimal implementation**

Add to `src/lib/kuma-status.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (8 tests total)

- [ ] **Step 5: Commit**

```bash
git add src/lib/kuma-status.ts src/lib/kuma-status.test.ts
git commit -m "Add fetchAllStatuses: batch-fetch every monitor's status from Kuma"
```

---

## Task 3: Refactor `StatusBadge` to use the shared module

**Files:**
- Modify: `src/components/StatusBadge.tsx`

**Interfaces:**
- Consumes: `fetchAllStatuses`, `StatusValue` (Task 2)

- [ ] **Step 1: Replace the inline fetch with `fetchAllStatuses` + lookup**

Modify `src/components/StatusBadge.tsx` — replace the entire file:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchAllStatuses, type StatusValue } from '@/lib/kuma-status';

interface Props {
  monitorName: string;
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
    fetchAllStatuses(baseUrl).then((statuses) => {
      const entry = statuses.get(monitorName);
      setStatus(entry?.status ?? 'unknown');
      setCheckedAt(entry?.checkedAt ?? null);
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
```

- [ ] **Step 2: Manual verification in browser**

```bash
npm run build && npm run dev
```

Open the homepage locally, confirm every service row's status dot still renders (color, `timeAgo` text, tooltip on hover) exactly as before — this is a data-source refactor, not a behavior change, so nothing visible should differ. Compare against production (`jaysynclab.com`) side by side if unsure.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatusBadge.tsx
git commit -m "Refactor StatusBadge to use the shared fetchAllStatuses lookup"
```

---

## Task 4: `SystemStatusBadge` — homepage aggregate indicator

**Files:**
- Create: `src/components/site/SystemStatusBadge.tsx`
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `fetchAllStatuses`, `aggregateStatuses`, `StatusValue`, `AggregateStatus` (Tasks 1–2)

- [ ] **Step 1: Write `SystemStatusBadge.tsx`**

Create `src/components/site/SystemStatusBadge.tsx`:

```typescript
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
```

- [ ] **Step 2: Wire it into the homepage**

Modify `src/app/(site)/page.tsx` — add the import near the other component imports:

```typescript
import { SystemStatusBadge } from '@/components/site/SystemStatusBadge';
```

Then find the `SectionReveal` block containing the "One box. N services. Zero clutter." heading (the one with `<h2 className="text-2xl! ...">`), and add the badge directly below the closing `</p>` of the descriptive paragraph, still inside that same `<div>`:

```typescript
            <p className="mt-4 leading-relaxed text-sm sm:text-base max-w-md" style={{ color: '#a1a1aa' }}>
              Everything hangs off a single Proxmox host behind a ZTE router,
              reachable anywhere through Tailscale. Each node is isolated,
              monitored, and documented.
            </p>
            <div className="mt-4">
              <SystemStatusBadge />
            </div>
```

- [ ] **Step 3: Manual verification in browser**

```bash
npm run build && npm run dev
```

Confirm the badge renders on the homepage below the intro paragraph, shows a real `N/M services up` count matching what Kuma actually reports, and clicking it navigates to `/status` (which will 404 until Task 5 — that's expected at this point).

- [ ] **Step 4: Commit**

```bash
git add src/components/site/SystemStatusBadge.tsx "src/app/(site)/page.tsx"
git commit -m "Add SystemStatusBadge: aggregate up/down count on the homepage"
```

---

## Task 5: `/status` page

**Files:**
- Create: `src/app/(site)/status/page.tsx`

**Interfaces:**
- Consumes: `fetchAllStatuses`, `aggregateStatuses`, `StatusEntry`, `AggregateStatus` (Tasks 1–2); `getInventory()` and `isLiveNode` from `@/lib/inventory` (existing)

- [ ] **Step 1: Write the status page**

Create `src/app/(site)/status/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getInventory, isLiveNode } from '@/lib/inventory';
import { PageHeader } from '@/components/site/PageHeader';
import { fetchAllStatuses, aggregateStatuses, type StatusEntry, type AggregateStatus } from '@/lib/kuma-status';

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

export default function StatusPage() {
  const { nodes } = getInventory();
  const liveNodes = nodes.filter(isLiveNode);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-16 md:pb-20">
      <PageHeader
        eyebrow="Status"
        title="System status"
        description="Live status for every service in the lab, pulled directly from Uptime Kuma."
      />

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
    </div>
  );
}
```

- [ ] **Step 2: Manual verification in browser**

```bash
npm run build && npm run dev
```

Navigate to `/status` locally, confirm: the aggregate banner at the top matches the homepage badge's count, every live node from `inventory.yaml` has a row, and each row's dot color/status matches what that same service's `StatusBadge` shows elsewhere on the site (cross-check at least 2 services against the homepage's Live Services rack).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)/status/page.tsx"
git commit -m "Add /status page: full per-service breakdown plus aggregate"
```

---

## Self-Review Notes

- **Spec coverage**: shared lib (Tasks 1–2), `StatusBadge` refactor (Task 3), homepage badge (Task 4), `/status` page (Task 5) — all three site-facing spec pieces covered. No new backend was added, per spec.
- **Placeholder scan**: none found.
- **Type consistency**: `StatusValue`/`StatusEntry`/`AggregateStatus` defined once in Task 1, imported unchanged by every later task; `fetchAllStatuses`'s `Map<string, StatusEntry>` return type is what `aggregateStatuses`, `StatusBadge`, `SystemStatusBadge`, and the `/status` page all consume identically.
