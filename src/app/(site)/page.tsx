import { getInventory, isLiveNode } from '@/lib/inventory';
import { DocsHero } from '@/components/docs/DocsHero';
import { NetworkTopology } from '@/components/site/NetworkTopology';
import { SectionReveal } from '@/components/site/SectionReveal';
import { NetworkNav } from '@/components/site/NetworkNav';
import { DocsServiceStrip } from '@/components/docs/DocsServiceStrip';
import { SystemFetch } from '@/components/site/SystemFetch';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SystemStatusBadge } from '@/components/site/SystemStatusBadge';

export const metadata = {
  title: 'JaySync-Lab — A homelab, documented properly',
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export default function HomePage() {
  const { nodes, host, vmid_bands } = getInventory();
  const liveCount = nodes.filter(isLiveNode).length;
  const liveCountWord = ONES[liveCount] ?? String(liveCount);

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
              One box. {liveCountWord.charAt(0).toUpperCase() + liveCountWord.slice(1)} services. Zero clutter.
            </h2>
            <p className="mt-4 leading-relaxed text-sm sm:text-base max-w-md" style={{ color: '#a1a1aa' }}>
              Everything hangs off a single Proxmox host behind a ZTE router,
              reachable anywhere through Tailscale. Each node is isolated,
              monitored, and documented.
            </p>
            <div className="mt-4">
              <SystemStatusBadge />
            </div>
          </div>
          <div className="w-full">
            <NetworkTopology nodes={nodes} bands={vmid_bands} className="w-full h-auto" />
          </div>
        </SectionReveal>

        {/* System fetch */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionReveal className="py-8 md:py-10">
            <SystemFetch host={host} nodes={nodes} />
          </SectionReveal>
        </div>

        {/* Network nav */}
        <SectionReveal className="py-10 md:py-14">
          <div className="mb-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
              Start here
            </p>
            <p className="font-mono text-sm" style={{ color: '#3f3f46' }}>
              Every section is a node on the lab network — pick a route off the gateway.
            </p>
          </div>
          <div className="flex justify-center">
            <NetworkNav />
          </div>
        </SectionReveal>
      </div>

      {/* Live services strip — full bleed */}
      <DocsServiceStrip nodes={nodes} host={host} />

      <SiteFooter host={host} nodes={nodes} />
    </>
  );
}
