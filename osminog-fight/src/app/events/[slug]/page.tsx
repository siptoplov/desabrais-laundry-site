import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Link from '@/components/ui/Link';
import { notFound } from 'next/navigation';
import { BoutRow } from '@/components/ui/BoutRow';
import { Btn } from '@/components/ui/Btn';
import { TypoPoster } from '@/components/ui/Cards';
import { Countdown } from '@/components/ui/Countdown';
import { Gallery } from '@/components/ui/Gallery';
import { VideoCard } from '@/components/ui/VideoCard';
import { AddToCalendar, ShareButton } from '@/components/ui/Actions';
import { Stat, SplitTitle } from '@/components/ui/Primitives';
import { FollowLinks } from '@/components/ui/FollowLinks';
import { PartnersStrip } from '@/components/ui/PartnersStrip';
import { getEvent, getEvents, getPastEvents, getVideos, positionRank } from '@/lib/cms';
import { asset, posterSrcSet } from '@/lib/asset';
import { fmtDate, fmtMoney, fmtTime, fmtWeekday } from '@/lib/format';
import { breadcrumbs, eventJsonLd, JsonLd } from '@/lib/seo';
import { disciplines, site, venueGeo } from '@/content/site';
import type { Bout } from '@/content/types';

export const dynamicParams = false;
export function generateStaticParams() {
  return getEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) return {};
  const when = e.date ? fmtDate(e.date) : 'дата скоро';
  return {
    title: `${e.title}${e.collab ? ' ' + e.collab : ''} — ${when}`,
    description: `${e.tagline}. ${[e.venue, e.city].filter(Boolean).join(', ')}. Кард, расписание, билеты, видео боёв.`,
    alternates: { canonical: `/events/${e.slug}/` },
    // карточка из scripts/og.mjs, если сгенерирована; иначе — общая картинка лиги
    openGraph: { images: [existsSync(join(process.cwd(), 'public/og/events', `${e.slug}.jpg`)) ? { url: `/og/events/${e.slug}.jpg`, width: 1200, height: 630 } : { url: '/og/default.jpg', width: 1200, height: 630 }] },
  };
}

const groups: { key: string; title: string; match: (b: Bout) => boolean }[] = [
  { key: 'main', title: 'Главный бой', match: (b) => b.position === 'main' || b.position === 'title' },
  { key: 'co', title: 'Со-главный бой', match: (b) => b.position === 'co-main' },
  { key: 'card', title: 'Главный кард', match: (b) => b.position === 'main-card' || b.position === 'special' },
  { key: 'under', title: 'Андеркард', match: (b) => b.position === 'undercard' },
];

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) notFound();
  const vids = getVideos().filter((v) => v.event === e.slug);
  const fightVids = vids.filter((v) => v.kind === 'fight');
  const extraVids = vids.filter((v) => v.kind !== 'fight');
  const lastPast = getPastEvents()[0];
  const upcoming = e.status === 'upcoming';
  const year = e.date ? Number(e.date.slice(0, 4)) : 0;
  const kinds = e.disciplines ?? Array.from(new Set(e.bouts.map((b) => b.discipline)));
  const sections = [
    e.bouts.length && { id: 'card', label: 'Кард' },
    e.schedule && { id: 'schedule', label: 'Расписание' },
    { id: 'venue', label: 'Арена' },
    { id: 'tickets', label: 'Билеты' },
    { id: 'watch', label: 'Эфир' },
    e.posters && { id: 'press', label: 'Пресс' },
  ].filter(Boolean) as { id: string; label: string }[];
  const mapQuery = encodeURIComponent([e.venue, e.city].filter(Boolean).join(', '));
  const geo = e.venue ? venueGeo[e.venue] : undefined;

  return (
    <>
      <JsonLd data={[eventJsonLd(e), breadcrumbs([{ name: 'Турниры', path: '/events/' }, { name: e.title, path: `/events/${e.slug}/` }])]} />

      {/* ── Hero события ── */}
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+32px)]">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          {e.poster && <img src={asset(`${e.poster}-560.webp`)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />}
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/40 via-abyss/80 to-abyss" />
          <div className="godrays" />
        </div>
        <div className="wrap grid gap-10 pb-16 lg:grid-cols-[1fr_minmax(0,440px)] lg:items-end">
          <div className="flex flex-col gap-6">
            <nav aria-label="Хлебные крошки" className="label">
              <Link href="/" className="hover:text-ice">
                Главная
              </Link>{' '}
              /{' '}
              <Link href="/events/" className="hover:text-ice">
                Турниры
              </Link>{' '}
              / <span className="text-mute">{e.title}</span>
            </nav>
            <span className={`chip self-start ${upcoming ? 'chip-blood' : ''}`}>{upcoming ? 'Скоро' : 'Турнир состоялся'}</span>
            <SplitTitle as="h1" lines={[e.title, ...(e.collab ? [<span key="c" className="text-accent">{e.collab}</span>] : [])]} className="display t-1" instant />
            <p className="lead">{e.tagline}</p>
            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 md:grid-cols-4">
              <div>
                <dt className="label">Дата</dt>
                <dd className="display-upright text-[26px] leading-tight">{e.date ? fmtDate(e.date, { day: 'numeric', month: 'long' }) : 'Скоро'}</dd>
                {e.date && <dd className="text-[13px] text-mute">{fmtWeekday(e.date)}{fmtTime(e.date) ? ` · ${fmtTime(e.date)}` : ''}</dd>}
              </div>
              <div>
                <dt className="label">Место</dt>
                <dd className="display-upright text-[26px] leading-tight">{e.venue ?? (upcoming ? 'Объявим' : e.city)}</dd>
                {e.venue && <dd className="text-[13px] text-mute">{e.city}</dd>}
              </div>
              {kinds.length > 0 && (
                <div>
                  <dt className="label">Дисциплины</dt>
                  <dd className="text-[15px] leading-snug">{kinds.map((d) => disciplines[d].label).join(', ')}</dd>
                </div>
              )}
              {(e.age || year >= 2024) && (
                <div>
                  <dt className="label">Возраст</dt>
                  <dd className="display-upright text-[26px] leading-tight">{e.age ?? '6+'}</dd>
                </div>
              )}
            </dl>
            <div className="flex flex-wrap gap-4">
              {upcoming ? (
                <Btn href="/tickets/" impact>
                  Билеты
                </Btn>
              ) : (
                fightVids.length > 0 && (
                  <Btn href="#watch" icon="play">
                    Смотреть бои
                  </Btn>
                )
              )}
              <ShareButton title={`${e.title} — ${site.name}`} path={`/events/${e.slug}/`} />
            </div>
          </div>
          <div className="relative">
            {e.poster ? (
              <img src={asset(`${e.poster}-560.webp`)} srcSet={posterSrcSet(e.poster)} sizes="440px" alt={`Постер ${e.title}`} width={560} height={700} className="w-full rounded-[var(--radius)] border border-line shadow-[0_50px_120px_-40px_rgba(236,238,241,.35)]" fetchPriority="high" />
            ) : (
              <TypoPoster e={e} className="aspect-[4/5] w-full rounded-[var(--radius)] border border-line" />
            )}
          </div>
        </div>
      </section>

      {/* ── Подменю ── */}
      <nav className="sticky top-0 z-40 border-y border-line bg-abyss/80 backdrop-blur-xl" aria-label="Разделы турнира">
        <div className="wrap no-scrollbar flex gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded px-4 py-2 font-display text-[19px] font-[800] uppercase tracking-[0.04em] text-mute transition-colors hover:bg-deep hover:text-ice">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Рассказ и цифры ── */}
      <section className="section-tight">
        <div className="wrap grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="prose-osm max-w-2xl" data-reveal="">
            {e.story?.map((p) => <p key={p}>{p}</p>)}
            {e.highlights && (
              <ul>
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-10">
            {upcoming ? (
              <div className="panel p-6 md:p-8">
                <Countdown date={e.date} since={lastPast?.date ?? undefined} size="md" />
                <div className="mt-6">{e.date ? <AddToCalendar event={e} /> : <FollowLinks />}</div>
              </div>
            ) : (
              e.stats && (
                <div className="grid grid-cols-3 gap-6" data-reveal="">
                  {e.stats.bouts && <Stat countTo={e.stats.bouts} label="Боёв" />}
                  {e.stats.fighters && <Stat countTo={e.stats.fighters} label="Бойцов" />}
                  {e.stats.disciplines && <Stat countTo={e.stats.disciplines} label="Дисциплины" />}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Кард ── */}
      {e.bouts.length > 0 ? (
        <section id="card" className="section-tight scroll-mt-20" aria-labelledby="card-title">
          <div className="wrap">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 id="card-title" className="display t-2">
                Кард
              </h2>
              <p className="label-mute">{e.bouts.length} боёв · нажмите на бой, чтобы раскрыть</p>
            </div>
            <div className="flex flex-col gap-10">
              {groups.map((g) => {
                const list = e.bouts.filter(g.match).sort((a, b) => positionRank[a.position] - positionRank[b.position]);
                if (!list.length) return null;
                return (
                  <div key={g.key}>
                    <p className="eyebrow mb-4">{g.title}</p>
                    <div className="flex flex-col gap-3">
                      {list.map((b, i) => (
                        <BoutRow key={b.id} bout={b} eventSlug={e.slug} defaultOpen={g.key === 'main' && i === 0} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {!e.bouts.some((b) => b.result) && e.status === 'past' && (
              <p className="mt-8 text-[14px] text-faint">Итоги боёв публикуются по официальным протоколам. Видео — в разделе «Эфир».</p>
            )}
          </div>
        </section>
      ) : (
        upcoming && (
          <section id="card" className="section-tight scroll-mt-20">
            <div className="wrap">
              <div className="grid place-items-center gap-6 rounded-[var(--radius)] border border-dashed border-line px-6 py-20 text-center">
                <p className="display t-3">Кард собирается в глубине</p>
                <p className="max-w-lg text-mute">Пары объявляем постепенно — каждую в {site.socials.instagramHandle} и здесь. Подпишитесь, чтобы не пропустить.</p>
                <Btn href={site.socials.instagram} variant="ghost" external>
                  {site.socials.instagramHandle}
                </Btn>
              </div>
            </div>
          </section>
        )
      )}

      {/* ── Расписание ── */}
      {e.schedule && (
        <section id="schedule" className="section-tight scroll-mt-20" aria-labelledby="sch-title">
          <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <h2 id="sch-title" className="display t-2">
              Расписание вечера
            </h2>
            <ol className="relative flex flex-col border-l border-line pl-8">
              {e.schedule.map((s, i) => (
                <li key={i} className="relative pb-10 last:pb-0" data-reveal="" style={{ ['--d' as string]: `${i * 0.08}s` }}>
                  <span className={`absolute -left-[39px] top-1 h-4 w-4 rounded-full border-2 ${i === e.schedule!.length - 1 ? 'border-blood bg-blood shadow-[0_0_14px_#ff2b3a]' : 'border-cyan bg-abyss'}`} aria-hidden="true" />
                  <p className="mono text-[12px] uppercase tracking-[0.16em] text-accent">{s.time ?? `Этап ${i + 1}`}</p>
                  <p className="display-upright text-[34px] leading-tight">{s.title}</p>
                  {s.text && <p className="text-mute">{s.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Арена: у старых вечеров без известной площадки блока нет ── */}
      {(e.venue || upcoming) && (
      <section id="venue" className="section-tight scroll-mt-20" aria-labelledby="venue-title">
        <div className="wrap grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <h2 id="venue-title" className="display t-2">
              Арена
            </h2>
            <p className="display-upright text-[40px] leading-none">{e.venue ?? 'Площадка объявляется'}</p>
            <p className="lead">{e.city}</p>
            {e.venue && (
              <div className="flex flex-wrap gap-3">
                <Btn href={`https://yandex.by/maps/?text=${mapQuery}`} variant="ghost" external>
                  Яндекс Карты
                </Btn>
                <Btn href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} variant="ghost" external>
                  Google Maps
                </Btn>
              </div>
            )}
            {upcoming && (
              <ul className="grid gap-3 text-mute">
                <li>— Приходите за 30–40 минут до старта: досмотр на входе.</li>
                <li>— Билет — электронный, на экране телефона.</li>
                <li>— Детям до 14 лет — только со взрослыми.</li>
              </ul>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2">
            {e.venue ? (
              <iframe
                title={`Карта: ${e.venue}, ${e.city}`}
                src={geo ? `https://yandex.ru/map-widget/v1/?ll=${geo[1]}%2C${geo[0]}&z=16&pt=${geo[1]}%2C${geo[0]}%2Cpm2rdm&lang=ru_RU` : `https://yandex.ru/map-widget/v1/?text=${mapQuery}&z=15&lang=ru_RU`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <p className="display-upright text-[28px] leading-tight text-mute">Площадку объявим позже: следите за анонсами лиги</p>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ── Билеты: у старых вечеров без данных о продаже блока нет ── */}
      {(upcoming || e.tickets) && (
      <section id="tickets" className="section-tight scroll-mt-20" aria-labelledby="tix-title">
        <div className="wrap">
          <div className="grid gap-8 rounded-[var(--radius)] border border-line p-6 md:grid-cols-[1fr_auto] md:items-center md:p-12" style={{ background: 'radial-gradient(70% 120% at 100% 0%, rgba(255,43,58,.14), transparent 60%), var(--abyss-2)' }}>
            <div className="flex flex-col gap-4">
              <h2 id="tix-title" className="display t-3">
                Билеты
              </h2>
              {e.tickets?.from ? (
                <p className="display-upright text-[clamp(2.4rem,5vw,4rem)] leading-none">
                  {fmtMoney(e.tickets.from, e.tickets.currency)} {e.tickets.to && <span className="text-mute">— {fmtMoney(e.tickets.to, e.tickets.currency)}</span>}
                </p>
              ) : (
                <p className="display-upright text-[36px] leading-none">{upcoming ? 'Продажа скоро' : 'Продажа завершена'}</p>
              )}
              {e.tickets?.note && <p className="text-mute">{e.tickets.note}</p>}
              {e.tickets?.refund && <p className="text-[14px] text-faint">Возврат: {e.tickets.refund}</p>}
              {e.tickets?.vendor && <p className="label">Оператор: {e.tickets.vendor}</p>}
            </div>
            <div className="flex flex-col gap-3">
              {e.tickets?.status === 'onsale' && e.tickets.url ? (
                <Btn href={e.tickets.url} impact external>
                  Купить на {e.tickets.vendor}
                </Btn>
              ) : upcoming ? (
                <Btn href="/tickets/" impact>
                  Выбрать место
                </Btn>
              ) : (
                <span className="chip">{e.tickets?.status === 'soldout' ? 'Солд-аут' : 'Архив'}</span>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── Эфир ── */}
      <section id="watch" className="section-tight scroll-mt-20" aria-labelledby="w-title">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="w-title" className="display t-2">
              Эфир и видео
            </h2>
            <Btn href="/watch/" variant="ghost" icon="play">
              Весь архив
            </Btn>
          </div>
          {vids.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {fightVids.map((v) => (
                  <VideoCard key={v.id} v={v} showEvent={false} />
                ))}
              </div>
              {extraVids.length > 0 && (
                <>
                  <p className="eyebrow mb-6 mt-14">Интервью и закулисье</p>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {extraVids.map((v) => (
                      <VideoCard key={v.id} v={v} showEvent={false} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="rounded border border-dashed border-line p-8 text-mute">
              {upcoming ? `Трансляция — у генерального партнёра лиги Rutube. Ссылку опубликуем в день турнира.` : 'Видео этого турнира готовятся к публикации. Следите за каналом Chinuk Gym на YouTube.'}
            </p>
          )}
        </div>
      </section>

      {/* ── Пресс ── */}
      {e.posters && (
        <section id="press" className="section-tight scroll-mt-20" aria-labelledby="press-title">
          <div className="wrap">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 id="press-title" className="display t-2">
                Пресс-материалы
              </h2>
              <Link href="/media/#press-kit" className="link-arrow">
                Логотипы лиги →
              </Link>
            </div>
            <Gallery items={e.posters} />
          </div>
        </section>
      )}

      {e.partners && (
        <section className="section-tight border-t border-line" aria-labelledby="ep-title">
          <div className="wrap">
            <h2 id="ep-title" className="mono mb-6 text-[11px] uppercase tracking-[0.2em] text-faint">
              Партнёры турнира
            </h2>
            <PartnersStrip names={e.partners} size="h-12" />
            {e.sources && (
              <p className="mt-8 text-[13px] text-faint">
                Источники:{' '}
                {e.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ', '}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ice">
                      {s.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="section-tight">
        <div className="wrap flex flex-wrap justify-between gap-4">
          {(() => {
            const all = getEvents();
            const i = all.findIndex((x) => x.slug === e.slug);
            const newer = all[i - 1];
            const older = all[i + 1];
            return (
              <>
                {older ? (
                  <Link href={`/events/${older.slug}/`} className="group flex flex-col">
                    <span className="label">← Раньше</span>
                    <span className="display-upright text-[32px] transition-colors group-hover:text-accent">{older.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {newer && (
                  <Link href={`/events/${newer.slug}/`} className="group flex flex-col text-right">
                    <span className="label">Позже →</span>
                    <span className="display-upright text-[32px] transition-colors group-hover:text-accent">{newer.title}</span>
                  </Link>
                )}
              </>
            );
          })()}
        </div>
      </section>
    </>
  );
}
