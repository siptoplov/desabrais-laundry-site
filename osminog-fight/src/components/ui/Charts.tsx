/**
 * Графики бойца на чистом SVG (без библиотек):
 *  • Radar — «ДНК бойца», профиль из реальных данных (опыт, победы, рост, титулы, вес);
 *  • RecordBar — разбивка рекорда: победы / поражения / ничьи.
 * Подписи — текстом рядом, цвет никогда не единственный носитель смысла.
 */
import type { Fighter } from '@/content/types';
import { totalFights } from '@/lib/cms';

export type Axis = { label: string; value: number; raw: string };

/** Нормированные оси 0..1. Шкалы — по ростеру лиги. */
export function fighterDna(f: Fighter): Axis[] {
  const fights = totalFights(f);
  return [
    { label: 'Опыт', value: Math.min(1, fights / 32), raw: fights ? `${fights} боёв` : '—' },
    { label: 'Победы', value: (f.winRate ?? 0) / 100, raw: f.winRate ? `${f.winRate}%` : '—' },
    { label: 'Рост', value: f.heightCm ? Math.max(0, Math.min(1, (f.heightCm - 160) / 32)) : 0, raw: f.heightCm ? `${f.heightCm} см` : '—' },
    { label: 'Титулы', value: Math.min(1, (f.titles?.length ?? 0) / 5), raw: String(f.titles?.length ?? 0) },
    { label: 'Вес', value: f.weightKg ? Math.min(1, (f.weightKg - 55) / 40) : 0, raw: f.weightKg ? `${String(f.weightKg).replace('.', ',')} кг` : '—' },
  ];
}

export function Radar({ axes, compare, size = 360 }: { axes: Axis[]; compare?: Axis[]; size?: number }) {
  const c = size / 2;
  const R = size / 2 - 56;
  const n = axes.length;
  const pt = (i: number, v: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v] as const;
  };
  const poly = (ax: Axis[]) => ax.map((x, i) => pt(i, Math.max(0.04, x.value)).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[420px]" role="img" aria-label={`Профиль бойца: ${axes.map((a) => `${a.label} ${a.raw}`).join(', ')}`}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={axes.map((_, i) => pt(i, r).join(',')).join(' ')} fill="none" stroke="rgba(232,241,248,.1)" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(232,241,248,.08)" />;
      })}
      {compare && <polygon points={poly(compare)} fill="rgba(255,43,58,.12)" stroke="#ff2b3a" strokeWidth="1.5" strokeDasharray="4 4" />}
      <polygon points={poly(axes)} fill="rgba(0,229,255,.18)" stroke="#00e5ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(0,229,255,.5))' }} />
      {axes.map((a, i) => {
        const [x, y] = pt(i, Math.max(0.04, a.value));
        const [lx, ly] = pt(i, 1.24);
        return (
          <g key={a.label}>
            <circle cx={x} cy={y} r="4" fill="#00e5ff" />
            <text x={lx} y={ly - 6} textAnchor="middle" fill="rgba(232,241,248,.6)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1.5">
              {a.label.toUpperCase()}
            </text>
            <text x={lx} y={ly + 10} textAnchor="middle" fill="#e8f1f8" fontSize="13" fontWeight="600" fontFamily="var(--font-mono)">
              {a.raw}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function RecordBar({ f }: { f: Fighter }) {
  if (!f.record) return null;
  const { w, l, d = 0 } = f.record;
  const total = w + l + d || 1;
  const seg = [
    { k: 'Победы', v: w, color: '#00e5ff' },
    { k: 'Поражения', v: l, color: '#ff2b3a' },
    { k: 'Ничьи', v: d, color: '#7fa3c7' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full" role="img" aria-label={`Рекорд: ${w} побед, ${l} поражений, ${d} ничьих`}>
        {seg
          .filter((s) => s.v > 0)
          .map((s) => (
            <div key={s.k} style={{ width: `${(s.v / total) * 100}%`, background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
          ))}
      </div>
      <dl className="grid grid-cols-3 gap-4">
        {seg.map((s) => (
          <div key={s.k} className="flex flex-col gap-1">
            <dt className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-faint">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
              {s.k}
            </dt>
            <dd className="display-upright text-[44px] leading-none">{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
