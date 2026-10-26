import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { BeltVisual } from '@/components/three/BeltVisual';
import { Flag } from '@/components/ui/Primitives';
import { fullName, getAllBouts, getFighters, recordStr, resolveCorner } from '@/lib/cms';
import { asset } from '@/lib/asset';
import { fmtDate } from '@/lib/format';
import { disciplines } from '@/content/site';

export const metadata: Metadata = {
  title: 'Чемпионы и дивизионы',
  description: 'Титулованные бойцы лиги «Осьминог», дивизионы по весовым категориям и история титульных боёв.',
  alternates: { canonical: '/rankings/' },
};

export default function RankingsPage() {
  const fighters = getFighters();
  const champs = fighters.filter((f) => f.badges?.includes('champion'));
  const weights = Array.from(new Set(fighters.map((f) => f.weightKg).filter(Boolean) as number[])).sort((a, b) => b - a);
  const titleFights = getAllBouts().filter(({ bout }) => bout.titleFight);

  return (
    <>
      <PageHero
        eyebrow="Зал чемпионов"
        title={['Чемпионы', <span key="s" className="text-outline">и дивизионы</span>]}
        lead="Пояса не дарят — их забирают. Титулы бойцов лиги, дивизионы по весу и история титульных боёв."
        crumbs={[{ name: 'Чемпионы', path: '/rankings/' }]}
        aside={
          <figure className="flex flex-col items-center gap-3">
            <BeltVisual className="aspect-square w-full max-w-[560px]" />
            <figcaption className="mono text-center text-[11px] uppercase tracking-[0.16em] text-faint">Концепт пояса чемпиона лиги · крутите мышью или пальцем</figcaption>
          </figure>
        }
      />

      {/* Титулованные */}
      <section className="section-tight" aria-labelledby="ch-title">
        <div className="wrap">
          <h2 id="ch-title" className="display t-2 mb-10">
            Титулованные
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {champs.map((f, i) => (
              <Link key={f.slug} href={`/fighters/${f.slug}/`} className="group relative grid grid-cols-[120px_1fr] overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 panel-hover sm:grid-cols-[180px_1fr]" data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                <div className="relative overflow-hidden">
                  {f.photo && <img src={asset(`${f.photo}-480.webp`)} alt="" width={480} height={600} loading="lazy" className="h-full w-full object-cover grayscale-[30%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-abyss-2" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-2">
                    <Flag code={f.country} />
                    <span className="mono text-[11px] uppercase tracking-[0.14em] text-mute">{f.weightKg ? `до ${String(f.weightKg).replace('.', ',')} кг` : ''}</span>
                  </div>
                  <p className="display text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.85]">{fullName(f)}</p>
                  <ul className="flex flex-col gap-1.5 text-[14px] text-mute">
                    {f.titles?.slice(0, 3).map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-[#e9c46a]" aria-hidden="true">
                          ◆
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Дивизионы */}
      <section className="section-tight" aria-labelledby="div-title">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="div-title" className="display t-2">
              Дивизионы
            </h2>
            <p className="max-w-md text-[13px] text-faint">Бойцы лиги по весовым категориям. Порядок — по доле побед в профессиональном рекорде; это не официальный рейтинг организации.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {weights.map((w) => {
              const list = fighters.filter((f) => f.weightKg === w).sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));
              return (
                <div key={w} className="panel p-6" data-reveal="">
                  <div className="mb-4 flex items-baseline justify-between">
                    <p className="display-upright text-[44px] leading-none">до {String(w).replace('.', ',')} кг</p>
                    <span className="label">{list.length} в ростере</span>
                  </div>
                  <ol className="flex flex-col">
                    {list.map((f, k) => (
                      <li key={f.slug}>
                        <Link href={`/fighters/${f.slug}/`} className="group grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 border-t border-line py-3">
                          <span className={`display-upright text-[24px] ${k === 0 ? 'text-[#e9c46a]' : 'text-faint'}`}>{k + 1}</span>
                          <span className="flex items-center gap-2">
                            <Flag code={f.country} />
                            <span className="display-upright text-[24px] transition-colors group-hover:text-accent">{fullName(f)}</span>
                          </span>
                          <span className="mono text-[13px] tabular text-mute">{recordStr(f)}</span>
                          <span className="mono w-12 text-right text-[13px] tabular text-ice">{f.winRate ? `${f.winRate}%` : '—'}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* История титулов */}
      <section className="section-tight" aria-labelledby="hist-title">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="hist-title" className="display t-2">
            Титульные бои в ринге лиги
          </h2>
          <ol className="flex flex-col border-t border-line">
            {titleFights.map(({ event, bout }) => (
              <li key={bout.id} className="flex flex-col gap-2 border-b border-line py-6">
                <span className="label">
                  {event.date && fmtDate(event.date)} · {event.title} · {disciplines[bout.discipline].label}
                </span>
                <span className="display-upright text-[34px] leading-tight">
                  {resolveCorner(bout.red).name} <span className="text-mute">vs</span> {resolveCorner(bout.blue).name}
                </span>
                <span className="chip chip-blood h-auto self-start whitespace-normal py-1">{bout.titleFight}</span>
                <Link href={`/events/${event.slug}/`} className="link-arrow self-start">
                  Смотреть бой →
                </Link>
              </li>
            ))}
            <li className="py-6 text-mute">Следующие титульные поединки — в анонсах турниров.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
