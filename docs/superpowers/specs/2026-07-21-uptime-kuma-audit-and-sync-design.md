# Uptime Kuma audit, auto-sync, and site status API

**Date**: 2026-07-21
**Status**: Approved, not yet implemented

## Problem

Uptime Kuma's monitors and status page are maintained by hand. There's no
guarantee every live service in `JaySync-Lab/infrastructure/inventory.yaml`
has a matching monitor, and nothing catches drift when a new service is
added — it just silently shows as `unknown` on the site (`StatusBadge`
already degrades gracefully for an unmatched name, but that's not the same
as being tracked).

Separately, the site currently only shows per-service status dots
(`StatusBadge` in `jaysync-lab-site`) — there's no single "is the lab
healthy right now" indicator.

## Scope

Three pieces, built in order:

1. **One-time audit**: reconcile Kuma's current monitors/status page against
   every live node in `inventory.yaml`. Fix names so they exactly match each
   node's `status_name` (required for `StatusBadge`'s matching to work).
2. **Ongoing auto-sync**: a GitHub Action in `JaySync-Lab`, triggered on push
   to `infrastructure/inventory.yaml`, that creates any missing Kuma
   monitors and adds them to the status page automatically.
3. **Aggregate status on the site**: a compact "System Status" badge near
   the homepage's `SystemFetch`, plus a dedicated `/status` page, both
   computed client-side from Kuma's existing public status-page API (same
   pattern `StatusBadge` already uses — no new backend).

## Decisions made during brainstorming

- **Full auto-provisioning**, not just drift-detection — the Action
  actually creates monitors, not just flags gaps.
- **Additive-only sync.** The Action never deletes a monitor. If a node is
  removed from `inventory.yaml`, the run reports an orphaned monitor (as a
  step summary / non-blocking annotation) for a human to remove by hand.
  Auto-deleting monitoring configuration is a meaningfully worse failure
  mode than auto-creating it, so this asymmetry is intentional.
- **Runs as a GitHub Action** (cloud-triggered on push), not a local cron
  job on the LAN, per explicit preference — even though this requires
  exposing Kuma's control surface to the internet, which this project would
  not otherwise do.
- **Gated behind Cloudflare Access**, to keep that exposure in line with
  this project's existing least-privilege pattern (dedicated SSH/NPM/
  Proxmox accounts, no unnecessary public surface elsewhere). A Cloudflare
  Access service token, stored as a GitHub Actions secret, is required to
  reach the tunnel hostname at all — Kuma itself is not reachable by
  anyone without that token, regardless of Kuma's own auth.
- **Dedicated Kuma user for the automation**, separate from the personal
  admin account — same least-privilege pattern as every other credential
  in this project.
- **No new backend/API** for the site-facing status display — it continues
  to hit Kuma's public status-page endpoints directly from the browser,
  same as the existing `StatusBadge`.

## Architecture

```
push to infrastructure/inventory.yaml (JaySync-Lab, main)
  → GitHub Action: sync-uptime-kuma.yml
  → runs sync script (Python, uptime-kuma-api client)
  → connects to https://kuma-ctl.lab.jaysynclab.com
    (Cloudflare Tunnel hostname, gated by Cloudflare Access service token)
  → authenticates to Kuma as a dedicated automation user
  → diffs live nodes (status_name) vs existing monitors
  → creates any missing monitor + adds to the status page group
  → never deletes; reports orphans as a job summary only
```

```
Browser (jaysync-lab-site)
  → StatusBadge (existing, per-service) + new aggregate helper
  → both fetch directly from Kuma's public status-page API
    (/api/status-page/default, /api/status-page/heartbeat/default)
  → aggregate computed client-side: upCount/totalCount, worst-case state
  → rendered as: homepage badge (near SystemFetch) + /status page
```

## Components

### 1. Kuma-side setup (manual, one-time)
- New dedicated Kuma user, automation-only, created via the Kuma admin UI
- New Cloudflare Tunnel ingress hostname for Kuma's control port, added
  alongside the existing tunnel-routed hostnames
- Cloudflare Access policy + service token scoped to that one hostname

### 2. `infrastructure/scripts/sync_uptime_kuma.py` (new, `JaySync-Lab`)
- Reads `infrastructure/inventory.yaml`, filters to live (non-template)
  nodes
- Connects to Kuma via `uptime-kuma-api`, using credentials from
  environment variables (`KUMA_URL`, `KUMA_USER`, `KUMA_PASSWORD`)
- For each live node without a matching monitor (matched by
  `status_name`): creates a **TCP ping monitor against the node's `ip`**
  and adds it to the default status page's monitor group. `inventory.yaml`
  has no structured port/URL field today, so a TCP ping is the only check
  every node can support without guessing — auto-created monitors are
  intentionally a baseline "is it up," not a full health check. Upgrading
  a specific monitor to an HTTP/keyword check remains a manual follow-up
  in the Kuma UI, same as it is today
- For each existing Kuma monitor with no matching live node: logs it as an
  orphan in the job summary, takes no other action
- Exits non-zero only on a real connection/auth failure, not on finding
  orphans (orphans are informational)

### 3. `.github/workflows/sync-uptime-kuma.yml` (new, `JaySync-Lab`)
- Triggers on push to `main` touching `infrastructure/inventory.yaml`
- Secrets: `KUMA_URL` (the gated tunnel hostname), `KUMA_USER`,
  `KUMA_PASSWORD`, plus whatever Cloudflare Access requires to authenticate
  the outbound request (service token client ID/secret as request headers)
- Runs the sync script, surfaces its summary as a GitHub Actions job
  summary

### 4. `jaysync-lab-site` status API/display
- Extract the fetch/match logic already in `StatusBadge.tsx` into a shared
  `src/lib/kuma-status.ts`: `fetchAllStatuses(): Promise<Map<string,
  StatusEntry>>`, used by both `StatusBadge` (per-service) and the new
  aggregate view (avoids two separate fetches for the same two endpoints)
- New `src/components/site/SystemStatusBadge.tsx`: compact aggregate
  indicator (`upCount/total`, worst-case dot color), placed next to
  `SystemFetch` on the homepage, links to `/status`
- New `src/app/(site)/status/page.tsx`: full breakdown — every live node's
  current status + last-checked time, plus the same aggregate at the top

## Error handling

- Sync script: a single monitor-creation failure must not abort the whole
  run — log it, continue with the remaining nodes, non-zero exit only if
  *every* creation failed or the initial connection/auth failed
- Site-side: identical to `StatusBadge`'s existing behavior — any fetch
  failure (Kuma down, Access blocking, network error) renders as
  `unknown`, never throws, never blocks the rest of the page

## Testing

- Add a throwaway dummy entry to `inventory.yaml`, push, confirm the
  Action creates a real monitor and it appears on the status page; remove
  the dummy afterward (and its now-orphaned Kuma monitor, by hand)
- Confirm the Action fails cleanly (clear error, non-zero exit) if the
  Cloudflare Access token is wrong — must not silently no-op
- Load `/status` and the homepage badge with the real current state, and
  with at least one service intentionally stopped, to confirm both the
  individual dot and the aggregate reflect it correctly
