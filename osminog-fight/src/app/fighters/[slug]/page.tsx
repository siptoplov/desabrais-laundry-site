import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Btn } from '@/components/ui/Btn';
import { FavButton, ShareButton } from '@/components/ui/Actions';
import { Radar, RecordBar, fighterDna } from '@/components/ui/Charts';
import { FighterCard, Silhouette } from '@/components/ui/Cards';
import { Flag, SplitTitle } from '@/components/ui/Primitives';
import { VideoCard } from '@/components/ui/VideoCard';
import { Gallery } from '@/components/ui/Gallery';
import { fullName, getFighter, getFighterBouts, getFighterVideos, getFighters, getUpcoming, positionLabel, recordStr, resolveCorner, totalFights } from '@/lib/cms';
import { asset, photoSrcSet } from '@/lib/asset';
import { fmtDate } from '@/lib/format';
import { breadcrumbs, JsonLd, personJsonLd } from '@/lib/seo';
import { countries, disciplines, site } from '@/content/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return getFighters().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFighter(slug);
  if (!f) return {};
  const name = fullName(f);
  const rec = f.record ? `рекорд ${recordStr(f)}` : '';
  return {
    title: `${name}${f.nickname ? ` «${f.nickname}»` : ''} — ${[rec, countries[f.country].name].filter(Boolean).join(', ')}`,
    description: `${name}: ${f.disciplines.map((d) => disciplines[d].label).join(', ')}${f.weightKg ? `, до ${f.weightKg} кг` : ''}. ${f.bio?.[0] ?? ''}`.trim(),
    alternates: { canonical: `/fighters/${f.slug}/` },
    // OG-картинки генерирует scripts/og.mjs (npm run og) — для бойцов с портретом
    openGraph: f.photo ? { images: [{ url: `/og/fighters/${f.slug}.jpg`, width: 1200, height: 630, alt: name }] } : undefined,
  };
}

/** Постеры, на которых есть боец (для галереи профиля) */
const posterMap: Record<string, string[]> = {
  mamedov: ['main-event', 'fullcard'],
  totmyanin: ['main-event', 'fullcard'],
  bobko: ['bobko-bashirov', 'fullcard'],
  bashirov: ['bobko-bashirov', 'fullcard'],
  yakimovich: ['yakimovich-ermolenko', 'fullcard'],
  ermolenko: ['yakimovich-ermolenko', 'fullcard'],
  bangura: ['bangura-elhami', 'fullcard'],
  elhami: ['bangura-elhami', 'fullcard'],
};

export default async function FighterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFighter(slug);
  if (!f) notFound();
  const name = fullName(f);
  const bouts = getFighterBouts(f.slug);
  const vids = getFighterVideos(f.slug);
  const dna = fighterDna(f);
  const all = getFighters();
  const i = all.findIndex((x) => x.slug === f.slug);
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];
  const upcoming = getUpcoming();
  const nextBout = upcoming?.bouts.find((b) => b.red === f.slug || b.blue === f.slug);
  const similar = all.filter((x) => x.slug !== f.slug && x.photo && (x.weightKg === f.weightKg || x.disciplines.some((d) => f.disciplines.includes(d)))).slice(0, 4);
  const gallery = (posterMap[f.slug] ?? []).map((p) => ({ src: `/img/posters/osminog-10/${p}`, alt: `ОСЬМИНОГ-10 · ${p === 'fullcard' ? 'полный кард' : name}` }));

  return (
    <>
      <JsonLd data={[personJsonLd(f), breadcrumbs([{ name: 'Бойцы', path: '/fighters/' }, { name, path: `/fighters/${f.slug}/` }])]} />

      {/* ── Полноэкранный портрет ── */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-[var(--header-h)]">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {f.photo ? (
            <img src={asset(`${f.photo}.webp`)} srcSet={photoSrcSet(f.photo)} sizes="(min-width: 1024px) 60vw, 100vw" alt="" fetchPriority="high" className="absolute right-0 top-0 h-full w-full object-cover object-[50%_15%] lg:w-[62%]" />
          ) : f.headshot ? (
            <img src={asset(f.headshot)} alt="" className="absolute right-0 top-0 h-full w-full object-cover object-top opacity-70 blur-[1px] lg:w-[50%]" />
          ) : (
            <Silhouette f={f} className="absolute right-0 top-0 h-full w-full lg:w-[55%]" />
          )}
          <div className="absolute inset-0 mix-blend-screen" style={{ background: 'radial-gradient(50% 60% at 95% 30%, rgba(0,229,255,.28), transparent 70%), radial-gradient(40% 50% at 40% 40%, rgba(255,43,58,.18), transparent 70%)' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/70 to-transparent lg:via-abyss/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/30" />
          <div className="caustics" />
        </div>

        <div className="wrap pb-14 pt-24">
          <nav aria-label="Хлебные крошки" className="mono mb-8 text-[11px] uppercase tracking-[0.16em] text-faint">
            <Link href="/" className="hover:text-ice">
              Главная
            </Link>{' '}
            /{' '}
            <Link href="/fighters/" className="hover:text-ice">
              Бойцы
            </Link>{' '}
            / <span className="text-mute">{name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <Flag code={f.country} withName />
            {f.city && <span className="text-mute">· {f.city}</span>}
            {f.status === 'retired' && <span className="chip">Завершил карьеру</span>}
            {f.badges?.includes('champion') && <span className="chip chip-cyan">Чемпион</span>}
            {f.badges?.includes('replacement') && <span className="chip chip-blood">Замена</span>}
          </div>
          {f.nickname && <p className="mono mt-6 text-[14px] uppercase tracking-[0.2em] text-accent">«{f.nickname}»</p>}
          <SplitTitle as="h1" lines={[...(f.firstName ? [<span key="f" className="text-[0.36em] leading-none text-mute">{f.firstName}</span>] : []), f.lastName]} className="display t-mega mt-4 leading-[0.8]" instant />
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
            {[
              ['Рекорд', recordStr(f)],
              ['Вес', f.weightKg ? `${String(f.weightKg).replace('.', ',')} кг` : '—'],
              ['Рост', f.heightCm ? `${f.heightCm} см` : '—'],
              ['Возраст', f.age ? String(f.age) : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="display-upright text-[clamp(2rem,4vw,3.4rem)] leading-none">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <FavButton slug={f.slug} name={name} />
            <ShareButton title={`${name} — ${site.name}`} path={`/fighters/${f.slug}/`} />
          </div>
        </div>
      </section>

      {/* ── Био + ДНК ── */}
      <section className="section-tight">
        <div className="wrap grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-10">
            <div>
              <p className="eyebrow mb-6">О бойце</p>
              <div className="prose-osm max-w-2xl">{f.bio?.map((p) => <p key={p}>{p}</p>) ?? <p>Профиль бойца пополняется.</p>}</div>
            </div>
            {f.titles && (
              <div>
                <p className="eyebrow mb-6">Титулы и опыт</p>
                <ul className="flex flex-col">
                  {f.titles.map((t, k) => (
                    <li key={t} className="grid grid-cols-[40px_1fr] items-baseline gap-3 border-b border-line py-4" data-reveal="" style={{ ['--d' as string]: `${k * 0.05}s` }}>
                      <span className="mono text-[12px] text-faint">{String(k + 1).padStart(2, '0')}</span>
                      <span className="text-[18px]">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {f.record && (
              <div>
                <p className="eyebrow mb-6">Разбивка рекорда</p>
                <RecordBar f={f} />
                <p className="mt-4 text-[13px] text-faint">Профессиональный рекорд — по данным официальных постеров лиги. Способы побед (KO / решение) добавляются по протоколам.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <div className="panel flex flex-col items-center gap-4 p-6 md:p-8">
              <p className="eyebrow self-start">ДНК бойца</p>
              <Radar axes={dna} />
              <p className="text-center text-[13px] text-faint">Профиль из реальных данных: опыт, доля побед, рост, титулы, весовая категория.</p>
            </div>
            <div className="panel p-6 md:p-8">
              <p className="eyebrow mb-4">Ближайший бой</p>
              {nextBout && upcoming ? (
                <Link href={`/events/${upcoming.slug}/`} className="display-upright text-[32px] hover:text-accent">
                  {upcoming.title}: vs {resolveCorner(nextBout.red === f.slug ? nextBout.blue : nextBout.red).name}
                </Link>
              ) : (
                <>
                  <p className="display-upright text-[30px] leading-tight">Объявим в {upcoming?.title ?? 'следующем турнире'}</p>
                  <p className="mt-2 text-mute">Добавьте бойца в избранное — напомним, когда он выйдет в ринг.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Бои в лиге ── */}
      {bouts.length > 0 && (
        <section className="section-tight" aria-labelledby="league-title">
          <div className="wrap">
            <h2 id="league-title" className="display t-2 mb-10">
              Бои в «Осьминоге»
            </h2>
            <ol className="flex flex-col border-t border-line">
              {bouts.map(({ event, bout, corner }) => {
                const opp = resolveCorner(corner === 'red' ? bout.blue : bout.red);
                const won = bout.result && bout.result.winner === corner;
                const lost = bout.result && bout.result.winner !== corner && bout.result.winner !== 'draw';
                return (
                  <li key={bout.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5 md:grid-cols-[160px_1fr_auto_auto]">
                    <span className="mono text-[12px] uppercase tracking-[0.14em] text-faint">{event.date ? fmtDate(event.date, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Скоро'}</span>
                    <span className="flex flex-col">
                      <span className="display-upright text-[28px] leading-tight">
                        vs{' '}
                        {opp.fighter ? (
                          <Link href={`/fighters/${opp.fighter.slug}/`} className="hover:text-accent">
                            {opp.name}
                          </Link>
                        ) : (
                          opp.name
                        )}
                      </span>
                      <Link href={`/events/${event.slug}/`} className="mono text-[11px] uppercase tracking-[0.14em] text-mute hover:text-ice">
                        {event.title} {event.collab} · {positionLabel[bout.position]} · {disciplines[bout.discipline].label}
                      </Link>
                    </span>
                    <span className={`chip ${won ? 'chip-cyan' : lost ? 'chip-blood' : ''}`}>{won ? 'Победа' : lost ? 'Поражение' : event.status === 'upcoming' ? 'Скоро' : 'Итог уточняется'}</span>
                    {bout.video && (
                      <a href="#videos" className="link-arrow hidden md:inline-flex">
                        Видео
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {vids.length > 0 && (
        <section id="videos" className="section-tight scroll-mt-24" aria-labelledby="hl-title">
          <div className="wrap">
            <h2 id="hl-title" className="display t-2 mb-10">
              Хайлайты
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {vids.map((v) => (
                <VideoCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="section-tight" aria-labelledby="gal-title">
          <div className="wrap">
            <h2 id="gal-title" className="display t-2 mb-10">
              Галерея
            </h2>
            <Gallery items={gallery} cols="sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        </section>
      )}

      <section className="section-tight border-t border-line">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="display t-3">Ещё бойцы</h2>
            <Btn href="/fighters/" variant="ghost">
              Все бойцы
            </Btn>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {similar.map((x) => (
              <FighterCard key={x.slug} f={x} />
            ))}
          </div>
          <div className="mt-14 flex justify-between gap-4">
            <Link href={`/fighters/${prev.slug}/`} className="group flex flex-col">
              <span className="label">← Предыдущий</span>
              <span className="display-upright text-[28px] transition-colors group-hover:text-accent">{fullName(prev)}</span>
            </Link>
            <Link href={`/fighters/${next.slug}/`} className="group flex flex-col text-right">
              <span className="label">Следующий →</span>
              <span className="display-upright text-[28px] transition-colors group-hover:text-accent">{fullName(next)}</span>
            </Link>
          </div>
          <p className="mt-10 text-[13px] text-faint">Всего боёв в рекорде: {totalFights(f) || '—'}. Данные — из официальных публикаций лиги.</p>
        </div>
      </section>
    </>
  );
}
