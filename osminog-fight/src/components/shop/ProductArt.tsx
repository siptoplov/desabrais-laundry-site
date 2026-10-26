/**
 * Иллюстрации мерча на SVG — пока нет фотосессии (потом замените на фото или 3D-модели из Higgsfield).
 */
import type { Product } from '@/content/types';
import { LogoMark } from '@/components/brand/Logo';

export function ProductArt({ p, color }: { p: Product; color: string }) {
  const light = color.toUpperCase() === '#E8F1F8';
  const ink = light ? '#05070A' : '#E8F1F8';
  const shapes: Record<Product['art'], React.ReactNode> = {
    tee: <path d="M70 40 L110 22 Q150 40 190 22 L230 40 L270 80 L235 105 L222 92 L222 260 L78 260 L78 92 L65 105 L30 80 Z" fill={color} stroke="rgba(232,241,248,.25)" />,
    hoodie: (
      <>
        <path d="M70 50 L115 25 Q150 55 185 25 L230 50 L272 200 L238 210 L222 120 L222 270 L78 270 L78 120 L62 210 L28 200 Z" fill={color} stroke="rgba(232,241,248,.25)" />
        <path d="M115 25 Q150 85 185 25" fill="none" stroke="rgba(232,241,248,.25)" />
        <rect x="112" y="200" width="76" height="40" rx="6" fill="none" stroke="rgba(232,241,248,.18)" />
      </>
    ),
    shorts: (
      <>
        <path d="M60 50 L240 50 L262 250 L170 255 L150 140 L130 255 L38 250 Z" fill={color} stroke="rgba(232,241,248,.25)" />
        <rect x="60" y="50" width="180" height="26" fill="rgba(5,7,10,.4)" />
      </>
    ),
    gloves: (
      <>
        <path d="M80 70 Q80 30 125 30 L165 30 Q205 32 205 80 L205 170 Q205 205 170 210 L110 210 Q80 205 80 170 Z" fill={color} stroke="rgba(232,241,248,.25)" />
        <path d="M80 120 Q50 120 52 150 Q55 175 82 172" fill={color} stroke="rgba(232,241,248,.25)" />
        <rect x="92" y="210" width="102" height="48" rx="6" fill={light ? '#0a1a2f' : '#0c0f14'} stroke="rgba(232,241,248,.25)" />
      </>
    ),
    cap: (
      <>
        <path d="M60 170 Q60 70 150 70 Q240 70 240 170 Z" fill={color} stroke="rgba(232,241,248,.25)" />
        <path d="M40 170 L260 170 Q270 190 230 192 L70 192 Q30 190 40 170Z" fill={color} stroke="rgba(232,241,248,.25)" />
      </>
    ),
    belt: (
      <>
        <rect x="10" y="125" width="280" height="56" rx="10" fill="#0c0f14" stroke="#ff2b3a" strokeOpacity=".5" />
        <polygon points="110,80 190,80 225,115 225,195 190,230 110,230 75,195 75,115" fill="#d9b25a" stroke="#a8812f" strokeWidth="4" />
      </>
    ),
  };
  const logoBox: Record<Product['art'], [number, number, number]> = {
    tee: [115, 100, 70],
    hoodie: [118, 95, 64],
    shorts: [80, 90, 44],
    gloves: [118, 80, 64],
    cap: [122, 92, 56],
    belt: [105, 110, 90],
  };
  const [x, y, s] = logoBox[p.art];
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`pg-${p.slug}`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#0e2440" />
          <stop offset="1" stopColor="#05070a" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill={`url(#pg-${p.slug})`} />
      <g style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.6))' }}>{shapes[p.art]}</g>
      <foreignObject x={x} y={y} width={s} height={s}>
        <div style={{ width: '100%', height: '100%' }}>
          <LogoMark className="h-full w-full" color={p.art === 'belt' ? '#05070A' : ink} />
        </div>
      </foreignObject>
    </svg>
  );
}
