# JaySync-Lab Site Redesign — Design Spec

**Date:** 2026-06-19
**Status:** Approved pending user review

## Goal

Redesign the existing functional-but-flat JaySync-Lab site into a minimal, stylish, highly-functional documentation site. A blue-accented landing experience funnels visitors into a calm, monochrome-grey documentation zone. Keep colors simple; invest the polish in motion, depth (shadows/abstraction), responsiveness, and hover interactions.

## Design Philosophy

- **Two zones, two palettes.**
  - **Site zone** (`/`, `/services`, `/architecture`, `/changelog`): blue accent (`#2563eb`) on a deep near-black, with abstract geometry, motion, and depth. Stylish but minimal — the landing page's single job is to pull people into the docs.
  - **Docs zone** (`/docs/*`): monochrome grey, two shades, clean light + dark mode. No accent-color noise. Calm and readable.
- **Less "AI-generated," more human.** Real copy with voice ("A homelab, documented properly."), not spec-sheet bullet hero text. No rainbow gradients, no purple-glass cliché.
- **Minimal color, maximal craft.** The wow comes from movement, shadow, abstraction, and responsiveness — not from many colors.

## Color System

### Site zone (blue)
| Token | Hex | Use |
|---|---|---|
| `--site-bg` | `#0a0f1f` | page background (deep navy-black) |
| `--site-surface` | `#111726` | cards, raised surfaces |
| `--site-border` | `#1e293b` | hairline borders |
| `--site-blue` | `#2563eb` | primary accent (matches anujajay.com) |
| `--site-blue-light` | `#60a5fa` | hover, highlights, gradient top |
| `--site-blue-deep` | `#1d4ed8` | gradient bottom, pressed states |
| `--site-text` | `#f1f5f9` | headings |
| `--site-text-muted` | `rgba(255,255,255,0.42)` | body/sub text |

Minor supporting colors only where they carry meaning: green `#22c55e` (status "up"), red `#ef4444` (status "down"), amber `#f59e0b` (a single stat highlight). No other hues.

### Docs zone (grey, two shades, both modes)
Tune Fumadocs CSS variables to a neutral grey scale:
- **Dark mode:** bg `#111317`, surface `#0c0e11`, border `#1c1f25`, text `#f3f4f6`, muted `#9ca3af`.
- **Light mode:** bg `#ffffff`, surface `#f7f8fa`, border `#eceef1`, text `#111317`, muted `#4b5563`.
- Accent inside docs = the grey text color itself (active sidebar item = darker grey bg). No blue inside docs except inline links, which use a desaturated slate-blue, not the vivid site blue.

## Typography
- **Display/UI:** Inter (already loaded). Weights 400/600/800. Tight tracking on large headings (`-2.5px` at 46px+).
- **Mono:** JetBrains Mono (already loaded) — IPs, VMIDs, code, eyebrow labels.
- Gradient text used sparingly: only the second line of the hero H1 and stat values.

## Motion System ("full send")

Library: **framer-motion** (`motion` package). Respect `prefers-reduced-motion` everywhere (framer-motion's `useReducedMotion` → skip transforms, keep opacity).

| Element | Animation |
|---|---|
| Hero glow + rings | Continuous CSS `breathe` keyframe (scale + opacity), 6s alternate |
| Hero grid | Static, radial-masked so it fades at edges |
| Hero H1 | Words blur-fade-up in sequence, 0.08s stagger, on load |
| Hero pill | Slides down + fades, on load |
| Hero CTA | Hover: lift `translateY(-2px)` + shadow intensify |
| Node constellation (hero/architecture) | SVG connection lines draw via `stroke-dashoffset`, then nodes spring-scale in, then live pulse loop |
| Section reveals | Intersection Observer → fade + slide up (`y: 24 → 0`), once |
| Stat numbers | Count from 0 → value when scrolled into view (`useInView` + animated counter) |
| Service cards | Hover: lift + scale `1.02`, glow intensifies, border brightens |
| Nav | Transparent at top; on scroll past 20px → blurred surface + hairline border (scroll listener) |
| Docs sidebar active item | Smooth slide indicator between items (framer-motion `layoutId`) |

## Page Designs

### Landing `/` (blue, the funnel)
- Full-viewport hero: deep navy bg, centered breathing blue radial glow, three concentric faint rings, edge-masked grid.
- Centered: status pill → H1 (`A homelab,` / gradient `documented properly.`) → sub → two CTAs (primary "Read the docs →", ghost "View on GitHub").
- Below hero: a compact, animated section preview — 3–4 cards linking to Docs / Services / Architecture / Changelog with hover lift. Keeps the page a true funnel.
- Minimal footer.

### Services `/services` (blue family)
- Blue-accented standalone page. Grid of glass service cards from `inventory.yaml` `nodes[]`.
- Each card: VMID/type eyebrow, name, role, IP (mono), live `StatusBadge`, doc link. Hover lift + per-card subtle blue glow.
- Section reveal on scroll.

### Architecture `/architecture` (blue family)
- Hero-style node constellation SVG (Router → Proxmox → services) with draw-in + pulse animation, built from inventory.
- VMID band diagram (100–199) retained from v1 but restyled to the blue/grey-neutral system with reveal animation.
- Physical layer cards (router, Proxmox, Tailscale).

### Changelog `/changelog` (blue family)
- Vertical timeline from parsed `CHANGELOG.md`. Most-recent dot accented blue with soft glow. Entries fade-slide in on scroll, staggered.

### Docs `/docs/*` (grey zone)
- Fumadocs layout, retuned to the monochrome grey scale for both light and dark.
- Protocol-inspired sidebar: section labels in small-caps grey, active item = darker grey pill with a smooth sliding indicator. Search box. Folder structure preserved.
- Clean typography, calm. The only motion is the sidebar indicator + subtle page-content fade on route change.

## Component Inventory

New / changed:
- `src/lib/motion.ts` — shared framer-motion variants (fadeUp, stagger, springScale) + reduced-motion helper.
- `src/components/site/Hero.tsx` — landing hero (client, framer-motion).
- `src/components/site/AbstractBackdrop.tsx` — glow + rings + masked grid (CSS-driven).
- `src/components/site/SectionReveal.tsx` — Intersection-Observer wrapper (client).
- `src/components/site/Counter.tsx` — count-up stat (client, useInView).
- `src/components/site/NodeConstellation.tsx` — animated SVG topology (client), replaces static `LabDiagram`.
- `src/components/site/Nav.tsx` — scroll-aware glass nav (client), replaces `Nav.tsx`.
- `src/components/site/ServiceCard.tsx` — restyled card with hover motion (wraps existing `StatusBadge`).
- `src/components/site/Timeline.tsx` — restyled animated timeline.
- `src/components/site/VmidBandDiagram.tsx` — restyled band diagram.
- `src/components/site/SectionPreviewCards.tsx` — landing funnel cards.
- `src/app/globals.css` — split into site-zone tokens + docs-zone Fumadocs grey overrides; add `breathe` and reveal keyframes.
- `src/app/(site)/*` — pages rewired to new components.
- `src/app/docs/*` — Fumadocs layout tuned to grey.

Retained as-is (data layer untouched):
- `src/lib/inventory.ts`, `src/lib/changelog.ts`, `src/lib/source.ts`, `src/data/inventory.yaml`, all `content/`.
- `src/components/StatusBadge.tsx` (logic unchanged; may get minor style tweak).

## Dependencies to add
- `motion` (framer-motion v11+, the `motion/react` entry).

## Constraints
- `prefers-reduced-motion` respected on every animation.
- Keyboard focus rings on all interactive elements (blue ring in site zone, grey ring in docs zone).
- Mobile responsive: hero scales down, nav collapses to a simple menu, grids reflow to single column.
- No regression to the working data pipeline or `/docs/*` routing.
- `npm run build` must pass clean.

## Out of Scope
- Deployment / Vercel / GitHub push (separate follow-up).
- Real Uptime Kuma URL wiring (env var stays a placeholder).
- Monorepo merge with JaySync-Lab.
