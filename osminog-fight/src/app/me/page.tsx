import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Cabinet } from '@/components/sections/Cabinet';
import { getEvents, getFighters } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Мой Осьминог — личный кабинет',
  description: 'Карта болельщика, избранные бойцы, голоса, выбранные места и уведомления.',
  alternates: { canonical: '/me/' },
  robots: { index: false },
};

export default function MePage() {
  return (
    <>
      <PageHero eyebrow="Личный кабинет" title={['Мой', <span key="s" className="text-outline-accent">Осьминог</span>]} crumbs={[{ name: 'Мой Осьминог', path: '/me/' }]} compact />
      <section className="pb-24">
        <div className="wrap">
          <Cabinet fighters={getFighters()} events={getEvents()} />
        </div>
      </section>
    </>
  );
}
