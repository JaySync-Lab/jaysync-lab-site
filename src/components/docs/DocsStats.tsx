import type { HostSpec } from '@/lib/inventory';

interface Props {
  host: HostSpec;
  containerCount: number;
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#52525b' }}>
        {label}
      </p>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs" style={{ color: '#a1a1aa' }}>{unit}</p>
    </div>
  );
}

export function DocsStats({ host, containerCount }: Props) {
  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  const stats = [
    { label: 'Containers', value: String(containerCount), unit: 'LXC + VM on Proxmox' },
    { label: 'RAM Installed', value: `${host.ram_gb} GB`, unit: `DDR4 · ${host.cpu}` },
    {
      label: 'Storage',
      value: `${storageTb} TB`,
      unit: `${host.storage.ssd_gb}GB SSD + ${host.storage.vault_tb}TB vault`,
    },
    { label: 'Uptime Target', value: `${host.uptime_target_pct}%`, unit: 'Watchman monitored' },
  ];

  return (
    <section
      className="py-12 px-6"
      style={{
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} unit={s.unit} />
        ))}
      </div>
    </section>
  );
}
