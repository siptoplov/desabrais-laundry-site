import type { ReactNode } from 'react';
import { countries } from '@/content/site';
import type { CountryCode } from '@/content/types';

/** Заголовок, который выезжает построчно (строки задаются массивом) */
/** instant — анимация сразу при загрузке на чистом CSS (для первого экрана: не ждём JS, быстрый LCP) */
export function SplitTitle({ lines, as: Tag = 'h2', className = '', delay = 0, instant }: { lines: ReactNode[]; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; delay?: number; instant?: boolean }) {
  return (
    <Tag className={className} data-split={instant ? 'load' : ''} style={{ ['--d' as string]: `${delay}s` }}>
      {lines.map((l, i) => (
        <span className="split-line" key={i}>
          <span style={{ ['--i' as string]: i }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function SectionHead({ eyebrow, title, lead, align = 'left', children }: { eyebrow?: string; title: ReactNode[]; lead?: ReactNode; align?: 'left' | 'center'; children?: ReactNode }) {
  return (
    <div className={`mb-12 flex flex-col gap-6 md:mb-16 ${align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={align === 'center' ? 'flex flex-col items-center' : ''}>
        {eyebrow && (
          <p className="eyebrow mb-5" data-reveal="">
            {eyebrow}
          </p>
        )}
        <SplitTitle lines={title} className="display t-2" />
      </div>
      {(lead || children) && (
        <div className={`flex max-w-md flex-col gap-5 ${align === 'center' ? 'items-center' : 'md:items-end md:text-right'}`} data-reveal="">
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

export function Flag({ code, withName }: { code: CountryCode; withName?: boolean }) {
  const c = countries[code];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="mono inline-grid h-[18px] min-w-[26px] place-items-center rounded-[2px] border border-line px-1 text-[10px] tracking-[0.08em] text-mute" title={c.name}>
        {code === 'XX' ? '—' : code}
      </span>
      {withName && code !== 'XX' && <span>{c.name}</span>}
    </span>
  );
}

/** Декоративная «кривая щупальца»-разделитель */
export function TentacleRule({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-full ${className}`} viewBox="0 0 1200 40" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path d="M0 20 C 200 -10, 300 50, 500 20 S 800 -10, 1000 20 S 1150 35, 1200 18" stroke="url(#tr-g)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="tr-g" x1="0" x2="1">
          <stop offset="0" stopColor="#ECEEF1" stopOpacity="0" />
          <stop offset=".5" stopColor="#ECEEF1" stopOpacity=".7" />
          <stop offset="1" stopColor="#FF2B3A" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Фон секции: глубина + лучи + каустика */
export function Depth({ rays = true, caustics = true, className = '' }: { rays?: boolean; caustics?: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 0%, var(--deep) 0%, transparent 70%)' }} />
      {rays && <div className="godrays" />}
      {caustics && <div className="caustics" />}
    </div>
  );
}

export function Stat({ value, label, countTo, suffix }: { value?: ReactNode; label: string; countTo?: number; suffix?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="display-upright text-[clamp(3rem,6vw,5.5rem)] leading-none">
        {countTo !== undefined ? (
          <span data-count-to={countTo}>{countTo}</span>
        ) : (
          value
        )}
        {suffix && <span className="text-accent">{suffix}</span>}
      </span>
      <span className="mono text-[11px] uppercase tracking-[0.18em] text-mute">{label}</span>
    </div>
  );
}
