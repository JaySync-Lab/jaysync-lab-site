# CLAUDE.md — jaysync-lab-site

**Read this first if you're starting a fresh session here.** For the full
ecosystem picture, also read `JaySync-Lab`'s `CLAUDE.md` (that repo is the
hub — this one is presentation, not source).

## What this is

The Next.js + Fumadocs site that publishes the JaySync-Lab homelab docs —
live at **[lab.anujajay.com](https://lab.anujajay.com)**. Homepage + docs
section + a designed `/architecture` and `/services` view driven by
structured data, not just prose.

**This repo owns none of its own content.** `content/` (docs) and
`src/data/inventory.yaml` are both **auto-synced from `JaySync-Lab`** on
every push there — see that repo's `CLAUDE.md` for the pipeline. If you're
here to change what the site *shows*, you're in the wrong repo; go edit
`JaySync-Lab` instead. If you're here to change how it's *rendered* —
layout, components, styling, the sync pipeline itself — you're in the right
place.

**Current version: `v1.0.0`** (tagged, released).

## Things that bit us before — know these before touching related code

- **`src/data/inventory.yaml` has a `template?: boolean` field.** A node
  with `template: true` (currently just CT 180, the playground's golden
  template) is a Proxmox template, not a running service — no IP, no live
  status. It's shown in catalogue views (`/services`, the VMID band
  diagram) labelled as a template, but excluded from live views (topology,
  the "Live Services" rack, the active-node count) via `isLiveNode()` in
  `src/lib/inventory.ts`. If you add a new live/runtime view that lists
  nodes, filter through `isLiveNode()` or you'll silently show a template
  as if it were active.
- **The splash screen (`SplashScreen.tsx`) plays on every page load**, not
  once per session — this was a deliberate fix (it used to be gated behind
  `sessionStorage`, which meant most visitors never saw it). If you're
  writing a Playwright test against this site, wait ~3.2s past navigation
  before asserting on page content, or you'll be measuring the splash, not
  the page.
- **`.scanline-overlay` requires `overflow-hidden` on its container.** Its
  `::after` pseudo-element animates `translateY(-100%→100%)` over 6s;
  without `overflow-hidden`, Chromium includes its post-transform position
  in the page's scrollable-overflow calculation, causing a scrollbar that
  flickers in sync with the animation. Root-caused via direct
  `scrollHeight` measurement, not guessed — see `jaysync-lab-playground`'s
  implementation-log.md for the full writeup (same bug hit two pages
  there too).
- **Wide diagrams need a touch-visible scroll affordance.** The VMID band
  diagram is intentionally wider than mobile and scrolls horizontally
  within its own card (`min-w-[480px]`, long entries that deliberately
  don't wrap) — but without a visual cue, that's not discoverable on a
  touch device. See `.band-diagram-scroll`/`.band-diagram-hint` in
  `globals.css` for the pattern if you add another wide element.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Fumadocs 14 (MDX) ·
Tailwind CSS 4 · Motion · `js-yaml` for the inventory · Vercel hosting.

## Conventions (shared across this whole ecosystem — see JaySync-Lab's CLAUDE.md for the full list)

- Branch → PR → merge, one focused change per PR.
- Real end-to-end verification against the live/deployed system before
  claiming something works — this repo's Vercel previews sit behind
  SSO/auth protection that blocks automated testing, so verification
  routinely happens post-merge against production instead (with explicit
  awareness that's the tradeoff being made).
- Mobile testing means real device viewports via Playwright (iPhone SE,
  iPhone 13, small Android), checking both `scrollWidth`/`scrollHeight`
  overflow and actual visual cramping — an overflow check alone misses
  real problems (see the band-diagram scroll-affordance fix above).

## Where to look next

- [`README.md`](README.md) — architecture diagram, tech stack table
- [JaySync-Lab's RULEBOOK.md](https://github.com/JaySync-Lab/JaySync-Lab/blob/main/RULEBOOK.md) —
  how the content this site renders actually gets authored
- [JaySync-Lab's CHANGELOG.md](https://github.com/JaySync-Lab/JaySync-Lab/blob/main/CHANGELOG.md) —
  what happened, across the whole ecosystem, dated
