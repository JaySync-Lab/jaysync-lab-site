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
