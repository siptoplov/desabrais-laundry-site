'use client';

/** Галерея с лайтбоксом: клавиатура (← → Esc), свайп, скачивание оригинала */
import { useCallback, useEffect, useRef, useState } from 'react';
import { asset, posterSrcSet } from '@/lib/asset';

export type GalleryItem = { src: string; alt: string };

export function Gallery({ items, download = true, cols = 'sm:grid-cols-2 lg:grid-cols-4' }: { items: GalleryItem[]; download?: boolean; cols?: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setIdx(null);
    lastFocus.current?.focus();
  }, []);
  const go = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (idx === null) return;
    closeBtn.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [idx, close, go]);

  return (
    <>
      <ul className={`grid grid-cols-2 gap-4 ${cols}`}>
        {items.map((it, i) => (
          <li key={it.src}>
            <button
              type="button"
              className="group relative block w-full overflow-hidden rounded-[var(--radius)] border border-line"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setIdx(i);
              }}
              aria-label={`Открыть: ${it.alt}`}
              data-cursor="view"
              data-cursor-label="Смотреть"
            >
              <img src={asset(`${it.src}-560.webp`)} srcSet={posterSrcSet(it.src)} sizes="(min-width:1024px) 25vw, 50vw" alt={it.alt} width={560} height={700} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>

      {idx !== null && (
        <div
          className="fixed inset-0 z-[150] flex flex-col bg-abyss/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={items[idx].alt}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <span className="mono text-[12px] text-mute">
              {idx + 1} / {items.length} · {items[idx].alt}
            </span>
            <div className="flex items-center gap-3">
              {download && (
                <a className="chip hover:text-ice" href={asset(`${items[idx].src}-1080.webp`)} download>
                  Скачать
                </a>
              )}
              <button ref={closeBtn} type="button" onClick={close} className="grid h-11 w-11 place-items-center rounded-full border border-line text-[22px] hover:border-ice" aria-label="Закрыть">
                ×
              </button>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-14 pb-8">
            <img src={asset(`${items[idx].src}-1080.webp`)} alt={items[idx].alt} className="max-h-full max-w-full rounded object-contain shadow-[0_40px_120px_-30px_rgba(236,238,241,.35)]" />
            <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-abyss/60 hover:border-ice md:left-6" aria-label="Предыдущее">
              ←
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-abyss/60 hover:border-ice md:right-6" aria-label="Следующее">
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
