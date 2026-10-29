import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { FaceOff } from '@/components/sections/FaceOff';
import { EightStrikes } from '@/components/sections/EightStrikes';
import { Chronicle } from '@/components/sections/Chronicle';
import { Subscribe } from '@/components/forms/Subscribe';
import { Btn } from '@/components/ui/Btn';
import { BoutRow } from '@/components/ui/BoutRow';
import { FighterCard, NewsCard } from '@/components/ui/Cards';
import { VideoCard } from '@/components/ui/VideoCard';
import { Depth, SectionHead, SplitTitle, Stat, TentacleRule } from '@/components/ui/Primitives';
import { LogoMark } from '@/components/brand/Logo';
import { zones } from '@/content/arena';
import { partners, site } from '@/content/site';
import { rubaha } from '@/content/pages';
import { fullName, getFighter, getFighters, getLatestPast, getNews, getUpcoming, getVideos, legends, positionRank } from '@/lib/cms';
import { asset, posterSrcSet } from '@/lib/asset';
import { fmtDate, fmtMoney } from '@/lib/format';
import { eventJsonLd, JsonLd } from '@/lib/seo';

export default function Home() {
  const next = getUpcoming();
  const last = getLatestPast()!;
  const main = last.bouts.find((b) => b.position === 'main')!;
  const red = getFighter(main.red)!;
  const blue = getFighter(main.blue)!;
  const topVideos = [...getVideos()].filter((v) => v.kind === 'fight').sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const featured = getFighters().filter((f) => f.featured);
  const titled = getFighters().filter((f) => f.badges?.includes('champion'));
  const news = getNews().slice(0, 3);
  const mainCard = [...last.bouts].sort((a, b) => positionRank[a.position] - positionRank[b.position]).slice(0, 4);

  return (
    <>
      <JsonLd data={[eventJsonLd(last)]} />
      <Hero />

      {/* ───────── Следующий выпуск ───────── */}
      {next && (
        <section className="section relative overflow-hidden" aria-labelledby="next-title">
          <Depth />
          <div className="wrap relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-6" data-reveal="">
                Следующий выпуск
              </p>
              <SplitTitle as="h2" lines={[next.title, <span key="t" className="text-outline-accent">готовится</span>]} className="display t-1" />
              <div className="mt-8 flex max-w-xl flex-col gap-4" data-reveal="">
                {next.story?.map((p) => (
                  <p key={p} className="lead max-w-none">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div className="panel p-6 md:p-10" data-reveal="" style={{ ['--d' as string]: '.15s' }}>
              <p className="display t-4 mb-2">Узнать дату первым</p>
              <p className="mb-6 text-mute">E-mail или Telegram. Только бои — никакого спама.</p>
              <Subscribe id="next-sub" />
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
                <Stat countTo={10} label="Выпусков серии" />
                <Stat countTo={4} label="Дисциплины" />
                <Stat value={site.since} label="Год основания" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────── Лицом к лицу ───────── */}
      <section className="section relative overflow-hidden ring-ropes" aria-label="Лицом к лицу">
        <div className="wrap relative">
          <FaceOff red={red} blue={blue} bout={main} title={site.mainEventHeadlines[0]} eventTitle={last.title} eventHref={`/events/${last.slug}/`} />
        </div>
      </section>

      <EightStrikes />

      {/* ───────── Карточка турнира ───────── */}
      <section className="section relative" aria-labelledby="last-title">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="flex flex-col gap-6">
              <p className="eyebrow" data-reveal="">
                Последний турнир · {fmtDate(last.date!)}
              </p>
              <h2 id="last-title" className="display t-2" data-reveal="">
                {last.title}
              </h2>
              <Link href={`/events/${last.slug}/`} className="group relative block overflow-hidden rounded-[var(--radius)] border border-line" data-reveal="" data-cursor="view" data-cursor-label="Турнир">
                <img src={asset(`${last.poster}-560.webp`)} srcSet={posterSrcSet(last.poster!)} sizes="(min-width:1024px) 420px, 90vw" alt={`Постер ${last.title}`} width={560} height={700} loading="lazy" decoding="async" className="w-full transition-transform duration-[1400ms] group-hover:scale-105" />
              </Link>
              <div className="grid grid-cols-3 gap-4" data-reveal="">
                <Stat countTo={last.stats?.bouts ?? 0} label="Боёв" />
                <Stat countTo={last.stats?.fighters ?? 0} label="Бойца" />
                <Stat countTo={last.stats?.disciplines ?? 0} label="Дисциплины" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="lead mb-2 max-w-2xl" data-reveal="">
                {last.story?.[0]}
              </p>
              {mainCard.map((b, i) => (
                <div key={b.id} data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                  <BoutRow bout={b} eventSlug={last.slug} defaultOpen={false} />
                </div>
              ))}
              <div className="mt-4 flex flex-wrap gap-4" data-reveal="">
                <Btn href={`/events/${last.slug}/`}>Весь кард · {last.stats?.bouts} боёв</Btn>
                <Btn href="/fight-card/" variant="ghost">
                  Голосовать за любимца
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Лучшие бои ───────── */}
      <section className="section relative overflow-hidden" aria-labelledby="best-title">
        <Depth caustics={false} />
        <div className="wrap relative">
          <SectionHead eyebrow="Видеоархив" title={['Лучшие бои', <span key="s" className="text-outline">по версии зала</span>]} lead="Самые просматриваемые бои лиги. Полные записи — без нарезок.">
            <Btn href="/watch/" variant="ghost" icon="play">
              Весь эфир
            </Btn>
          </SectionHead>
          <div className="grid gap-5 md:grid-cols-4">
            {topVideos.map((v, i) => (
              <div key={v.id} className={i === 0 ? 'md:col-span-2 md:row-span-2' : ''} data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                <VideoCard v={v} big={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Бойцы ───────── */}
      <section className="section relative" aria-labelledby="fighters-title">
        <div className="wrap">
          <SectionHead eyebrow="Ростер лиги" title={['Выходят', <span key="s" className="text-blood">из тьмы</span>]} lead="Чемпионы мира и Европы, ветераны кулачных рубок и голодные проспекты.">
            <Btn href="/fighters/" variant="ghost">
              Все бойцы
            </Btn>
          </SectionHead>
          <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {featured.map((f, i) => (
              <div key={f.slug} data-reveal="" style={{ ['--d' as string]: `${(i % 4) * 0.07}s` }}>
                <FighterCard f={f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Chronicle />

      {/* ───────── Титулы ───────── */}
      <section className="section relative overflow-hidden" aria-labelledby="titles-title">
        <Depth rays={false} />
        <div className="wrap relative grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow mb-6">Зал чемпионов</p>
            <SplitTitle lines={['Пояса', <span key="s" className="text-outline">не дарят</span>]} className="display t-1" />
            <p className="lead mt-8">В ринге «Осьминога» — чемпионы мира, Европы, России и Беларуси. А в 2025-м здесь разыграли пояс чемпиона мира WTKF.</p>
            <div className="mt-10">
              <Btn href="/rankings/">Чемпионы и дивизионы</Btn>
            </div>
          </div>
          <ul className="flex flex-col">
            {titled.map((f, i) => (
              <li key={f.slug} data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                <Link href={`/fighters/${f.slug}/`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-5 transition-colors hover:border-cyan/40">
                  <span className="mono text-[12px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex flex-col">
                    <span className="display text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.9] transition-transform duration-500 group-hover:translate-x-2">{fullName(f)}</span>
                    <span className="text-[14px] text-mute">{f.titles?.[0]}</span>
                  </span>
                  <span className="mono text-[13px] tabular text-mute">{f.weightKg ? `${String(f.weightKg).replace('.', ',')} кг` : ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Билеты ───────── */}
      <section className="section relative overflow-hidden" aria-labelledby="tix-title">
        <div className="wrap relative">
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-line p-6 md:p-14" style={{ background: 'radial-gradient(70% 90% at 100% 0%, rgba(255,43,58,.18), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(236,238,241,.12), transparent 60%), var(--abyss-2)' }}>
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow mb-6">Билеты</p>
                <SplitTitle lines={['Сядь так близко,', <span key="s" className="text-blood">чтобы слышать удар</span>]} className="display t-2" />
                <p className="lead mt-6">Ringside, VIP-столы, ложи Lounge, партер и трибуна. Выберите место на схеме зала — мы напомним, когда откроются продажи.</p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Btn href="/tickets/" impact>
                    Выбрать место
                  </Btn>
                  <Btn href="/faq/" variant="ghost">
                    Вопросы о билетах
                  </Btn>
                </div>
              </div>
              <ul className="grid gap-3">
                {zones.map((z, i) => (
                  <li key={z.id} className="flex items-center justify-between gap-4 rounded border border-line bg-abyss/50 px-5 py-4" data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                    <span className="flex items-center gap-4">
                      <span className="h-3 w-3 rounded-full" style={{ background: z.color, boxShadow: `0 0 12px ${z.color}` }} />
                      <span>
                        <span className="display-upright block text-[24px] leading-none">{z.name}</span>
                        <span className="text-[13px] text-mute">{z.perks}</span>
                      </span>
                    </span>
                    <span className="mono shrink-0 text-[13px] text-mute">от {fmtMoney(z.price)}*</span>
                  </li>
                ))}
                <li className="text-[12px] text-faint">* Ориентир по цене билетов прошлого турнира. Актуальные цены — при старте продаж.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Рубаха-парень ───────── */}
      <section className="section relative overflow-hidden" aria-labelledby="rubaha-title">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'repeating-linear-gradient(-45deg, transparent 0 40px, rgba(255,43,58,.035) 40px 80px)' }} />
        <div className="wrap relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-6">Спецпроект</p>
            <h2 id="rubaha-title" className="display t-mega leading-[0.8]">
              <span className="block">Рубаха-</span>
              <span className="block text-blood glow-blood">парень</span>
            </h2>
          </div>
          <div className="flex flex-col gap-6" data-reveal="">
            <p className="lead">{rubaha.lead}</p>
            <dl className="grid grid-cols-2 gap-4">
              {rubaha.format.map((r) => (
                <div key={r.k} className="border-l border-blood/50 pl-4">
                  <dt className="label">{r.k}</dt>
                  <dd className="display-upright text-[26px] leading-tight">{r.v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <Btn href="/rubaha-paren/" impact>
                Хватит смелости?
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Новости ───────── */}
      <section className="section relative" aria-labelledby="news-title">
        <div className="wrap">
          <SectionHead eyebrow="Новости" title={['Что всплыло', <span key="s" className="text-outline">на поверхность</span>]}>
            <Btn href="/media/" variant="ghost">
              Все новости
            </Btn>
          </SectionHead>
          <div className="grid gap-5 md:grid-cols-3">
            {news.map((n, i) => (
              <div key={n.slug} data-reveal="" style={{ ['--d' as string]: `${i * 0.07}s` }}>
                <NewsCard n={n} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Легенды и партнёры ───────── */}
      <section className="section-tight relative overflow-hidden border-t border-line" aria-labelledby="legends-title">
        <div className="wrap mb-10 flex flex-col items-center gap-4 text-center">
          <LogoMark className="h-16 w-16" />
          <h2 id="legends-title" className="display t-3">
            В этом ринге выходили
          </h2>
        </div>
        <div className="marquee" aria-label="Легенды лиги">
          {[0, 1].map((k) => (
            <div key={k} className="marquee__track" aria-hidden={k === 1}>
              {legends.map((n) => (
                <span key={n} className="display text-outline whitespace-nowrap text-[clamp(2.6rem,6vw,5rem)] leading-none transition-colors hover:text-ice">
                  {n}
                </span>
              ))}
            </div>
          ))}
        </div>
        <TentacleRule className="my-14 h-10" />
        <div className="wrap flex flex-col items-center gap-6 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.22em] text-faint">{partners.general.role}</p>
          <p className="display-upright text-[clamp(3rem,6vw,5rem)] leading-none">{partners.general.name}</p>
          <p className="mono text-[11px] uppercase tracking-[0.22em] text-faint">
            {partners.tv.role} · <span className="text-ice">{partners.tv.name}</span>
          </p>
        </div>
        <div className="marquee marquee--reverse mt-10" style={{ ['--marquee-speed' as string]: '60s' }} aria-label="Партнёры">
          {[0, 1].map((k) => (
            <div key={k} className="marquee__track" aria-hidden={k === 1}>
              {[...partners.list, ...partners.federations].map((p) => (
                <span key={p} className="display-upright whitespace-nowrap text-[26px] text-mute">
                  {p}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="wrap mt-12 flex justify-center">
          <Btn href="/join/#partners" variant="ghost">
            Стать партнёром
          </Btn>
        </div>
      </section>
    </>
  );
}
