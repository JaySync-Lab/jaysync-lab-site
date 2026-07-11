import { getNodes } from '@/lib/inventory';
import { ServiceCard } from '@/components/site/ServiceCard';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionReveal } from '@/components/site/SectionReveal';

export const metadata = { title: 'Services — JaySync-Lab' };

export default function ServicesPage() {
  const nodes = getNodes();
  const activeCount = nodes.filter((n) => !n.template).length;
  const templateCount = nodes.length - activeCount;
  const eyebrow =
    templateCount > 0
      ? `${activeCount} active containers · ${templateCount} template`
      : `${activeCount} active containers`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-16 md:pb-20">
      <PageHeader
        eyebrow={eyebrow}
        title="Services"
        description="Every container and VM running on the Proxmox host, plus the golden template sessions are cloned from. Live services are monitored by Uptime Kuma; each links straight to its documentation."
      />

      <SectionReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerChildren>
        {nodes.map((node) => (
          <ServiceCard key={node.vmid} node={node} />
        ))}
      </SectionReveal>
    </div>
  );
}
