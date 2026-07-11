import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface HardwareNode {
  id: string;
  name: string;
  ip: string;
  type: string;
  role: string;
  vmid: null;
  docs?: string;
}

export interface ServiceNode {
  vmid: number;
  name: string;
  type: 'lxc' | 'vm';
  ip: string;
  role: string;
  status_name: string;
  docs: string;
  band: string;
  created?: string;
  // A Proxmox template rather than a running service (e.g. the playground
  // golden template). Shown in catalogue views (services grid, VMID band
  // diagram) labelled as a template, but excluded from live/runtime views
  // and the "active" count. See isLiveNode() below.
  template?: boolean;
}

export interface OverlayNode {
  id: string;
  name: string;
  ip: string;
  type: 'overlay';
  role: string;
  vmid: null;
  docs: string;
}

export interface VmidBand {
  id: string;
  range: string;
  label: string;
  purpose: string;
  isolation: string;
}

export interface HostSpec {
  model: string;
  cpu: string;
  ram_gb: number;
  storage: {
    ssd_gb: number;
    vault_tb: number;
  };
  proxmox_version: string;
  uptime_target_pct: number;
  services_summary: string;
}

export interface Inventory {
  host: HostSpec;
  hardware: HardwareNode[];
  nodes: ServiceNode[];
  overlay: OverlayNode[];
  vmid_bands: VmidBand[];
}

// src/data/inventory.yaml is AUTO-SYNCED from JaySync-Lab's
// infrastructure/inventory.yaml by the rebuild-from-docs pipeline — it is
// the single source of truth. Don't hand-edit the copy in this repo; edit
// it in JaySync-Lab and push, and it flows here automatically (same as
// docs/). See JaySync-Lab/RULEBOOK.md.
export function getInventory(): Inventory {
  const filePath = path.join(process.cwd(), 'src', 'data', 'inventory.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as Inventory;
}

export function getNodes(): ServiceNode[] {
  return getInventory().nodes;
}

export function getBands(): VmidBand[] {
  return getInventory().vmid_bands;
}

// A node that represents a real, running service — excludes Proxmox
// templates (which have no live status and no IP). Use this for "live"
// views (topology, the Live Services rack, the neofetch node count);
// catalogue views (services grid, VMID band diagram) show all nodes.
export function isLiveNode(node: ServiceNode): boolean {
  return !node.template;
}
