import Link from 'next/link';
import type { HostSpec, ServiceNode } from '@/lib/inventory';

const GITHUB = 'https://github.com/Anuja-jayasinghe/JaySync-Lab';

const NAV = [
  { href: '/docs/infrastructure/hardware', label: '/docs'         },
  { href: '/services',                     label: '/services'     },
  { href: '/architecture',                 label: '/architecture' },
  { href: '/docs/changelog',               label: '/changelog'    },
];

interface Props {
  host: HostSpec;
  nodes: ServiceNode[];
}

export function SiteFooter({ host, nodes }: Props) {
  const storageTb = +(host.storage.ssd_gb / 1024 + host.storage.vault_tb).toFixed(1);

  return (
    <footer
      className="font-mono text-[11px]"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">

        {/* left — prompt + specs */}
        <div className="flex items-center gap-1.5 flex-wrap" style={{ color: '#3f3f46' }}>
          <span style={{ color: '#22c55e' }}>jaysync</span>
          <span>@proxmox:~$</span>
          <span className="ml-1" style={{ color: '#52525b' }}>
            {host.model} · PVE {host.proxmox_version} · {nodes.length} containers · {storageTb} TB
          </span>
          <span
            className="inline-block w-[6px] h-[0.8em] align-middle ml-0.5"
            style={{ background: '#3f3f46', animation: 'blink-cursor 1.1s step-end infinite' }}
            aria-hidden="true"
          />
        </div>

        {/* right — nav links */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
            style={{ color: '#52525b' }}
          >
            github&nbsp;↗
          </a>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="transition-colors hover:text-white"
              style={{ color: '#3f3f46' }}
            >
              {n.label}
            </Link>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </footer>
  );
}
