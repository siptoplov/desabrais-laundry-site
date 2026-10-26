'use client';

/**
 * Видео без тяжёлого YouTube-плеера до клика (facade): превью + кнопка.
 * По клику подгружается youtube-nocookie iframe с автозапуском. Экономит ~800 КБ на странице.
 */
import { useState } from 'react';
import type { Video } from '@/content/types';
import { ytThumb } from '@/lib/asset';
import { fmtViews } from '@/lib/format';
import { disciplines } from '@/content/site';
import { getEvent } from '@/lib/cms';

export function VideoCard({ v, big, showEvent = true }: { v: Video; big?: boolean; showEvent?: boolean }) {
  const [play, setPlay] = useState(false);
  const ev = getEvent(v.event);
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 ${big ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <div className="relative aspect-video overflow-hidden bg-abyss">
        {play ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1&hl=ru`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" className="absolute inset-0 h-full w-full" onClick={() => setPlay(true)} aria-label={`Смотреть: ${v.title}`} data-cursor="play" data-cursor-label="Смотреть">
            <img src={ytThumb(v.id, 'hq')} alt="" loading="lazy" decoding="async" width={480} height={360} className="h-full w-full scale-[1.34] object-cover grayscale-[40%] transition duration-[1200ms] group-hover:scale-[1.4] group-hover:grayscale-0" />
            <span className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ice/40 bg-abyss/40 backdrop-blur transition-all duration-500 group-hover:scale-110 group-hover:border-blood group-hover:bg-blood">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" aria-hidden="true">
                <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
        {!play && v.views ? <span className="mono pointer-events-none absolute right-3 top-3 rounded bg-abyss/70 px-2 py-1 text-[10px] tracking-[0.1em] text-mute">{fmtViews(v.views)} просм.</span> : null}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-faint">
          {showEvent && ev && (
            <span className="text-accent">
              {ev.title}
              {ev.collab ? ` ${ev.collab}` : ''}
            </span>
          )}
          {v.discipline && <span>{disciplines[v.discipline].label}</span>}
          {v.kind !== 'fight' && <span>{v.kind === 'interview' ? 'Интервью' : v.kind === 'ceremony' ? 'Церемония' : 'Закулисье'}</span>}
        </div>
        <h3 className={`display-upright leading-[0.95] ${big ? 'text-[clamp(1.8rem,3vw,2.6rem)]' : 'text-[22px]'}`}>{v.title}</h3>
      </div>
    </article>
  );
}
