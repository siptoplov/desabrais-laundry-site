import Link from 'next/link';
import { HeroVisual } from '@/components/three/HeroVisual';
import { Countdown } from '@/components/ui/Countdown';
import { Btn } from '@/components/ui/Btn';
import { site, disciplines } from '@/content/site';
import { getPastEvents, getUpcoming } from '@/lib/cms';
import { fmtDate, fmtTime } from '@/lib/format';
import { t } from '@/i18n';

/**
 * Первый экран: бездна, 3D-осьминог, гигантский словесный знак с глитчем и «жидкостью»,
 * живой таймер, CTA «Билеты» и «Смотреть бои».
 */
export function Hero() {
  const next = getUpcoming();
  const last = getPastEvents()[0];
  const headline = site.heroHeadlines[site.heroHeadlineIndex];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]" aria-labelledby="hero-title">
      {/* слои глубины */}
      <div className="absolute inset-0 -z-20" style={{ background: 'radial-gradient(80% 70% at 70% 30%, #0e2440 0%, #0a1a2f 30%, #05070a 75%)' }} />
      <div className="godrays -z-10" />
      <div className="caustics -z-10" />
      <HeroVisual className="absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-abyss via-abyss/60 to-transparent" />

      <div className="wrap flex flex-1 flex-col justify-end pb-10 md:pb-14">
        <p className="eyebrow mb-6" data-reveal="load">
          {site.league} · Минск · с {site.since}
        </p>

        <h1 id="hero-title" className="relative">
          <span className="sr-only">
            {site.name} — {headline}
          </span>
          <span
            aria-hidden="true"
            className="display glitch t-mega block select-none [filter:drop-shadow(0_0_60px_rgba(0,229,255,.18))] hover:[filter:url(#liquid)]"
            data-text="Осьминог"
          >
            Осьминог
          </span>
          <span aria-hidden="true" className="display-upright mt-3 block text-[clamp(1.6rem,3.6vw,3.4rem)] text-ice/90">
            {headline.split('. ').map((part, i, arr) => (
              <span key={i} className={i === arr.length - 1 && arr.length > 1 ? 'text-blood glow-blood' : ''}>
                {part}
                {i < arr.length - 1 ? '. ' : ''}
              </span>
            ))}
          </span>
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal="load" style={{ ['--d' as string]: '.2s' }}>
              {next && (
                <Link href={`/events/${next.slug}/`} className="group flex items-center gap-4">
                  <span className="chip chip-blood">Следующий</span>
                  <span className="display-upright text-[28px] transition-colors group-hover:text-accent">{next.title}</span>
                  <span className="mono text-[12px] uppercase tracking-[0.18em] text-mute">
                    {next.date ? `${fmtDate(next.date, { day: 'numeric', month: 'long' })} · ${fmtTime(next.date)}` : 'дата — скоро'}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-4" data-reveal="load" style={{ ['--d' as string]: '.3s' }}>
              <Btn href="/tickets/" impact>
                {next?.tickets?.status === 'onsale' ? t.buyTickets : t.tickets}
              </Btn>
              <Btn href="/watch/" variant="ghost" icon="play">
                {t.watchFights}
              </Btn>
            </div>
          </div>
          <div data-reveal="load" style={{ ['--d' as string]: '.4s' }}>
            <Countdown date={next?.date ?? null} since={last?.date ?? undefined} />
          </div>
        </div>
      </div>

      {/* бегущая строка дисциплин */}
      <div className="relative border-y border-line bg-abyss/85 py-4" aria-hidden="true">
        <div className="marquee" style={{ ['--marquee-speed' as string]: '38s' }}>
          {[0, 1].map((k) => (
            <div key={k} className="marquee__track">
              {[...Object.values(disciplines), ...Object.values(disciplines)].map((d, i) => (
                <span key={i} className="display-upright flex items-center gap-12 text-[22px] text-mute">
                  {d.label}
                  <svg viewBox="0 0 20 20" className="h-3 w-3 text-blood" aria-hidden="true">
                    <path d="M10 0l2.9 7.1L20 10l-7.1 2.9L10 20l-2.9-7.1L0 10l7.1-2.9z" fill="currentColor" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
