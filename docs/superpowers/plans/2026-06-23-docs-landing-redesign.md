# Docs Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain markdown `/docs` index with a full-width glassmorphism landing page (black/grey/white) while keeping all other doc pages inside the fumadocs sidebar shell.

**Architecture:** Change the `[[...slug]]` optional catch-all to `[...slug]` (required), freeing `/docs` for a dedicated `page.tsx`. Move `DocsLayout` into a `[...slug]/layout.tsx` so it only wraps real doc pages. The landing reads inventory data server-side and passes it as props into five focused components.

**Tech Stack:** Next.js 15 app router, TypeScript, Tailwind CSS v4, motion/react (for hero animation), fumadocs-ui (sidebar layout stays on doc pages), js-yaml via existing `getInventory()`.

## Global Constraints

- No blue anywhere on the landing — monochrome only (`#080808`, `#ffffff`, `#a1a1aa`, `#52525b`)
- Glass surface: `rgba(255,255,255,0.04)` bg · `rgba(255,255,255,0.08)` border · `backdrop-blur(12px)`
- All inventory data flows through `getInventory()` in `src/app/docs/page.tsx` only — no child component calls it directly
- `npx tsc --noEmit` must pass after every task
- Reuse `StatusBadge`, `HostSpec`, `ServiceNode` from existing codebase — do not duplicate

---

### Task 1: Restructure routing — split `[[...slug]]` into `[...slug]` + standalone `/docs`

**Files:**
- Rename: `src/app/docs/[[...slug]]/` → `src/app/docs/[...slug]/`
- Create: `src/app/docs/[...slug]/layout.tsx`
- Modify: `src/app/docs/layout.tsx` → bare pass-through
- Modify: `src/app/docs/[...slug]/page.tsx` — filter empty slug from `generateStaticParams`

**Interfaces:**
- Produces: `/docs` is unclaimed by the catch-all; `/docs/*` still renders through `DocsLayout`

- [ ] **Step 1: Rename the catch-all directory**

```bash
# In the project root
mv "src/app/docs/[[...slug]]" "src/app/docs/[...slug]"
```

Verify: `ls src/app/docs/` should show `[...slug]  layout.tsx` (no double brackets).

- [ ] **Step 2: Create `src/app/docs/[...slug]/layout.tsx` with DocsLayout**

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-zone bg-fd-background min-h-screen">
      <DocsLayout
        tree={source.pageTree}
        nav={{
          title: (
            <span className="font-bold tracking-tight">
              Jay<span className="text-fd-muted-foreground">Sync</span> Lab
            </span>
          ),
        }}
        sidebar={{
          footer: (
            <Link
              href="/"
              className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
            >
              ← Back to site
            </Link>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/app/docs/layout.tsx` with a bare pass-through**

```tsx
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 4: Filter empty slug from `generateStaticParams` in `src/app/docs/[...slug]/page.tsx`**

Find the `generateStaticParams` export (currently `return source.generateParams()`) and replace it:

```tsx
export async function generateStaticParams() {
  return source.generateParams().filter(
    (p: { slug?: string[] }) => p.slug && p.slug.length > 0,
  );
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Smoke-test dev server**

```bash
npm run dev
```

Visit `http://localhost:3000/docs/infrastructure/hardware` — sidebar and DocsLayout must still appear. Visit `http://localhost:3000/docs` — should 404 (no `page.tsx` yet, which is correct at this step).

- [ ] **Step 7: Commit**

```bash
git add src/app/docs/
git commit -m "refactor: split [[...slug]] into [...slug] + bare docs layout for standalone landing"
```

---

### Task 2: Build the five landing components

**Files:**
- Create: `src/components/docs/DocsNav.tsx`
- Create: `src/components/docs/DocsHero.tsx`
- Create: `src/components/docs/DocsStats.tsx`
- Create: `src/components/docs/DocsServiceStrip.tsx`
- Create: `src/components/docs/DocsFooter.tsx`

**Interfaces:**
- Consumes: `HostSpec`, `ServiceNode` from `src/lib/inventory.ts`; `StatusBadge` from `src/components/StatusBadge.tsx`; `stagger`, `fadeUp` from `src/lib/motion.ts`
- Produces:
  - `DocsNav()` — no props
  - `DocsHero()` — no props
  - `DocsStats({ host: HostSpec, containerCount: number })` — JSX
  - `DocsServiceStrip({ nodes: ServiceNode[] })` — JSX
  - `DocsFooter({ host: HostSpec })` — JSX

- [ ] **Step 1: Create `src/components/docs/DocsNav.tsx`**

```tsx
'use client';

import Link from 'next/link';

export function DocsNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Link
        href="/"
        className="font-mono text-sm transition-colors"
        style={{ color: '#a1a1aa' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
      >
        ← JaySync-Lab
      </Link>
      <Link
        href="/docs/infrastructure/hardware"
        className="font-mono text-sm px-4 py-1.5 rounded-lg transition-colors"
        style={{
          color: '#ffffff',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        Read the docs →
      </Link>
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/docs/DocsHero.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { stagger, fadeUp } from '@/lib/motion';

export function DocsHero() {
  return (
    <section
      className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: '#080808' }}
    >
      {/* noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />
      {/* radial depth gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03), transparent)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-3xl"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* badge */}
        <motion.span
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#a1a1aa',
          }}
        >
          Documentation
        </motion.span>

        {/* headline */}
        <motion.h1
          variants={fadeUp}
          className="font-extrabold leading-[0.95] tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
        >
          Everything documented.
          <br />
          <span style={{ color: '#52525b' }}>Nothing guessed.</span>
        </motion.h1>

        {/* subtext */}
        <motion.p
          variants={fadeUp}
          className="text-lg max-w-md leading-relaxed"
          style={{ color: '#a1a1aa' }}
        >
          One box. Five services. Every decision written down.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3 mt-2"
        >
          <Link
            href="/docs/infrastructure/hardware"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#ffffff', color: '#000000' }}
          >
            Read the docs →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa',
            }}
          >
            ← Back to site
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/docs/DocsStats.tsx`**

```tsx
import type { HostSpec } from '@/lib/inventory';

interface Props {
  host: HostSpec;
  containerCount: number;
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-widest mb-3"
        style={{ color: '#52525b' }}
      >
        {label}
      </p>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs" style={{ color: '#a1a1aa' }}>
        {unit}
      </p>
    </div>
  );
}

export function DocsStats({ host, containerCount }: Props) {
  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  const stats = [
    { label: 'Containers', value: String(containerCount), unit: 'LXC + VM on Proxmox' },
    { label: 'RAM Installed', value: `${host.ram_gb} GB`, unit: `DDR4 · ${host.cpu}` },
    {
      label: 'Storage',
      value: `${storageTb} TB`,
      unit: `${host.storage.ssd_gb}GB SSD + ${host.storage.vault_tb}TB vault`,
    },
    { label: 'Uptime Target', value: `${host.uptime_target_pct}%`, unit: 'Watchman monitored' },
  ];

  return (
    <section
      className="py-12 px-6"
      style={{
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/docs/DocsServiceStrip.tsx`**

```tsx
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
      className="flex-shrink-0 flex flex-col gap-3 p-5 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minWidth: '180px',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: '#52525b' }}
        >
          {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
        </span>
        <StatusBadge monitorName={node.status_name} />
      </div>
      <p className="text-sm font-semibold text-white capitalize leading-snug">
        {node.name.replace(/-/g, ' ')}
      </p>
      <p className="font-mono text-xs" style={{ color: '#52525b' }}>
        {node.ip}
      </p>
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
```

- [ ] **Step 5: Create `src/components/docs/DocsFooter.tsx`**

```tsx
import type { HostSpec } from '@/lib/inventory';

interface Props {
  host: HostSpec;
}

export function DocsFooter({ host }: Props) {
  return (
    <footer
      className="py-8 px-6"
      style={{
        background: '#080808',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-xs" style={{ color: '#52525b' }}>
          jaysync-lab · Proxmox VE {host.proxmox_version}
        </p>
        <p className="font-mono text-xs" style={{ color: '#52525b' }}>
          documented properly.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/docs/
git commit -m "feat: add docs landing components (DocsNav, DocsHero, DocsStats, DocsServiceStrip, DocsFooter)"
```

---

### Task 3: Wire the landing page

**Files:**
- Create: `src/app/docs/page.tsx`

**Interfaces:**
- Consumes: all five components from `src/components/docs/`; `getInventory()` from `src/lib/inventory`
- Produces: the `/docs` route, rendered without fumadocs chrome

- [ ] **Step 1: Create `src/app/docs/page.tsx`**

```tsx
import { getInventory } from '@/lib/inventory';
import { DocsNav } from '@/components/docs/DocsNav';
import { DocsHero } from '@/components/docs/DocsHero';
import { DocsStats } from '@/components/docs/DocsStats';
import { DocsServiceStrip } from '@/components/docs/DocsServiceStrip';
import { DocsFooter } from '@/components/docs/DocsFooter';

export const metadata = {
  title: 'Documentation — JaySync-Lab',
  description: 'Everything documented. Nothing guessed.',
};

export default function DocsLandingPage() {
  const { host, nodes } = getInventory();

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <DocsNav />
      <main>
        <DocsHero />
        <DocsStats host={host} containerCount={nodes.length} />
        <DocsServiceStrip nodes={nodes} />
      </main>
      <DocsFooter host={host} />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Check all six points from the spec:
1. `http://localhost:3000/docs` — custom landing renders, **no fumadocs sidebar**
2. `http://localhost:3000/docs/infrastructure/hardware` — sidebar + DocsLayout present ✓
3. `http://localhost:3000/services` — service cards still link correctly to docs pages ✓
4. Stats values match `src/data/inventory.yaml` ✓
5. Each service chip in the status strip links to its correct doc page ✓
6. Nav bar appears fixed at top on scroll ✓

- [ ] **Step 4: Production build check**

```bash
npm run build
```

Expected: builds clean with `/docs` listed as a static route alongside `/docs/[...slug]` paths.

- [ ] **Step 5: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "feat: docs landing page — glassmorphism hero, stats, service strip (black/grey/white)"
```
