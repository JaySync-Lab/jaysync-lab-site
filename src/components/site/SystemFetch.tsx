'use client';

import type { HostSpec, ServiceNode } from '@/lib/inventory';

interface Props {
  host:  HostSpec;
  nodes: ServiceNode[];
}

// "JS" in Unicode block art — split so J (white) and S (grey) can be coloured separately
const J_ART = [
  ' ██╗ ',
  ' ██║ ',
  ' ██║ ',
  ' ██║ ',
  '╚██╔╝',
  ' ╚═╝ ',
];
const S_ART = [
  '███████╗',
  '██╔════╝',
  '███████╗',
  '╚════██║',
  ' ██████║',
  ' ╚═════╝',
];

const NODE_ACCENT: Record<string, string> = {
  'pi-hole':                         '#60a5fa',
  'uptime-kuma':                     '#a855f7',
  'home-assistant':                  '#f59e0b',
  'media-stack':                     '#22c55e',
  'playground-controller':           '#38bdf8',
};

export function SystemFetch({ host, nodes }: Props) {
  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  const info: { label: string; value: string }[] = [
    { label: 'Host',    value: host.model                                                               },
    { label: 'OS',      value: `Proxmox VE ${host.proxmox_version}`                                    },
    { label: 'CPU',     value: host.cpu                                                                 },
    { label: 'Memory',  value: `${host.ram_gb} GB DDR4`                                                },
    { label: 'Storage', value: `${storageTb} TB  (${host.storage.ssd_gb} GiB NVMe + ${host.storage.vault_tb} TiB HDD)` },
    { label: 'Nodes',   value: `${nodes.length} active  (LXC · QEMU-KVM on PVE)`                      },
    { label: 'SLA',     value: `${host.uptime_target_pct}% uptime target`                              },
  ];

  // separator length matches "jaysync@proxmox"
  const SEP = '─'.repeat('jaysync@proxmox'.length);

  return (
    <div className="font-mono text-[12px] sm:text-[13px] flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">

      {/* ── ASCII art ── */}
      <div className="shrink-0 leading-[1.45] select-none" aria-hidden>
        {J_ART.map((jRow, i) => (
          <div key={i}>
            <span className="text-white">{jRow}</span>
            <span style={{ color: '#52525b' }}>{S_ART[i]}</span>
          </div>
        ))}
      </div>

      {/* ── Info panel ── */}
      <div className="flex flex-col min-w-0">

        {/* user@host */}
        <p className="mb-0.5">
          <span className="font-bold text-white">jaysync</span>
          <span style={{ color: '#3f3f46' }}>@</span>
          <span style={{ color: '#52525b' }}>proxmox</span>
        </p>

        {/* separator */}
        <p className="mb-3" style={{ color: '#2a2a2a' }}>{SEP}</p>

        {/* info rows */}
        <div className="flex flex-col gap-[3px]">
          {info.map(({ label, value }) => (
            <p key={label} className="truncate">
              <span className="font-semibold text-white">{label}</span>
              <span style={{ color: '#3f3f46' }}>: </span>
              <span style={{ color: '#71717a' }}>{value}</span>
            </p>
          ))}
        </div>

        {/* node color palette — like terminal colour swatches in neofetch */}
        <div className="flex gap-1.5 mt-4">
          {nodes.map((node) => (
            <span
              key={node.vmid}
              className="inline-block rounded-sm"
              style={{
                width: 22,
                height: 13,
                background: NODE_ACCENT[node.name] ?? '#52525b',
              }}
              title={node.name.replace(/-/g, ' ')}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
