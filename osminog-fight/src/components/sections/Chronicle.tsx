'use client';

/**
 * Горизонтальная хроника лиги: вертикальный скролл двигает ленту вбок (sticky + ScrollTrigger).
 * На тач-экранах — обычная лента со свайпом и snap.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { chronicle, getEvent } from '@/lib/cms';
import { useScrollScene } from '@/lib/useScrollScene';
import { asset } from '@/lib/asset';
import { TypoPoster } from '@/components/ui/Cards';

export function Chronicle() {
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px) and (hover: hover)');
    const measure = () => {
      setDesktop(mq.matches);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const ref = useScrollScene<HTMLElement>((p) => {
    if (track.current) track.current.style.transform = desktop ? `translate3d(${-p * dist}px,0,0)` : '';
  });

  return (
    <section ref={ref} className="relative" style={{ height: desktop ? `calc(100vh + ${dist}px)` : undefined }} aria-labelledby="chronicle-title">
      <div className={desktop ? 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden' : 'section-tight overflow-hidden'}>
        <div className="wrap mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">Хроника · с 2009</p>
            <h2 id="chronicle-title" className="display t-2">
              Из глубины <span className="text-outline">— в историю</span>
            </h2>
          </div>
          <p className="mono hidden text-[11px] uppercase tracking-[0.2em] text-mute md:block">{desktop ? 'Листайте вниз →' : 'Свайп →'}</p>
        </div>
        <div
          ref={track}
          className={`flex gap-5 pl-[var(--gutter)] pr-[var(--gutter)] will-change-transform ${desktop ? '' : 'no-scrollbar snap-x snap-mandatory overflow-x-auto'}`}
          data-cursor={desktop ? 'drag' : undefined}
          data-cursor-label="Листай"
        >
          {chronicle.map((c, i) => {
            const ev = c.event ? getEvent(c.event) : undefined;
            const card = (
              <article className="group relative flex h-[min(62vh,560px)] w-[min(78vw,400px)] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 transition-colors duration-500 hover:border-cyan/50">
                <div className="relative flex-1 overflow-hidden">
                  {ev?.poster ? (
                    <img src={asset(`${ev.poster}-560.webp`)} alt="" loading="lazy" decoding="async" width={560} height={700} className="h-full w-full object-cover opacity-80 transition duration-[1200ms] group-hover:scale-105 group-hover:opacity-100" />
                  ) : ev ? (
                    <TypoPoster e={ev} showDate={false} />
                  ) : (
                    <div className="grid h-full place-items-center" style={{ background: 'radial-gradient(70% 70% at 50% 30%, var(--deep-2), var(--abyss))' }}>
                      <span className="display-upright text-outline text-[9rem] leading-none">{c.year}</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-transparent" />
                  <span className="display-upright absolute left-5 top-4 text-[64px] leading-none text-ice/90 [text-shadow:0_4px_30px_rgba(0,0,0,.6)]">{c.year}</span>
                  <span className="mono absolute right-5 top-6 text-[11px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <h3 className="display text-[34px] leading-[0.85]">{c.title}</h3>
                  <p className="text-[14px] leading-relaxed text-mute">{c.text}</p>
                </div>
              </article>
            );
            return ev ? (
              <Link key={i} href={`/events/${ev.slug}/`} className="shrink-0 snap-start">
                {card}
              </Link>
            ) : (
              <div key={i} className="shrink-0 snap-start">
                {card}
              </div>
            );
          })}
          <div className="w-[10vw] shrink-0" aria-hidden="true" />
        </div>
        {desktop && (
          <div className="wrap mt-10" aria-hidden="true">
            <div className="h-[2px] w-full overflow-hidden rounded bg-line">
              <div className="h-full origin-left bg-accent" style={{ transform: 'scaleX(var(--p, 0))' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
