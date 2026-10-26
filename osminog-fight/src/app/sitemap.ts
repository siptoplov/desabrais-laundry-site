import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getEvents, getFighters, getNews } from '@/lib/cms';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const now = new Date();
  const pages = ['/', '/events/', '/fight-card/', '/fighters/', '/rankings/', '/tickets/', '/watch/', '/results/', '/news/', '/media/', '/about/', '/rubaha-paren/', '/join/', '/shop/', '/faq/', '/contacts/', '/legal/privacy/', '/legal/terms/'];
  return [
    ...pages.map((p) => ({ url: u(p), lastModified: now, changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...getEvents().map((e) => ({ url: u(`/events/${e.slug}/`), lastModified: now, priority: e.status === 'upcoming' ? 0.9 : 0.6 })),
    ...getFighters().map((f) => ({ url: u(`/fighters/${f.slug}/`), lastModified: now, priority: f.featured ? 0.7 : 0.5 })),
    ...getNews().map((n) => ({ url: u(`/news/${n.slug}/`), lastModified: new Date(n.date), priority: 0.5 })),
  ];
}
