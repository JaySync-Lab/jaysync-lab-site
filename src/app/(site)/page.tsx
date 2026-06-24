import { getInventory } from '@/lib/inventory';
import { DocsHero } from '@/components/docs/DocsHero';
import { NetworkTopology } from '@/components/site/NetworkTopology';
import { SectionReveal } from '@/components/site/SectionReveal';
import { SectionPreviewCards } from '@/components/site/SectionPreviewCards';
import { DocsServiceStrip } from '@/components/docs/DocsServiceStrip';
import { StatsGrid } from '@/components/site/StatsGrid';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata = {
  title: 'JaySync-Lab — A homelab, documented properly',
};

export default function HomePage() {
  const { nodes, host } = getInventory();
  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  return (
    <>
      <DocsHero count={nodes.length} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {/* Topology + intro */}
        <SectionReveal className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center py-10 md:py-16" staggerChildren>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#52525b' }}>
              The topology
            </p>
            <h2 className="text-2xl! sm:text-3xl! lg:text-4xl! font-bold! text-white tracking-tight">
              One box. Five services. Zero clutter.
            </h2>
            <p className="mt-4 leading-relaxed text-sm sm:text-base max-w-md" style={{ color: '#a1a1aa' }}>
              Everything hangs off a single Proxmox host behind a ZTE router,
              reachable anywhere through Tailscale. Each node is isolated,
              monitored, and documented.
            </p>
          </div>
          <div className="w-full max-w-[420px] mx-auto">
            <NetworkTopology nodes={nodes} className="w-full h-auto" />
          </div>
        </SectionReveal>

        {/* Stats grid */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionReveal className="py-8 md:py-10">
            <StatsGrid
              containerCount={nodes.length}
              ramGb={host.ram_gb}
              storageTb={storageTb}
              uptimePct={host.uptime_target_pct}
              cpu={host.cpu}
              ssdGb={host.storage.ssd_gb}
              vaultTb={host.storage.vault_tb}
            />
          </SectionReveal>
        </div>

        {/* Funnel cards */}
        <SectionReveal className="py-10 md:py-14" staggerChildren>
          <div className="mb-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#52525b' }}>
              Start here
            </p>
            <h2 className="text-2xl! sm:text-3xl! lg:text-4xl! font-bold! text-white tracking-tight">
              Everything is written down.
            </h2>
          </div>
          <SectionPreviewCards />
        </SectionReveal>
      </div>

      {/* Live services strip — full bleed */}
      <DocsServiceStrip nodes={nodes} host={host} />

      <SiteFooter host={host} nodes={nodes} />
    </>
  );
}
