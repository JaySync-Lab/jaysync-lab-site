import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
}

// Black/grey/white — each band has a distinct lightness tier so they're still distinguishable
const BAND_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'core-network':            { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.40)', text: '#ffffff'  },
  'automation-utilities':    { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.25)', text: '#d4d4d8'  },
  'specialized-controllers': { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.18)', text: '#a1a1aa'  },
  'media-streaming':         { bg: 'rgba(255,255,255,0.015)',border: 'rgba(255,255,255,0.12)', text: '#71717a'  },
  'sandboxes-testing':       { bg: 'rgba(255,255,255,0.01)', border: 'rgba(255,255,255,0.07)', text: '#52525b'  },
};

function parseRange(r: string): [number, number] {
  const [s, e] = r.split('-').map(Number);
  return [s, e];
}

export function VmidBandDiagram({ nodes, bands }: Props) {
  const PX = 4;

  return (
    <div className="flex gap-6 font-mono text-xs min-w-[480px]">
      {/* VMID axis */}
      <div className="flex flex-col shrink-0 text-[10px] text-right" style={{ color: '#3f3f46' }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          return (
            <div key={band.id} style={{ height: (e - s + 1) * PX }} className="flex items-start justify-end pr-1">
              {s}
            </div>
          );
        })}
        <div className="text-[10px] pr-1" style={{ color: '#3f3f46' }}>199</div>
      </div>

      {/* Band blocks with service slots */}
      <div className="flex flex-col shrink-0" style={{ width: '40px' }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const c = BAND_COLORS[band.id] ?? BAND_COLORS['sandboxes-testing'];
          const bandNodes = nodes.filter((n) => n.band === band.id);
          return (
            <div
              key={band.id}
              className="relative"
              style={{
                height: (e - s + 1) * PX,
                backgroundColor: c.bg,
                borderLeft: `3px solid ${c.border}`,
              }}
            >
              {bandNodes.map((node) => (
                <div
                  key={node.vmid}
                  className="absolute left-0 right-0"
                  style={{
                    top: (node.vmid - s) * PX,
                    height: PX,
                    backgroundColor: c.border,
                    opacity: 0.9,
                  }}
                  title={`CT ${node.vmid}: ${node.name}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex flex-col flex-1">
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const height = (e - s + 1) * PX;
          const c = BAND_COLORS[band.id] ?? BAND_COLORS['sandboxes-testing'];
          const bandNodes = nodes.filter((n) => n.band === band.id);
          return (
            <div
              key={band.id}
              className="flex flex-col justify-center gap-0.5 pl-3 py-1 last:border-0"
              style={{
                minHeight: Math.max(height, 72),
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <p className="font-semibold text-xs" style={{ color: c.text }}>{band.label}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                VMIDs {band.range} · {band.isolation}
              </p>
              <p className="text-[10px]" style={{ color: '#3f3f46' }}>{band.purpose}</p>
              {bandNodes.map((node) => (
                <p key={node.vmid} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  ▸ CT {node.vmid} — {node.name}{' '}
                  <span style={{ color: '#3f3f46' }}>({node.ip})</span>
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
