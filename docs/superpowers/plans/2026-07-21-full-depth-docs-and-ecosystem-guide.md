# Full-Depth Docs + Ecosystem Section + Content Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every thin service doc page up to a consistent depth standard, add a new "Ecosystem" docs section covering the project's software side, and codify the depth standard in a new content guide.

**Architecture:** Pure content work — no code. Every task edits or creates `.mdx` files (plus `meta.json` navigation entries) in `JaySync-Lab`, the docs hub. Content reaches the live site automatically via the existing publishing pipeline (`RULEBOOK.md` §8) — no pipeline changes needed.

**Tech Stack:** MDX + YAML frontmatter, validated by the existing `node scripts/validate-docs.mjs` (no dependencies, already wired into CI).

**Repo:** `JaySync-Lab` (this plan modifies that repo, saved here in `jaysync-lab-site` per this project's existing spec/plan location convention).

## Global Constraints

- Every page must cover, explicitly, the four categories from the design spec: (1) full resource/config specs, (2) every external dependency named (no secret values), (3) operational details (backups, autostart/boot order, gotchas, health checks), (4) access & security model. If a category genuinely doesn't apply to a page, the page says so explicitly rather than silently omitting it.
- Nothing under `/docs` may reference, embed, or link to anything under `/secrets` — encrypted or not (existing `RULEBOOK.md` §10 rule, unchanged, binding on every task here).
- Every frontmatter block needs exactly `title`, `description`, `status`, and optionally `icon` — no extra fields (`RULEBOOK.md` §5).
- Filenames are lowercase-kebab-case. Every folder containing `.mdx` files needs a `meta.json` next to it, and a page not listed in its folder's `meta.json` `pages` array won't appear in navigation (`RULEBOOK.md` §6).
- Git workflow (explicit project instruction): one branch per task GROUP (not per individual page) — Group A = Tasks 1–4, Group B = Task 5, Group C = Tasks 6–9, Group D = Task 10 — each with a commit per task inside the group, merged to `main` once the whole group passes validation. Four merge points total.
- Verification for every task: `node scripts/validate-docs.mjs` run from the `JaySync-Lab` repo root, exit code 0.

---

## Task 1: Rewrite `docs/services/pi-hole.mdx`

**Files:**
- Modify: `docs/services/pi-hole.mdx`

- [ ] **Step 1: Replace the file's entire content**

```mdx
---
title: "Pi-hole"
description: "Network-wide DNS resolver and ad-blocker, LXC 100."
status: published
icon: "ShieldCheck"
---

> Pi-hole runs as an unprivileged LXC container (ID: 100) directly on the
> Proxmox host. It's the network-wide DNS resolver and ad-blocker for the
> `192.168.1.0/24` LAN, and the authoritative resolver for every
> `*.lab.jaysynclab.com` hostname the [reverse proxy](/docs/networking/reverse-proxy)
> serves.

## Deployment Strategy

- **Container Type:** LXC (Unprivileged)
- **Container ID:** 100
- **Compute:** 1 Core
- **Memory:** 512MB RAM
- **Swap:** 512MB
- **Root Disk:** 4GB on `local-lvm`
- **Features:** `nesting=1`
- **Network:** Static IP `192.168.1.101` on `vmbr0`
- **Firewall:** Enabled
- **Autostart:** `onboot=1`

## Network Role & Traffic Flow

- **Upstream Resolution:** permitted DNS queries are forwarded to Cloudflare
  (`1.1.1.1`) and Google (`8.8.8.8`).
- **DHCP Integration:** the ZTE router's DHCP settings broadcast
  `192.168.1.101` as the primary DNS server to every LAN client.
- **Local DNS Records:** authoritative resolver for `*.lab.jaysynclab.com`,
  mapping every reverse-proxy hostname to the Nginx Proxy Manager
  container's IP.

## A real gap, found and fixed 2026-07-18

The DHCP integration above wasn't actually configured correctly until this
date — the router had never been set up to hand out Pi-hole as the LAN's
DNS server at all. Every device on the network was using the router itself
for DNS, meaning Pi-hole's ad-blocking and local-DNS resolution were
silently inactive network-wide, not just for the newer `*.lab.jaysynclab.com`
domains. Found via `nslookup` returning `NXDOMAIN` against the router but
resolving correctly against Pi-hole directly.

Fixing it took two parts:
1. The router's DHCP DNS field pointed at `192.168.1.101`.
2. The router was *also* advertising itself as an IPv6 DNS server via
   Router Advertisements, which most OSes (Windows included) prefer over
   IPv4 DNS — this silently undid part of fix #1 for any client with IPv6
   enabled. Fixed by disabling IPv6 on the router's LAN side (required a
   router reboot to fully apply).

## Wildcard DNS Configuration

Pi-hole v6/FTL v6.6 no longer reads `/etc/dnsmasq.d/*.conf` for custom DNS
entries — that convention changed. The wildcard record for
`*.lab.jaysynclab.com` is set via `misc.dnsmasq_lines` in
`/etc/pihole/pihole.toml` instead:

```toml
[misc]
dnsmasq_lines = [
  "address=/lab.jaysynclab.com/192.168.1.106"
]
```

## External Dependencies

- **Upstream DNS**: Cloudflare (`1.1.1.1`), Google (`8.8.8.8`) — public
  resolvers, no account or auth involved.
- No Cloudflare Tunnel, no email service, no other external API — Pi-hole
  has no outbound integrations beyond the two upstream resolvers above.

## Access & Security

- **LAN:** direct IP, `http://192.168.1.101` (admin UI on port 80).
- **Reverse proxy:** `https://pihole.lab.jaysynclab.com` via Nginx Proxy
  Manager, using the same wildcard TLS cert as every other
  `*.lab.jaysynclab.com` host.
- **Off-VLAN:** reachable via Tailscale split-DNS — the tailnet's DNS
  settings restrict `lab.jaysynclab.com` resolution to Pi-hole, without
  overriding all other DNS on the remote device.
- **Homepage dashboard widget:** authenticates via an app password
  (Settings → Web interface/API → Expert → Configure app password) — the
  Pi-hole v6 API's supported auth method for third-party integrations, not
  the admin UI's own login password.

## Operational Notes

- No automated backup is currently configured. If lost, the container
  would need to be rebuilt from this page plus
  [`infrastructure/inventory.yaml`](https://github.com/JaySync-Lab/JaySync-Lab/blob/main/infrastructure/inventory.yaml)
  (IP, resource specs) and the wildcard-DNS config above.
- **Health check:** the admin UI's `Settings → System` panel shows FTL's
  live status, or run `pihole status` from the container's own shell.
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run (from the `JaySync-Lab` repo root): `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/services/pi-hole.mdx
git commit -m "Rewrite pi-hole.mdx to the full-depth standard"
```

---

## Task 2: Rewrite `docs/services/uptime-kuma.mdx`

**Files:**
- Modify: `docs/services/uptime-kuma.mdx`

- [ ] **Step 1: Replace the file's entire content**

```mdx
---
title: "Uptime Kuma"
description: "Infrastructure observability and alerting, LXC 101."
status: published
icon: "Activity"
---

> Uptime Kuma runs as an unprivileged LXC container (ID: 101) on the
> Proxmox host — a native Node.js install, not Docker. It's the lab's
> "is it up?" layer: synthetic checks every 60 seconds, HTML alert emails
> on failure, and the public status-page API the live docs site reads
> from directly for real-time service dots.

## Deployment & Scope

**Container Specs:**
- **Container ID:** 101
- **Compute:** 1 Core
- **Memory:** 512MB RAM
- **Swap:** 512MB
- **Root Disk:** 4GB on `local-lvm`
- **Features:** `nesting=1,keyctl=1`
- **Network:** `192.168.1.102` on `vmbr0`
- **Timezone:** `Asia/Colombo`
- **Tags:** `analytics`, `community-script`, `monitoring`
- **Autostart:** `onboot=1`

**Monitored Targets:**
- **Hardware/Gateway:** ZTE Router (`192.168.1.1`)
- **External DNS:** Cloudflare (`1.1.1.1`), to verify ISP connectivity
- **Hypervisor:** Proxmox Host GUI (`https://192.168.1.100:8006`)
- **Internal DNS:** Pi-hole (`192.168.1.101`)

Complements, not replaces, the [monitoring stack](/docs/services/monitoring-stack):
Kuma answers "is it up?" with a synthetic check; Prometheus/Grafana answer
"how's it trending?" with real resource metrics over time.

## External Dependencies

- **Gmail (SMTP + App Password):** a dedicated system Gmail account sends
  outbound alert emails. Standard plaintext alerts were insufficient, so
  custom Liquid templating (`{% if status == 'up' %}`) and inline CSS
  produce responsive, professional-looking alert cards instead — the raw
  template/CSS source lives in this repo's `/templates` directory.
- No Cloudflare Tunnel, no other external API.

## Access & Security

- **LAN:** direct IP, `http://192.168.1.102:3001`.
- **Reverse proxy:** `https://kuma.lab.jaysynclab.com` via Nginx Proxy
  Manager, wildcard TLS.
- **Off-VLAN:** reachable via Tailscale split-DNS, same as every other
  `*.lab.jaysynclab.com` host — confirmed working from a real off-VLAN
  device. (If it's ever unreachable off-VLAN, check that Tailscale is
  actually connected on the client first — split-DNS resolution only
  works while the tailnet connection is active.)
- **Public status-page API:** deliberately public (no auth), by design —
  [jaysync-lab-site](/docs/ecosystem/site-architecture) reads
  `/api/status-page/default` and `/api/status-page/heartbeat/default`
  directly from the browser to render live per-service status dots and an
  aggregate "N/M services up" indicator, with no backend proxy in between.

## Operational Notes

- **Health check:** the dashboard itself shows each monitor's live
  heartbeat; `systemctl status` won't show a unit named `kuma` — check
  the running Node process directly if the web UI itself is unreachable.
- No automated backup configured for `/opt/uptime-kuma`'s SQLite database
  (monitor definitions, history) — losing it means re-adding every monitor
  by hand from this page's "Monitored Targets" list (plus whatever's been
  added since).
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/services/uptime-kuma.mdx
git commit -m "Rewrite uptime-kuma.mdx to the full-depth standard"
```

---

## Task 3: Rewrite `docs/services/home-assistant.mdx`

**Files:**
- Modify: `docs/services/home-assistant.mdx`

- [ ] **Step 1: Replace the file's entire content**

```mdx
---
title: "Home Assistant"
description: "Smart home command center, HAOS VM 103."
status: published
icon: "Home"
---

> Central command for the smart home environment. Runs as a full virtual
> machine (HAOS), not a container — chosen specifically for Supervisor's
> add-on management and snapshot-based backups.

## Deployment Strategy

> **VM over Docker Decision:** a full VM (HAOS) was chosen over a Docker
> container to get Supervisor's add-on management and snapshot-based
> backups without building standalone container orchestration by hand.

**VM Configuration (ID: 103):**
- **Machine Type:** Q35 with OVMF (UEFI) BIOS
- **CPU:** 2 Cores (x86-64-v2-AES), 1 Socket
- **Memory:** 2048MB RAM
- **Boot Disk:** 32GB SCSI (virtio-scsi-single, iothread enabled)
- **EFI Disk:** 4MB on `local-lvm`
- **Network:** VirtIO NIC on `vmbr0`, firewall enabled
- **Autostart:** `onboot=1`

## External Dependencies

- **EZVIZ cameras/NVR (in progress, as of 2026-07-21):** an EZVIZ H9C
  dual-lens camera and an EZVIZ X5 8-channel NVR are being integrated via
  local RTSP/ONVIF — deliberately chosen over the official EZVIZ cloud
  integration to avoid a cloud-account dependency and the extra latency of
  round-tripping every stream request through EZVIZ's servers. The NVR
  exposes each channel over RTSP directly on the LAN; Home Assistant polls
  the stream locally, so camera access keeps working even if the internet
  connection drops. Not yet complete — this page will be updated once
  channels are wired in and verified.
- No Cloudflare Tunnel, no other cloud service integration.

## Access & Security

- **LAN:** direct IP, `http://192.168.1.12:8123`. (Note: this IP was
  previously mis-documented as `192.168.1.11` — a real drift between the
  docs and the actual assigned address, found via a peer container failing
  to reach `.11` and confirmed live at `.12` via the Proxmox console. Fixed
  in both this page and `infrastructure/inventory.yaml`; worth
  double-checking against the Proxmox console directly if this ever looks
  wrong again, since HA's VM has no guest agent to report its IP
  automatically.)
- **Reverse proxy:** `https://ha.lab.jaysynclab.com` via Nginx Proxy
  Manager, wildcard TLS.
- **Recurring gotcha — reverse-proxy trust config lost twice:** Home
  Assistant rejects requests from a reverse proxy it doesn't explicitly
  trust (400 Bad Request) unless `configuration.yaml` has:
  ```yaml
  http:
    use_x_forwarded_for: true
    trusted_proxies:
      - 192.168.1.106
  ```
  This was first added 2026-07-16, found completely missing again on
  2026-07-19 (likely wiped by a HA update or a config reset), and re-added.
  If `ha.lab.jaysynclab.com` ever returns a real `400` while direct-IP
  access still works fine, check this block first before assuming a
  network problem.
- **Known open issue:** unreachable off-VLAN over Tailscale even by direct
  IP, unlike every other host on the subnet
  ([JaySync-Lab#10](https://github.com/JaySync-Lab/JaySync-Lab/issues/10)).
  Lead: the VM's per-guest Proxmox firewall flag, not yet confirmed as the
  actual cause. Parked until physically on the home VLAN to inspect the
  firewall rules directly in the Proxmox UI.

## Operational Notes

- **Backups:** HAOS Supervisor's built-in snapshot feature — the whole
  reason a VM was chosen over a container.
- **Health check:** the HA UI itself, or `ha core info` via the
  Supervisor's Terminal & SSH add-on.
- **Config editing without SSH:** HAOS doesn't expose SSH by default. Use
  the Supervisor's **Terminal & SSH** and **File editor** add-ons from the
  HA sidebar for direct config access.
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/services/home-assistant.mdx
git commit -m "Rewrite home-assistant.mdx to the full-depth standard"
```

---

## Task 4: Rewrite `docs/services/media-stack.mdx`

**Files:**
- Modify: `docs/services/media-stack.mdx`

- [ ] **Step 1: Replace the file's entire content**

```mdx
---
title: "Media Stack"
description: "GPU-accelerated Docker media streaming stack, LXC 104."
status: published
icon: "Film"
---

> The media-stack runs as an unprivileged LXC container (ID: 104) on the
> Proxmox host. It hosts a Docker-based media services stack with
> GPU-accelerated hardware transcoding via Intel HD Graphics 530
> passthrough.

## Deployment Strategy

A dedicated LXC container running Docker was chosen over individual VMs
per service, to consolidate resource usage while keeping service isolation
through Docker Compose.

**Container Specs:**
- **Container ID:** 104
- **Compute:** 2 Cores
- **Memory:** 2048MB RAM
- **Swap:** 2048MB
- **Root Disk:** 35GB on `local-lvm`
- **Features:** `nesting=1` (required for Docker-in-LXC)
- **Network:** `192.168.1.104` on `vmbr0`
- **Autostart:** `onboot=1`

## GPU Passthrough (Hardware Transcoding)

> The Intel HD Graphics 530 iGPU is passed through from the Proxmox host
> into this container for hardware-accelerated video transcoding (Quick
> Sync Video), avoiding CPU-bound transcoding bottlenecks.

**LXC Configuration:**
```
lxc.cgroup2.devices.allow: c 226:0 rwm
lxc.cgroup2.devices.allow: c 226:128 rwm
lxc.mount.entry: /dev/dri dev/dri none bind,optional,create=dir
```

Device `226:0` is the DRM render node and `226:128` is the card node,
giving the container full GPU access for transcoding.

## Storage Architecture

The Vault HDD (1TB) is bind-mounted into the container for media storage:

```
mp0: /mnt/pve/vault/data,mp=/data
```

This keeps the media library (large, slow-tier storage) separate from
application data (fast SSD-backed root disk), so the container root never
fills up with media files.

## Docker Services

Six containers run via Docker Compose with overlay networking:

- **jellyfin** — media server, the actual streaming frontend
- **sonarr** — TV show library management/automation
- **radarr** — movie library management/automation
- **prowlarr** — indexer manager feeding Sonarr/Radarr
- **qbittorrent** — download client
- **flaresolverr** — solves Cloudflare challenges some indexers present,
  so Prowlarr can query them successfully

> To inspect the running services:
> `pct exec 104 -- docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"`

## External Dependencies

None. Every service here is self-hosted with no cloud account, API key, or
external tunnel involved — indexers/trackers are queried directly, not
through a managed third-party service.

## Access & Security

Deliberately **not** behind the reverse proxy and **not** resolvable via
Tailscale split-DNS or any `*.lab.jaysynclab.com` hostname — both
exclusions are intentional, not oversights. Reachable only via direct LAN
IP:port from inside the home network (e.g. `192.168.1.104:8096` for
Jellyfin). No off-VLAN access exists for this stack by design.

## Operational Notes

- No automated backup configured for application config (Sonarr/Radarr/
  Prowlarr/qBittorrent settings) — only the media library itself lives on
  the more durable Vault HDD; app config lives on the root disk with the
  rest of the container.
- **Health check:** `docker ps` (see command above) — all six should show
  `Up`, not `Restarting` or `Exited`.
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/services/media-stack.mdx
git commit -m "Rewrite media-stack.mdx to the full-depth standard"
```

---

## Task 5: Light-touch pass — `monitoring-stack.mdx` + `homepage-dashboard.mdx`

**Files:**
- Modify: `docs/services/monitoring-stack.mdx`
- Read only (no edit expected, see Step 2): `docs/services/homepage-dashboard.mdx`

**Context:** both pages were already written with real depth in an earlier
session and largely satisfy the four-category checklist. This task adds the
one genuinely missing detail to `monitoring-stack.mdx`, and confirms
`homepage-dashboard.mdx` needs no changes (a real possible outcome — not
every page in this plan needs a rewrite).

- [ ] **Step 1: Add a Grafana credential note to `monitoring-stack.mdx`**

Find the `## Access` section in `docs/services/monitoring-stack.mdx` and add
this paragraph immediately after it (before `## Known gotchas`):

```mdx
## Grafana Login

Grafana's admin account is a real login, set directly by the project
owner — not automated, not provisioned via the `pve-exporter` API token
above (that token only feeds the Proxmox data source; it has no relation
to Grafana's own user accounts). Rotating it is a manual step in Grafana's
own UI, deliberately not something automation touches.
```

- [ ] **Step 2: Confirm `homepage-dashboard.mdx` needs no changes**

Read `docs/services/homepage-dashboard.mdx` and confirm it already covers:
resource specs (VMID 121, band, IP, container flags — under `## Architecture`),
external dependencies named (Pi-hole app password, HA token, reused Proxmox
token, explicit note on why Grafana/Kuma widgets are parked as bookmarks —
under `## Credentials` and the widget scope table), operational details
(the bookmarks-placeholder fix, verification steps), and access & security
(`dashboard.lab.jaysynclab.com` via the reverse proxy, Tailscale split-DNS
reachability — under `## Architecture`'s "Access" bullet). If all four are
genuinely present, make no edit to this file — write in your task report
that you confirmed this and why. If you find a real gap while reading it
(not a nice-to-have, an actual missing category), add the minimal content
to close it and note the addition in your report.

- [ ] **Step 3: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 4: Commit**

```bash
git add docs/services/monitoring-stack.mdx
git commit -m "Add Grafana credential note to monitoring-stack.mdx"
```

(If Step 2 found a real gap and you edited `homepage-dashboard.mdx` too,
include it in this commit's `git add` and mention it in the commit message.)

---

## Task 6: New `docs/ecosystem/site-architecture.mdx`

**Files:**
- Create: `docs/ecosystem/meta.json`
- Create: `docs/ecosystem/site-architecture.mdx`

- [ ] **Step 1: Create the section's `meta.json`**

Create `docs/ecosystem/meta.json`:

```json
{
  "title": "Ecosystem",
  "pages": ["site-architecture", "domain-dns-architecture", "playground-architecture", "email-notifications"]
}
```

- [ ] **Step 2: Write `docs/ecosystem/site-architecture.mdx`**

```mdx
---
title: "Site Architecture"
description: "How jaysync-lab-site is built, and how it turns this repo's content into a live site."
status: published
icon: "LayoutTemplate"
---

> [jaysync-lab-site](https://github.com/JaySync-Lab/jaysync-lab-site) is
> the Next.js site publishing everything in this repo's `/docs` and
> `infrastructure/inventory.yaml`. This repo owns none of the site's own
> code — it owns the content the site renders.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Fumadocs 14 (the MDX
docs engine powering `/docs`) · Tailwind CSS 4 · Motion (animation) ·
`js-yaml` (parses `inventory.yaml`) · Vercel hosting.

## Data Flow

`infrastructure/inventory.yaml` is the single source of truth for
everything the site renders that isn't prose: the homepage's topology
diagram and live-services rack, `/architecture`'s topology + VMID band
diagram, and `/services`'s catalogue. A single `getInventory()` function
(`src/lib/inventory.ts` in the site repo) parses it once per build/request;
every page-level component reads from that, never from a second
hand-maintained copy — `inventory.yaml` used to be duplicated inside the
site repo and silently went stale, which is exactly the failure mode this
single-source setup exists to prevent.

## The Publishing Pipeline

```
push to docs/** or infrastructure/inventory.yaml on this repo's main
  → validate-and-dispatch.yml runs node scripts/validate-docs.mjs
    (frontmatter + meta.json check — Gate One)
  → on success, notifies jaysync-lab-site via repository_dispatch
  → jaysync-lab-site's rebuild-from-docs.yml pulls docs/ + inventory.yaml
  → pre-flight `npm run build` (Gate Two) — a broken inventory.yaml or a
    site build failure stops here, nothing is committed
  → commits the synced content, Vercel auto-deploys
```

Either gate failing means the live site simply keeps showing its last
working version — it can never end up broken or stale-but-wrong, only a
few minutes behind while a mistake gets fixed.

## Draft/Published

Any page with `status: draft` in its frontmatter passes Gate One but is
excluded from what the site actually builds — this is how a page gets
written and committed incrementally over several sessions without ever
accidentally going live half-finished.

## Live Data On The Site

Not everything the site shows comes from `inventory.yaml` at build time —
some of it is genuinely live. The system status feature
([`StatusBadge`](/docs/services/uptime-kuma), the homepage's aggregate
badge, and the `/status` page) fetches Uptime Kuma's public status-page
API directly from the visitor's browser, with no backend proxy in
between — the same pattern this repo's `RULEBOOK.md` calls out as the
publishing pipeline's opposite: build-time content vs. request-time live
data, both intentional, used for different things.
```

- [ ] **Step 3: Add "ecosystem" to the top-level `docs/meta.json`**

Modify `docs/meta.json`:

```json
{
  "title": "JaySync-Lab",
  "pages": ["index", "changelog", "infrastructure", "networking", "security", "services", "ecosystem"]
}
```

- [ ] **Step 4: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 5: Commit**

```bash
git add docs/ecosystem/meta.json docs/ecosystem/site-architecture.mdx docs/meta.json
git commit -m "Add Ecosystem section: site-architecture.mdx"
```

---

## Task 7: New `docs/ecosystem/domain-dns-architecture.mdx`

**Files:**
- Create: `docs/ecosystem/domain-dns-architecture.mdx`

- [ ] **Step 1: Write the page**

```mdx
---
title: "Domain & DNS Architecture"
description: "Which jaysynclab.com subdomains go through Vercel, Cloudflare Tunnel, or the reverse proxy — and why."
status: published
icon: "Globe"
---

> `jaysynclab.com` and its subdomains don't all reach the lab the same
> way. This page is the single place that lays out which path each one
> takes, since the individual pieces are otherwise scattered across
> several other pages.

## The Four Paths

| Hostname | Path | Notes |
| :--- | :--- | :--- |
| `jaysynclab.com` / `www.jaysynclab.com` | Vercel | The docs site itself |
| `jslnode.jaysynclab.com` | Vercel | Playground frontend |
| `api-jslnode.jaysynclab.com` | Cloudflare Tunnel → CT 105 | Playground's FastAPI controller — **not** Vercel-hosted, a direct tunnel straight into the homelab |
| `*.lab.jaysynclab.com` | Nginx Proxy Manager (LAN) | Every internal service's friendly URL — never has a public DNS record |

## Vercel-Hosted (public internet, no lab dependency)

`jaysynclab.com` and `jslnode.jaysynclab.com` are both static/serverless
deployments on Vercel — they stay up regardless of whether the homelab
itself is reachable. `jslnode.jaysynclab.com`'s frontend calls
`api-jslnode.jaysynclab.com` for anything that needs the actual lab (spinning
up a playground session), so the frontend loading successfully doesn't
guarantee the backend is reachable — that's a separate, real failure mode
the frontend's own offline-state UI handles.

## Cloudflare Tunnel (public internet, lab-dependent)

`api-jslnode.jaysynclab.com` is the one hostname that's both public and
genuinely served from inside the lab. `cloudflared` runs on CT 105 and
tunnels the hostname straight to `http://localhost:8000` (the playground
controller) — no port-forwarding, no public IP exposure on the router
itself. See [Playground Architecture](/docs/ecosystem/playground-architecture)
for the controller side of this.

## Reverse Proxy (LAN + Tailscale only, never public)

Every `*.lab.jaysynclab.com` hostname (`pihole.lab`, `kuma.lab`, `ha.lab`,
`grafana.lab`, `proxmox.lab`, `dashboard.lab`) resolves only through
Pi-hole, and only to Nginx Proxy Manager's internal IP
(`192.168.1.106`) — there is no public DNS record for any of them,
by design. Two ways to actually resolve one:

1. **On the home LAN:** Pi-hole serves the wildcard record directly (see
   [Pi-hole](/docs/services/pi-hole)).
2. **Off the home LAN, over Tailscale:** the tailnet's admin console has a
   split-DNS nameserver entry restricted to `lab.jaysynclab.com`, pointing
   at Pi-hole — so these hostnames resolve identically on-VLAN and
   off-VLAN via Tailscale, without overriding all other DNS on the remote
   device. Without Tailscale connected, these hostnames simply don't
   resolve anywhere (correctly — they were never meant to be public).

All of them share one wildcard Let's Encrypt certificate, issued via
Cloudflare's DNS-01 challenge — no public HTTP challenge needed, so the
cert works even though the hostnames themselves are never publicly
resolvable.

## Domain Migration History

The ecosystem originally lived on subdomains of `anujajay.com`
(`lab.anujajay.com`, `jslnode.anujajay.com`, `api-jslnode.anujajay.com`) —
a separate personal domain also used for unrelated projects. `jaysynclab.com`
was purchased and migrated to on 2026-07-16 to give the lab its own
identity. The old domains still 308-redirect to their `jaysynclab.com`
equivalents rather than being removed outright, so old bookmarks/links keep
working. `anujajay.com` itself is untouched and unrelated to this
ecosystem going forward — it's the personal portfolio domain, intentionally
excluded from this migration (e.g. the playground's footer credit link and
its transactional-email footer both still point there deliberately).
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/ecosystem/domain-dns-architecture.mdx
git commit -m "Add Ecosystem section: domain-dns-architecture.mdx"
```

---

## Task 8: New `docs/ecosystem/playground-architecture.mdx`

**Files:**
- Create: `docs/ecosystem/playground-architecture.mdx`

- [ ] **Step 1: Write the page**

```mdx
---
title: "Playground Architecture"
description: "The disposable-terminal playground: session model, network isolation, and how it's actually deployed."
status: published
icon: "TerminalSquare"
---

> [jslnode.jaysynclab.com](https://jslnode.jaysynclab.com) gives every
> visitor a real, isolated Linux terminal session — spun up on demand,
> destroyed when they're done. This page covers the architecture; see
> [Domain & DNS Architecture](/docs/ecosystem/domain-dns-architecture) for
> how traffic actually reaches it.

## Two Deployments, Two Deploy Models

The frontend (`web/` in
[jaysync-lab-playground](https://github.com/JaySync-Lab/jaysync-lab-playground))
and the backend (`controller/`) are genuinely separate deployables with
different deploy models — worth stating plainly rather than assuming both
work the same way:

- **Frontend:** Next.js on Vercel. Deploys automatically on every push to
  `main` — real CI/CD.
- **Backend:** FastAPI on CT 105, a manually-deployed `systemd` service
  (`playground-controller.service`). No CI/CD — a change to
  `controller/` requires manually copying the file(s) to the container and
  restarting the service. This is a deliberate current state, not an
  oversight; automating it is unscheduled future work.

## Session Model

Every session is a fast linked clone of CT 180
(`sandbox-template-playground`, the golden template) — a pre-built,
pre-hardened Debian container with the visitor experience (guided tour,
resource caps, fork-bomb protection) already baked in. Cloning from a
template rather than building from scratch is what makes a session start
in seconds instead of minutes.

**Limits:** 3 concurrent sessions maximum, 15 minutes per session, 1
session per visitor (by source IP) at a time.

**Cleanup:** a background reaper checks the real state of running clones
on a timer and destroys anything overstayed, independent of the
controller's own bookkeeping — so an orphaned clone gets cleaned up even
after a controller crash or restart.

## Network Isolation

CT 105 is deliberately dual-homed — the one chokepoint between two
networks that otherwise never touch:

- `net0` on `vmbr0` (the LAN) — receives requests from the frontend/tunnel.
- `net1` on `vmbr_sandbox` — an isolated network segment with no route to
  the LAN or the internet, reaching each session clone's terminal to proxy
  it back to the visitor's browser.

Session clones themselves have zero network access beyond this one proxy
path, by design.

## Startup Notification

An `ExecStartPost` hook (`notify-host-online.sh`) fires the instant the
controller service itself starts, POSTing to the frontend's
`/api/host-online` — a hint, not proof: that endpoint never trusts the
ping and always does its own real health check through the actual public
tunnel before sending any outage-recovery email (see
[Email & Notifications](/docs/ecosystem/email-notifications)). This exists
specifically so a recovery email goes out immediately on a host reboot,
rather than waiting for the once-a-day cron fallback.

## Known Gotcha: CORS drift after a domain migration

The controller's CORS `allow_origins` has to match the frontend's actual
origin exactly. During the `jaysynclab.com` domain migration, this was
missed — the controller kept allowing only the old
`https://jslnode.anujajay.com` origin, since it lives on a manually
deployed script the migration's Vercel/Cloudflare-Tunnel sweep never
touched. Every real browser request was silently CORS-blocked (curl
doesn't enforce CORS, so every direct `curl` health check during the
migration looked completely fine) — the frontend showed "offline"
regardless of actual backend health until this was caught by checking for
a missing `Access-Control-Allow-Origin` header specifically. Worth
checking first, specifically, the next time the frontend shows "offline"
despite the backend clearly being up.

## External Dependencies

- **Cloudflare Tunnel** — see
  [Domain & DNS Architecture](/docs/ecosystem/domain-dns-architecture).
- **Proxmox API** — the controller uses `proxmoxer` to clone/start/destroy
  session containers; runs with whatever Proxmox credential the controller
  itself is configured with (not `claude-agent`'s separate, more narrowly
  scoped SSH access).
- No email service directly — that's the frontend's responsibility, see
  [Email & Notifications](/docs/ecosystem/email-notifications).
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/ecosystem/playground-architecture.mdx
git commit -m "Add Ecosystem section: playground-architecture.mdx"
```

---

## Task 9: New `docs/ecosystem/email-notifications.mdx`

**Files:**
- Create: `docs/ecosystem/email-notifications.mdx`

- [ ] **Step 1: Write the page**

```mdx
---
title: "Email & Notifications"
description: "Every notification path in the ecosystem: Resend, the outage-recovery queue, and Uptime Kuma's alert emails."
status: published
icon: "Mail"
---

> Two independent notification systems exist in this ecosystem, for two
> independent purposes — worth documenting together specifically so they
> don't get confused with each other.

## Playground Outage/Recovery Emails (Resend)

The playground's "Notify me" flow (shown when the backend is offline) uses
[Resend](https://resend.com) to send a "the playground is back" email once
the host genuinely recovers.

- **From address:** on the `jaysynclab.com` apex, domain-verified
  (SPF/DKIM/DMARC) — migrated from an `anujajay.com` address once
  `jaysynclab.com`'s own domain verification completed.
- **Queue:** a Redis SET (Vercel KV / Upstash Redis) holding every email
  address that signed up during the *current* outage. Additive only
  during an outage; fully cleared after every recovery send, so a later,
  separate outage always starts from an empty list — no cross-outage
  bleed.
- **Trigger paths:** a push notification the instant the controller starts
  (see [Playground Architecture](/docs/ecosystem/playground-architecture)),
  plus a once-daily cron fallback (a Vercel Hobby-plan limit, not a
  deliberate design choice — the plan called for hourly). Both funnel
  through the same function, which always does its own real health check
  and never trusts the caller — a "still up" check on either path never
  sends email, only a genuine down→up transition does.
- **A real gotcha, found and fixed:** the Redis client's `Redis.fromEnv()`
  helper looks specifically for `UPSTASH_REDIS_REST_URL`/
  `UPSTASH_REDIS_REST_TOKEN` env vars — but only the older
  `KV_REST_API_URL`/`KV_REST_API_TOKEN` naming was actually configured on
  Vercel, so every subscribe attempt was silently throwing. Fixed by
  constructing the client explicitly from the vars that actually exist,
  rather than keeping two copies of the same secret in sync.

## Playground Feedback Confirmation Emails (Resend)

The same Resend integration also sends a thank-you email to anyone who
leaves an email address with feedback, plus a notification to the project
owner — both using the same branded HTML template (a shared dark-terminal
themed shell used by every email this project sends).

## Uptime Kuma Alert Emails (Gmail App Password)

Completely separate system: [Uptime Kuma](/docs/services/uptime-kuma)
sends its own down/up alert emails via a dedicated Gmail account
authenticated with an App Password (not the account's real password), with
custom Liquid-templated HTML and inline CSS for a more polished look than
Kuma's plaintext default. This has no relationship to Resend or the
playground's queue — it's Kuma's own, independent alerting path for
lab-infrastructure monitoring, not visitor-facing notifications.

## External Dependencies Summary

- **Resend** — playground outage/recovery + feedback emails, `jaysynclab.com`-verified sender.
- **Vercel KV / Upstash Redis** — the outage-recovery queue's storage.
- **Gmail (App Password)** — Uptime Kuma's alert emails, unrelated to Resend.
```

- [ ] **Step 2: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed

- [ ] **Step 3: Commit**

```bash
git add docs/ecosystem/email-notifications.mdx
git commit -m "Add Ecosystem section: email-notifications.mdx"
```

---

## Task 10: `CONTENT-GUIDE.md` + pointers from `RULEBOOK.md`/`CLAUDE.md`

**Files:**
- Create: `CONTENT-GUIDE.md`
- Modify: `RULEBOOK.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Write `CONTENT-GUIDE.md`**

```markdown
# CONTENT-GUIDE.md — What a Service Page Must Cover

This file is the editorial companion to [`RULEBOOK.md`](RULEBOOK.md).
`RULEBOOK.md` covers publishing *mechanics* — frontmatter, `meta.json`,
the draft/published gate. This file covers *depth*: what a page actually
has to say to be complete, so a new service page doesn't quietly end up
thin the way several already had (`pi-hole.mdx`, `uptime-kuma.mdx`,
`home-assistant.mdx`, and `media-stack.mdx` were all rewritten from
resource-spec-plus-one-paragraph pages to this standard on 2026-07-21).

## The Four Categories

Every service/infrastructure page must cover all four. If one genuinely
doesn't apply, say so explicitly (e.g. media-stack's "External
Dependencies: None." section) — a reader should be able to tell the
category was considered, not skipped by accident.

### 1. Full resource + config specs

CPU/RAM/disk/network allocation, container/VM flags that matter (e.g.
`nesting=1` for Docker-in-LXC, GPU passthrough config), and the exact
provisioning method if it's non-obvious (Helper Script vs. hand-built,
clone-from-template, etc.).

### 2. Every external dependency, named

Every Cloudflare Tunnel hostname, Cloudflare Access policy, email service,
DNS record, and API token/account this service actually uses — by name and
scope only. **Never a secret value.** `RULEBOOK.md` §10's rule is absolute:
nothing under `/docs` ever references anything under `/secrets`, encrypted
or not. "Uses a dedicated `pve-exporter@pve` API token with the
`ExporterAuditRole` (read-only)" is correct; the token's actual value is
not, ever.

### 3. Operational details

Backup/update strategy (including "none configured" if that's the honest
answer — don't invent one), autostart/boot-order behavior, known
gotchas or incidents specific to this service (especially ones that
*recurred* — say so plainly, like Home Assistant's `trusted_proxies`
config disappearing twice), and how to check its health/logs.

### 4. Access & security model

Exactly how it's reached — LAN IP, reverse-proxy hostname, Tailscale
split-DNS, public Cloudflare Tunnel — and what credentials/accounts
control access to it. If something is deliberately *not* reachable a
certain way (media-stack has no reverse-proxy entry, on purpose), state
that plainly too — it reads very differently from an oversight once it's
written down as a decision.

## Worked Example

[`proxmox-host.mdx`](docs/infrastructure/proxmox-host.mdx) and
[`playground-controller.mdx`](docs/services/playground-controller.mdx) are
the reference model — both already hit this standard before this guide was
written. Match their depth and tone, not their exact section headers;
the four categories matter, not the literal words used to introduce them.
```

- [ ] **Step 2: Add a pointer from `RULEBOOK.md`**

Find this line in `RULEBOOK.md` (near the top, in the intro paragraph):

```
covers frontmatter, folder structure, the draft/published workflow, and
what happens after you push. It does **not** cover repository navigation
or infrastructure — see [`MAINTENANCE.md`](./MAINTENANCE.md) for that.
```

Replace it with:

```
covers frontmatter, folder structure, the draft/published workflow, and
what happens after you push. It does **not** cover repository navigation
or infrastructure — see [`MAINTENANCE.md`](./MAINTENANCE.md) for that —
and it does **not** cover what a page must actually say to be complete —
see [`CONTENT-GUIDE.md`](./CONTENT-GUIDE.md) for that.
```

- [ ] **Step 3: Add `CONTENT-GUIDE.md` to `CLAUDE.md`'s "Key files" list**

Find the numbered list under `## Key files, in the order you'd actually
want them` in `CLAUDE.md`. Add a new entry after the `RULEBOOK.md` entry
(renumbering the rest of the list by one):

```
2. **[`CONTENT-GUIDE.md`](CONTENT-GUIDE.md)** — the four things every
   service/infrastructure page must cover (resource specs, named external
   dependencies, operational details, access & security), so depth
   doesn't drift thin again
```

- [ ] **Step 4: Verify frontmatter/structure passes validation**

Run: `node scripts/validate-docs.mjs`
Expected: exit code 0, no errors printed (`CONTENT-GUIDE.md` lives at the
repo root, not under `docs/`, so it isn't touched by this validator at all
— this step just confirms nothing else broke)

- [ ] **Step 5: Commit**

```bash
git add CONTENT-GUIDE.md RULEBOOK.md CLAUDE.md
git commit -m "Add CONTENT-GUIDE.md: codify the four-category depth standard"
```

---

## Self-Review Notes

- **Spec coverage**: all 4 rewrites (Tasks 1–4), both light-touch pages
  addressed (Task 5), all 4 new Ecosystem pages + top-level `meta.json`
  update (Tasks 6–9), and the content guide + both cross-repo-doc pointers
  (Task 10) — every piece from the spec has a task.
- **Placeholder scan**: none found — every task has complete, real MDX
  content, not a description of what to write.
- **Type consistency**: not applicable (no code), but cross-link
  consistency was checked — every internal `/docs/...` link used above
  points at a real page created either already or by an earlier task in
  this same plan (e.g. Task 6's site-architecture.mdx links to
  `/docs/services/uptime-kuma`, which already exists; Tasks 7–9's mutual
  cross-links only reference pages created within Tasks 6–9 of this same
  plan, so link targets exist by the time each page ships in its group).
