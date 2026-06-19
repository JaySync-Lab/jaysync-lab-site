import { getNodes } from '@/lib/inventory';
import { ServiceCard } from '@/components/ServiceCard';

export const metadata = { title: 'Services — JaySync-Lab' };

export default function ServicesPage() {
  const nodes = getNodes();

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">
          {nodes.length} active containers
        </p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Services</h1>
        <p className="text-[#64748b] mt-3 max-w-lg text-sm leading-relaxed">
          All containers and VMs running on the Proxmox host. Each is monitored
          by Uptime Kuma and has dedicated documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <ServiceCard key={node.vmid} node={node} />
        ))}
      </div>
    </div>
  );
}
