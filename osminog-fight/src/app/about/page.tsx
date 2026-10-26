import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Btn } from '@/components/ui/Btn';
import { LogoMark } from '@/components/brand/Logo';
import { SplitTitle } from '@/components/ui/Primitives';
import { about, rules, safety } from '@/content/pages';
import { disciplines, site } from '@/content/site';
import { legends } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'О лиге — история, миссия, правила',
  description: '«Осьминог» — лига профессиональных боёв в Минске с 2009 года: история, миссия, правила (раунды, вес, экипировка, судейство, допинг-контроль) и безопасность бойцов.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow={`С ${site.since} года`} title={['Восемь', <span key="s" className="text-outline-accent">щупалец</span>]} lead={about.mission} crumbs={[{ name: 'О лиге', path: '/about/' }]} aside={<LogoMark className="mx-auto h-auto w-full max-w-[420px] drop-shadow-[0_0_60px_rgba(0,229,255,.25)]" />} />

      {/* Манифест */}
      <section className="section-tight">
        <div className="wrap">
          <ol className="flex flex-col">
            {about.manifesto.map((m, i) => (
              <li key={m} className="grid grid-cols-[60px_1fr] items-baseline gap-4 border-t border-line py-8 md:grid-cols-[120px_1fr]" data-reveal="" style={{ ['--d' as string]: `${i * 0.08}s` }}>
                <span className="mono text-[13px] text-accent">0{i + 1}</span>
                <p className="display-upright text-[clamp(2rem,4.6vw,4.4rem)] leading-[0.95]">{m}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* История */}
      <section className="section-tight" aria-labelledby="hist">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow mb-6">История</p>
            <SplitTitle lines={['Из клубного', <span key="s" className="text-outline">зала — в Prime Hall</span>]} className="display t-2" />
          </div>
          <ol className="relative flex flex-col border-l border-line pl-8">
            {about.history.map((h, i) => (
              <li key={h.year} className="relative pb-12 last:pb-0" data-reveal="" style={{ ['--d' as string]: `${i * 0.06}s` }}>
                <span className="absolute -left-[39px] top-2 h-4 w-4 rounded-full border-2 border-cyan bg-abyss shadow-[0_0_12px_rgba(0,229,255,.6)]" aria-hidden="true" />
                <p className="display-upright text-[56px] leading-none text-accent">{h.year}</p>
                <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-mute">{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ценности */}
      <section className="section-tight">
        <div className="wrap grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <div key={v.title} className="panel p-6" data-reveal="" style={{ ['--d' as string]: `${i * 0.07}s` }}>
              <p className="mono text-[12px] text-accent">0{i + 1}</p>
              <p className="display-upright mt-4 text-[32px] leading-none">{v.title}</p>
              <p className="mt-3 text-mute">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Дисциплины */}
      <section className="section-tight" aria-labelledby="disc">
        <div className="wrap">
          <h2 id="disc" className="display t-2 mb-10">
            Дисциплины
          </h2>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line md:grid-cols-2 lg:grid-cols-5">
            {Object.values(disciplines).map((d) => (
              <div key={d.label} className="flex flex-col gap-3 bg-abyss p-6">
                <p className="display text-[40px] leading-none">{d.label}</p>
                <p className="text-[15px] text-mute">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Правила */}
      <section id="rules" className="section-tight scroll-mt-20" aria-labelledby="rules-t">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="rules-t" className="display t-2">
              Правила
            </h2>
            <p className="max-w-md text-[13px] text-faint">Общий регламент профессиональных боёв лиги. Детали каждого поединка — в карде турнира.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rules.map((r) => (
              <div key={r.title} className="rounded-[var(--radius)] border border-line p-6">
                <p className="display-upright text-[32px] leading-none">{r.title}</p>
                <ul className="mt-4 flex flex-col gap-2 text-[15px] text-mute">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span className="text-blood" aria-hidden="true">
                        —
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Безопасность */}
      <section className="section-tight" aria-labelledby="safe">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-6">Безопасность бойцов</p>
            <SplitTitle lines={['Бой кончается', <span key="s" className="text-blood">раньше здоровья</span>]} className="display t-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {safety.map((s) => (
              <div key={s.title} className="border-l-2 border-cyan pl-5">
                <p className="display-upright text-[28px] leading-tight">{s.title}</p>
                <p className="mt-2 text-mute">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="section-tight" aria-labelledby="team">
        <div className="wrap">
          <h2 id="team" className="display t-2 mb-10">
            Кто за этим стоит
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {about.organizers.map((o) => (
              <div key={o.name} className="panel flex flex-col gap-3 p-6">
                <p className="display-upright text-[34px] leading-none">{o.name}</p>
                <p className="text-mute">{o.text}</p>
                {o.url && (
                  <a href={o.url} target="_blank" rel="noopener noreferrer" className="link-arrow mt-auto self-start">
                    Сайт клуба ↗
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="mt-16">
            <p className="eyebrow mb-6">В ринге «Осьминога» выходили</p>
            <p className="display-upright text-[clamp(1.6rem,3vw,2.6rem)] leading-snug text-mute">{legends.join(' · ')}</p>
          </div>
          <div className="mt-14 flex flex-wrap gap-4">
            <Btn href="/join/">Выступать у нас</Btn>
            <Btn href="/join/#partners" variant="ghost">
              Стать партнёром
            </Btn>
          </div>
        </div>
      </section>
    </>
  );
}
