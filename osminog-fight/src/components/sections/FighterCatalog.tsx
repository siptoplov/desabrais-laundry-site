'use client';

/**
 * Каталог бойцов: поиск, фильтры (дисциплина, страна, вес, статус), сортировка — без перезагрузки.
 * Состояние фильтров пишется в URL (?q=&d=&c=&w=&s=&sort=) — ссылкой можно поделиться.
 */
import { useEffect, useMemo, useState } from 'react';
import type { CountryCode, Discipline, Fighter } from '@/content/types';
import { countries, disciplines } from '@/content/site';
import { FighterCard } from '@/components/ui/Cards';
import { fullName, totalFights } from '@/lib/cms';
import { plural } from '@/lib/format';

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`chip h-9 px-4 text-[12px] transition-colors ${on ? 'chip-cyan' : 'hover:border-ice hover:text-ice'}`}>
      {children}
    </button>
  );
}

type Sort = 'featured' | 'name' | 'wins' | 'winrate' | 'age';

export function FighterCatalog({ fighters }: { fighters: Fighter[] }) {
  const [q, setQ] = useState('');
  const [d, setD] = useState<Discipline | ''>('');
  const [c, setC] = useState<CountryCode | ''>('');
  const [w, setW] = useState<string>('');
  const [s, setS] = useState<'' | 'active' | 'retired'>('');
  const [sort, setSort] = useState<Sort>('featured');

  // восстановить из URL
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQ(p.get('q') ?? '');
    setD((p.get('d') as Discipline) ?? '');
    setC((p.get('c') as CountryCode) ?? '');
    setW(p.get('w') ?? '');
    setS((p.get('s') as '' | 'active' | 'retired') ?? '');
    setSort((p.get('sort') as Sort) ?? 'featured');
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (d) p.set('d', d);
    if (c) p.set('c', c);
    if (w) p.set('w', w);
    if (s) p.set('s', s);
    if (sort !== 'featured') p.set('sort', sort);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }, [q, d, c, w, s, sort]);

  const usedDisc = useMemo(() => Array.from(new Set(fighters.flatMap((f) => f.disciplines))), [fighters]);
  const usedCountries = useMemo(() => Array.from(new Set(fighters.map((f) => f.country))), [fighters]);
  const usedWeights = useMemo(() => Array.from(new Set(fighters.map((f) => f.weightKg).filter(Boolean) as number[])).sort((a, b) => a - b), [fighters]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = fighters.filter(
      (f) =>
        (!needle || `${fullName(f)} ${f.nickname ?? ''} ${f.city ?? ''}`.toLowerCase().includes(needle)) &&
        (!d || f.disciplines.includes(d)) &&
        (!c || f.country === c) &&
        (!w || String(f.weightKg) === w) &&
        (!s || f.status === s),
    );
    const by: Record<Sort, (a: Fighter, b: Fighter) => number> = {
      featured: (a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.photo) - Number(!!a.photo),
      name: (a, b) => a.lastName.localeCompare(b.lastName, 'ru'),
      wins: (a, b) => (b.record?.w ?? -1) - (a.record?.w ?? -1),
      winrate: (a, b) => (b.winRate ?? -1) - (a.winRate ?? -1),
      age: (a, b) => (a.age ?? 99) - (b.age ?? 99),
    };
    return [...out].sort(by[sort]);
  }, [fighters, q, d, c, w, s, sort]);

  const reset = () => {
    setQ('');
    setD('');
    setC('');
    setW('');
    setS('');
    setSort('featured');
  };
  const activeFilters = [q, d, c, w, s].filter(Boolean).length;

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-30 -mx-[var(--gutter)] mb-10 border-y border-line bg-abyss/85 px-[var(--gutter)] py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Поиск бойца</span>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, прозвище, город…" className="input pl-12" />
            </label>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="label">
                Сортировка
              </label>
              <select id="sort" className="input min-h-[48px] w-auto pr-12" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="featured">Главные</option>
                <option value="name">По фамилии</option>
                <option value="wins">Больше побед</option>
                <option value="winrate">Доля побед</option>
                <option value="age">Моложе</option>
              </select>
            </div>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Фильтры">
            <Pill on={!d} onClick={() => setD('')}>
              Все стили
            </Pill>
            {usedDisc.map((x) => (
              <Pill key={x} on={d === x} onClick={() => setD(d === x ? '' : x)}>
                {disciplines[x].label}
              </Pill>
            ))}
            <span className="mx-2 w-px shrink-0 bg-line" aria-hidden="true" />
            {usedCountries.map((x) => (
              <Pill key={x} on={c === x} onClick={() => setC(c === x ? '' : x)}>
                {countries[x].name}
              </Pill>
            ))}
            <span className="mx-2 w-px shrink-0 bg-line" aria-hidden="true" />
            {usedWeights.map((x) => (
              <Pill key={x} on={w === String(x)} onClick={() => setW(w === String(x) ? '' : String(x))}>
                до {String(x).replace('.', ',')} кг
              </Pill>
            ))}
            <span className="mx-2 w-px shrink-0 bg-line" aria-hidden="true" />
            <Pill on={s === 'active'} onClick={() => setS(s === 'active' ? '' : 'active')}>
              Действующие
            </Pill>
            <Pill on={s === 'retired'} onClick={() => setS(s === 'retired' ? '' : 'retired')}>
              Завершили
            </Pill>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="label-mute" aria-live="polite">
          {list.length} {plural(list.length, ['боец', 'бойца', 'бойцов'])}
        </p>
        {activeFilters > 0 && (
          <button type="button" onClick={reset} className="link-arrow">
            Сбросить фильтры
          </button>
        )}
      </div>

      {list.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {list.map((f, i) => (
            <div key={f.slug} className="animate-[fadeUp_.6s_cubic-bezier(.16,1,.3,1)_both]" style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}>
              <FighterCard f={f} priority={i < 4} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid place-items-center gap-4 rounded border border-dashed border-line py-20 text-center">
          <p className="display t-3">Бездна молчит</p>
          <p className="text-mute">По этим условиям никого. Попробуйте ослабить хватку.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            <span>Сбросить</span>
          </button>
        </div>
      )}
      <p className="mt-10 text-[13px] text-faint">
        Всего в базе: {fighters.length} · {fighters.reduce((n, f) => n + totalFights(f), 0)} профессиональных боёв в рекордах бойцов.
      </p>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
