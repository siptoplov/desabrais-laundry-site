/**
 * Схема зала для страницы «Билеты».
 * Зоны, цены и раскладка рядов. Генератор мест — в components/tickets/ArenaMap.tsx.
 * ⚠ Цены — ориентир по «Осьминогу-10» (55–155,50 BYN). Актуальные — при старте продаж.
 */
export type ZoneId = 'ringside' | 'vip' | 'lounge' | 'parter' | 'tribune';

export interface Zone {
  id: ZoneId;
  name: string;
  price: number;
  color: string;
  perks: string;
}

export const zones: Zone[] = [
  { id: 'ringside', name: 'Ringside', price: 155.5, color: '#FF2B3A', perks: 'Ряды на танцполе вокруг ринга. Слышно каждый удар.' },
  { id: 'vip', name: 'VIP', price: 135, color: '#E9C46A', perks: 'Первые ряды амфитеатра прямо над рингом.' },
  { id: 'lounge', name: 'Lounge', price: 110, color: '#B78CFF', perks: 'Ложи балкона со столиком на 4, бар, вид на весь зал.' },
  { id: 'parter', name: 'Партер', price: 85, color: '#ECEEF1', perks: 'Сектора B, C и D амфитеатра — напротив ринга.' },
  { id: 'tribune', name: 'Трибуна', price: 55, color: '#7FA3C7', perks: 'Боковые сектора A и E. Видно ринг и выход бойцов.' },
];

/**
 * Раскладка Prime Hall (Минск) — по схеме зала на TicketPro: сцена с экраном в торце,
 * ринг на танцполе перед сценой, вокруг подковой амфитеатр — сектора A–E, выше балкон с ложами.
 * Ringside — ряды на танцполе вокруг ринга; VIP — первые ряды секторов B–D; Партер — остальные ряды
 * B–D; Трибуна — боковые сектора A и E; Lounge — ложи балкона со столиками.
 */
export interface Sector {
  id: string;
  label: string;
  /** Угол от оси «ринг — центр зала», градусы: минус — слева от ринга, плюс — справа */
  from: number;
  to: number;
  rows: number;
  /** Сколько первых рядов — VIP */
  vipRows: number;
  zone: 'parter' | 'tribune';
}

export const sectors: Sector[] = [
  { id: 'A', label: 'Сектор A', from: -80, to: -54, rows: 7, vipRows: 0, zone: 'tribune' },
  { id: 'B', label: 'Сектор B', from: -49, to: -20, rows: 7, vipRows: 2, zone: 'parter' },
  { id: 'C', label: 'Сектор C', from: -15, to: 15, rows: 7, vipRows: 2, zone: 'parter' },
  { id: 'D', label: 'Сектор D', from: 20, to: 49, rows: 7, vipRows: 2, zone: 'parter' },
  { id: 'E', label: 'Сектор E', from: 54, to: 80, rows: 7, vipRows: 0, zone: 'tribune' },
];

/** Ряды на танцполе вокруг ринга: слева, справа и со стороны зала (к сцене — проход бойцов) */
export const ringsideRows = 2;

/** Ложи балкона: столик на 4 места */
export const boxes = { count: 16, seats: 4 };

/** Промокоды (в проде — проверка на стороне билетного оператора) */
export const promoCodes: Record<string, number> = {};

export const ticketRules = {
  maxSeats: 8,
  holdMinutes: 10,
};
