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
  { id: 'ringside', name: 'Ringside', price: 155.5, color: '#FF2B3A', perks: 'Первый ряд у канатов. Слышно каждый удар.' },
  { id: 'vip', name: 'VIP', price: 135, color: '#E9C46A', perks: 'Столы у ринга, отдельный вход, обслуживание.' },
  { id: 'lounge', name: 'Lounge', price: 110, color: '#B78CFF', perks: 'Ложи на 6 мест, бар, лучший обзор на выход бойцов.' },
  { id: 'parter', name: 'Партер', price: 85, color: '#00E5FF', perks: 'Ряды вдоль ринга. Центр событий.' },
  { id: 'tribune', name: 'Трибуна', price: 55, color: '#7FA3C7', perks: 'Амфитеатр. Видно всё — от ринга до экранов.' },
];

/** Блоки мест: сторона ринга, зона, ряды, мест в ряду */
export interface SeatBlock {
  id: string;
  zone: ZoneId;
  side: 'N' | 'S' | 'E' | 'W';
  rows: number;
  seats: number;
  /** Отступ от ринга (в единицах схемы) */
  offset: number;
  label: string;
}

export const blocks: SeatBlock[] = [
  { id: 'RS-N', zone: 'ringside', side: 'N', rows: 1, seats: 14, offset: 22, label: 'Ringside · Север' },
  { id: 'RS-S', zone: 'ringside', side: 'S', rows: 1, seats: 14, offset: 22, label: 'Ringside · Юг' },
  { id: 'RS-E', zone: 'ringside', side: 'E', rows: 1, seats: 10, offset: 22, label: 'Ringside · Восток' },
  { id: 'RS-W', zone: 'ringside', side: 'W', rows: 1, seats: 10, offset: 22, label: 'Ringside · Запад' },
  { id: 'VIP-N', zone: 'vip', side: 'N', rows: 2, seats: 16, offset: 52, label: 'VIP · Север' },
  { id: 'VIP-S', zone: 'vip', side: 'S', rows: 2, seats: 16, offset: 52, label: 'VIP · Юг' },
  { id: 'P-N', zone: 'parter', side: 'N', rows: 5, seats: 22, offset: 112, label: 'Партер · Север' },
  { id: 'P-S', zone: 'parter', side: 'S', rows: 5, seats: 22, offset: 112, label: 'Партер · Юг' },
  { id: 'P-E', zone: 'parter', side: 'E', rows: 4, seats: 12, offset: 66, label: 'Партер · Восток' },
  { id: 'P-W', zone: 'parter', side: 'W', rows: 4, seats: 12, offset: 66, label: 'Партер · Запад' },
  { id: 'T-E', zone: 'tribune', side: 'E', rows: 6, seats: 16, offset: 170, label: 'Трибуна · Восток' },
  { id: 'T-W', zone: 'tribune', side: 'W', rows: 6, seats: 16, offset: 170, label: 'Трибуна · Запад' },
];

/** Ложи Lounge — по углам, по 6 мест */
export const lounges = [
  { id: 'L1', label: 'Ложа 1', corner: 'NW' as const },
  { id: 'L2', label: 'Ложа 2', corner: 'NE' as const },
  { id: 'L3', label: 'Ложа 3', corner: 'SE' as const },
  { id: 'L4', label: 'Ложа 4', corner: 'SW' as const },
];

/** Промокоды (в проде — проверка на стороне билетного оператора) */
export const promoCodes: Record<string, number> = {};

export const ticketRules = {
  maxSeats: 8,
  holdMinutes: 10,
};
