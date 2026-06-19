import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
}

const BAND_COLORS: Record<string, string> = {
  'core-network':            '#3b82f6',
  'automation-utilities':    '#a855f7',
  'specialized-controllers': '#f59e0b',
  'media-streaming':         '#22c55e',
  'sandboxes-testing':       '#475569',
};

function parseRange(range: string): [number, number] {
  const [s, e] = range.split('-').map(Number);
  return [s, e];
}

export function VmidRack({ nodes, bands }: Props) {
  const SCALE = 3;
  const HEIGHT = 100 * SCALE;

  return (
    <div className="flex gap-4 items-start overflow-x-auto pb-2">
      {/* VMID axis labels */}
      <div className="relative shrink-0 font-mono text-[9px] text-[#475569] text-right" style={{ width: '24px', height: HEIGHT }}>
        {[100, 120, 140, 160, 180, 199].map((v) => (
          <span key={v} className="absolute right-0" style={{ top: (v - 100) * SCALE - 5 }}>
            {v}
          </span>
        ))}
      </div>

      {/* Color column */}
      <div className="relative shrink-0" style={{ width: '20px', height: HEIGHT }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          return (
            <div
              key={band.id}
              className="absolute w-full rounded-sm opacity-25"
              style={{
                top: (s - 100) * SCALE,
                height: (e - s + 1) * SCALE,
                backgroundColor: BAND_COLORS[band.id],
              }}
            />
          );
        })}
        {nodes.map((node) => (
          <div
            key={node.vmid}
            className="absolute w-full rounded-sm"
            style={{
              top: (node.vmid - 100) * SCALE,
              height: SCALE + 2,
              backgroundColor: BAND_COLORS[node.band] ?? '#475569',
            }}
            title={`CT ${node.vmid}: ${node.name}`}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="relative shrink-0 font-mono" style={{ height: HEIGHT, minWidth: '240px' }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const mid = ((s + e) / 2 - 100) * SCALE;
          return (
            <span
              key={band.id}
              className="absolute text-[9px] leading-none opacity-50"
              style={{ top: mid - 4, color: BAND_COLORS[band.id] ?? '#475569' }}
            >
              {band.label}
            </span>
          );
        })}
        {nodes.map((node) => (
          <span
            key={node.vmid}
            className="absolute text-[9px] leading-none text-[#94a3b8]"
            style={{ top: (node.vmid - 100) * SCALE - 1 }}
          >
            <span style={{ color: BAND_COLORS[node.band] }}>▸</span>{' '}
            {node.name}{' '}
            <span className="text-[#475569]">{node.ip}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
