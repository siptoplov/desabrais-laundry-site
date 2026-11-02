/**
 * Статистика бойца по боям лиги. Чистые функции без импорта контента —
 * работают и на сервере (страница бойца), и в браузере (карта болельщика).
 */
import type { Bout, Discipline, FightEvent, Video } from '@/content/types';

export type Outcome = 'win' | 'loss' | 'draw' | 'unknown' | 'upcoming';

export interface FighterBout {
  event: FightEvent;
  bout: Bout;
  corner: 'red' | 'blue';
  /** slug или фамилия соперника */
  opponent: Corner;
  outcome: Outcome;
  /** Учебно-боевой спарринг — в статистику не идёт */
  exhibition: boolean;
}
type Corner = Bout['red'];

export interface FighterStats {
  /** Все выходы в ринг лиги, включая спарринги и объявленные бои */
  appearances: number;
  /** Официальные бои (без спаррингов и ещё не прошедших) */
  fights: number;
  wins: number;
  losses: number;
  draws: number;
  /** Официальные бои, итог которых не опубликован */
  unknown: number;
  events: number;
  first?: string;
  last?: string;
  disciplines: Discipline[];
  videos: number;
  views: number;
}

const dateOf = (e: FightEvent) => (e.date ? e.date.slice(0, 10) : '9999-12-31');

export function outcomeOf(event: FightEvent, bout: Bout, corner: 'red' | 'blue'): Outcome {
  if (event.status === 'upcoming') return 'upcoming';
  const r = bout.result;
  if (!r) return 'unknown';
  if (r.winner === 'draw') return 'draw';
  return r.winner === corner ? 'win' : 'loss';
}

/** Все бои бойца, от новых к старым */
export function boutsOf(events: FightEvent[], slug: string): FighterBout[] {
  const out: FighterBout[] = [];
  for (const event of events) {
    for (const bout of event.bouts) {
      const corner = bout.red === slug ? 'red' : bout.blue === slug ? 'blue' : null;
      if (!corner) continue;
      out.push({
        event,
        bout,
        corner,
        opponent: corner === 'red' ? bout.blue : bout.red,
        outcome: outcomeOf(event, bout, corner),
        exhibition: !!event.exhibition,
      });
    }
  }
  return out.sort((a, b) => dateOf(b.event).localeCompare(dateOf(a.event)));
}

export function statsOf(bouts: FighterBout[], videos: Video[] = []): FighterStats {
  const official = bouts.filter((b) => !b.exhibition && b.outcome !== 'upcoming');
  const count = (o: Outcome) => official.filter((b) => b.outcome === o).length;
  const dates = bouts.filter((b) => b.outcome !== 'upcoming' && b.event.date).map((b) => dateOf(b.event)).sort();
  const vids = bouts.map((b) => b.bout.video).filter(Boolean) as string[];
  return {
    appearances: bouts.length,
    fights: official.length,
    wins: count('win'),
    losses: count('loss'),
    draws: count('draw'),
    unknown: count('unknown'),
    events: new Set(bouts.map((b) => b.event.slug)).size,
    first: dates[0],
    last: dates[dates.length - 1],
    disciplines: Array.from(new Set(bouts.map((b) => b.bout.discipline))),
    videos: vids.length,
    views: vids.reduce((s, id) => s + (videos.find((v) => v.id === id)?.views ?? 0), 0),
  };
}

export const outcomeLabel: Record<Outcome, string> = {
  win: 'Победа',
  loss: 'Поражение',
  draw: 'Ничья',
  unknown: 'Итог не опубликован',
  upcoming: 'Скоро',
};

export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const rutubeUrl = (id: string) => `https://rutube.ru/video/${id}/`;

export interface FighterAnalytics {
  /** Победы досрочно (KO / TKO / сдача) и по решению */
  finishes: number;
  decisions: number;
  /** Текущая серия по известным итогам, от последнего боя */
  streak: { outcome: 'win' | 'loss' | 'draw'; n: number } | null;
  /** Форма — последние 5 официальных боёв, от нового к старому */
  form: Outcome[];
  /** Итоги по дисциплинам */
  byDiscipline: { discipline: Discipline; fights: number; wins: number; losses: number }[];
  /** Доля побед среди боёв с известным итогом, 0–100; null — итогов нет */
  winRate: number | null;
}

export function analyticsOf(bouts: FighterBout[]): FighterAnalytics {
  const official = bouts.filter((b) => !b.exhibition && b.outcome !== 'upcoming');
  const known = official.filter((b) => b.outcome === 'win' || b.outcome === 'loss' || b.outcome === 'draw');
  const wins = known.filter((b) => b.outcome === 'win');
  const finishes = wins.filter((b) => ['KO', 'TKO', 'SUB'].includes(b.bout.result?.method ?? '')).length;
  let streak: FighterAnalytics['streak'] = null;
  for (const b of known) {
    const o = b.outcome as 'win' | 'loss' | 'draw';
    if (!streak) streak = { outcome: o, n: 1 };
    else if (streak.outcome === o) streak.n++;
    else break;
  }
  const map = new Map<Discipline, { discipline: Discipline; fights: number; wins: number; losses: number }>();
  for (const b of official) {
    const d = map.get(b.bout.discipline) ?? { discipline: b.bout.discipline, fights: 0, wins: 0, losses: 0 };
    d.fights++;
    if (b.outcome === 'win') d.wins++;
    if (b.outcome === 'loss') d.losses++;
    map.set(b.bout.discipline, d);
  }
  return {
    finishes,
    decisions: wins.length - finishes,
    streak,
    form: official.slice(0, 5).map((b) => b.outcome),
    byDiscipline: Array.from(map.values()).sort((a, b) => b.fights - a.fights),
    winRate: known.length ? Math.round((wins.length / known.length) * 100) : null,
  };
}
