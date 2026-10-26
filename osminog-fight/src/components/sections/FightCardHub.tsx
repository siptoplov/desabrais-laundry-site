'use client';

/**
 * Интерактивный Fight Card: переключение турниров, раскрытие статистики, голос за «любимца зрителей».
 * Голоса хранятся на устройстве; для общего лидерборда подключите API (см. README → «Голосование»).
 */
import { useEffect, useMemo, useState } from 'react';
import type { FightEvent } from '@/content/types';
import { BoutRow } from '@/components/ui/BoutRow';
import { positionRank, resolveCorner } from '@/lib/cms';
import { read } from '@/lib/storage';
import { fmtDate } from '@/lib/format';

export function FightCardHub({ events }: { events: FightEvent[] }) {
  const [slug, setSlug] = useState(events[0]?.slug);
  const [votes, setVotes] = useState<Record<string, 'red' | 'blue'>>({});
  const ev = events.find((e) => e.slug === slug)!;
  const bouts = useMemo(() => [...ev.bouts].sort((a, b) => positionRank[a.position] - positionRank[b.position]), [ev]);

  useEffect(() => {
    const load = () => {
      const v: Record<string, 'red' | 'blue'> = {};
      for (const b of ev.bouts) {
        const x = read<'red' | 'blue' | null>(`vote:${ev.slug}:${b.id}`, null);
        if (x) v[b.id] = x;
      }
      setVotes(v);
    };
    load();
    window.addEventListener('osm:storage', load);
    return () => window.removeEventListener('osm:storage', load);
  }, [ev]);

  const count = Object.keys(votes).length;
  const pct = Math.round((count / Math.max(1, ev.bouts.length)) * 100);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1" role="tablist" aria-label="Турниры">
          {events.map((e) => (
            <button
              key={e.slug}
              role="tab"
              type="button"
              aria-selected={e.slug === slug}
              onClick={() => setSlug(e.slug)}
              className={`shrink-0 rounded border px-5 py-3 text-left transition-colors ${e.slug === slug ? 'border-accent bg-deep text-ice' : 'border-line text-mute hover:border-ice hover:text-ice'}`}
            >
              <span className="display-upright block text-[24px] leading-none">
                {e.title} {e.collab && <span className="text-accent">{e.collab}</span>}
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">{e.date ? fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' }) : 'скоро'}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" className="flex flex-col gap-3">
          {bouts.map((b) => (
            <BoutRow key={`${ev.slug}-${b.id}`} bout={b} eventSlug={ev.slug} />
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <div className="panel flex flex-col gap-6 p-6">
          <p className="eyebrow">Ваш бюллетень</p>
          <div>
            <p className="display-upright text-[64px] leading-none">
              {count}
              <span className="text-mute">/{ev.bouts.length}</span>
            </p>
            <p className="label">голосов за любимцев</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          {count > 0 ? (
            <ul className="flex flex-col gap-2 text-[14px]">
              {ev.bouts
                .filter((b) => votes[b.id])
                .map((b) => {
                  const fav = resolveCorner(votes[b.id] === 'red' ? b.red : b.blue);
                  const opp = resolveCorner(votes[b.id] === 'red' ? b.blue : b.red);
                  return (
                    <li key={b.id} className="flex justify-between gap-3 border-b border-line pb-2">
                      <span className={votes[b.id] === 'red' ? 'tag-corner-red' : 'tag-corner-blue'}>{fav.short}</span>
                      <span className="text-faint">vs {opp.short}</span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p className="text-[14px] text-mute">Раскройте бой и отдайте голос любимцу зрителей.</p>
          )}
          <p className="text-[12px] text-faint">Голоса сохраняются на этом устройстве и видны в разделе «Мой Осьминог». Общий лидерборд болельщиков — с запуском аккаунтов.</p>
        </div>
      </aside>
    </div>
  );
}
