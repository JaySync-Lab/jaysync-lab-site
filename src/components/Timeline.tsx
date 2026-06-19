import type { ChangelogEntry } from '@/lib/changelog';

interface Props {
  entries: ChangelogEntry[];
}

export function Timeline({ entries }: Props) {
  return (
    <ol className="relative border-l-2 border-[#1e293b] ml-3">
      {entries.map((entry, i) => (
        <li key={entry.label} className="mb-12 ml-8 last:mb-0">
          {/* Dot */}
          <span
            className="absolute flex items-center justify-center w-3 h-3 rounded-full -left-[7px]"
            style={{
              backgroundColor: i === 0 ? '#38bdf8' : '#1e293b',
              border: `2px solid ${i === 0 ? '#38bdf8' : '#334155'}`,
              top: '4px',
            }}
          />

          {/* Date label */}
          <time className="block font-mono text-[10px] text-[#475569] uppercase tracking-wider mb-3">
            {entry.label}
          </time>

          {/* Bullet items */}
          <ul className="space-y-2">
            {entry.entries.map((item, j) => (
              <li key={j} className="text-[#cbd5e1] text-sm leading-relaxed flex gap-2 items-start">
                <span className="text-[#38bdf8] shrink-0 mt-0.5 text-xs">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
