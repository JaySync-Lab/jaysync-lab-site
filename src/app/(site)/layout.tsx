import type { ReactNode } from 'react';
import { Nav } from '@/components/site/Nav';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#080808] min-h-screen">
      <Nav />
      <main>{children}</main>
    </div>
  );
}
