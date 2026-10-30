'use client';

/**
 * Живой дым арены поверх чемпиона — Vanta FOG (three.js), смешение «экран»: чёрное не видно, светлое — дым.
 * Только мышь/тачпад; грузится лениво, в простое, после первого экрана.
 * На телефонах остаётся лёгкий CSS-дым (.caustics).
 */
import { useEffect, useRef } from 'react';

export function HeroFog({ className = '' }: { className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let fx: { destroy: () => void } | null = null;
    let cancelled = false;
    const start = async () => {
      const [THREE, { default: FOG }] = await Promise.all([import('three'), import('vanta/dist/vanta.fog.min')]);
      if (cancelled || !el.current) return;
      fx = FOG({
        el: el.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        baseColor: 0x000000,
        lowlightColor: 0x0b0b0e,
        midtoneColor: 0x2a2a31,
        highlightColor: 0x6b1219,
        blurFactor: 0.62,
        speed: 1.1,
        zoom: 0.7,
      });
      el.current.classList.add('is-on');
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(() => void start(), { timeout: 2500 });
    else window.setTimeout(() => void start(), 800);
    return () => {
      cancelled = true;
      fx?.destroy();
    };
  }, []);

  return <div ref={el} aria-hidden="true" className={`pointer-events-none opacity-0 mix-blend-screen transition-opacity duration-[1.6s] [&.is-on]:opacity-70 ${className}`} />;
}
