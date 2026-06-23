import { getInventory } from '@/lib/inventory';
import { DocsHero } from '@/components/docs/DocsHero';
import { NetworkTopology } from '@/components/site/NetworkTopology';
import { SectionReveal } from '@/components/site/SectionReveal';
import { SectionPreviewCards } from '@/components/site/SectionPreviewCards';
import { DocsServiceStrip } from '@/components/docs/DocsServiceStrip';
import { Counter } from '@/components/site/Counter';

export const metadata = {
  title: 'JaySync-Lab — A homelab, documented properly',
};

export default function HomePage() {
  const { nodes, host } = getInventory();

  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  const STATS = [
    { label: 'Containers',    value: nodes.length,            decimals: 0, suffix: '',    unit: 'LXC + VM on Proxmox' },
    { label: 'RAM installed', value: host.ram_gb,             decimals: 0, suffix: ' GB', unit: `DDR4 · ${host.cpu}` },
    { label: 'Storage',       value: storageTb,               decimals: 1, suffix: ' TB', unit: `${host.storage.ssd_gb}GB SSD + ${host.storage.vault_tb}TB vault` },
    { label: 'Uptime target', value: host.uptime_target_pct,  decimals: 1, suffix: '%',   unit: 'Watchman monitored' },
  ];

  return (
    <>
      <DocsHero />

      <div className="max-w-6xl mx-auto px-6 pb-28">
        {/* Topology + intro */}
        <SectionReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20" staggerChildren>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#52525b' }}>
              The topology
            </p>
            <h2 className="text-3xl! sm:text-4xl! font-bold! text-white tracking-tight">
              One box. Five services. Zero clutter.
            </h2>
            <p className="mt-5 leading-relaxed max-w-md" style={{ color: '#a1a1aa' }}>
              Everything hangs off a single Proxmox host behind a ZTE router,
              reachable anywhere through Tailscale. Each node is isolated,
              monitored, and documented.
            </p>
          </div>
          <div className="w-full">
            <NetworkTopology nodes={nodes} className="w-full h-auto" />
          </div>
        </SectionReveal>

        {/* Stats */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionReveal className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-12" staggerChildren>
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: '#52525b' }}>
                  {s.label}
                </p>
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs" style={{ color: '#a1a1aa' }}>{s.unit}</p>
              </div>
            ))}
          </SectionReveal>
        </div>

        {/* Funnel cards */}
        <SectionReveal className="py-20" staggerChildren>
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#52525b' }}>
              Start here
            </p>
            <h2 className="text-3xl! sm:text-4xl! font-bold! text-white tracking-tight">
              Everything is written down.
            </h2>
          </div>
          <SectionPreviewCards />
        </SectionReveal>
      </div>

      {/* Live services strip — full bleed */}
      <DocsServiceStrip nodes={nodes} />

      {/* Footer */}
      <footer className="py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-mono" style={{ color: '#52525b' }}>
            <span className="font-bold text-white">Jay<span style={{ color: '#52525b' }}>Sync</span> Lab</span>
            {' '}· {host.model} · Proxmox VE {host.proxmox_version}
          </p>
          <p className="font-mono text-xs" style={{ color: '#52525b' }}>documented properly.</p>
        </div>
      </footer>
    </>
  );
}
