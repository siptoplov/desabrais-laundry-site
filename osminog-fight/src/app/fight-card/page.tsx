import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { FightCardHub } from '@/components/sections/FightCardHub';
import { getEvents } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Fight Card — интерактивный кард',
  description: 'Все бои турниров «Осьминог»: статистика бойцов, видео и голосование за любимца зрителей.',
  alternates: { canonical: '/fight-card/' },
};

export default function FightCardPage() {
  const events = getEvents().filter((e) => e.bouts.length > 0);
  return (
    <>
      <PageHero
        eyebrow="Fight Card"
        title={['Кард', <span key="s" className="text-outline-accent">вечера</span>]}
        lead="Раскройте бой — статистика, разбор и видео. Отдайте голос за любимца зрителей."
        crumbs={[{ name: 'Fight Card', path: '/fight-card/' }]}
        compact
      />
      <section className="pb-24">
        <div className="wrap">
          <FightCardHub events={events} />
        </div>
      </section>
    </>
  );
}
