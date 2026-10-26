import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { FighterCatalog } from '@/components/sections/FighterCatalog';
import { getFighters } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Бойцы — ростер лиги',
  description: 'Все бойцы лиги «Осьминог»: рекорды, рост, вес, титулы. Фильтры по дисциплине, стране, весу и статусу.',
  alternates: { canonical: '/fighters/' },
};

export default function FightersPage() {
  const fighters = getFighters();
  return (
    <>
      <PageHero eyebrow="Ростер" title={['Бойцы', <span key="s" className="text-outline-accent">из глубины</span>]} lead="Чемпионы мира, ветераны, проспекты. Ищите по имени, фильтруйте по стилю, весу и стране." crumbs={[{ name: 'Бойцы', path: '/fighters/' }]} compact />
      <section className="pb-24">
        <div className="wrap">
          <FighterCatalog fighters={fighters} />
        </div>
      </section>
    </>
  );
}
