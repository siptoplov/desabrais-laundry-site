'use client';

/**
 * Чемпион лиги — чёрный осьминог в красных перчатках — на арене (ключевой арт; значки на нём — прежний логотип лиги).
 *  • картинка сразу (она же LCP), поверх — дым, горящие глаза и лёгкий параллакс за курсором;
 *  • на десктопе персонаж справа и уходит в темноту к заголовку, на телефоне — по центру;
 *  • reduced-motion — без пульса и дыма (их гасят общие правила в globals.css).
 */
import { useEffect, useRef } from 'react';
import { site } from '@/content/site';
import { asset } from '@/lib/asset';

/** Глаза на арте, доли ширины/высоты картинки */
const EYES = [
  { x: 37.3, y: 26 },
  { x: 45.3, y: 25.5 },
];

export function HeroVisual({ className = '' }: { className?: string }) {
  const { heroArt, heroArtFocus } = site.media;
  const layer = useRef<HTMLDivElement>(null);

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
      <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)] md:[mask-image:linear-gradient(to_bottom,black_62%,transparent)]">
        <div
          ref={layer}
          className="absolute top-0 h-full max-md:left-1/2 max-md:-translate-x-[var(--focus)] md:right-0 [aspect-ratio:972/941] transition-[translate] duration-700 ease-out md:[mask-image:linear-gradient(to_right,transparent,black_38%)]"
          style={{ ['--focus' as string]: `${heroArtFocus}%` }}
        >
          <img src={asset(heroArt)} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
          {EYES.map((e, i) => (
            <span
              key={i}
              className="eye-glow absolute h-[4.5%] w-[4.5%] rounded-full"
              style={{ left: `${e.x}%`, top: `${e.y}%`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
      {/* дым поверх бойца, у пола */}
      <div className="caustics" />
      {/* на телефоне — затемнение под текстом */}
      <div className="absolute inset-0 bg-abyss/40 md:hidden" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-abyss/80 to-transparent" />
    </div>
  );
}
