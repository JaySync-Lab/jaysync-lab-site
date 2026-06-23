import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-zone bg-fd-background min-h-screen">
      <DocsLayout
        tree={source.pageTree}
        nav={{
          title: (
            <span className="font-bold tracking-tight">
              Jay<span className="text-fd-muted-foreground">Sync</span> Lab
            </span>
          ),
        }}
        sidebar={{
          footer: (
            <Link
              href="/"
              className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
            >
              ← Back to site
            </Link>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
