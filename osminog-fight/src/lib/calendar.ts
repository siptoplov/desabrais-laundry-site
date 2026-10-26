import type { FightEvent } from '@/content/types';
import { site } from '@/content/site';
import { toDate } from './format';

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function range(e: FightEvent) {
  const start = toDate(e.date!);
  const end = new Date(start.getTime() + 5 * 3600 * 1000);
  return { start, end };
}

const where = (e: FightEvent) => [e.venue, e.address, e.city].filter(Boolean).join(', ');

/** Ссылка «Добавить в Google Календарь» */
export function googleCalendarUrl(e: FightEvent) {
  const { start, end } = range(e);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.title}${e.collab ? ' ' + e.collab : ''} — ${site.name}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `${e.tagline}\n${site.url}/events/${e.slug}/`,
    location: where(e),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** .ics-файл для Apple/Outlook (скачивается на клиенте) */
export function icsContent(e: FightEvent) {
  const { start, end } = range(e);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OSMINOG FIGHT//RU',
    'BEGIN:VEVENT',
    `UID:${e.slug}@osminog.fight`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${e.title} — ${site.name}`,
    `LOCATION:${where(e)}`,
    `DESCRIPTION:${e.tagline}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${e.title} через 3 часа`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
