import type { ReactNode } from 'react';
import { Nav } from '@/components/site/Nav';
import { SplashScreen } from '@/components/site/SplashScreen';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#080808] min-h-screen">
      <SplashScreen />
      <Nav />
      <main>{children}</main>
    </div>
  );
}
