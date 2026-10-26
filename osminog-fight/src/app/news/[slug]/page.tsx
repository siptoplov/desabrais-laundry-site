import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard } from '@/components/ui/Cards';
import { ShareButton } from '@/components/ui/Actions';
import { Btn } from '@/components/ui/Btn';
import { SplitTitle } from '@/components/ui/Primitives';
import { getEvent, getNews, getNewsItem } from '@/lib/cms';
import { asset, posterSrcSet } from '@/lib/asset';
import { fmtDate } from '@/lib/format';
import { breadcrumbs, JsonLd, newsJsonLd } from '@/lib/seo';
import { site } from '@/content/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return getNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = getNewsItem(slug);
  if (!n) return {};
  return {
    title: n.title,
    description: n.lead,
    alternates: { canonical: `/news/${n.slug}/` },
    openGraph: { type: 'article', publishedTime: n.date, ...(n.image ? { images: [{ url: `${n.image}-1080.webp`, width: 1080, height: 1350 }] } : {}) },
  };
}

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNewsItem(slug);
  if (!n) notFound();
  const ev = n.event ? getEvent(n.event) : undefined;
  const more = getNews()
    .filter((x) => x.slug !== n.slug)
    .slice(0, 3);

  return (
    <article>
      <JsonLd data={[newsJsonLd(n), breadcrumbs([{ name: 'Новости', path: '/news/' }, { name: n.title, path: `/news/${n.slug}/` }])]} />
      <header className="relative overflow-hidden pt-[calc(var(--header-h)+48px)]">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 70% at 20% 0%, var(--deep-2), transparent 70%)' }} />
          <div className="godrays" />
        </div>
        <div className="wrap grid gap-12 pb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="flex flex-col gap-6">
            <nav aria-label="Хлебные крошки" className="label">
              <Link href="/" className="hover:text-ice">
                Главная
              </Link>{' '}
              /{' '}
              <Link href="/news/" className="hover:text-ice">
                Новости
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="chip chip-cyan">{n.tag}</span>
              <time dateTime={n.date} className="label-mute">
                {fmtDate(n.date)}
              </time>
            </div>
            <SplitTitle as="h1" lines={[n.title]} className="display t-2" instant />
            <p className="lead max-w-2xl">{n.lead}</p>
          </div>
          {n.image && <img src={asset(`${n.image}-560.webp`)} srcSet={posterSrcSet(n.image)} sizes="(min-width:1024px) 40vw, 90vw" alt="" width={560} height={700} className="w-full max-w-md justify-self-end rounded-[var(--radius)] border border-line" fetchPriority="high" />}
        </div>
      </header>
      <div className="wrap grid gap-12 pb-24 lg:grid-cols-[1.3fr_1fr]">
        <div className="prose-osm max-w-2xl">
          {n.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {n.source && (
            <p className="!text-[14px] !text-faint">
              Источник:{' '}
              <a href={n.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ice">
                {n.source.label}
              </a>
            </p>
          )}
          <div className="mt-10">
            <ShareButton title={n.title} path={`/news/${n.slug}/`} />
          </div>
        </div>
        {ev && (
          <aside className="panel flex flex-col gap-4 self-start p-6">
            <p className="eyebrow">Турнир</p>
            <p className="display t-4">
              {ev.title} {ev.collab}
            </p>
            <p className="text-mute">{ev.tagline}</p>
            <Btn href={`/events/${ev.slug}/`} variant="ghost">
              Страница турнира
            </Btn>
          </aside>
        )}
      </div>
      <section className="section-tight border-t border-line">
        <div className="wrap">
          <h2 className="display t-3 mb-8">Ещё новости</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {more.map((m) => (
              <NewsCard key={m.slug} n={m} />
            ))}
          </div>
          <p className="mt-10 text-[13px] text-faint">
            Полные публикации и анонсы — в Instagram{' '}
            <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ice">
              {site.socials.instagramHandle}
            </a>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
