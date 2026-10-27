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
