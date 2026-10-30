import Link from 'next/link';
import type { FightEvent, Fighter, NewsItem } from '@/content/types';
import { disciplines } from '@/content/site';
import { fullName, recordStr } from '@/lib/cms';
import { asset, photoSrcSet, posterSrcSet } from '@/lib/asset';
import { fmtDate, fmtDay, fmtMonth } from '@/lib/format';
import { Flag } from './Primitives';
import { LogoMark } from '@/components/brand/Logo';

const badgeLabel: Record<NonNullable<Fighter['badges']>[number], string> = {
  champion: 'Чемпион',
  replacement: 'Замена',
  veteran: 'Ветеран',
  prospect: 'Проспект',
  unbeaten: 'Без поражений',
  home: 'Хозяин ринга',
};

/** Силуэт для бойцов без фото: инициалы на фоне знака */
export function Silhouette({ f, className = '' }: { f: Fighter; className?: string }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-b from-deep-2 to-abyss ${className}`}>
      <LogoMark className="absolute h-[70%] w-[70%] opacity-[0.07]" mono />
      <span className="display text-[clamp(3rem,8vw,6rem)] text-ice/20">{f.lastName.slice(0, 2)}</span>
    </div>
  );
}

export function FighterCard({ f, priority, size = 'md' }: { f: Fighter; priority?: boolean; size?: 'md' | 'sm' }) {
  return (
    <Link
      href={`/fighters/${f.slug}/`}
      className="group relative block overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 panel-hover"
      data-cursor="view"
      data-cursor-label="Профиль"
    >
      <div className={`relative ${size === 'sm' ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden`}>
        {f.photo ? (
          <img
            src={asset(`${f.photo}-480.webp`)}
            srcSet={photoSrcSet(f.photo)}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            alt={fullName(f)}
            width={480}
            height={600}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full scale-[1.02] object-cover grayscale-[35%] transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 group-hover:grayscale-0"
          />
        ) : f.headshot ? (
          <img src={asset(f.headshot)} alt={fullName(f)} width={230} height={284} loading="lazy" decoding="async" className="h-full w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <Silhouette f={f} className="h-full w-full" />
        )}
        {/* контровой свет */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-700 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 100% 30%, rgba(236,238,241,.35), transparent 70%), radial-gradient(50% 50% at 0% 40%, rgba(255,43,58,.3), transparent 70%)' }} />
        {/* щупальца-рамка */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-cyan opacity-0 transition-opacity duration-500 group-hover:opacity-100" viewBox="0 0 100 125" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path d="M0 30 C 6 20, 4 8, 14 2" stroke="currentColor" strokeWidth=".6" className="[stroke-dasharray:40] [stroke-dashoffset:40] transition-[stroke-dashoffset] duration-700 group-hover:[stroke-dashoffset:0]" />
          <path d="M100 95 C 94 105, 96 117, 86 123" stroke="currentColor" strokeWidth=".6" className="[stroke-dasharray:40] [stroke-dashoffset:40] transition-[stroke-dashoffset] duration-700 group-hover:[stroke-dashoffset:0]" />
        </svg>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {f.badges?.slice(0, 2).map((b) => (
            <span key={b} className={`chip backdrop-blur ${b === 'champion' ? 'chip-cyan' : b === 'replacement' ? 'chip-blood' : 'bg-abyss/50'}`}>
              {badgeLabel[b]}
            </span>
          ))}
          {f.status === 'retired' && <span className="chip bg-abyss/50 backdrop-blur">Завершил карьеру</span>}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
          <div className="flex items-center gap-2 text-[12px] text-mute">
            <Flag code={f.country} />
            {/* на телефоне карточка узкая — только вес, без списка стилей */}
            <span className="mono truncate uppercase tracking-[0.12em]">
              <span className="max-sm:hidden">
                {f.disciplines.map((d) => disciplines[d].short).join(' · ')}
                {f.weightKg && f.disciplines.length ? ' · ' : ''}
              </span>
              {f.weightKg ? `${String(f.weightKg).replace('.', ',')} кг` : ''}
            </span>
          </div>
          <h3 className="display leading-[0.85]">
            {f.firstName && <span className="block text-[clamp(1.1rem,1.8vw,1.5rem)] text-mute">{f.firstName}</span>}
            <span className="block text-[clamp(1.9rem,3.2vw,2.8rem)]">{f.lastName}</span>
          </h3>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="label">Рекорд</span>
        <span className="mono text-[15px] font-semibold tabular text-ice">{recordStr(f)}</span>
      </div>
    </Link>
  );
}

export function EventCard({ e, big }: { e: FightEvent; big?: boolean }) {
  return (
    <Link href={`/events/${e.slug}/`} className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 panel-hover" data-cursor="view" data-cursor-label="Турнир">
      <div className={`relative ${big ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden`}>
        {e.poster ? (
          <img src={asset(`${e.poster}-560.webp`)} srcSet={posterSrcSet(e.poster)} sizes="(min-width:1024px) 30vw, 90vw" alt={`Постер ${e.title}`} width={560} height={700} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
        ) : (
          <TypoPoster e={e} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-mute">{e.date ? fmtDate(e.date) : 'Дата — скоро'}</span>
          <span className={`chip ${e.status === 'upcoming' ? 'chip-blood' : ''}`}>{e.status === 'upcoming' ? 'Скоро' : 'Архив'}</span>
        </div>
        <h3 className="display text-[clamp(2rem,3vw,2.8rem)] leading-[0.85]">
          {e.title} {e.collab && <span className="text-accent">{e.collab}</span>}
        </h3>
        <p className="text-[14px] text-mute">{e.tagline}</p>
        <p className="mono mt-auto text-[11px] uppercase tracking-[0.14em] text-faint">{[e.venue, e.city].filter(Boolean).join(' · ')}</p>
      </div>
    </Link>
  );
}

/** Типографский постер для турниров без картинки */
export function TypoPoster({ e, className = 'h-full w-full', showDate = true }: { e: FightEvent; className?: string; showDate?: boolean }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background: 'radial-gradient(80% 60% at 50% 30%, var(--deep-2), var(--abyss) 75%)' }}>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <LogoMark className="h-[clamp(56px,7vw,96px)] w-[clamp(56px,7vw,96px)] opacity-90" />
        <span className="display text-[clamp(2.6rem,5vw,4.2rem)] leading-[0.8]">Осьминог</span>
        <span className="display-upright text-outline-accent text-[clamp(4rem,8vw,7rem)] leading-[0.8]">{e.number ?? ''}</span>
        {e.collab && <span className="display-upright text-[24px] text-accent">{e.collab}</span>}
      </div>
      {showDate && e.date && (
        <div className="absolute bottom-[5%] flex flex-col items-center">
          <span className="display-upright text-[42px] leading-none">{fmtDay(e.date)}</span>
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-mute">{fmtMonth(e.date)}</span>
        </div>
      )}
    </div>
  );
}

export function NewsCard({ n, featured }: { n: NewsItem; featured?: boolean }) {
  return (
    <Link href={`/news/${n.slug}/`} className={`group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 panel-hover ${featured ? 'md:col-span-2 md:row-span-2' : ''}`} data-cursor="view" data-cursor-label="Читать">
      <div className={`relative overflow-hidden ${featured ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
        {n.image ? (
          <img src={asset(`${n.image}-560.webp`)} srcSet={posterSrcSet(n.image)} sizes={featured ? '(min-width:768px) 60vw, 90vw' : '(min-width:768px) 30vw, 90vw'} alt="" loading="lazy" decoding="async" width={560} height={700} className="h-full w-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
        ) : (
          <div className="relative grid h-full w-full place-items-center" style={{ background: 'radial-gradient(70% 70% at 30% 20%, var(--deep-2), var(--abyss))' }}>
            <span className="display text-outline px-6 text-center text-[clamp(2rem,4vw,3.4rem)] leading-[0.85] opacity-70">{n.tag}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/90 via-transparent to-transparent" />
        <span className="chip absolute left-4 top-4 bg-abyss/60 backdrop-blur">{n.tag}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <time dateTime={n.date} className="label">
          {fmtDate(n.date)}
        </time>
        <h3 className={`display-upright leading-[0.9] transition-colors group-hover:text-accent ${featured ? 'text-[clamp(2rem,3.4vw,3rem)]' : 'text-[26px]'}`}>{n.title}</h3>
        <p className="text-[15px] text-mute">{n.lead}</p>
      </div>
    </Link>
  );
}
