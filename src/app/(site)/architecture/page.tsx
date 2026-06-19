import { getInventory } from '@/lib/inventory';
import { VmidBandDiagram } from '@/components/VmidBandDiagram';

export const metadata = { title: 'Architecture — JaySync-Lab' };

export default function ArchitecturePage() {
  const { hardware, nodes, overlay, vmid_bands } = getInventory();
  const router    = hardware.find((h) => h.id === 'zte-router');
  const proxmox   = hardware.find((h) => h.id === 'proxmox-host');
  const tailscale = overlay[0];

  const physicalNodes = [
    { label: router?.name    ?? 'Router',   ip: router?.ip,    role: router?.role,    color: '#475569' },
    { label: proxmox?.name   ?? 'Proxmox',  ip: proxmox?.ip,   role: proxmox?.role,   color: '#3b82f6' },
    { label: tailscale?.name ?? 'Tailscale',ip: tailscale?.ip, role: tailscale?.role, color: '#a855f7' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">Infrastructure</p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Architecture</h1>
        <p className="text-[#64748b] mt-3 max-w-lg text-sm leading-relaxed">
          VMID bands partition the 100–199 allocation space into functional layers.
          Active containers are placed at their assigned VMID slot.
        </p>
      </div>

      {/* Physical layer */}
      <section className="mb-16">
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-5">Physical Layer</p>
        <div className="flex flex-wrap gap-4">
          {physicalNodes.map((node) => (
            <div
              key={node.label}
              className="border rounded-lg p-4 bg-[#0f172a] font-mono text-xs"
              style={{ borderColor: node.color }}
            >
              <p className="font-semibold text-[#e2e8f0] text-sm mb-1">{node.label}</p>
              <p style={{ color: node.color }}>{node.ip}</p>
              <p className="text-[#475569] mt-1 text-[11px] max-w-[200px] leading-relaxed">{node.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VMID band diagram */}
      <section>
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-5">
          VMID Band Allocation — 100 to 199
        </p>
        <div className="overflow-x-auto">
          <VmidBandDiagram nodes={nodes} bands={vmid_bands} />
        </div>
      </section>
    </div>
  );
}
