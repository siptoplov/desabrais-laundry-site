'use client';

/** Видеоархив: фильтры по турниру, дисциплине и типу, поиск по фамилии */
import { useMemo, useState } from 'react';
import type { Discipline, FightEvent, Video } from '@/content/types';
import { disciplines } from '@/content/site';
import { VideoCard } from '@/components/ui/VideoCard';

export function WatchHub({ videos, events }: { videos: Video[]; events: FightEvent[] }) {
  const [ev, setEv] = useState('');
  const [d, setD] = useState<Discipline | ''>('');
  const [kind, setKind] = useState<'' | 'fight' | 'other'>('');
  const [q, setQ] = useState('');
  const usedEvents = events.filter((e) => videos.some((v) => v.event === e.slug));
  const usedDisc = Array.from(new Set(videos.map((v) => v.discipline).filter(Boolean))) as Discipline[];

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return videos.filter(
      (v) => (!ev || v.event === ev) && (!d || v.discipline === d) && (!kind || (kind === 'fight' ? v.kind === 'fight' : v.kind !== 'fight')) && (!n || v.title.toLowerCase().includes(n)),
    );
  }, [videos, ev, d, kind, q]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Фильтр по турниру">
          <button type="button" aria-pressed={!ev} onClick={() => setEv('')} className={`chip h-9 shrink-0 px-4 ${!ev ? 'chip-cyan' : 'hover:text-ice'}`}>
            Все турниры
          </button>
          {usedEvents.map((e) => (
            <button key={e.slug} type="button" aria-pressed={ev === e.slug} onClick={() => setEv(ev === e.slug ? '' : e.slug)} className={`chip h-9 shrink-0 px-4 ${ev === e.slug ? 'chip-cyan' : 'hover:text-ice'}`}>
              {e.title} {e.collab}
            </button>
          ))}
        </div>
        <label className="relative lg:w-72">
          <span className="sr-only">Поиск по бойцу</span>
          <input type="search" className="input min-h-[44px]" placeholder="Фамилия бойца…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <div className="no-scrollbar -mx-1 mb-10 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Фильтр по дисциплине и типу">
        {usedDisc.map((x) => (
          <button key={x} type="button" aria-pressed={d === x} onClick={() => setD(d === x ? '' : x)} className={`chip h-9 shrink-0 px-4 ${d === x ? 'chip-cyan' : 'hover:text-ice'}`}>
            {disciplines[x].label}
          </button>
        ))}
        <span className="mx-2 w-px shrink-0 bg-line" aria-hidden="true" />
        <button type="button" aria-pressed={kind === 'fight'} onClick={() => setKind(kind === 'fight' ? '' : 'fight')} className={`chip h-9 shrink-0 px-4 ${kind === 'fight' ? 'chip-cyan' : 'hover:text-ice'}`}>
          Полные бои
        </button>
        <button type="button" aria-pressed={kind === 'other'} onClick={() => setKind(kind === 'other' ? '' : 'other')} className={`chip h-9 shrink-0 px-4 ${kind === 'other' ? 'chip-cyan' : 'hover:text-ice'}`}>
          Интервью и закулисье
        </button>
      </div>
      <p className="mono mb-6 text-[12px] uppercase tracking-[0.16em] text-mute" aria-live="polite">
        {list.length} видео
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>
    </div>
  );
}
