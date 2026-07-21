# Full-depth service docs, Ecosystem section, and a content guide

**Date**: 2026-07-21
**Status**: Approved, not yet implemented

## Problem

The live docs site's service pages are inconsistent in depth. `proxmox-host.mdx`
and `playground-controller.mdx` are thorough (resource specs, network role,
external dependencies, rationale, source location). `pi-hole.mdx`,
`uptime-kuma.mdx`, `home-assistant.mdx`, and `media-stack.mdx` are thin —
mostly a resource-spec table and one short paragraph, missing external
dependencies, operational details, and access/security information a reader
would actually need.

Separately, nothing documents the ecosystem's own software (the site itself,
the domain/DNS layout, the playground, email/notifications) — only the
physical lab is documented. And there's no written standard for what a
service page must cover, so depth will drift thin again the next time a
service is added.

## Scope

Three pieces:

1. **Bring every service page to one consistent depth standard.**
2. **Add a new "Ecosystem" docs section** covering the software side of the
   project (the site, DNS/domains, the playground, email).
3. **Write a content guide** codifying the depth standard for future pages.

## Decisions made during brainstorming

- **Depth standard, four required categories per service page** (confirmed
  with the project owner, scoped explicitly to "everything that is ok to
  display publicly, nothing sensitive" — consistent with `RULEBOOK.md`'s
  existing rule that `/docs` never references `/secrets`):
  1. **Full resource + config specs** — CPU/RAM/disk/network, container
     flags, exact install/provisioning method.
  2. **Every external dependency, named** — Cloudflare Tunnel hostnames,
     Cloudflare Access, Resend/email, DNS records, which API tokens/accounts
     are used (names and scopes only, never secret values).
  3. **Operational details** — backup/update strategy, autostart/boot-order
     behavior, known gotchas/incidents specific to that service, how to
     check its health/logs.
  4. **Access & security model** — exactly how it's reached (LAN IP,
     reverse-proxy hostname, Tailscale split-DNS, public tunnel) and what
     credentials/accounts control access.
- **Pages needing a full rewrite to this standard**: `pi-hole.mdx`,
  `uptime-kuma.mdx`, `home-assistant.mdx`, `media-stack.mdx` — confirmed
  thin by direct inspection.
- **Pages needing a lighter pass** (already reasonably deep, just check
  against the four-category checklist and fill genuine gaps, not a
  rewrite): `monitoring-stack.mdx`, `homepage-dashboard.mdx`.
- **Pages that already meet the standard, no changes needed**:
  `proxmox-host.mdx`, `playground-controller.mdx` — these are the reference
  model for every other page.
- **New "Ecosystem" top-level section** (`docs/ecosystem/`), not folded into
  `infrastructure/` — keeps physical-hardware docs separate from
  software/CI-CD docs. Four pages, confirmed:
  1. **Site architecture** — Next.js/Fumadocs/Vercel, how `/architecture`
     and `/services` render from `inventory.yaml`, the docs publishing
     pipeline (this repo → site, draft/published, build gates — already
     described operationally in `RULEBOOK.md`, but not as reader-facing
     published content).
  2. **Domain & DNS architecture** — which `*.jaysynclab.com` subdomains go
     through Vercel vs. Cloudflare Tunnel vs. the reverse proxy, wildcard
     TLS, Tailscale split-DNS. Unifies what's currently scattered across
     `reverse-proxy.mdx`, `tailscale-routing.mdx`, and various changelog
     entries into one coherent picture.
  3. **Playground architecture** — the FastAPI controller, the
     session-clone-per-visitor model, the dual-homed network isolation
     (`vmbr0` + `vmbr_sandbox`), and stating plainly that the controller is
     manually deployed (systemd service, no CI/CD), unlike the frontend
     (Vercel, deploys on push).
  4. **Email & notifications** — Resend, the outage-notification queue
     (Vercel KV / Upstash Redis), and Uptime Kuma's alert emails, as one
     page rather than scattered one-line mentions.
- **Content guide lives in a new top-level file**, `CONTENT-GUIDE.md`, not
  folded into `RULEBOOK.md`. `RULEBOOK.md` covers publishing *mechanics*
  (frontmatter, `meta.json`, draft/published) — this guide covers editorial
  *depth* (what a page must actually say). Keeping them separate keeps
  `RULEBOOK.md` focused and lets this guide be referenced independently.
  Both `RULEBOOK.md` and `CLAUDE.md` get a one-line pointer to it.
- **Git workflow** (explicit project instruction, not just a default):
  branch per task with frequent commits, merged once each task reaches a
  stable point — not one branch holding all ~11 pieces unmerged until the
  very end. Concretely, "task" here means **logical group**, not individual
  page: one branch per group (the 4 rewrites; the 2 light-touch passes; the
  4 new Ecosystem pages; the content guide + `RULEBOOK.md`/`CLAUDE.md`
  pointers), with a commit after each page inside that group is drafted,
  and the branch merged to `main` once the whole group passes the existing
  frontmatter/`meta.json` validation — four merge points total, not eleven,
  each still with per-page commit granularity underneath.

## Architecture

No code changes — this is entirely `.mdx` content plus `meta.json`
navigation entries, all in `JaySync-Lab` (the docs hub; content reaches the
live site automatically via the existing sync pipeline described in
`RULEBOOK.md` — no changes needed to that pipeline itself).

```
JaySync-Lab/docs/
├── services/
│   ├── pi-hole.mdx              (rewrite)
│   ├── uptime-kuma.mdx          (rewrite)
│   ├── home-assistant.mdx       (rewrite)
│   ├── media-stack.mdx          (rewrite)
│   ├── monitoring-stack.mdx     (light pass)
│   ├── homepage-dashboard.mdx   (light pass)
│   ├── proxmox-host.mdx         (reference model, unchanged)
│   └── playground-controller.mdx (reference model, unchanged)
├── ecosystem/                   (new section)
│   ├── meta.json
│   ├── site-architecture.mdx
│   ├── domain-dns-architecture.mdx
│   ├── playground-architecture.mdx
│   └── email-notifications.mdx
└── meta.json                    (add "ecosystem" to top-level pages array)

JaySync-Lab/
├── CONTENT-GUIDE.md              (new)
├── RULEBOOK.md                   (add one-line pointer to CONTENT-GUIDE.md)
└── CLAUDE.md                     (add CONTENT-GUIDE.md to "Key files" list)
```

## Components

### The four-category checklist (used by every rewritten/new page, and
### written out in full in `CONTENT-GUIDE.md`)

1. Full resource + config specs
2. Every external dependency, named (no secret values)
3. Operational details (backups, autostart/boot order, gotchas, health checks)
4. Access & security model

### Source material per page (facts to gather while drafting, not exhaustive research — everything needed is already known from this project's own history/changelog/prior sessions)

- **pi-hole.mdx**: add — DHCP/DNS role clarification (the router-DHCP gap
  fixed 2026-07-18), the `misc.dnsmasq_lines` v6 config gotcha, reverse-proxy
  hostname (`pihole.lab.jaysynclab.com`), Tailscale split-DNS reachability,
  the app-password auth method used by Homepage's widget.
- **uptime-kuma.mdx**: add — reverse-proxy hostname
  (`kuma.lab.jaysynclab.com`), Tailscale split-DNS reachability, the Gmail
  App Password used for alert emails (account existence/purpose, not the
  password), current monitor list, how it complements (not replaces) the
  monitoring stack.
- **home-assistant.mdx**: add — the recurring `trusted_proxies`/
  `use_x_forwarded_for` reverse-proxy gotcha (lost twice already — worth
  documenting plainly as a known recurrence, not just a one-time fix),
  reverse-proxy hostname, the still-open off-VLAN-over-Tailscale issue
  (JaySync-Lab#10), the EZVIZ camera/NVR integration plan.
- **media-stack.mdx**: add — explicitly not behind the reverse proxy or any
  public/Tailscale-DNS path (deliberate, stated plainly, matches the
  existing "media-stack deliberately excluded" changelog note), the six
  Docker services it actually runs, named.
- **monitoring-stack.mdx** (light pass): confirm/add — Grafana's reverse-proxy
  hostname and access model, the dedicated `pve-exporter@pve` Proxmox API
  user (name/scope, not the token).
- **homepage-dashboard.mdx** (light pass): confirm the four categories are
  already covered (this page was written this session with real depth) —
  likely only needs minor additions, not a rewrite.
- **Ecosystem/site-architecture.mdx**: Next.js 15 App Router, Fumadocs,
  Tailwind, Vercel hosting, the `inventory.yaml` → `/architecture`/`/services`
  data flow, the `validate-and-dispatch.yml` → `repository_dispatch` →
  `rebuild-from-docs.yml` publishing pipeline, the draft/published gate.
- **Ecosystem/domain-dns-architecture.mdx**: `jaysynclab.com` (Vercel,
  docs site), `jslnode.jaysynclab.com` (Vercel, playground frontend),
  `api-jslnode.jaysynclab.com` (Cloudflare Tunnel → CT 105, not Vercel),
  `*.lab.jaysynclab.com` (NPM reverse proxy, LAN + Tailscale split-DNS only,
  never public), wildcard Let's Encrypt cert via Cloudflare DNS-01.
- **Ecosystem/playground-architecture.mdx**: FastAPI controller (CT 105),
  clone-per-session model from the golden template (CT 180), the
  `vmbr0`/`vmbr_sandbox` dual-homed isolation, session limits, manual
  systemd deployment (explicitly no CI/CD, unlike the Vercel-deployed
  frontend).
- **Ecosystem/email-notifications.mdx**: Resend (`FROM_ADDRESS` on
  `jaysynclab.com`, domain-verified), the outage-notification queue (Vercel
  KV / Upstash Redis, additive per-outage, cleared after every recovery
  send), Uptime Kuma's Gmail-App-Password alert emails — as one page tying
  together every notification path in the ecosystem.

### `CONTENT-GUIDE.md`

Structure: a short intro (why this exists — depth drifted thin before,
this is how future pages avoid that), the four-category checklist with one
paragraph per category explaining what belongs there and what doesn't
(explicitly: nothing from `/secrets`, nothing beyond "this account/token
exists and is scoped to X" — never a value), and one annotated example
(pointing at `proxmox-host.mdx` or `playground-controller.mdx` as the
worked example, not duplicating their content).

## Testing

Docs have no automated tests; "testing" here is the existing validation
pipeline plus a manual editorial check:
- Every changed/new page passes the existing frontmatter + `meta.json`
  validation (`node scripts/validate-docs.mjs`, already run in CI on push).
- Every new/rewritten page is checked against the four-category checklist
  before its commit — if a category genuinely doesn't apply (e.g.
  media-stack has no external dependencies), the page says so explicitly
  rather than silently omitting the section, so a reader knows it was
  considered, not missed.
- After each of the four merge points, confirm the live site actually
  builds and the affected pages render (this repo's existing
  `RULEBOOK.md` §8 gates already guarantee this structurally — a malformed
  page can't reach production).
