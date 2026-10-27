import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Btn } from '@/components/ui/Btn';
import { Stat } from '@/components/ui/Primitives';
import { sponsorFormats } from '@/content/pages';
import { partners } from '@/content/site';
import { sponsors, sponsorsReady, sponsorTiers, type Sponsor } from '@/content/sponsors';
import { getFighters, getPastEvents, getVideos } from '@/lib/cms';
import { asset } from '@/lib/asset';
import { plural } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Спонсоры лиги',
  description: 'Спонсоры и партнёры лиги «Осьминог»: компании, благодаря которым проходят турниры. Форматы спонсорства и медиакит.',
  alternates: { canonical: '/sponsors/' },
  // пока спонсоры не объявлены — страница-заготовка не нужна поисковикам
  robots: sponsorsReady ? undefined : { index: false },
};

const sizes: Record<Sponsor['tier'], { grid: string; tile: string; name: string }> = {
  general: { grid: 'grid-cols-1', tile: 'min-h-[240px] md:min-h-[300px]', name: 'text-[clamp(2.6rem,6vw,5rem)]' },
  official: { grid: 'sm:grid-cols-2 lg:grid-cols-3', tile: 'min-h-[200px]', name: 'text-[clamp(2rem,3.4vw,2.8rem)]' },
  supporting: { grid: 'grid-cols-2 lg:grid-cols-4', tile: 'min-h-[150px]', name: 'text-[clamp(1.4rem,2.4vw,1.9rem)]' },
};

function SponsorTile({ s, size }: { s: Sponsor; size: (typeof sizes)[Sponsor['tier']] }) {
  const body = (
    <>
      {s.logo ? <img src={asset(s.logo)} alt={s.name} loading="lazy" className="max-h-24 w-auto max-w-[80%] object-contain" /> : <span className={`display-upright text-center leading-none ${size.name}`}>{s.name}</span>}
      {s.text && <span className="mono text-center text-[11px] uppercase tracking-[0.14em] text-mute">{s.text}</span>}
    </>
  );
  const cls = `panel flex flex-col items-center justify-center gap-4 p-6 ${size.tile}`;
  return s.url ? (
    <a href={s.url} target="_blank" rel="noopener noreferrer sponsored" className={`${cls} panel-hover`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function FreeSlot({ label, size }: { label: string; size: (typeof sizes)[Sponsor['tier']] }) {
  return (
    <a href="#become" className={`group flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-ice/20 p-6 text-center transition-colors hover:border-accent ${size.tile}`}>
      <span className="mono text-[11px] uppercase tracking-[0.16em] text-faint">{label}</span>
      <span className="display-upright text-[clamp(1.4rem,2.4vw,2rem)] leading-none text-mute transition-colors group-hover:text-accent">Место свободно</span>
      <span className="link-arrow text-faint group-hover:text-accent">Стать спонсором →</span>
    </a>
  );
}

export default function SponsorsPage() {
  const past = getPastEvents();
  const bouts = past.reduce((n, e) => n + e.bouts.length, 0);
  const views = getVideos().reduce((n, v) => n + (v.views ?? 0), 0);
  const fighters = getFighters();
  const countries = new Set(fighters.map((f) => f.country).filter((c) => c !== 'XX')).size;

  return (
    <>
      <PageHero
        eyebrow="Спонсоры"
        title={['Сила', <span key="s" className="text-outline-accent">за рингом</span>]}
        lead="Компании, благодаря которым «Осьминог» выходит из тьмы в свет ринга. Спасибо, что вы с нами."
        crumbs={[{ name: 'Спонсоры', path: '/sponsors/' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Btn href="#become">Стать спонсором</Btn>
          <Btn href="#partners" variant="ghost" icon="none">
            Партнёры лиги
          </Btn>
        </div>
      </PageHero>

      {/* уровни спонсоров */}
      {sponsorTiers.map(({ tier, label, one, text, slots }) => {
        const list = sponsors.filter((s) => s.tier === tier);
        const free = Math.max(0, slots - list.length);
        const size = sizes[tier];
        return (
          <section key={tier} className="section-tight" aria-labelledby={`tier-${tier}`}>
            <div className="wrap">
              <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h2 id={`tier-${tier}`} className="display t-3">
                  {label}
                </h2>
                <p className="max-w-md text-[14px] text-faint">{text}</p>
              </div>
              <div className={`grid gap-4 ${size.grid}`}>
                {list.map((s) => (
                  <SponsorTile key={s.name} s={s} size={size} />
                ))}
                {Array.from({ length: free }, (_, i) => (
                  <FreeSlot key={i} label={one} size={size} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* действующие партнёры */}
      <section id="partners" className="section-tight scroll-mt-24 border-t border-line" aria-labelledby="partners-title">
        <div className="wrap flex flex-col gap-10">
          <h2 id="partners-title" className="display t-3">
            Партнёры лиги
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[partners.general, partners.tv].map((p) => (
              <div key={p.name} className="panel flex flex-col gap-2 p-6 md:p-8">
                <span className="mono text-[11px] uppercase tracking-[0.16em] text-faint">{p.role}</span>
                <span className="display-upright text-[clamp(2rem,4vw,3.2rem)] leading-none">{p.name}</span>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {partners.list.map((p) => (
              <li key={p} className="display-upright text-[clamp(1.4rem,2.4vw,1.9rem)] text-mute">
                {p}
              </li>
            ))}
          </ul>
          <div>
            <p className="label mb-3">При поддержке</p>
            <p className="text-mute">{partners.federations.join(' · ')}</p>
          </div>
        </div>
      </section>

      {/* цифры лиги */}
      <section className="section-tight border-t border-line" aria-labelledby="numbers-title">
        <div className="wrap flex flex-col gap-10">
          <h2 id="numbers-title" className="display t-3">
            Лига в цифрах
          </h2>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <Stat countTo={past.length} label="Турниров в архиве" />
            <Stat countTo={bouts} label="Боёв в ринге лиги" />
            <Stat countTo={fighters.length} label={`Бойцов из ${countries} ${plural(countries, ['страны', 'стран', 'стран'])}`} />
            <Stat value={`${Math.round(views / 1000)}`} suffix=" тыс." label="Просмотров боёв на YouTube" />
          </div>
        </div>
      </section>

      {/* форматы и заявка */}
      <section id="become" className="section-tight scroll-mt-24 border-t border-line" aria-labelledby="become-title">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">Для компаний</p>
            <h2 id="become-title" className="display t-2">
              Станьте спонсором
            </h2>
            <p className="text-mute">Выберите формат — пришлём медиакит с аудиторией, охватами и ценами и подберём место под задачи бренда.</p>
            <Btn href="/join/#partners">Запросить медиакит</Btn>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sponsorFormats.map((f, i) => (
              <div key={f.title} className="rounded-[var(--radius)] border border-line p-6">
                <p className="mono text-[12px] text-accent">0{i + 1}</p>
                <p className="display-upright mt-3 text-[26px] leading-tight">{f.title}</p>
                <p className="mt-2 text-[15px] text-mute">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
