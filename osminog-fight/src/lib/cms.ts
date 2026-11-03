/**
 * Слой доступа к данным.
 * Сейчас данные лежат в src/content/*.ts (JSON-заглушки с реальным контентом).
 * Чтобы подключить headless CMS (Sanity/Strapi), достаточно переписать функции
 * в этом файле — компоненты страниц останутся без изменений.
 */
import { events, chronicle } from '@/content/events';
import { fighters, legends } from '@/content/fighters';
import { videos } from '@/content/videos';
import { clubs } from '@/content/clubs';
import { news } from '@/content/news';
import type { Bout, Corner, Fighter } from '@/content/types';
import { boutsOf, statsOf } from '@/lib/stats';

export { chronicle, legends };

export const getEvents = () => events;
export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const getUpcoming = () => events.find((e) => e.status === 'upcoming');
export const getPastEvents = () => events.filter((e) => e.status === 'past');
/** Последний прошедший турнир с главным боем — для блока «Лицом к лицу» */
export const getLatestPast = () => events.find((e) => e.status === 'past' && e.bouts.some((b) => b.position === 'main' && getFighter(b.red)?.photo));

/**
 * Текущий рекорд: в данных — рекорд ДО боя (с постера или описания боя на дату recordAsOf),
 * к нему прибавляются итоги всех боёв лиги с этой даты (спарринги не в счёт).
 * recordAsOf становится датой последнего учтённого боя.
 */
function withLeagueResults(f: Fighter): Fighter {
  if (!f.record || !f.recordAsOf) return f;
  const from = f.recordAsOf.slice(0, 10);
  const counted = boutsOf(events, f.slug).filter((b) => !b.exhibition && b.event.date && b.event.date.slice(0, 10) >= from && (b.outcome === 'win' || b.outcome === 'loss' || b.outcome === 'draw'));
  if (!counted.length) return f;
  const r = { ...f.record, d: f.record.d ?? 0 };
  for (const b of counted) b.outcome === 'win' ? r.w++ : b.outcome === 'loss' ? r.l++ : r.d++;
  const last = counted.map((b) => b.event.date!.slice(0, 10)).sort().at(-1)!;
  const total = r.w + r.l + r.d;
  return { ...f, record: r.d ? r : { w: r.w, l: r.l }, recordAsOf: last, ...(f.winRate !== undefined && total ? { winRate: Math.round((r.w / total) * 100) } : {}) };
}

/** У бойцов из архива дисциплины не заполнены вручную — берём их из боёв; клуб и тренер — из clubs.ts */
const allFighters: Fighter[] = fighters.map((f) =>
  withLeagueResults({
    ...clubs[f.slug],
    ...f,
    disciplines: f.disciplines.length ? f.disciplines : Array.from(new Set(boutsOf(events, f.slug).map((b) => b.bout.discipline))),
  }),
);

export const getFighters = () => allFighters;
export const getFighter = (slug?: string) => (slug ? allFighters.find((f) => f.slug === slug) : undefined);

export const getVideos = () => videos;
export const getNews = () => [...news].sort((a, b) => b.date.localeCompare(a.date));
export const getNewsItem = (slug: string) => news.find((n) => n.slug === slug);

export interface ResolvedCorner {
  fighter?: Fighter;
  name: string;
  short: string;
}

/** Угол боя → боец из каталога или просто фамилия */
export function resolveCorner(c: Corner): ResolvedCorner {
  const f = getFighter(c);
  if (f) return { fighter: f, name: fullName(f), short: f.lastName };
  return { name: c, short: c };
}

export const fullName = (f: Fighter) => [f.firstName, f.lastName].filter(Boolean).join(' ');

export const recordStr = (f?: Fighter) => (f?.record ? `${f.record.w}-${f.record.l}${f.record.d ? `-${f.record.d}` : ''}` : '—');

export const totalFights = (f: Fighter) => (f.record ? f.record.w + f.record.l + (f.record.d ?? 0) : 0);

/** Все бои бойца в лиге (по slug), от новых к старым */
export const getFighterBouts = (slug: string) => boutsOf(events, slug);

/** Статистика бойца по боям лиги */
export const getFighterStats = (slug: string) => statsOf(boutsOf(events, slug), videos);

/** Видео бойца: по боям в лиге */
export function getFighterVideos(slug: string) {
  return getFighterBouts(slug)
    .filter((b) => b.bout.video)
    .map((b) => videos.find((v) => v.id === b.bout.video))
    .filter(Boolean) as typeof videos;
}

/** Все бои всех турниров, плоским списком (для «Результатов») */
export function getAllBouts() {
  return events.flatMap((event) => event.bouts.map((bout) => ({ event, bout })));
}

/** Порядок важности боя в карде */
export const positionRank: Record<Bout['position'], number> = { main: 0, title: 0, 'co-main': 1, 'main-card': 2, special: 3, undercard: 4 };
export const positionLabel: Record<Bout['position'], string> = {
  main: 'Главный бой',
  title: 'Титульный бой',
  'co-main': 'Со-главный бой',
  'main-card': 'Главный кард',
  special: 'Спецпроект',
  undercard: 'Андеркард',
};
