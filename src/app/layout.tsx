import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import { getInventory } from '@/lib/inventory';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jaysync-lab-site.vercel.app').replace(/\/$/, '');

export function generateMetadata() {
  const { host } = getInventory();
  const description = `${host.model} running Proxmox VE ${host.proxmox_version} — homelab infrastructure, documented properly.`;

  return {
    metadataBase: new URL(BASE),
    title: {
      default: 'JaySync Lab',
      template: '%s — JaySync Lab',
    },
    description,
    openGraph: {
      type: 'website',
      siteName: 'JaySync Lab',
      title: 'JaySync Lab',
      description,
      url: BASE,
    },
    twitter: {
      card: 'summary',
      title: 'JaySync Lab',
      description,
    },
    icons: { icon: '/icon.svg' },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="bg-[#080808] text-[#f1f5f9] antialiased min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
