import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: 'JaySync-Lab',
  description: 'HP ProDesk 400 G3 running Proxmox VE — homelab infrastructure documentation',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="bg-[#0a0f1f] text-[#f1f5f9] antialiased min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
