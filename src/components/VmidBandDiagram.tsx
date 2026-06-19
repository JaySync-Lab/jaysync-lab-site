import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
}

const BAND_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'core-network':            { bg: '#0c1a3d', border: '#3b82f6', text: '#93c5fd' },
  'automation-utilities':    { bg: '#1a0f2e', border: '#a855f7', text: '#d8b4fe' },
  'specialized-controllers': { bg: '#2c1500', border: '#f59e0b', text: '#fcd34d' },
  'media-streaming':         { bg: '#031a0f', border: '#22c55e', text: '#86efac' },
  'sandboxes-testing':       { bg: '#0f172a', border: '#475569', text: '#94a3b8' },
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
      <div className="flex flex-col shrink-0 text-[#475569] text-[10px] text-right">
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          return (
            <div key={band.id} style={{ height: (e - s + 1) * PX }} className="flex items-start justify-end pr-1">
              {s}
            </div>
          );
        })}
        <div className="text-[10px] text-[#475569] pr-1">199</div>
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
              className="flex flex-col justify-center gap-0.5 pl-3 border-b border-[#1e293b]/50 last:border-0 py-1"
              style={{ minHeight: Math.max(height, 72) }}
            >
              <p className="font-semibold text-xs" style={{ color: c.text }}>{band.label}</p>
              <p className="text-[10px]" style={{ color: c.border }}>
                VMIDs {band.range} · {band.isolation}
              </p>
              <p className="text-[10px] text-[#475569]">{band.purpose}</p>
              {bandNodes.map((node) => (
                <p key={node.vmid} className="text-[10px]" style={{ color: c.border }}>
                  ▸ CT {node.vmid} — {node.name}{' '}
                  <span className="text-[#475569]">({node.ip})</span>
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
