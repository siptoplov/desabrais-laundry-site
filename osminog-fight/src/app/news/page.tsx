import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { NewsCard } from '@/components/ui/Cards';
import { getNews } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Новости лиги',
  description: 'Анонсы боёв, замены, итоги и новости лиги «Осьминог».',
  alternates: { canonical: '/news/' },
};

export default function NewsPage() {
  const news = getNews();
  return (
    <>
      <PageHero eyebrow="Новости" title={['Что всплыло', <span key="s" className="text-outline">на поверхность</span>]} lead="Анонсы боёв, замены и итоги. Коротко и по делу." crumbs={[{ name: 'Новости', path: '/news/' }]} compact />
      <section className="pb-24">
        <div className="wrap grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {news.map((n, i) => (
            <NewsCard key={n.slug} n={n} featured={i === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
