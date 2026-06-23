import { getInventory } from '@/lib/inventory';
import { DocsNav } from '@/components/docs/DocsNav';
import { DocsHero } from '@/components/docs/DocsHero';
import { DocsStats } from '@/components/docs/DocsStats';
import { DocsServiceStrip } from '@/components/docs/DocsServiceStrip';
import { DocsFooter } from '@/components/docs/DocsFooter';

export const metadata = {
  title: 'Documentation — JaySync-Lab',
  description: 'Everything documented. Nothing guessed.',
};

export default function DocsLandingPage() {
  const { host, nodes } = getInventory();

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <DocsNav />
      <main>
        <DocsHero />
        <DocsStats host={host} containerCount={nodes.length} />
        <DocsServiceStrip nodes={nodes} />
      </main>
      <DocsFooter host={host} />
    </div>
  );
}
