/**
 * Слой доступа к данным.
 * Сейчас данные лежат в src/content/*.ts (JSON-заглушки с реальным контентом).
 * Чтобы подключить headless CMS (Sanity/Strapi), достаточно переписать функции
 * в этом файле — компоненты страниц останутся без изменений.
 */
import { events, chronicle } from '@/content/events';
import { fighters, legends } from '@/content/fighters';
import { videos } from '@/content/videos';
import { news } from '@/content/news';
import type { Bout, Corner, FightEvent, Fighter } from '@/content/types';

export { chronicle, legends };

export const getEvents = () => events;
export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
export const getUpcoming = () => events.find((e) => e.status === 'upcoming');
export const getPastEvents = () => events.filter((e) => e.status === 'past');
/** Последний прошедший турнир с главным боем — для блока «Лицом к лицу» */
export const getLatestPast = () => events.find((e) => e.status === 'past' && e.bouts.some((b) => b.position === 'main' && getFighter(b.red)?.photo));

export const getFighters = () => fighters;
export const getFighter = (slug?: string) => (slug ? fighters.find((f) => f.slug === slug) : undefined);

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

/** Все бои бойца в лиге (по slug) */
export function getFighterBouts(slug: string): { event: FightEvent; bout: Bout; corner: 'red' | 'blue' }[] {
  const out: { event: FightEvent; bout: Bout; corner: 'red' | 'blue' }[] = [];
  for (const event of events) {
    for (const bout of event.bouts) {
      if (bout.red === slug) out.push({ event, bout, corner: 'red' });
      else if (bout.blue === slug) out.push({ event, bout, corner: 'blue' });
    }
  }
  return out;
}

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
