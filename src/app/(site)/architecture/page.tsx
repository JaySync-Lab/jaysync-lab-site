import { getInventory } from '@/lib/inventory';
import { VmidBandDiagram } from '@/components/VmidBandDiagram';
import { NodeConstellation } from '@/components/site/NodeConstellation';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionReveal } from '@/components/site/SectionReveal';

export const metadata = { title: 'Architecture — JaySync-Lab' };

export default function ArchitecturePage() {
  const { hardware, nodes, overlay, vmid_bands } = getInventory();
  const router    = hardware.find((h) => h.id === 'zte-router');
  const proxmox   = hardware.find((h) => h.id === 'proxmox-host');
  const tailscale = overlay[0];

  const physicalNodes = [
    { label: router?.name    ?? 'Router',    ip: router?.ip,    role: router?.role,    accent: '#64748b' },
    { label: proxmox?.name   ?? 'Proxmox',   ip: proxmox?.ip,   role: proxmox?.role,   accent: '#3b82f6' },
    { label: tailscale?.name ?? 'Tailscale', ip: tailscale?.ip, role: tailscale?.role, accent: '#a855f7' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
      <PageHeader
        eyebrow="Infrastructure"
        title="Architecture"
        description="A single Proxmox host behind a ZTE router. VMID bands partition the 100–199 space into functional layers; each active container sits at its assigned slot."
      />

      {/* Topology */}
      <SectionReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20" staggerChildren>
        <div>
          <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-4">Topology</p>
          <div className="flex flex-wrap gap-3">
            {physicalNodes.map((node) => (
              <div
                key={node.label}
                className="rounded-xl border bg-[#111726] p-4 font-mono text-xs"
                style={{ borderColor: `${node.accent}66` }}
              >
                <p className="font-semibold text-white text-sm mb-1">{node.label}</p>
                <p style={{ color: node.accent }}>{node.ip}</p>
                <p className="text-[#475569] mt-1 text-[11px] max-w-[200px] leading-relaxed">{node.role}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full max-w-md mx-auto">
          <NodeConstellation nodes={nodes} className="w-full h-auto" />
        </div>
      </SectionReveal>

      {/* VMID band diagram */}
      <SectionReveal>
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-5">
          VMID band allocation — 100 to 199
        </p>
        <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#111726] p-6">
          <VmidBandDiagram nodes={nodes} bands={vmid_bands} />
        </div>
      </SectionReveal>
    </div>
  );
}
