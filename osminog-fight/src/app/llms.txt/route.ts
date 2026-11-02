import { site, disciplines } from '@/content/site';
import { fullName, getEvents, getFighter, getFighters, resolveCorner } from '@/lib/cms';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-static';

/**
 * /llms.txt — короткая справка о лиге для ИИ-поисковиков (ChatGPT, Claude, Perplexity, Яндекс-нейро):
 * факты, турниры с итогами и ссылки на страницы. Собирается из тех же данных, что и сайт.
 */
const method: Record<string, string> = { KO: 'нокаут', TKO: 'технический нокаут', SUB: 'сдача', UD: 'единогласное решение', SD: 'раздельное решение', MD: 'решение большинства', DEC: 'решение судей', DQ: 'дисквалификация', NC: 'бой не состоялся', DRAW: 'ничья' };

export function GET() {
  const u = (p: string) => `${site.url}${p}`;
  const events = getEvents();
  const next = events.find((e) => e.status === 'upcoming');
  const champions = getFighters().filter((f) => f.badges?.includes('champion'));
  const lines: string[] = [
    `# ${site.name} (${site.nameLatin})`,
    '',
    `> ${site.description}`,
    '',
    `- Организатор: ${site.legalName}, ${site.city}, Беларусь. Лига проводит турниры с ${site.since} года.`,
    `- Дисциплины: ${Object.values(disciplines).map((d) => d.label).join(', ')}.`,
    `- Билеты: ${site.contacts.ticketSupport.name} (${site.contacts.ticketSupport.phone}).`,
    `- Видео боёв: YouTube ${site.socials.youtube}, Rutube ${site.socials.rutube}. Instagram: ${site.socials.instagram}`,
    '',
    '## Следующий турнир',
    next ? `- [${next.title}](${u(`/events/${next.slug}/`)}): ${next.date ? fmtDate(next.date) : 'дата уточняется'}, ${[next.venue, next.city].filter(Boolean).join(', ')}. Билеты: ${u('/tickets/')}` : '- Дата следующего турнира будет объявлена.',
    '',
    '## Чемпионы лиги',
    ...champions.map((f) => `- [${fullName(f)}](${u(`/fighters/${f.slug}/`)})${f.weightKg ? `, до ${f.weightKg} кг` : ''}${f.titles?.[0] ? ` — ${f.titles[0]}` : ''}`),
    '',
    '## Турниры и итоги боёв',
  ];
  for (const e of events.filter((x) => x.status === 'past')) {
    lines.push('', `### [${e.title}${e.collab ? ` ${e.collab}` : ''}](${u(`/events/${e.slug}/`)}) — ${e.date ? fmtDate(e.date) : 'дата не указана'}${e.venue ? `, ${e.venue}` : ''}, ${e.city}`);
    for (const b of e.bouts) {
      const r = resolveCorner(b.red).name;
      const bl = resolveCorner(b.blue).name;
      const res = b.result;
      const outcome = !res ? 'итог не опубликован' : res.winner === 'draw' ? 'ничья' : `победа: ${res.winner === 'red' ? r : bl}${res.method && res.method !== 'DRAW' ? `, ${method[res.method]}` : ''}${res.round ? `, ${res.round}-й раунд` : ''}`;
      lines.push(`- ${r} — ${bl} (${disciplines[b.discipline].label}${b.weightKg ? `, ${b.weightKg} кг` : ''}): ${outcome}`);
    }
  }
  lines.push('', '## Разделы', ...[
    ['Турниры', '/events/'], ['Бойцы', '/fighters/'], ['Чемпионы и рейтинги', '/rankings/'], ['Результаты', '/results/'], ['Билеты', '/tickets/'], ['Видео боёв', '/watch/'], ['О лиге', '/about/'], ['Вопросы и ответы', '/faq/'], ['Контакты', '/contacts/'],
  ].map(([n, p]) => `- [${n}](${u(p)})`));
  void getFighter;
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
