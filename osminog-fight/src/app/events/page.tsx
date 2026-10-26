import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { EventCard, TypoPoster } from '@/components/ui/Cards';
import { Countdown } from '@/components/ui/Countdown';
import { Btn } from '@/components/ui/Btn';
import { Subscribe } from '@/components/forms/Subscribe';
import { getEvents, getPastEvents, getUpcoming } from '@/lib/cms';
import { fmtDate, fmtTime } from '@/lib/format';
import { disciplines } from '@/content/site';

export const metadata: Metadata = {
  title: 'Турниры — афиша и архив',
  description: 'Афиша турниров «Осьминог» и архив всех выпусков: даты, площадки, карды, видео боёв.',
  alternates: { canonical: '/events/' },
};

export default function EventsPage() {
  const next = getUpcoming();
  const past = getPastEvents();
  const all = getEvents();
  const years = Array.from(new Set(all.filter((e) => e.date).map((e) => e.date!.slice(0, 4))));

  return (
    <>
      <PageHero eyebrow="Афиша · Архив" title={['Турниры', <span key="s" className="text-outline">лиги</span>]} lead="Каждый выпуск — кино, снятое за один вечер. Здесь — следующий и все, что уже случились." crumbs={[{ name: 'Турниры', path: '/events/' }]} />

      {next && (
        <section className="relative pb-20" aria-labelledby="up-title">
          <div className="wrap">
            <div className="grid overflow-hidden rounded-[var(--radius)] border border-blood/40 bg-abyss-2 lg:grid-cols-[minmax(0,420px)_1fr]" style={{ boxShadow: '0 40px 120px -60px rgba(255,43,58,.6)' }}>
              <TypoPoster e={next} className="aspect-[4/5] w-full" />
              <div className="flex flex-col justify-between gap-10 p-6 md:p-12">
                <div className="flex flex-col gap-5">
                  <span className="chip chip-blood self-start">Следующий турнир</span>
                  <h2 id="up-title" className="display t-1">
                    {next.title}
                  </h2>
                  <p className="lead">{next.tagline}</p>
                  <p className="mono text-[13px] uppercase tracking-[0.16em] text-mute">
                    {next.date ? `${fmtDate(next.date)} · ${fmtTime(next.date)}` : 'Дата и площадка — скоро'} · {next.city}
                  </p>
                </div>
                <Countdown date={next.date} since={past[0]?.date ?? undefined} size="md" />
                <div className="flex flex-col gap-4">
                  <p className="text-mute">Узнать дату и старт продаж первыми:</p>
                  <Subscribe id="events-sub" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Btn href={`/events/${next.slug}/`} variant="ghost">
                    Страница турнира
                  </Btn>
                  <Btn href="/tickets/" impact>
                    Схема зала
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-tight relative" aria-labelledby="arch-title">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 id="arch-title" className="display t-2">
              Архив
            </h2>
            <p className="mono text-[12px] uppercase tracking-[0.18em] text-mute">{past.length} турниров в базе</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e, i) => (
              <div key={e.slug} data-reveal="" style={{ ['--d' as string]: `${(i % 3) * 0.07}s` }}>
                <EventCard e={e} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Календарь */}
      <section className="section-tight relative" aria-labelledby="cal-title">
        <div className="wrap">
          <h2 id="cal-title" className="display t-2 mb-10">
            Календарь
          </h2>
          <div className="flex flex-col">
            {years.map((y) => (
              <div key={y} className="grid gap-4 border-t border-line py-8 md:grid-cols-[200px_1fr]">
                <p className="display-upright text-outline text-[72px] leading-none">{y}</p>
                <ul className="flex flex-col">
                  {all
                    .filter((e) => e.date?.startsWith(y))
                    .map((e) => (
                      <li key={e.slug}>
                        <Link href={`/events/${e.slug}/`} className="group grid grid-cols-[110px_1fr] items-baseline gap-4 border-b border-line py-4 last:border-0 md:grid-cols-[140px_1fr_auto]">
                          <span className="mono text-[13px] text-mute">{fmtDate(e.date!, { day: '2-digit', month: 'short' })}</span>
                          <span className="display-upright text-[28px] leading-none transition-colors group-hover:text-accent">
                            {e.title} {e.collab && <span className="text-accent">{e.collab}</span>}
                          </span>
                          <span className="mono col-span-2 text-[11px] uppercase tracking-[0.14em] text-faint md:col-span-1">
                            {[e.venue, e.city].filter(Boolean).join(' · ')} {e.disciplines && `· ${e.disciplines.map((d) => disciplines[d].short).join(', ')}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-line py-8">
              <p className="text-mute">
                Серия «Осьминог» идёт с 2009 года. В базе — выпуски с подтверждёнными данными; архив пополняется.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
