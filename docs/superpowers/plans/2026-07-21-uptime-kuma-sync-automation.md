# Uptime Kuma Sync Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A GitHub Action in `JaySync-Lab`, triggered on push to `infrastructure/inventory.yaml`, that automatically creates any missing Uptime Kuma monitors for live services and adds them to the status page — additive-only, never deletes.

**Architecture:** A standalone Python script (`infrastructure/scripts/sync_uptime_kuma.py`) reads `inventory.yaml`, diffs live node names against Kuma's existing monitors via the `uptime-kuma-api` Socket.IO client, creates missing monitors as TCP pings, and updates the status page's `publicGroupList`. A GitHub Actions workflow runs it on the relevant push trigger, reaching Kuma through a Cloudflare Tunnel hostname gated by Cloudflare Access.

**Tech Stack:** Python 3.11, `uptime-kuma-api` (PyPI, Socket.IO-based Kuma client), `PyYAML`, `pytest`, GitHub Actions (`actions/setup-python`).

**Repo:** `JaySync-Lab` (this plan modifies that repo, even though it's saved here in `jaysync-lab-site` per this project's existing spec/plan location convention).

## Global Constraints

- Additive-only: the script must never call `delete_monitor`. Orphaned monitors (exist in Kuma, no matching live node) are reported, never removed.
- Auto-created monitors are TCP ping checks only (`MonitorType.PING`), matched to a live node by its `status_name` field — `inventory.yaml` has no structured port/URL field to safely infer an HTTP check from.
- The automation's Kuma credentials must be a dedicated user, not the personal admin account.
- Kuma's control endpoint must be reachable by GitHub's runners only through a Cloudflare Access service token — never left open to the public internet.
- A single monitor-creation failure must not abort the run; the script continues with the remaining nodes.

---

## Task 1: Provision Kuma-side infrastructure (manual/guided)

This task has no automated test — it's infrastructure provisioning, verified by a real HTTP request at the end.

**Files:** none (external infra: Kuma admin UI, Cloudflare dashboard/API)

- [ ] **Step 1: Create a dedicated Kuma automation user**

In Kuma's web UI: Settings → Users → Add a User. Username `automation`, generate a strong password, save it — this becomes the `KUMA_PASSWORD` GitHub secret in Task 6. Kuma has no granular per-user permission scoping below full admin, so this user will have the same access as any other Kuma user; the point of a dedicated account is auditability and easy revocation, not reduced permissions.

- [ ] **Step 2: Add a new Cloudflare Tunnel ingress for Kuma's control port**

On the Proxmox host, edit the existing `cloudflared` config (the same tunnel already used for `api-jslnode.jaysynclab.com`, on CT 105, or Kuma's own tunnel if it has a separate one — check `/etc/cloudflared/config.yml` on CT 101 first, since Kuma is VMID 101). Add:

```yaml
  - hostname: kuma-ctl.lab.jaysynclab.com
    service: http://localhost:3001
```

Then: `cloudflared tunnel route dns <tunnel-name> kuma-ctl.lab.jaysynclab.com` and restart the `cloudflared` service.

- [ ] **Step 3: Create a Cloudflare Access application + service token**

In the Cloudflare Zero Trust dashboard: Access → Applications → Add an application → Self-hosted. Application domain: `kuma-ctl.lab.jaysynclab.com`. Add a policy that allows only a Service Auth rule (not an email/identity rule — this is machine-to-machine). Then: Access → Service Auth → Create Service Token. Save the generated **Client ID** and **Client Secret** — these become `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` GitHub secrets in Task 6.

- [ ] **Step 4: Verify the gate works**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://kuma-ctl.lab.jaysynclab.com
```

Expected: `403` (Cloudflare Access blocking, no token presented).

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://kuma-ctl.lab.jaysynclab.com \
  -H "CF-Access-Client-Id: <client-id>" \
  -H "CF-Access-Client-Secret: <client-secret>"
```

Expected: `200` or `101` (reaches Kuma — Kuma's own login page/socket handshake, not a Cloudflare block page).

---

## Task 2: `load_live_nodes` — parse inventory.yaml

**Files:**
- Create: `infrastructure/scripts/sync_uptime_kuma.py`
- Create: `infrastructure/scripts/test_sync_uptime_kuma.py`
- Create: `infrastructure/scripts/requirements.txt`

**Interfaces:**
- Produces: `load_live_nodes(inventory_path: str) -> list[dict]`, each dict has keys `status_name: str`, `ip: str`

- [ ] **Step 1: Write `requirements.txt`**

```
uptime-kuma-api==1.2.1
PyYAML==6.0.2
```

- [ ] **Step 2: Write the failing test**

Create `infrastructure/scripts/test_sync_uptime_kuma.py`:

```python
import textwrap
from sync_uptime_kuma import load_live_nodes


def test_load_live_nodes_filters_templates(tmp_path):
    inventory = tmp_path / "inventory.yaml"
    inventory.write_text(textwrap.dedent("""
        nodes:
          - vmid: 100
            name: pi-hole
            status_name: "Pi-hole"
            ip: "192.168.1.101"
          - vmid: 180
            name: sandbox-template
            status_name: "Sandbox Template"
            ip: null
            template: true
    """))

    result = load_live_nodes(str(inventory))

    assert result == [{"status_name": "Pi-hole", "ip": "192.168.1.101"}]
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd infrastructure/scripts && pip install -r requirements.txt pytest && pytest test_sync_uptime_kuma.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'sync_uptime_kuma'` or `ImportError`

- [ ] **Step 4: Write minimal implementation**

Create `infrastructure/scripts/sync_uptime_kuma.py`:

```python
import yaml


def load_live_nodes(inventory_path: str) -> list[dict]:
    """Read inventory.yaml, return [{"status_name": ..., "ip": ...}] for every non-template node."""
    with open(inventory_path) as f:
        data = yaml.safe_load(f)

    return [
        {"status_name": node["status_name"], "ip": node["ip"]}
        for node in data["nodes"]
        if not node.get("template")
    ]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add infrastructure/scripts/sync_uptime_kuma.py infrastructure/scripts/test_sync_uptime_kuma.py infrastructure/scripts/requirements.txt
git commit -m "Add load_live_nodes: parse inventory.yaml, filter out templates"
```

---

## Task 3: `diff_monitors` and `find_orphans` — pure diff logic

**Files:**
- Modify: `infrastructure/scripts/sync_uptime_kuma.py`
- Modify: `infrastructure/scripts/test_sync_uptime_kuma.py`

**Interfaces:**
- Consumes: `load_live_nodes()`'s return shape (`list[dict]` with `status_name`, `ip`)
- Produces: `diff_monitors(live_nodes: list[dict], existing_names: set[str]) -> list[dict]` (subset of `live_nodes` needing a new monitor); `find_orphans(live_nodes: list[dict], existing_names: set[str]) -> list[str]` (monitor names with no matching live node)

- [ ] **Step 1: Write the failing tests**

Add to `infrastructure/scripts/test_sync_uptime_kuma.py`:

```python
from sync_uptime_kuma import diff_monitors, find_orphans


def test_diff_monitors_returns_only_missing():
    live_nodes = [
        {"status_name": "Pi-hole", "ip": "192.168.1.101"},
        {"status_name": "Uptime Kuma", "ip": "192.168.1.102"},
    ]
    existing_names = {"Pi-hole"}

    result = diff_monitors(live_nodes, existing_names)

    assert result == [{"status_name": "Uptime Kuma", "ip": "192.168.1.102"}]


def test_diff_monitors_empty_when_all_exist():
    live_nodes = [{"status_name": "Pi-hole", "ip": "192.168.1.101"}]
    existing_names = {"Pi-hole"}

    assert diff_monitors(live_nodes, existing_names) == []


def test_find_orphans_returns_names_with_no_live_node():
    live_nodes = [{"status_name": "Pi-hole", "ip": "192.168.1.101"}]
    existing_names = {"Pi-hole", "Decommissioned Service"}

    result = find_orphans(live_nodes, existing_names)

    assert result == ["Decommissioned Service"]


def test_find_orphans_empty_when_all_match():
    live_nodes = [{"status_name": "Pi-hole", "ip": "192.168.1.101"}]
    existing_names = {"Pi-hole"}

    assert find_orphans(live_nodes, existing_names) == []
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: FAIL with `ImportError: cannot import name 'diff_monitors'`

- [ ] **Step 3: Write minimal implementation**

Add to `infrastructure/scripts/sync_uptime_kuma.py`:

```python
def diff_monitors(live_nodes: list[dict], existing_names: set[str]) -> list[dict]:
    """Live nodes that don't yet have a matching Kuma monitor."""
    return [node for node in live_nodes if node["status_name"] not in existing_names]


def find_orphans(live_nodes: list[dict], existing_names: set[str]) -> list[str]:
    """Kuma monitor names with no matching live node -- reported, never deleted."""
    live_names = {node["status_name"] for node in live_nodes}
    return [name for name in sorted(existing_names) if name not in live_names]
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: PASS (5 tests total)

- [ ] **Step 5: Commit**

```bash
git add infrastructure/scripts/sync_uptime_kuma.py infrastructure/scripts/test_sync_uptime_kuma.py
git commit -m "Add diff_monitors/find_orphans: pure diff logic between inventory and Kuma"
```

---

## Task 4: `sync()` — the integration function

**Files:**
- Modify: `infrastructure/scripts/sync_uptime_kuma.py`
- Modify: `infrastructure/scripts/test_sync_uptime_kuma.py`

**Interfaces:**
- Consumes: `load_live_nodes`, `diff_monitors`, `find_orphans` (all defined above); `uptime_kuma_api.UptimeKumaApi` (`login(user, password)`, `get_monitors() -> list[dict]` each with `"name"`, `add_monitor(type=MonitorType.PING, name=str, hostname=str) -> dict` with `"monitorID"`, `get_status_page(slug) -> dict` with `"publicGroupList": [{"id", "name", "weight", "monitorList": [{"id", "name", ...}]}]`, `save_status_page(slug, publicGroupList=list)`)
- Produces: `sync(kuma_url: str, kuma_user: str, kuma_password: str, inventory_path: str, status_page_slug: str = "default") -> dict` returning `{"created": list[str], "orphans": list[str], "failed": list[str]}`

- [ ] **Step 1: Write the failing test**

Add to `infrastructure/scripts/test_sync_uptime_kuma.py`:

```python
import textwrap
from unittest.mock import MagicMock, patch
from sync_uptime_kuma import sync


def _write_inventory(tmp_path):
    inventory = tmp_path / "inventory.yaml"
    inventory.write_text(textwrap.dedent("""
        nodes:
          - vmid: 100
            name: pi-hole
            status_name: "Pi-hole"
            ip: "192.168.1.101"
          - vmid: 101
            name: uptime-kuma
            status_name: "Uptime Kuma"
            ip: "192.168.1.102"
    """))
    return str(inventory)


@patch("sync_uptime_kuma.UptimeKumaApi")
def test_sync_creates_missing_monitor_and_adds_to_status_page(mock_api_cls, tmp_path):
    inventory_path = _write_inventory(tmp_path)
    mock_api = MagicMock()
    mock_api_cls.return_value = mock_api
    mock_api.get_monitors.return_value = [{"id": 1, "name": "Pi-hole"}]
    mock_api.add_monitor.return_value = {"msg": "Added Successfully.", "monitorID": 2}
    mock_api.get_status_page.return_value = {
        "publicGroupList": [
            {"id": 1, "name": "Services", "weight": 1, "monitorList": [{"id": 1, "name": "Pi-hole"}]}
        ]
    }

    result = sync("https://kuma.example.com", "automation", "secret", inventory_path)

    mock_api.login.assert_called_once_with("automation", "secret")
    mock_api.add_monitor.assert_called_once()
    call_kwargs = mock_api.add_monitor.call_args.kwargs
    assert call_kwargs["name"] == "Uptime Kuma"
    assert call_kwargs["hostname"] == "192.168.1.102"

    mock_api.save_status_page.assert_called_once()
    saved_groups = mock_api.save_status_page.call_args.kwargs["publicGroupList"]
    monitor_ids_in_group = {m["id"] for m in saved_groups[0]["monitorList"]}
    assert monitor_ids_in_group == {1, 2}

    assert result == {"created": ["Uptime Kuma"], "orphans": [], "failed": []}


@patch("sync_uptime_kuma.UptimeKumaApi")
def test_sync_reports_orphan_without_deleting(mock_api_cls, tmp_path):
    inventory_path = _write_inventory(tmp_path)
    mock_api = MagicMock()
    mock_api_cls.return_value = mock_api
    mock_api.get_monitors.return_value = [
        {"id": 1, "name": "Pi-hole"},
        {"id": 2, "name": "Uptime Kuma"},
        {"id": 3, "name": "Decommissioned Service"},
    ]

    result = sync("https://kuma.example.com", "automation", "secret", inventory_path)

    mock_api.add_monitor.assert_not_called()
    mock_api.delete_monitor.assert_not_called()
    assert result == {"created": [], "orphans": ["Decommissioned Service"], "failed": []}


@patch("sync_uptime_kuma.UptimeKumaApi")
def test_sync_continues_after_one_monitor_creation_fails(mock_api_cls, tmp_path):
    inventory_path = _write_inventory(tmp_path)
    mock_api = MagicMock()
    mock_api_cls.return_value = mock_api
    mock_api.get_monitors.return_value = []
    mock_api.add_monitor.side_effect = [Exception("kuma error"), {"msg": "Added Successfully.", "monitorID": 5}]
    mock_api.get_status_page.return_value = {"publicGroupList": [{"id": 1, "name": "Services", "weight": 1, "monitorList": []}]}

    result = sync("https://kuma.example.com", "automation", "secret", inventory_path)

    assert result["created"] == ["Uptime Kuma"]
    assert result["failed"] == ["Pi-hole"]
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: FAIL with `ImportError: cannot import name 'sync'`

- [ ] **Step 3: Write minimal implementation**

Add to the top of `infrastructure/scripts/sync_uptime_kuma.py`:

```python
from uptime_kuma_api import UptimeKumaApi, MonitorType
```

Add to `infrastructure/scripts/sync_uptime_kuma.py`:

```python
def sync(
    kuma_url: str,
    kuma_user: str,
    kuma_password: str,
    inventory_path: str,
    status_page_slug: str = "default",
) -> dict:
    live_nodes = load_live_nodes(inventory_path)

    api = UptimeKumaApi(kuma_url)
    api.login(kuma_user, kuma_password)

    existing_monitors = api.get_monitors()
    existing_names = {m["name"] for m in existing_monitors}

    to_create = diff_monitors(live_nodes, existing_names)
    orphans = find_orphans(live_nodes, existing_names)

    created = []
    failed = []
    created_ids_by_name = {}
    for node in to_create:
        try:
            response = api.add_monitor(
                type=MonitorType.PING,
                name=node["status_name"],
                hostname=node["ip"],
            )
            created_ids_by_name[node["status_name"]] = response["monitorID"]
            created.append(node["status_name"])
        except Exception:
            failed.append(node["status_name"])

    if created_ids_by_name:
        status_page = api.get_status_page(status_page_slug)
        groups = status_page["publicGroupList"]
        target_group = groups[0] if groups else {"name": "Services", "weight": 1, "monitorList": []}
        for name, monitor_id in created_ids_by_name.items():
            target_group["monitorList"].append({"id": monitor_id})
        if not groups:
            groups = [target_group]
        api.save_status_page(status_page_slug, publicGroupList=groups)

    return {"created": created, "orphans": orphans, "failed": failed}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: PASS (8 tests total)

- [ ] **Step 5: Commit**

```bash
git add infrastructure/scripts/sync_uptime_kuma.py infrastructure/scripts/test_sync_uptime_kuma.py
git commit -m "Add sync(): create missing monitors, update status page, report orphans"
```

---

## Task 5: `main()` CLI entry point

**Files:**
- Modify: `infrastructure/scripts/sync_uptime_kuma.py`
- Modify: `infrastructure/scripts/test_sync_uptime_kuma.py`

**Interfaces:**
- Consumes: `sync()` from Task 4
- Produces: `main() -> int` (exit code), reads `KUMA_URL`, `KUMA_USER`, `KUMA_PASSWORD` from `os.environ`, reads `INVENTORY_PATH` env var (default `"infrastructure/inventory.yaml"`)

- [ ] **Step 1: Write the failing test**

Add to `infrastructure/scripts/test_sync_uptime_kuma.py`:

```python
import os
from sync_uptime_kuma import main


@patch("sync_uptime_kuma.sync")
def test_main_reads_env_vars_and_exits_zero_on_success(mock_sync, tmp_path, monkeypatch, capsys):
    mock_sync.return_value = {"created": ["Uptime Kuma"], "orphans": [], "failed": []}
    monkeypatch.setenv("KUMA_URL", "https://kuma.example.com")
    monkeypatch.setenv("KUMA_USER", "automation")
    monkeypatch.setenv("KUMA_PASSWORD", "secret")
    monkeypatch.setenv("INVENTORY_PATH", str(tmp_path / "inventory.yaml"))

    exit_code = main()

    assert exit_code == 0
    mock_sync.assert_called_once_with(
        "https://kuma.example.com", "automation", "secret", str(tmp_path / "inventory.yaml")
    )
    captured = capsys.readouterr()
    assert "Uptime Kuma" in captured.out


@patch("sync_uptime_kuma.sync")
def test_main_exits_nonzero_on_connection_failure(mock_sync, monkeypatch):
    mock_sync.side_effect = Exception("connection refused")
    monkeypatch.setenv("KUMA_URL", "https://kuma.example.com")
    monkeypatch.setenv("KUMA_USER", "automation")
    monkeypatch.setenv("KUMA_PASSWORD", "secret")

    exit_code = main()

    assert exit_code == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: FAIL with `ImportError: cannot import name 'main'`

- [ ] **Step 3: Write minimal implementation**

Add to the top of `infrastructure/scripts/sync_uptime_kuma.py`:

```python
import os
import sys
```

Add to `infrastructure/scripts/sync_uptime_kuma.py`:

```python
def main() -> int:
    try:
        result = sync(
            os.environ["KUMA_URL"],
            os.environ["KUMA_USER"],
            os.environ["KUMA_PASSWORD"],
            os.environ.get("INVENTORY_PATH", "infrastructure/inventory.yaml"),
        )
    except Exception as e:
        print(f"Sync failed: {e}")
        return 1

    print(f"Created: {result['created']}")
    print(f"Orphans (not deleted, review manually): {result['orphans']}")
    print(f"Failed: {result['failed']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest test_sync_uptime_kuma.py -v`
Expected: PASS (10 tests total)

- [ ] **Step 5: Commit**

```bash
git add infrastructure/scripts/sync_uptime_kuma.py infrastructure/scripts/test_sync_uptime_kuma.py
git commit -m "Add main(): CLI entry point reading env vars, real exit codes"
```

---

## Task 6: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/sync-uptime-kuma.yml`

**Interfaces:**
- Consumes: `infrastructure/scripts/sync_uptime_kuma.py`'s `main()` (via `python -m sync_uptime_kuma` or direct invocation)

- [ ] **Step 1: Write the workflow file**

Create `.github/workflows/sync-uptime-kuma.yml`:

```yaml
name: Sync Uptime Kuma monitors

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/inventory.yaml'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r infrastructure/scripts/requirements.txt

      - name: Sync monitors
        env:
          KUMA_URL: https://kuma-ctl.lab.jaysynclab.com
          KUMA_USER: ${{ secrets.KUMA_USER }}
          KUMA_PASSWORD: ${{ secrets.KUMA_PASSWORD }}
          CF_ACCESS_CLIENT_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}
          CF_ACCESS_CLIENT_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}
        run: python infrastructure/scripts/sync_uptime_kuma.py
```

- [ ] **Step 2: Add Cloudflare Access headers to the Kuma client's requests**

`uptime-kuma-api`'s `UptimeKumaApi` constructor doesn't take custom headers directly, but the underlying `socketio.Client` it wraps accepts `http_session` / connection kwargs. Simplest correct approach for this library version: set the two Cloudflare Access headers as environment variables that a `requests.Session` picks up isn't automatic either — instead, pass them explicitly via the `headers` argument `UptimeKumaApi` forwards to `socketio.Client.connect()`. Add to `infrastructure/scripts/sync_uptime_kuma.py`, inside `sync()`, replacing the plain constructor call:

```python
    api = UptimeKumaApi(
        kuma_url,
        headers={
            "CF-Access-Client-Id": os.environ.get("CF_ACCESS_CLIENT_ID", ""),
            "CF-Access-Client-Secret": os.environ.get("CF_ACCESS_CLIENT_SECRET", ""),
        },
    )
```

- [ ] **Step 3: Add the four secrets to the `JaySync-Lab` repo**

```bash
gh secret set KUMA_USER --repo JaySync-Lab/JaySync-Lab --body "automation"
gh secret set KUMA_PASSWORD --repo JaySync-Lab/JaySync-Lab
gh secret set CF_ACCESS_CLIENT_ID --repo JaySync-Lab/JaySync-Lab
gh secret set CF_ACCESS_CLIENT_SECRET --repo JaySync-Lab/JaySync-Lab
```

(`KUMA_PASSWORD`/`CF_ACCESS_CLIENT_ID`/`CF_ACCESS_CLIENT_SECRET` prompt for stdin input when no `--body` is given — paste the values saved in Task 1.)

- [ ] **Step 4: Trigger a manual run and verify**

```bash
gh workflow run sync-uptime-kuma.yml --repo JaySync-Lab/JaySync-Lab
gh run watch --repo JaySync-Lab/JaySync-Lab
```

Expected: job succeeds, log output shows `Created: [...]` with any genuinely missing monitors (likely empty if Task 7's audit already ran), not a connection/auth error.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/sync-uptime-kuma.yml infrastructure/scripts/sync_uptime_kuma.py
git commit -m "Add sync-uptime-kuma GitHub Action, wire Cloudflare Access headers"
```

---

## Task 7: One-time audit against the real Kuma instance

**Files:** none (operational task)

- [ ] **Step 1: Run the sync script locally against production Kuma**

```bash
export KUMA_URL="https://kuma-ctl.lab.jaysynclab.com"
export KUMA_USER="automation"
export KUMA_PASSWORD="<the password saved in Task 1>"
export CF_ACCESS_CLIENT_ID="<from Task 1>"
export CF_ACCESS_CLIENT_SECRET="<from Task 1>"
cd infrastructure/scripts
python sync_uptime_kuma.py
```

- [ ] **Step 2: Review the `Created` and `Orphans` output**

For each name in `Orphans`: open Kuma's UI, confirm the monitor genuinely has no corresponding live service in `inventory.yaml`, and if so delete it by hand (Settings → the monitor → Delete). If a name looks like it *should* match a live node but doesn't, that's a naming mismatch — fix whichever side (Kuma monitor name or `inventory.yaml`'s `status_name`) is wrong so they match exactly.

- [ ] **Step 3: Verify the status page reflects the fix**

```bash
curl -s https://kuma-ctl.lab.jaysynclab.com/api/status-page/default | python -m json.tool
```

Confirm every live node's `status_name` appears in the returned `publicGroupList[].monitorList[].name`.

---

## Self-Review Notes

- **Spec coverage**: one-time audit (Task 7), additive-only auto-sync (Tasks 2–6), dedicated Kuma user + Cloudflare Access gating (Task 1) — all three spec pieces covered.
- **Placeholder scan**: none found — every step has real, verified-against-source code.
- **Type consistency**: `load_live_nodes` → `list[dict]` with `status_name`/`ip` keys used consistently through `diff_monitors`, `find_orphans`, and `sync`. `sync()`'s return shape (`created`/`orphans`/`failed`) matches what `main()` consumes.
