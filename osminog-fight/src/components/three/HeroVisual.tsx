'use client';

/**
 * Чемпион лиги — чёрный осьминог в красных перчатках — на арене (ключевой арт; значки на нём — прежний логотип лиги).
 *  • картинка сразу (она же LCP), поверх — дым, горящие глаза и лёгкий параллакс за курсором;
 *  • на десктопе персонаж справа и уходит в темноту к заголовку, на телефоне — по центру;
 *  • если текст первого экрана поднимается до глаз (узкие и низкие окна) — арт приподнимается над ним;
 *  • при прокрутке (GSAP ScrollTrigger) арт медленно наезжает и уходит в темноту;
 *  • reduced-motion — без пульса, дыма и наезда (их гасят общие правила в globals.css).
 */
import { useEffect, useRef } from 'react';
import { HeroFog } from '@/components/fx/HeroFog';
import { site } from '@/content/site';
import { asset } from '@/lib/asset';

/** Глаза на арте, доли ширины/высоты картинки */
const EYES = [
  { x: 37.3, y: 26 },
  { x: 45.3, y: 25.5 },
];
/** Линия под глазами (доля высоты арта) — выше неё текст не заходит */
const EYE_LINE = 0.3;

export function HeroVisual({ className = '' }: { className?: string }) {
  const { heroArt, heroArtFocus } = site.media;
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  // приподнимаем арт, чтобы глаза были над первой строкой текста, но не уходили под шапку
  useEffect(() => {
    const section = box.current?.closest('section');
    const text = section?.querySelector<HTMLElement>('[data-hero-text]');
    if (!box.current || !section || !text) return;
    const fit = () => {
      const h = box.current?.clientHeight ?? 0;
      const header = parseFloat(getComputedStyle(section).paddingTop) || 0;
      const need = h * EYE_LINE + 16 - text.offsetTop;
      const room = h * EYES[0].y / 100 - header - 12;
      layer.current?.style.setProperty('top', `${-Math.round(Math.max(0, Math.min(need, room)))}px`);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box.current);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);

  // наезд камеры при прокрутке первого экрана
  useEffect(() => {
    const el = box.current;
    const section = el?.closest('section');
    if (!el || !section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let revert = () => {};
    let cancelled = false;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.to(el, { scale: 1.12, yPercent: 6, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true } });
      });
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -16;
        const y = (e.clientY / window.innerHeight - 0.5) * -8;
        layer.current?.style.setProperty('translate', `${x}px ${y}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (!heroArt) return null;

  return (
    <div className={className} aria-hidden="true">
      <div ref={box} className="absolute inset-0 overflow-hidden">
        <div
          ref={layer}
          className="absolute top-0 h-full max-md:left-1/2 max-md:-translate-x-[var(--focus)] md:right-0 [aspect-ratio:972/941] transition-[translate] duration-700 ease-out md:[mask-image:linear-gradient(to_right,transparent,black_38%)]"
          style={{ ['--focus' as string]: `${heroArtFocus}%` }}
        >
          {/* затухание вниз — на самой картинке, чтобы при подъёме не было края */}
          <img
            src={asset(heroArt)}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_bottom,black_60%,transparent)] md:[mask-image:linear-gradient(to_bottom,black_62%,transparent)]"
          />
          {EYES.map((e, i) => (
            <span
              key={i}
              className="eye-glow absolute h-[4.5%] w-[4.5%] rounded-full"
              style={{ left: `${e.x}%`, top: `${e.y}%`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
      {/* дым поверх бойца: живой (Vanta) на компьютере, CSS — у пола везде */}
      <HeroFog className="absolute inset-0" />
      <div className="caustics" />
      {/* на телефоне — затемнение под текстом */}
      <div className="absolute inset-0 bg-abyss/40 md:hidden" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-abyss/80 to-transparent" />
    </div>
  );
}
