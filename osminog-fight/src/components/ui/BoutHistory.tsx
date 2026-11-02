import Link from 'next/link';
import type { Fighter } from '@/content/types';
import { disciplines } from '@/content/site';
import { positionLabel, recordStr, resolveCorner } from '@/lib/cms';
import { fmtDate, fmtShort, fmtViews, plural } from '@/lib/format';
import { outcomeLabel, videoUrl, type FighterAnalytics, type FighterBout, type FighterStats, type Outcome } from '@/lib/stats';

const outcomeChip: Record<Outcome, string> = { win: 'chip-cyan', loss: 'chip-blood', draw: '', unknown: '', upcoming: 'chip-cyan' };

/** Бои бойца в лиге: дата, соперник, турнир, итог и ссылка на запись боя */
export function BoutHistory({ bouts }: { bouts: FighterBout[] }) {
  return (
    <ol className="flex flex-col border-t border-line">
      {bouts.map(({ event, bout, opponent, outcome, exhibition }) => {
        const opp = resolveCorner(opponent);
        const meta = [`${event.title}${event.collab ? ` ${event.collab}` : ''}`, positionLabel[bout.position], disciplines[bout.discipline].label, bout.weightKg ? `${String(bout.weightKg).replace('.', ',')} кг` : ''];
        return (
          <li key={`${event.slug}-${bout.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-5 md:grid md:grid-cols-[150px_minmax(0,1fr)_auto_190px]">
            <span className="mono order-1 text-[12px] uppercase tracking-[0.14em] text-faint">{event.date ? fmtDate(event.date, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Дата уточняется'}</span>
            <span className={`chip order-2 ml-auto md:order-3 md:ml-0 ${exhibition ? '' : outcomeChip[outcome]}`}>{exhibition ? 'Спарринг' : outcomeLabel[outcome]}</span>
            <span className="order-3 flex w-full min-w-0 flex-col md:order-2 md:w-auto">
              <span className="display-upright text-[clamp(1.4rem,2.4vw,1.75rem)] leading-tight">
                vs{' '}
                {opp.fighter ? (
                  <Link href={`/fighters/${opp.fighter.slug}/`} className="hover:text-accent">
                    {opp.name}
                  </Link>
                ) : (
                  opp.name
                )}
              </span>
              <Link href={`/events/${event.slug}/`} className="mono text-[11px] uppercase tracking-[0.14em] text-mute hover:text-ice">
                {meta.filter(Boolean).join(' · ')}
              </Link>
              {bout.result?.note && <span className="mt-1 text-[13px] text-faint">{bout.result.note}</span>}
            </span>
            {bout.video ? (
              <a href={videoUrl(bout.video)} target="_blank" rel="noopener noreferrer" className="link-arrow order-4 md:justify-self-end">
                Смотреть бой ↗
              </a>
            ) : (
              <Link href={`/events/${event.slug}/`} className="link-arrow order-4 text-mute md:justify-self-end">
                {event.status === 'upcoming' ? 'Кард турнира →' : 'О турнире →'}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Плитки статистики бойца: рекорд в карьере и цифры по боям лиги */
export function StatsGrid({ f, bouts, st }: { f: Fighter; bouts: FighterBout[]; st: FighterStats }) {
  const upcoming = bouts.filter((b) => b.outcome === 'upcoming').length;
  const spar = bouts.filter((b) => b.exhibition).length;
  const fightsSub =
    [upcoming && `${upcoming} ${plural(upcoming, ['бой объявлен', 'боя объявлено', 'боёв объявлено'])}`, spar && `${spar} ${plural(spar, ['спарринг', 'спарринга', 'спаррингов'])} не в счёт`].filter(Boolean).join(' · ') ||
    `${st.events} ${plural(st.events, ['турнир', 'турнира', 'турниров'])}`;
  const tiles = [
    ['Рекорд в карьере', recordStr(f), f.record && f.recordAsOf ? `на ${fmtShort(f.recordAsOf)}` : f.record ? 'по постеру лиги' : 'не опубликован'],
    ['Боёв в лиге', String(st.fights), fightsSub],
    ['Победы', String(st.wins), 'по итогам лиги'],
    ['Поражения', String(st.losses), st.draws ? `ничьих: ${st.draws}` : 'по итогам лиги'],
    ['В лиге с', st.first ? st.first.slice(0, 4) : '—', st.last && st.first !== st.last ? `последний бой ${fmtShort(st.last)}` : st.last ? fmtShort(st.last) : 'дебют впереди'],
    ['Просмотры боёв', st.views ? fmtViews(st.views) : '—', st.videos ? `${st.videos} ${plural(st.videos, ['запись', 'записи', 'записей'])} на YouTube` : 'записей пока нет'],
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(([k, v, sub]) => (
          <div key={k} className="flex flex-col gap-1 bg-abyss-2 p-5">
            <dt className="label">{k}</dt>
            <dd className="display-upright text-[clamp(2rem,3.4vw,2.8rem)] leading-none">{v}</dd>
            <dd className="mono text-[10px] uppercase tracking-[0.12em] text-faint">{sub}</dd>
          </div>
        ))}
      </dl>
      {st.unknown > 0 && (
        <p className="max-w-3xl text-[13px] text-faint">
          Победы и поражения — только по опубликованным итогам; итог не опубликован: {st.unknown} из {st.fights}. Рекорд в карьере — по последнему официальному постеру или описанию боя.
        </p>
      )}
    </div>
  );
}

const formDot: Record<Outcome, string> = { win: 'bg-cyan', loss: 'bg-blood', draw: 'bg-mute', unknown: 'border border-ice/25', upcoming: 'border border-cyan' };
const formLetter: Record<Outcome, string> = { win: 'П', loss: 'П', draw: 'Н', unknown: '?', upcoming: '·' };

/** Аналитика бойца: доля побед, как побеждает, серия, форма и итоги по дисциплинам */
export function FighterAnalyticsPanel({ a }: { a: FighterAnalytics }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const wins = a.finishes + a.decisions;
  return (
    <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line md:grid-cols-[auto_1fr_1fr]">
      {/* доля побед */}
      <div className="flex items-center gap-5 bg-abyss-2 p-5">
        <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="8" className="text-line" />
          {a.winRate !== null && (
            <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-blood [filter:drop-shadow(0_0_6px_rgba(255,43,58,.6))]" strokeDasharray={`${(C * a.winRate) / 100} ${C}`} />
          )}
        </svg>
        <div className="flex flex-col gap-1">
          <span className="label">Доля побед</span>
          <span className="display-upright text-[clamp(2.2rem,3.6vw,3rem)] leading-none">{a.winRate === null ? '—' : `${a.winRate}%`}</span>
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-faint">по известным итогам лиги</span>
        </div>
      </div>
      {/* как побеждает + серия */}
      <div className="flex flex-col gap-4 bg-abyss-2 p-5">
        <span className="label">Как побеждает</span>
        <div className="flex h-3 overflow-hidden rounded-full bg-line">
          {wins > 0 && <span className="h-full bg-blood" style={{ width: `${(a.finishes / wins) * 100}%` }} />}
          {wins > 0 && <span className="h-full bg-ice/70" style={{ width: `${(a.decisions / wins) * 100}%` }} />}
        </div>
        <div className="mono flex justify-between text-[11px] uppercase tracking-[0.12em] text-mute">
          <span>
            <span className="text-blood">●</span> Досрочно {a.finishes}
          </span>
          <span>
            <span className="text-ice/70">●</span> Решением {a.decisions}
          </span>
        </div>
        <span className="label mt-2">Серия</span>
        <span className="display-upright text-[26px] leading-none">
          {a.streak ? `${a.streak.n} ${a.streak.outcome === 'win' ? plural(a.streak.n, ['победа', 'победы', 'побед']) : a.streak.outcome === 'loss' ? plural(a.streak.n, ['поражение', 'поражения', 'поражений']) : plural(a.streak.n, ['ничья', 'ничьи', 'ничьих'])} подряд` : 'нет данных'}
        </span>
      </div>
      {/* форма + дисциплины */}
      <div className="flex flex-col gap-4 bg-abyss-2 p-5">
        <span className="label">Форма · последние бои</span>
        <div className="flex gap-2">
          {a.form.length ? (
            a.form.map((o, i) => (
              <span key={i} title={outcomeLabel[o]} className={`mono grid h-8 w-8 place-items-center rounded-full text-[11px] ${o === 'win' || o === 'loss' ? 'text-abyss' : 'text-mute'} ${formDot[o]}`}>
                {o === 'win' ? 'В' : formLetter[o]}
              </span>
            ))
          ) : (
            <span className="text-mute">боёв ещё не было</span>
          )}
        </div>
        <span className="label mt-2">По дисциплинам</span>
        <ul className="flex flex-col gap-1.5">
          {a.byDiscipline.map((d) => (
            <li key={d.discipline} className="mono flex justify-between text-[12px] uppercase tracking-[0.12em]">
              <span className="text-ice">{disciplines[d.discipline].label}</span>
              <span className="text-mute">
                {d.fights} {plural(d.fights, ['бой', 'боя', 'боёв'])} · {d.wins}–{d.losses}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
