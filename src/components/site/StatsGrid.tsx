'use client';

import { Counter } from './Counter';

interface StatRow {
  label: string;
  value: number;
  decimals: number;
  suffix: string;
  unit: string;
}

interface Props {
  containerCount: number;
  ramGb: number;
  storageTb: number;
  uptimePct: number;
  cpu: string;
  ssdGb: number;
  vaultTb: number;
}

export function StatsGrid({ containerCount, ramGb, storageTb, uptimePct, cpu, ssdGb, vaultTb }: Props) {
  const rows: StatRow[] = [
    { label: 'Containers',    value: containerCount, decimals: 0, suffix: '',    unit: 'LXC + VM on Proxmox'                         },
    { label: 'RAM installed', value: ramGb,          decimals: 0, suffix: ' GB', unit: `DDR4 · ${cpu}`                               },
    { label: 'Storage',       value: storageTb,      decimals: 1, suffix: ' TB', unit: `${ssdGb}GB SSD + ${vaultTb}TB vault`         },
    { label: 'Uptime target', value: uptimePct,      decimals: 1, suffix: '%',   unit: 'Watchman monitored'                          },
  ];

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4"
        >
          {/* left: label */}
          <span
            className="font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: '#3f3f46' }}
          >
            {row.label}
          </span>

          {/* right: value + unit */}
          <div className="flex items-baseline gap-3 tabular-nums">
            <span className="text-xl font-semibold tracking-tight text-white">
              <Counter value={row.value} decimals={row.decimals} suffix={row.suffix} durationMs={1200} />
            </span>
            <span
              className="font-mono text-[11px] hidden sm:inline"
              style={{ color: '#3f3f46' }}
            >
              {row.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
