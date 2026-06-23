import type { HostSpec } from '@/lib/inventory';

interface Props {
  host: HostSpec;
}

export function DocsFooter({ host }: Props) {
  return (
    <footer
      className="py-8 px-6"
      style={{
        background: '#080808',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-mono text-xs" style={{ color: '#52525b' }}>
          jaysync-lab · Proxmox VE {host.proxmox_version}
        </p>
        <p className="font-mono text-xs" style={{ color: '#52525b' }}>
          documented properly.
        </p>
      </div>
    </footer>
  );
}
