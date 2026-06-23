# Docs Landing Page Redesign

**Date:** 2026-06-23
**Status:** Approved — ready for implementation

## Context

The `/docs` landing page currently renders `content/index.md` through the standard fumadocs `DocsPage` component. It has no visual personality — just plain markdown inside the fumadocs sidebar shell. The user wants a full-width standalone page with a black/grey/white glassmorphism aesthetic that gives the docs zone its own identity, distinct from the main site's blue/cinematic style.

## Routing Architecture (Option A)

The `[[...slug]]` optional catch-all is renamed to `[...slug]` (required). This frees `/docs` from fumadocs chrome entirely:

| Route | Handler |
|---|---|
| `/docs` | `src/app/docs/page.tsx` — new custom landing (no DocsLayout) |
| `/docs/infrastructure/hardware` | `src/app/docs/[...slug]/page.tsx` — existing MDX renderer |
| `/docs/services/pi-hole` | same |

**File operations required:**

1. Rename directory `src/app/docs/[[...slug]]/` → `src/app/docs/[...slug]/`
2. Create `src/app/docs/[...slug]/layout.tsx` containing `DocsLayout` (moved from step 3)
3. Replace `src/app/docs/layout.tsx` with a bare pass-through (`export default function Layout({ children }) { return <>{children}</> }`)
4. Create `src/app/docs/page.tsx` — the new landing page (server component)
5. Create `src/components/docs/` for landing-specific components

`content/index.md` stays on disk (useful reference) but is no longer rendered through fumadocs for the `/docs` route.

## Page Structure

Three sections rendered top-to-bottom inside a single server component. No client boundary needed except for the motion animations.

### 1. Sticky Nav Bar

- Fixed top, full-width
- Background: `rgba(8,8,8,0.85)` + `backdrop-filter: blur(16px)`
- Border-bottom: `rgba(255,255,255,0.06)`
- Left: `← JaySync-Lab` link back to `/`
- Right: `Read the docs →` anchor to first real doc page (`/docs/infrastructure/hardware`)
- No dark/light toggle (landing is always dark)

### 2. Hero (~85vh)

- Background: `#080808` with a subtle SVG noise texture overlay at 4% opacity
- Optional: a radial gradient fade `rgba(255,255,255,0.02)` centred top to add depth
- Content centred vertically and horizontally:
  - **Badge:** monospace label `DOCUMENTATION` in a glass pill (`rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.10)` border)
  - **Headline:** `Everything documented.` / `Nothing guessed.` — white, `font-extrabold`, large (clamp 48px–80px)
  - **Subtext:** `One box. Five services. Every decision written down.` — `#a1a1aa`, `text-lg`
  - **CTAs:** Two buttons side by side
    - Primary: `Read the docs →` — white bg, black text, rounded-xl
    - Secondary: `← Back to site` — glass border, white text, rounded-xl

### 3. Stats Bar

- Full-width strip, `py-12`, `border-y rgba(255,255,255,0.06)`
- Background: `rgba(255,255,255,0.02)`
- Four stat cards in a `grid-cols-2 lg:grid-cols-4` grid, each a glass card:
  - Glass card: `rgba(255,255,255,0.04)` bg, `rgba(255,255,255,0.08)` border, `backdrop-blur(12px)`, `rounded-xl`
  - **Value:** white, `font-extrabold text-3xl`
  - **Label:** `#52525b` zinc-600, mono uppercase xs
  - **Unit:** `#a1a1aa` zinc-400, xs
- Data from `getInventory()` — containers count, RAM GB, storage TB, uptime target %

### 4. Service Status Strip

- `py-16` section, label `LIVE SERVICES`
- Horizontal flex row, wraps on mobile (or horizontal scroll)
- One glass card per node from `getInventory().nodes`:
  - Card: same glass treatment as stats
  - Row 1: mono badge `CT {vmid}` or `VM {vmid}` + `StatusBadge` (existing component)
  - Row 2: service name (capitalised, white)
  - Row 3: IP address in mono `#52525b`
  - Card links to `/docs/{node.docs stripped}`
- Uses existing `StatusBadge` and `ServiceNode` type — no new data fetching

### 5. Footer

- `py-8 border-t rgba(255,255,255,0.06)`
- Mono text, `#52525b`:
  - Left: `jaysync-lab · Proxmox VE {host.proxmox_version}` (from inventory)
  - Right: `documented properly.`

## Colour Tokens

| Token | Value | Usage |
|---|---|---|
| Page bg | `#080808` | Body background |
| Glass bg | `rgba(255,255,255,0.04)` | Card fills |
| Glass border | `rgba(255,255,255,0.08)` | Card borders |
| Backdrop blur | `blur(12px)` | All glass surfaces |
| Nav bg | `rgba(8,8,8,0.85)` | Sticky nav |
| Nav blur | `blur(16px)` | Sticky nav |
| Text primary | `#ffffff` | Headlines, values |
| Text secondary | `#a1a1aa` | Body copy, units |
| Text muted | `#52525b` | Labels, mono details |
| Accent | `#e4e4e7` | Hover states |

No blue. This zone is purely monochrome.

## Components to Create

| Component | File | Type |
|---|---|---|
| `DocsNav` | `src/components/docs/DocsNav.tsx` | client (sticky positioning) |
| `DocsHero` | `src/components/docs/DocsHero.tsx` | server |
| `DocsStats` | `src/components/docs/DocsStats.tsx` | server (receives `HostSpec`) |
| `DocsServiceStrip` | `src/components/docs/DocsServiceStrip.tsx` | server (receives `ServiceNode[]`) |
| `DocsFooter` | `src/components/docs/DocsFooter.tsx` | server |

All components are focused, single-purpose, and receive data as props — no internal `getInventory()` calls except in `src/app/docs/page.tsx`.

## Reused From Existing Codebase

- `StatusBadge` — `src/components/StatusBadge.tsx`
- `getInventory()`, `HostSpec`, `ServiceNode` — `src/lib/inventory.ts`
- `docPath()` logic from `ServiceCard.tsx` (inline in DocsServiceStrip, or extract to lib)

## Animations

Motion is minimal — this is a docs zone, not the cinematic main site:
- Hero text: simple `opacity: 0 → 1` + `translateY(8px → 0)` on mount, staggered per line
- Cards: same subtle `fadeUp` on scroll-enter (reuse `SectionReveal` pattern or just CSS)
- No ping dots, no constellations, no backdrop rings

## Verification

1. `npm run dev` — `/docs` renders the custom page, no fumadocs sidebar visible
2. `/docs/infrastructure/hardware` still renders with full sidebar and DocsLayout
3. `/services` service cards still link correctly to docs pages (docPath unchanged)
4. `npx tsc --noEmit` — no type errors
5. Stats values match `inventory.yaml` (change a value in YAML, confirm page updates)
6. Each service card in the status strip links to its correct doc page
