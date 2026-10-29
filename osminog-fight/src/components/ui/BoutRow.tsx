'use client';

/**
 * Строка боя в карде: углы, вес, правила, результат. По клику раскрывается:
 * сравнение бойцов, описание и видео боя. Есть голосование «любимец зрителей».
 */
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import type { Bout } from '@/content/types';
import { disciplines } from '@/content/site';
import { positionLabel, recordStr, resolveCorner, totalFights, type ResolvedCorner } from '@/lib/cms';
import { asset } from '@/lib/asset';
import { read, write } from '@/lib/storage';
import { play } from '@/lib/sound';
import { Flag } from './Primitives';
import { VideoCard } from './VideoCard';
import { getVideos } from '@/lib/cms';

const methodLabel: Record<string, string> = { KO: 'Нокаут', TKO: 'Технический нокаут', SUB: 'Болевой или удушающий приём', UD: 'Единогласное решение', SD: 'Раздельное решение', MD: 'Решение большинства', DEC: 'Решение судей', DQ: 'Дисквалификация', NC: 'Бой признан несостоявшимся', DRAW: 'Ничья' };

function Avatar({ c, side }: { c: ResolvedCorner; side: 'red' | 'blue' }) {
  const f = c.fighter;
  const src = f?.photo ? asset(`${f.photo}-480.webp`) : f?.headshot ? asset(f.headshot) : null;
  return (
    <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full border md:h-16 md:w-16 ${side === 'red' ? 'border-blood/60' : 'border-cyan/60'}`}>
      {src ? (
        <img src={src} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
      ) : (
        <span className="display grid h-full w-full place-items-center bg-deep text-[22px] text-ice/50">{c.short.slice(0, 1)}</span>
      )}
    </div>
  );
}

function CornerCell({ c, side, winner }: { c: ResolvedCorner; side: 'red' | 'blue'; winner?: boolean }) {
  const f = c.fighter;
  const body = (
    <div className={`flex min-w-0 items-center gap-3 md:gap-4 ${side === 'blue' ? 'flex-row-reverse text-right' : ''}`}>
      <Avatar c={c} side={side} />
      <div className="min-w-0">
        <div className={`flex items-center gap-2 ${side === 'blue' ? 'justify-end' : ''}`}>
          {f && <Flag code={f.country} />}
          {winner && <span className="chip chip-cyan">Победа</span>}
        </div>
        <p className="display truncate text-[clamp(1.35rem,2.2vw,2.1rem)] leading-[0.9]">
          {f?.firstName && <span className="hidden text-mute 2xl:inline">{f.firstName} </span>}
          {f ? f.lastName : c.name}
        </p>
        {f?.record && <p className="mono text-[12px] text-mute tabular">{recordStr(f)}</p>}
      </div>
    </div>
  );
  return f ? (
    <Link href={`/fighters/${f.slug}/`} className="min-w-0 transition-opacity hover:opacity-80" onClick={(e) => e.stopPropagation()}>
      {body}
    </Link>
  ) : (
    body
  );
}

export function BoutRow({ bout, eventSlug, defaultOpen, vote = true }: { bout: Bout; eventSlug: string; defaultOpen?: boolean; vote?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [pick, setPick] = useState<'red' | 'blue' | null>(null);
  const id = useId();
  const red = resolveCorner(bout.red);
  const blue = resolveCorner(bout.blue);
  const video = bout.video ? getVideos().find((v) => v.id === bout.video) : undefined;
  const key = `vote:${eventSlug}:${bout.id}`;

  useEffect(() => {
    setPick(read<'red' | 'blue' | null>(key, null));
  }, [key]);

  const doVote = (s: 'red' | 'blue') => {
    setPick(s);
    write(key, s);
    play('punch');
  };

  const major = bout.position === 'main' || bout.position === 'title' || bout.position === 'co-main';

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius)] border transition-colors ${open ? 'border-cyan/40 bg-deep/40' : 'border-line bg-abyss-2/60 hover:border-line-strong'} ${major ? 'shadow-[0_0_0_1px_rgba(255,43,58,.15)]' : ''}`} style={{ borderColor: undefined }}>
      {major && <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-blood" aria-hidden="true" />}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 md:gap-6 md:px-6">
        <CornerCell c={red} side="red" winner={bout.result?.winner === 'red'} />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="group flex flex-col items-center gap-1 px-1 text-center">
          <span className="mono hidden text-[10px] uppercase tracking-[0.16em] text-accent sm:block">{positionLabel[bout.position]}</span>
          <span className="display-upright text-[26px] leading-none text-ice/60 transition-colors group-hover:text-ice md:text-[34px]">VS</span>
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {disciplines[bout.discipline].short}
            {bout.weightKg ? ` · ${String(bout.weightKg).replace('.', ',')}` : ''}
          </span>
          <svg viewBox="0 0 24 24" className={`mt-1 h-4 w-4 text-mute transition-transform duration-500 ${open ? 'rotate-180' : ''}`} fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="sr-only">{open ? 'Свернуть' : 'Подробнее о бое'}</span>
        </button>
        <CornerCell c={blue} side="blue" winner={bout.result?.winner === 'blue'} />
      </div>

      <div id={id} className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden" inert={!open}>
          <div className="grid gap-8 border-t border-line px-4 py-6 md:grid-cols-[1.1fr_1fr] md:px-6">
            <div className="flex flex-col gap-5">
              {bout.titleFight && <span className="chip chip-blood h-auto self-start whitespace-normal py-1">{bout.titleFight}</span>}
              {bout.headline && <p className="display-upright text-[28px] leading-[0.95]">{bout.headline}</p>}
              {bout.rules && <p className="mono text-[12px] uppercase tracking-[0.14em] text-mute">{bout.rules}</p>}
              {bout.note && <p className="text-mute">{bout.note}</p>}
              {bout.result && (
                <div className="rounded border border-cyan/30 bg-cyan/5 p-4">
                  <p className="mono text-[11px] uppercase tracking-[0.16em] text-cyan">Итог</p>
                  <p className="mt-1 text-ice">
                    Победа — {bout.result.winner === 'red' ? red.name : bout.result.winner === 'blue' ? blue.name : 'ничья'}
                    {bout.result.method ? ` · ${methodLabel[bout.result.method]}` : ''}
                    {bout.result.round ? ` · ${bout.result.round}-й раунд` : ''}
                    {bout.result.time ? ` · ${bout.result.time}` : ''}
                  </p>
                  {bout.result.scorecards && <p className="mono mt-1 text-[12px] text-mute">Записки: {bout.result.scorecards.join(' · ')}</p>}
                  {bout.result.note && <p className="mt-1 text-[14px] text-mute">{bout.result.note}</p>}
                </div>
              )}
              {red.fighter?.record && blue.fighter?.record && <MiniCompare red={red} blue={blue} />}
              {vote && (
                <div className="flex flex-col gap-3">
                  <p className="label">Любимец зрителей — ваш голос</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['red', 'blue'] as const).map((s) => {
                      const c = s === 'red' ? red : blue;
                      const on = pick === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => doVote(s)}
                          aria-pressed={on}
                          className={`flex items-center justify-center gap-2 rounded border px-3 py-3 font-display text-[19px] font-[800] uppercase transition-all ${on ? (s === 'red' ? 'border-blood bg-blood text-white shadow-[0_0_24px_rgba(255,43,58,.5)]' : 'border-cyan bg-cyan text-abyss shadow-[0_0_24px_rgba(236,238,241,.45)]') : 'border-line text-mute hover:border-ice hover:text-ice'}`}
                        >
                          {on && '✓ '}
                          {c.short}
                        </button>
                      );
                    })}
                  </div>
                  {pick && <p className="text-[13px] text-mute">Голос учтён на этом устройстве. Общий рейтинг зрителей появится с запуском личного кабинета.</p>}
                </div>
              )}
            </div>
            <div>
              {video ? (
                <VideoCard v={video} showEvent={false} />
              ) : (
                <div className="grid h-full min-h-[200px] place-items-center rounded border border-dashed border-line p-6 text-center text-[14px] text-faint">Видео боя появится в разделе «Эфир»</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCompare({ red, blue }: { red: ResolvedCorner; blue: ResolvedCorner }) {
  const a = red.fighter!;
  const b = blue.fighter!;
  const rows: [string, string | number, string | number][] = [
    ['Рост', a.heightCm ? `${a.heightCm} см` : '—', b.heightCm ? `${b.heightCm} см` : '—'],
    ['Возраст', a.age ?? '—', b.age ?? '—'],
    ['Боёв', totalFights(a), totalFights(b)],
    ['Доля побед', a.winRate ? `${a.winRate}%` : '—', b.winRate ? `${b.winRate}%` : '—'],
  ];
  return (
    <dl className="grid grid-cols-[1fr_auto_1fr] gap-x-4 gap-y-2 rounded border border-line p-4">
      {rows.map(([k, x, y]) => (
        <div key={k} className="contents">
          <dd className="mono text-[14px] tabular tag-corner-red">{x}</dd>
          <dt className="mono text-center text-[10px] uppercase tracking-[0.14em] text-faint">{k}</dt>
          <dd className="mono text-right text-[14px] tabular tag-corner-blue">{y}</dd>
        </div>
      ))}
    </dl>
  );
}
