import { partnerLogos } from '@/content/site';
import { PartnerLogo } from './PartnerLogo';

/**
 * Партнёры в два ряда: сначала только логотипы (крупно, без серого фильтра),
 * ниже — названия тех, у кого логотипа пока нет.
 */
export function PartnersStrip({ names, size = 'h-12', align = 'start' }: { names: string[]; size?: string; align?: 'start' | 'center' }) {
  const withLogo = names.filter((n) => partnerLogos[n]);
  const without = names.filter((n) => !partnerLogos[n]);
  const justify = align === 'center' ? 'justify-center text-center' : '';
  return (
    <div className="flex flex-col gap-6">
      {withLogo.length > 0 && (
        <ul className={`flex flex-wrap items-center gap-x-10 gap-y-6 ${justify}`}>
          {withLogo.map((p) => (
            <li key={p} className="flex items-center">
              <PartnerLogo name={p} className={size} vivid />
            </li>
          ))}
        </ul>
      )}
      {without.length > 0 && (
        <p className={`display-upright flex flex-wrap gap-x-5 gap-y-2 text-[1.1rem] leading-tight text-mute ${justify}`}>
          {without.map((p, i) => (
            <span key={p}>
              {p}
              {i < without.length - 1 && <span className="ml-5 text-faint" aria-hidden="true">·</span>}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
