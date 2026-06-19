import Link from 'next/link';
import { getInventory } from '@/lib/inventory';
import { LabDiagram } from '@/components/LabDiagram';
import { VmidRack } from '@/components/VmidRack';

export const metadata = {
  title: 'JaySync-Lab — Homelab Infrastructure',
};

export default function HomePage() {
  const { hardware, nodes, vmid_bands } = getInventory();
  const proxmox = hardware.find((h) => h.id === 'proxmox-host');

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-24">
        <div>
          <p className="font-mono text-[#38bdf8] text-xs uppercase tracking-widest mb-4">
            HP ProDesk 400 G3 · Proxmox VE 9.2 · {proxmox?.ip}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#e2e8f0] leading-tight mb-6">
            {nodes.length} containers.
            <br />
            <span className="text-[#38bdf8]">16GB RAM.</span>
            <br />
            1 homelab.
          </h1>
          <p className="text-[#64748b] text-base leading-relaxed mb-8 max-w-md">
            An Intel i5-6500 running Pi-hole, Home Assistant, GPU-passthrough
            media streaming, and this documentation engine — all accessible
            over Tailscale.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/services"
              className="px-5 py-2.5 bg-[#38bdf8] text-[#020617] text-sm font-semibold rounded hover:bg-[#7dd3fc] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              View Services
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 border border-[#334155] text-[#cbd5e1] text-sm rounded hover:border-[#38bdf8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              Browse Docs
            </Link>
          </div>
        </div>

        <div className="overflow-hidden">
          <LabDiagram nodes={nodes} />
        </div>
      </div>

      {/* Stat bar */}
      <div className="border-t border-[#1e293b] pt-12 mb-24 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Containers', value: String(nodes.length), unit: 'LXC + VM' },
          { label: 'RAM',        value: '16',                 unit: 'GB DDR4' },
          { label: 'SSD',        value: '512',                unit: 'GB fast tier' },
          { label: 'Vault',      value: '1TB',                unit: 'HDD slow tier' },
        ].map((s) => (
          <div key={s.label} className="border border-[#1e293b] bg-[#0f172a] rounded-lg p-4">
            <p className="font-mono text-[#475569] text-[10px] uppercase tracking-wider mb-2">{s.label}</p>
            <p className="font-mono text-[#f59e0b] text-2xl font-bold">{s.value}</p>
            <p className="text-[#475569] text-xs mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* VMID Rack */}
      <div className="border-t border-[#1e293b] pt-12">
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-6">
          VMID Allocation · 100–199
        </p>
        <VmidRack nodes={nodes} bands={vmid_bands} />
      </div>
    </div>
  );
}
