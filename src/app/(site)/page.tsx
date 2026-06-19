import { getInventory } from '@/lib/inventory';
import { Hero } from '@/components/site/Hero';
import { NodeConstellation } from '@/components/site/NodeConstellation';
import { SectionReveal } from '@/components/site/SectionReveal';
import { SectionPreviewCards } from '@/components/site/SectionPreviewCards';
import { Counter } from '@/components/site/Counter';

export const metadata = {
  title: 'JaySync-Lab — A homelab, documented properly',
};

const STATS = [
  { label: 'Containers', value: 5, decimals: 0, suffix: '', unit: 'LXC + VM on Proxmox' },
  { label: 'RAM installed', value: 16, decimals: 0, suffix: ' GB', unit: 'DDR4 · Intel i5-6500' },
  { label: 'Storage', value: 1.5, decimals: 1, suffix: ' TB', unit: '512GB SSD + 1TB vault' },
  { label: 'Uptime target', value: 99.9, decimals: 1, suffix: '%', unit: 'Watchman monitored' },
];

export default function HomePage() {
  const { nodes } = getInventory();

  return (
    <>
      <Hero containerCount={nodes.length} />

      <div className="max-w-6xl mx-auto px-6 pb-28">
        {/* Constellation + intro */}
        <SectionReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20" staggerChildren>
          <div>
            <p className="font-mono text-[#60a5fa] text-xs uppercase tracking-widest mb-4">
              The topology
            </p>
            <h2 className="text-3xl! sm:text-4xl! font-bold! text-white tracking-tight">
              One box. Five services. Zero clutter.
            </h2>
            <p className="mt-5 text-[#94a3b8] leading-relaxed max-w-md">
              Everything hangs off a single Proxmox host behind a ZTE router,
              reachable anywhere through Tailscale. Each node is isolated,
              monitored, and documented.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <NodeConstellation nodes={nodes} className="w-full h-auto" />
          </div>
        </SectionReveal>

        {/* Stats */}
        <SectionReveal className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-12 border-y border-[#1e293b]" staggerChildren>
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-[#1e293b] bg-[#111726] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#475569] mb-3">
                {s.label}
              </p>
              <p className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-[#60a5fa] to-[#2563eb] bg-clip-text text-transparent">
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs text-[#475569]">{s.unit}</p>
            </div>
          ))}
        </SectionReveal>

        {/* Funnel cards */}
        <SectionReveal className="py-20" staggerChildren>
          <div className="mb-10 text-center">
            <p className="font-mono text-[#60a5fa] text-xs uppercase tracking-widest mb-3">
              Start here
            </p>
            <h2 className="text-3xl! sm:text-4xl! font-bold! text-white tracking-tight">
              Everything is written down.
            </h2>
          </div>
          <SectionPreviewCards />
        </SectionReveal>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#475569]">
            <span className="font-bold text-white">Jay<span className="text-[#60a5fa]">Sync</span> Lab</span>
            {' '}· HP ProDesk 400 G3 · Proxmox VE
          </p>
          <p className="font-mono text-xs text-[#475569]">documented properly.</p>
        </div>
      </footer>
    </>
  );
}
