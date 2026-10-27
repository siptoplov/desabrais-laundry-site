import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { getPastEvents, positionLabel, positionRank, resolveCorner } from '@/lib/cms';
import { disciplines } from '@/content/site';
import { fmtDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Результаты боёв',
  description: 'Итоги турниров «Осьминог»: победитель, способ, раунд, время, записки судей и видео каждого боя.',
  alternates: { canonical: '/results/' },
};

const methodShort: Record<string, string> = { KO: 'KO', TKO: 'TKO', SUB: 'Сдача', UD: 'Решение (ед.)', SD: 'Решение (разд.)', MD: 'Решение (больш.)', DEC: 'Решение', DQ: 'Дисквал.', NC: 'Не сост.', DRAW: 'Ничья' };

export default function ResultsPage() {
  const events = getPastEvents().filter((e) => e.bouts.length);
  return (
    <>
      <PageHero
        eyebrow="Протоколы"
        title={['Результаты', <span key="s" className="text-outline">боёв</span>]}
        lead="Победитель, способ, раунд, время и записки судей. Итоги вносятся по официальным протоколам; для каждого боя — полное видео."
        crumbs={[{ name: 'Результаты', path: '/results/' }]}
        compact
      />
      <section className="pb-24">
        <div className="wrap flex flex-col gap-16">
          {events.map((e) => (
            <div key={e.slug}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
                <h2 className="display t-3">
                  <Link href={`/events/${e.slug}/`} className="hover:text-accent">
                    {e.title} {e.collab && <span className="text-accent">{e.collab}</span>}
                  </Link>
                </h2>
                <span className="label-mute">
                  {e.date && fmtDate(e.date)} · {[e.venue, e.city].filter(Boolean).join(', ')}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <caption className="sr-only">Результаты {e.title}</caption>
                  <thead>
                    <tr className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Бой
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Позиция
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Дисциплина
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Победитель
                      </th>
                      <th scope="col" className="py-3 pr-4 font-normal">
                        Способ · раунд · время
                      </th>
                      <th scope="col" className="py-3 font-normal">
                        Видео
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...e.bouts]
                      .sort((a, b) => positionRank[a.position] - positionRank[b.position])
                      .map((b) => {
                        const r = resolveCorner(b.red);
                        const bl = resolveCorner(b.blue);
                        const win = b.result ? (b.result.winner === 'red' ? r : b.result.winner === 'blue' ? bl : null) : null;
                        return (
                          <tr key={b.id} className="border-t border-line align-top">
                            <td className="py-4 pr-4">
                              <span className="display-upright text-[22px] leading-tight">
                                <span className={b.result?.winner === 'red' ? 'text-ice' : 'text-mute'}>{r.short}</span> <span className="text-faint">—</span>{' '}
                                <span className={b.result?.winner === 'blue' ? 'text-ice' : 'text-mute'}>{bl.short}</span>
                              </span>
                              {b.titleFight && <span className="mt-1 block text-[12px] text-blood">{b.titleFight}</span>}
                            </td>
                            <td className="mono py-4 pr-4 text-[12px] text-mute">{positionLabel[b.position]}</td>
                            <td className="mono py-4 pr-4 text-[12px] text-mute">
                              {disciplines[b.discipline].label}
                              {b.weightKg ? ` · ${String(b.weightKg).replace('.', ',')} кг` : ''}
                            </td>
                            <td className="py-4 pr-4">{win ? <span className="chip chip-cyan">{win.short}</span> : b.result?.winner === 'draw' ? <span className="chip">Ничья</span> : <span className="text-[13px] text-faint">уточняется</span>}</td>
                            <td className="mono py-4 pr-4 text-[12px] text-mute">
                              {b.result ? [b.result.method && methodShort[b.result.method], b.result.round && `R${b.result.round}`, b.result.time, b.result.scorecards?.join(' / '), b.result.note].filter(Boolean).join(' · ') || '—' : '—'}
                            </td>
                            <td className="py-4">
                              {b.video ? (
                                <a href={`https://www.youtube.com/watch?v=${b.video}`} target="_blank" rel="noopener noreferrer" className="link-arrow">
                                  ▶ Бой
                                </a>
                              ) : (
                                <span className="text-faint">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
