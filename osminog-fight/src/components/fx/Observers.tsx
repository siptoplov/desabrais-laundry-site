'use client';

/**
 * Глобальные наблюдатели:
 *  • [data-reveal], [data-split] — появление при скролле (IntersectionObserver);
 *  • .glitch — случайные глитч-вспышки на заголовках в зоне видимости;
 *  • [data-count-to] — счётчики, которые «накручиваются» при появлении.
 * Перезапускаются при смене страницы.
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Observers() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add('is-in');
          if (el.dataset.countTo) countUp(el, reduce);
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in), [data-split]:not(.is-in), [data-count-to]:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    // контент, который появляется позже (фильтры, табы)
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (!pending) pending = window.setTimeout(() => ((pending = 0), scan()), 150);
    });
    mo.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true });

    // глитч
    const visible = new Set<Element>();
    const gio = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
    document.querySelectorAll('.glitch').forEach((el) => gio.observe(el));
    const gt = reduce
      ? 0
      : window.setInterval(() => {
          const arr = Array.from(visible);
          if (!arr.length) return;
          const el = arr[Math.floor(Math.random() * arr.length)];
          el.classList.add('is-glitching');
          window.setTimeout(() => el.classList.remove('is-glitching'), 430);
        }, 2600);

    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(pending);
      gio.disconnect();
      if (gt) clearInterval(gt);
    };
  }, [pathname]);

  return null;
}

function countUp(el: HTMLElement, reduce: boolean) {
  const to = parseFloat(el.dataset.countTo || '0');
  const dec = (el.dataset.countTo || '').includes('.') ? 1 : 0;
  if (reduce) {
    el.textContent = to.toFixed(dec);
    return;
  }
  const start = performance.now();
  const dur = 1400;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = (to * eased).toFixed(dec);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
