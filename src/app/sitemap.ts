import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jaysync-lab-site.vercel.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/services`,      lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/architecture`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/docs`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
  ];

  const docRoutes: MetadataRoute.Sitemap = source.generateParams()
    .filter((p: { slug?: string[] }) => p.slug && p.slug.length > 0)
    .map((p: { slug: string[] }) => ({
      url: `${BASE}/docs/${p.slug.join('/')}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...docRoutes];
}
