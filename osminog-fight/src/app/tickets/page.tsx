import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ArenaMap } from '@/components/tickets/ArenaMap';
import { Accordion } from '@/components/ui/Actions';
import { getPastEvents, getUpcoming } from '@/lib/cms';
import { faq } from '@/content/pages';
import { site } from '@/content/site';
import { fmtDate, fmtTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Билеты — схема зала',
  description: 'Билеты на турниры «Осьминог»: схема зала, зоны Ringside, VIP, Lounge, партер и трибуна. Лист ожидания на следующий турнир.',
  alternates: { canonical: '/tickets/' },
};

export default function TicketsPage() {
  const ev = getUpcoming() ?? getPastEvents()[0];
  const ticketFaq = faq.filter((f) => f.group === 'Билеты');
  return (
    <>
      <PageHero
        eyebrow={`Билеты · ${ev.title}`}
        title={['Займи место', <span key="s" className="text-blood glow-blood">у ринга</span>]}
        lead={ev.date ? `${fmtDate(ev.date)} · ${fmtTime(ev.date)} · ${[ev.venue, ev.city].filter(Boolean).join(', ')}` : `${ev.title}: дата и старт продаж — скоро. Выберите места сейчас — напишем первыми.`}
        crumbs={[{ name: 'Билеты', path: '/tickets/' }]}
        compact
      />
      <section className="pb-20">
        <div className="wrap">
          <ArenaMap event={ev} />
        </div>
      </section>
      <section className="section-tight border-t border-line">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-6">
            <h2 className="display t-2">Вопросы о билетах</h2>
            <p className="text-mute">
              Билетный оператор лиги — {site.contacts.ticketSupport.name}.<br />
              Поддержка: <a href={`tel:${site.contacts.ticketSupport.phoneHref}`} className="text-ice underline underline-offset-4">{site.contacts.ticketSupport.phone}</a> ({site.contacts.ticketSupport.hours}),{' '}
              <a href={`mailto:${site.contacts.ticketSupport.email}`} className="text-ice underline underline-offset-4">
                {site.contacts.ticketSupport.email}
              </a>
            </p>
          </div>
          <Accordion items={ticketFaq.map((f) => ({ q: f.q, a: f.a }))} defaultOpen={0} />
        </div>
      </section>
    </>
  );
}
