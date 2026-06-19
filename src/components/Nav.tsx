import Link from 'next/link';

const NAV_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/services', label: 'Services' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/changelog', label: 'Changelog' },
];

export function Nav() {
  return (
    <header className="border-b border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-[#38bdf8] font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded"
        >
          jaysync-lab<span className="text-[#475569]">:~$</span>
        </Link>
        <ul className="flex gap-5 overflow-x-auto">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className="text-sm text-[#64748b] hover:text-[#cbd5e1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded px-1"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
