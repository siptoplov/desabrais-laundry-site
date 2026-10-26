// Готовит данные для OG-картинок из src/content (запуск: node scripts/og-data.mts)
import { writeFileSync } from 'node:fs';
import { events } from '../src/content/events.ts';
import { fighters } from '../src/content/fighters.ts';

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Minsk', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso.length === 10 ? `${iso}T12:00:00+03:00` : iso));

const data = {
  events: events.map((e) => ({
    slug: e.slug,
    title: e.title,
    collab: e.collab ?? '',
    poster: e.poster ?? '',
    when: e.date ? fmt(e.date) : 'Дата — скоро',
    place: [e.venue, e.city].filter(Boolean).join(' · '),
  })),
  fighters: fighters
    .filter((f) => f.photo)
    .map((f) => ({
      slug: f.slug,
      first: f.firstName ?? '',
      last: f.lastName,
      photo: f.photo,
      record: f.record ? `${f.record.w}-${f.record.l}${f.record.d ? `-${f.record.d}` : ''}` : '—',
      meta: [f.country, f.weightKg ? `до ${String(f.weightKg).replace('.', ',')} кг` : ''].filter(Boolean).join(' · '),
    })),
};
writeFileSync(new URL('./og-data.json', import.meta.url), JSON.stringify(data, null, 2));
console.log('og-data.json:', data.events.length, 'турниров,', data.fighters.length, 'бойцов');
