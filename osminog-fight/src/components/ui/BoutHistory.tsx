import Link from 'next/link';
import type { Fighter } from '@/content/types';
import { disciplines } from '@/content/site';
import { positionLabel, recordStr, resolveCorner } from '@/lib/cms';
import { fmtDate, fmtShort, fmtViews, plural } from '@/lib/format';
import { outcomeLabel, videoUrl, type FighterBout, type FighterStats, type Outcome } from '@/lib/stats';

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
