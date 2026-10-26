import { locale } from '@/i18n';

const TZ = 'Europe/Minsk';

/** Дата без времени: «2026-05-08». Для таких событий время не показываем. */
export const isDateOnly = (iso: string) => iso.length === 10;

export const toDate = (iso: string) => new Date(isDateOnly(iso) ? `${iso}T12:00:00+03:00` : iso);

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, ...opts }).format(toDate(iso));
}

export function fmtDay(iso: string) {
  return new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, day: '2-digit' }).format(toDate(iso));
}

export function fmtMonth(iso: string, style: 'long' | 'short' = 'long') {
  const s = new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, day: 'numeric', month: style }).format(toDate(iso));
  return s.replace(/^\d+\s/, '').replace('.', '');
}

export function fmtWeekday(iso: string) {
  return new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, weekday: 'long' }).format(toDate(iso));
}

export function fmtTime(iso: string) {
  if (isDateOnly(iso)) return '';
  return new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(toDate(iso));
}

export function fmtShort(iso: string) {
  return new Intl.DateTimeFormat(locale.intl, { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(toDate(iso));
}

export function fmtMoney(v: number, currency = 'BYN') {
  const n = new Intl.NumberFormat(locale.intl, { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(v);
  return `${n} ${currency}`;
}

export function fmtViews(v?: number) {
  if (!v) return '';
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.', ',').replace(',0', '')} тыс.`;
  return String(v);
}

/** Склонение: plural(5, ['бой','боя','боёв']) */
export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const pad = (n: number) => String(n).padStart(2, '0');
