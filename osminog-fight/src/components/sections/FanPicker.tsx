'use client';

/**
 * Выбор любимого бойца для карты болельщика: все бойцы лиги за всю историю,
 * поиск по имени, городу и прозвищу, фильтр по дисциплине.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Discipline, FightEvent, Fighter } from '@/content/types';
import { disciplines } from '@/content/site';
import { Flag } from '@/components/ui/Primitives';
import { getLenis } from '@/components/fx/SmoothScroll';
import { recordStr } from '@/lib/cms';
import { asset } from '@/lib/asset';
import { plural } from '@/lib/format';
import { boutsOf } from '@/lib/stats';

/** Портрет бойца: фото, хедшот или инициалы */
export function FighterAvatar({ f, className = '', text = 'text-[clamp(1.6rem,4vw,2.4rem)]' }: { f: Fighter; className?: string; text?: string }) {
  if (f.photo) return <img src={asset(`${f.photo}-480.webp`)} alt="" loading="lazy" decoding="async" className={`object-cover object-[50%_15%] ${className}`} />;
  if (f.headshot) return <img src={asset(f.headshot)} alt="" loading="lazy" decoding="async" className={`object-cover object-top ${className}`} />;
  return (
    <span className={`grid place-items-center bg-gradient-to-b from-deep-2 to-abyss ${className}`} aria-hidden="true">
      <span className={`display text-ice/25 ${text}`}>{f.lastName.slice(0, 2)}</span>
    </span>
  );
}

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

export function FanPicker({ fighters, events, current, onPick, onClose }: { fighters: Fighter[]; events: FightEvent[]; current: string; onPick: (slug: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [d, setD] = useState<Discipline | ''>('');
  const [sort, setSort] = useState<'fights' | 'az'>('fights');
  const search = useRef<HTMLInputElement>(null);

  const count = useMemo(() => Object.fromEntries(fighters.map((f) => [f.slug, boutsOf(events, f.slug).filter((b) => b.outcome !== 'upcoming').length])), [fighters, events]);
  const used = useMemo(() => (Object.keys(disciplines) as Discipline[]).filter((x) => fighters.some((f) => f.disciplines.includes(x))), [fighters]);

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return fighters
      .filter((f) => {
        if (d && !f.disciplines.includes(d)) return false;
        const hay = norm([f.firstName, f.lastName, f.nickname, f.city].filter(Boolean).join(' '));
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => (sort === 'fights' ? count[b.slug] - count[a.slug] : 0) || a.lastName.localeCompare(b.lastName, 'ru'));
  }, [fighters, q, d, sort, count]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    search.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      getLenis()?.start();
      prev?.focus();
    };
  }, [onClose]);

  // в body: у предков страницы есть transform, и fixed-слой иначе уходит под шапку
  return createPortal(
    <div className="fixed inset-0 z-[150] bg-abyss/95 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="pick-title" onClick={onClose}>
      <div className="wrap flex h-full flex-col gap-5 py-5 md:py-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="pick-title" className="display t-3">
              Выберите своего бойца
            </h2>
            <p className="mt-2 text-[14px] text-mute">
              Все {fighters.length} {plural(fighters.length, ['боец', 'бойца', 'бойцов'])} «Осьминога» — от вечера боёв 2016 года до наших дней.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ice/25 text-[20px] hover:border-accent hover:text-accent" aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input ref={search} type="search" className="input md:max-w-sm" placeholder="Фамилия, имя, город…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск бойца" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Дисциплина">
            {[['', 'Все'] as const, ...used.map((x) => [x, disciplines[x].short] as const)].map(([k, label]) => (
              <button key={k || 'all'} type="button" aria-pressed={d === k} onClick={() => setD(k)} className={`chip ${d === k ? 'chip-cyan' : 'hover:text-ice'}`}>
                {label}
              </button>
            ))}
          </div>
          <label className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-mute md:ml-auto">
            Порядок
            <select value={sort} onChange={(e) => setSort(e.target.value as 'fights' | 'az')} className="rounded border border-ice/25 bg-abyss px-2 py-1.5 text-ice">
              <option value="fights">по числу боёв</option>
              <option value="az">по алфавиту</option>
            </select>
          </label>
        </div>

        <p className="mono text-[11px] uppercase tracking-[0.14em] text-faint" aria-live="polite">
          Найдено: {list.length} из {fighters.length}
        </p>

        <ul className="-mx-1 grid flex-1 auto-rows-max grid-cols-1 gap-3 min-[480px]:grid-cols-2 overflow-y-auto overscroll-contain px-1 pb-6 sm:grid-cols-3 lg:grid-cols-5" data-lenis-prevent="">
          {list.map((f) => {
            const n = count[f.slug];
            const on = f.slug === current;
            return (
              <li key={f.slug}>
                <button
                  type="button"
                  onClick={() => onPick(f.slug)}
                  aria-pressed={on}
                  className={`group flex w-full items-center gap-3 rounded-[var(--radius)] border p-2 text-left transition-colors ${on ? 'border-accent bg-accent/10' : 'border-line hover:border-ice/40 hover:bg-deep-2/40'}`}
                >
                  <FighterAvatar f={f} className="h-16 w-14 shrink-0 overflow-hidden rounded-[calc(var(--radius)/2)]" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    {f.firstName && <span className="truncate text-[12px] text-mute">{f.firstName}</span>}
                    <span className="display-upright truncate text-[20px] leading-none group-hover:text-accent">{f.lastName}</span>
                    <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-faint">
                      <Flag code={f.country} />
                      {n} {plural(n, ['бой', 'боя', 'боёв'])}
                      {f.record ? ` · ${recordStr(f)}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="col-span-full py-10 text-center text-mute">Никого не нашли. Проверьте написание или сбросьте фильтр.</li>}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
