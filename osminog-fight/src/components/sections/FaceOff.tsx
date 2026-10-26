'use client';

/**
 * «Лицом к лицу»: два бойца по краям, наведи — боец «надвигается» в свет.
 * Посередине — сравнение статистики; полосы заливаются при появлении,
 * а у «надвигающегося» бойца подсвечиваются.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Bout, Fighter } from '@/content/types';
import { asset, photoSrcSet } from '@/lib/asset';
import { recordStr, totalFights } from '@/lib/cms';
import { Flag } from '@/components/ui/Primitives';

function Portrait({ f, s, side, setSide }: { f: Fighter; s: 'red' | 'blue'; side: 'red' | 'blue' | null; setSide: (v: 'red' | 'blue' | null) => void }) {
  const active = side === s;
  const dim = side && side !== s;
  return (
    <Link
      href={`/fighters/${f.slug}/`}
      className="group relative block h-full"
      onMouseEnter={() => setSide(s)}
      onFocus={() => setSide(s)}
      onMouseLeave={() => setSide(null)}
      onBlur={() => setSide(null)}
      data-cursor="view"
      data-cursor-label="Профиль"
    >
      <div
        className="relative h-full overflow-hidden transition-[transform,filter,opacity] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{
          transform: active ? `scale(1.08) translateX(${s === 'red' ? 4 : -4}%)` : 'scale(1)',
          filter: dim ? 'brightness(.45) grayscale(.6)' : 'none',
        }}
      >
        <img
          src={asset(`${f.photo}.webp`)}
          srcSet={photoSrcSet(f.photo!)}
          sizes="(min-width: 1024px) 34vw, 50vw"
          alt={`${f.firstName} ${f.lastName}`}
          width={960}
          height={1200}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${s === 'blue' ? 'object-[60%_20%]' : 'object-[40%_20%]'}`}
        />
        {/* контровой свет угла */}
        <div className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: s === 'red' ? 'radial-gradient(70% 60% at 0% 35%, rgba(255,43,58,.45), transparent 65%)' : 'radial-gradient(70% 60% at 100% 35%, rgba(0,229,255,.4), transparent 65%)' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent" />
        <div className={`pointer-events-none absolute inset-0 ${s === 'red' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-abyss via-transparent to-transparent`} />
      </div>
      <div className={`absolute bottom-6 flex flex-col gap-1 ${s === 'red' ? 'left-4 md:left-8' : 'right-4 items-end text-right md:right-8'}`}>
        <span className={`mono flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${s === 'red' ? 'tag-corner-red' : 'tag-corner-blue'}`}>
          <Flag code={f.country} /> {s === 'red' ? 'Красный угол' : 'Синий угол'}
        </span>
        {f.nickname && <span className="mono text-[12px] text-mute">«{f.nickname}»</span>}
        <span className="display text-[clamp(1.4rem,2.6vw,2.4rem)] leading-[0.85] text-mute">{f.firstName}</span>
        <span className="display text-[clamp(2.4rem,5.4vw,5.6rem)] leading-[0.82]">{f.lastName}</span>
        <span className="mono text-[clamp(1.2rem,2vw,1.8rem)] font-semibold tabular">{recordStr(f)}</span>
      </div>
    </Link>
  );
}

type Row = { label: string; a: number; b: number; fmt: (v: number) => string; max?: number; lowerIsBetter?: boolean };

export function FaceOff({ red, blue, bout, title, eventTitle, eventHref }: { red: Fighter; blue: Fighter; bout: Bout; title: string; eventTitle: string; eventHref: string }) {
  const [side, setSide] = useState<'red' | 'blue' | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const rows: Row[] = [
    { label: 'Рост, см', a: red.heightCm ?? 0, b: blue.heightCm ?? 0, fmt: String, max: 200 },
    { label: 'Вес, кг', a: red.weightKg ?? 0, b: blue.weightKg ?? 0, fmt: (v) => String(v).replace('.', ','), max: 100 },
    { label: 'Возраст', a: red.age ?? 0, b: blue.age ?? 0, fmt: String, max: 45 },
    { label: 'Боёв', a: totalFights(red), b: totalFights(blue), fmt: String, max: 30 },
    { label: 'Побед', a: red.record?.w ?? 0, b: blue.record?.w ?? 0, fmt: String, max: 25 },
    { label: 'Доля побед', a: red.winRate ?? 0, b: blue.winRate ?? 0, fmt: (v) => `${v}%`, max: 100 },
    { label: 'Титулов', a: red.titles?.length ?? 0, b: blue.titles?.length ?? 0, fmt: String, max: 6 },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Link href={eventHref} className="eyebrow hover:text-ice">
          Главный бой · {eventTitle}
        </Link>
        <h2 className="display t-2 max-w-[18ch]">{title}</h2>
        <p className="mono text-[12px] uppercase tracking-[0.18em] text-mute">
          {bout.weightKg ? `до ${String(bout.weightKg).replace('.', ',')} кг · ` : ''}
          {bout.rules}
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-0 lg:grid-cols-[1fr_minmax(320px,0.9fr)_1fr]">
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
          <Portrait f={red} s="red" side={side} setSide={setSide} />
        </div>

        {/* сравнение */}
        <div className="relative order-last col-span-2 flex flex-col justify-center gap-4 px-0 py-10 lg:order-none lg:col-span-1 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-line-strong to-transparent lg:block" style={{ background: 'linear-gradient(transparent, rgba(232,241,248,.18), transparent)' }} />
          <div className="relative mb-2 flex items-center justify-center" aria-hidden="true">
            <span className="display-upright text-outline text-[clamp(4rem,8vw,7rem)] leading-none">VS</span>
          </div>
          <table className="relative w-full border-separate border-spacing-y-3">
            <caption className="sr-only">Сравнение бойцов</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{red.lastName}</th>
                <th scope="col">Показатель</th>
                <th scope="col">{blue.lastName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const max = Math.max(r.max ?? 0, r.a, r.b) || 1;
                const aWin = r.a > r.b;
                const bWin = r.b > r.a;
                return (
                  <tr key={r.label}>
                    <td className="w-[38%] align-middle">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`mono text-[15px] font-semibold tabular ${aWin ? 'text-ice' : 'text-mute'}`}>{r.fmt(r.a)}</span>
                        <div className="relative h-[6px] w-full max-w-[140px] overflow-hidden rounded-full bg-line">
                          <div
                            className="absolute inset-y-0 right-0 rounded-full transition-[width,box-shadow] duration-[1300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                            style={{
                              width: inView ? `${(r.a / max) * 100}%` : '0%',
                              transitionDelay: `${i * 0.08}s`,
                              background: 'linear-gradient(90deg, rgba(255,43,58,.4), #ff2b3a)',
                              boxShadow: side === 'red' ? '0 0 14px #ff2b3a' : 'none',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <th scope="row" className="mono w-[24%] px-2 text-center text-[10px] font-normal uppercase tracking-[0.14em] text-faint">
                      {r.label}
                    </th>
                    <td className="w-[38%] align-middle">
                      <div className="flex items-center gap-3">
                        <div className="relative h-[6px] w-full max-w-[140px] overflow-hidden rounded-full bg-line">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-[width,box-shadow] duration-[1300ms] ease-[cubic-bezier(.16,1,.3,1)]"
                            style={{
                              width: inView ? `${(r.b / max) * 100}%` : '0%',
                              transitionDelay: `${i * 0.08}s`,
                              background: 'linear-gradient(90deg, #00e5ff, rgba(0,229,255,.4))',
                              boxShadow: side === 'blue' ? '0 0 14px #00e5ff' : 'none',
                            }}
                          />
                        </div>
                        <span className={`mono text-[15px] font-semibold tabular ${bWin ? 'text-ice' : 'text-mute'}`}>{r.fmt(r.b)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bout.note && <p className="mx-auto mt-4 max-w-sm text-center text-[14px] leading-relaxed text-mute">{bout.note}</p>}
        </div>

        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
          <Portrait f={blue} s="blue" side={side} setSide={setSide} />
        </div>
      </div>
    </div>
  );
}
