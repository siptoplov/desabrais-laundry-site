/**
 * Модель данных сайта.
 * Эти же типы описывают схему для headless CMS (см. cms/sanity/schemas) —
 * поэтому поля названы так, чтобы менеджер понимал их без программиста.
 */

export type Discipline = 'k1' | 'muaythai' | 'boxing' | 'mma' | 'eurothai';

export type CountryCode = 'BY' | 'RU' | 'IR' | 'KZ' | 'UA' | 'PL' | 'LT' | 'MD' | 'RO' | 'UZ' | 'KG' | 'AF';

export type FighterStatus = 'active' | 'retired';

export interface Fighter {
  slug: string;
  firstName?: string;
  lastName: string;
  nickname?: string;
  country: CountryCode;
  city?: string;
  disciplines: Discipline[];
  /** Весовая категория, кг (верхняя граница). Нет данных — не заполняем. */
  weightKg?: number;
  record?: { w: number; l: number; d?: number };
  /** Доля побед, % — как на официальных постерах */
  winRate?: number;
  age?: number;
  heightCm?: number;
  /** Портрет 960×1200 (и уменьшенная 480×600 с суффиксом -480) */
  photo?: string;
  /** Маленький портрет для андеркарда */
  headshot?: string;
  bio?: string[];
  titles?: string[];
  status: FighterStatus;
  badges?: ('champion' | 'replacement' | 'veteran' | 'prospect' | 'unbeaten' | 'home')[];
  instagram?: string;
  /** Показать в «звёздном» ряду на главной */
  featured?: boolean;
}

/** Участник боя: slug бойца из каталога или просто фамилия (если профиля ещё нет) */
export type Corner = string;

export type ResultMethod = 'KO' | 'TKO' | 'UD' | 'SD' | 'MD' | 'DEC' | 'DQ' | 'NC' | 'DRAW';

export interface BoutResult {
  winner: 'red' | 'blue' | 'draw';
  method?: ResultMethod;
  round?: number;
  time?: string;
  /** Записки судей, например ["30-27", "29-28", "28-29"] */
  scorecards?: string[];
  note?: string;
}

export type BoutPosition = 'main' | 'co-main' | 'main-card' | 'undercard' | 'special' | 'title';

export interface Bout {
  id: string;
  red: Corner;
  blue: Corner;
  discipline: Discipline;
  weightKg?: number;
  rules?: string;
  position: BoutPosition;
  headline?: string;
  note?: string;
  /** YouTube ID полного боя */
  video?: string;
  result?: BoutResult;
  titleFight?: string;
}

export type TicketStatus = 'soon' | 'onsale' | 'soldout' | 'closed';

export interface EventTickets {
  status: TicketStatus;
  url?: string;
  vendor?: string;
  from?: number;
  to?: number;
  currency?: 'BYN' | 'RUB' | 'USD' | 'EUR';
  note?: string;
  refund?: string;
}

export interface ScheduleItem {
  time?: string;
  title: string;
  text?: string;
}

export interface FightEvent {
  slug: string;
  number?: number;
  /** Полное название: «ОСЬМИНОГ-10» */
  title: string;
  /** Совместный бренд: «× BFC 86» */
  collab?: string;
  tagline: string;
  /** ISO со смещением, например 2026-10-09T18:00:00+03:00. null — дата ещё не объявлена */
  date: string | null;
  status: 'upcoming' | 'past';
  venue?: string;
  city: string;
  address?: string;
  age?: string;
  poster?: string;
  posters?: { src: string; alt: string }[];
  stats?: { bouts?: number; fighters?: number; disciplines?: number };
  disciplines?: Discipline[];
  story?: string[];
  schedule?: ScheduleItem[];
  bouts: Bout[];
  tickets?: EventTickets;
  guest?: { name: string; role: string };
  host?: string;
  highlights?: string[];
  /** Плейлист/канал с видео */
  watchUrl?: string;
  partners?: string[];
  sources?: { label: string; url: string }[];
}

export interface Video {
  id: string; // YouTube ID
  title: string;
  event: string; // slug события
  red?: string;
  blue?: string;
  discipline?: Discipline;
  kind: 'fight' | 'interview' | 'backstage' | 'ceremony';
  views?: number;
  published?: string;
}

export interface NewsItem {
  slug: string;
  date: string;
  title: string;
  lead: string;
  body: string[];
  tag: 'Анонс' | 'Кард' | 'Итоги' | 'Лига' | 'Шоу' | 'Замена';
  image?: string;
  event?: string;
  source?: { label: string; url: string };
}

export interface FaqItem {
  q: string;
  a: string;
  group: 'Билеты' | 'Турнир' | 'Бойцам' | 'Эфир' | 'Партнёрам';
}

export interface Product {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  sizes?: string[];
  colors: string[];
  art: 'tee' | 'hoodie' | 'shorts' | 'gloves' | 'cap' | 'belt';
  status: 'soon' | 'preorder' | 'available';
  price?: number;
}
