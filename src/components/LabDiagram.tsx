import type { ServiceNode } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
}

export function LabDiagram({ nodes }: Props) {
  const svgH = 60 + nodes.length * 52;

  return (
    <svg
      viewBox={`0 0 340 ${svgH}`}
      className="w-full max-w-sm"
      aria-label="JaySync-Lab network topology: ZTE Router connects to Proxmox host, which runs containers"
      role="img"
    >
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
        </marker>
      </defs>

      {/* Router */}
      <rect x="8" y={svgH / 2 - 22} width="82" height="44" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <text x="49" y={svgH / 2 - 6} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">ZTE Router</text>
      <text x="49" y={svgH / 2 + 8} textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">192.168.1.1</text>

      {/* Router → Proxmox */}
      <line x1="90" y1={svgH / 2} x2="138" y2={svgH / 2} stroke="#334155" strokeWidth="1.5" markerEnd="url(#arr)" />

      {/* Proxmox */}
      <rect x="140" y={svgH / 2 - 28} width="82" height="56" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="181" y={svgH / 2 - 10} textAnchor="middle" fill="#93c5fd" fontSize="8" fontFamily="monospace" fontWeight="600">Proxmox VE</text>
      <text x="181" y={svgH / 2 + 3} textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">192.168.1.100</text>
      <text x="181" y={svgH / 2 + 15} textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">i5-6500 · 16GB</text>

      {/* Proxmox → Services */}
      {nodes.map((node, i) => {
        const ty = 30 + i * 52;
        return (
          <line
            key={node.vmid}
            x1="222"
            y1={svgH / 2}
            x2="256"
            y2={ty + 14}
            stroke="#1e293b"
            strokeWidth="1"
            markerEnd="url(#arr)"
          />
        );
      })}

      {/* Service nodes */}
      {nodes.map((node, i) => {
        const ty = 8 + i * 52;
        return (
          <g key={node.vmid}>
            <rect x="256" y={ty} width="76" height="30" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="294" y={ty + 12} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
              {node.name}
            </text>
            <text x="294" y={ty + 23} textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">
              {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
