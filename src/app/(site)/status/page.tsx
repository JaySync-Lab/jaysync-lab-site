import { getInventory, isLiveNode } from '@/lib/inventory';
import { PageHeader } from '@/components/site/PageHeader';
import { StatusPageClient } from '@/components/site/StatusPageClient';
import { type ServiceNode } from '@/lib/inventory';

export default function StatusPage() {
  const { nodes } = getInventory();
  const liveNodes: ServiceNode[] = nodes.filter(isLiveNode);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-16 md:pb-20">
      <PageHeader
        eyebrow="Status"
        title="System status"
        description="Live status for every service in the lab, pulled directly from Uptime Kuma."
      />

      <StatusPageClient liveNodes={liveNodes} />
    </div>
  );
}
