'use client';

/**
 * Плавный скролл Lenis — только для мыши/тачпада (на телефонах нативный скролл лучше).
 * Библиотека грузится лениво, в простое браузера, и не мешает первому экрану.
 * Отключается при prefers-reduced-motion.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    let cancelled = false;
    let cleanup = () => {};
    const start = async () => {
      const { default: LenisCtor } = await import('lenis');
      if (cancelled) return;
      lenis = new LenisCtor({ lerp: 0.1, smoothWheel: true, autoRaf: true });
      // якорные ссылки — плавно
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
        if (!a) return;
        const id = a.getAttribute('href')!.slice(1);
        const target = id ? document.getElementById(id) : null;
        if (target) {
          e.preventDefault();
          lenis?.scrollTo(target, { offset: -80 });
        }
      };
      document.addEventListener('click', onClick);
      cleanup = () => {
        document.removeEventListener('click', onClick);
        lenis?.destroy();
        lenis = null;
      };
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(() => void start(), { timeout: 2000 });
    else window.setTimeout(() => void start(), 600);
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // новая страница — наверх
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
