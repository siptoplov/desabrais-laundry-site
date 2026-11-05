import { partnerLogos } from '@/content/site';
import { asset } from '@/lib/asset';
import { LogoMark } from '@/components/brand/Logo';

/**
 * Все партнёры одной сеткой одинаковых плиток: логотип подогнан по высоте и ширине плитки,
 * у кого логотипа ещё нет — название тем же «весом», чтобы никто не выглядел лишним.
 */
export function PartnersStrip({ names, size = 'md' }: { names: string[]; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-24 w-full sm:w-[12.5rem]' : 'h-20 w-full sm:w-[11rem]';
  const img = size === 'lg' ? 'max-h-12' : 'max-h-10';
  return (
    <ul className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      {names.map((n) => {
        const logo = partnerLogos[n];
        return (
          <li key={n} className={`group relative flex items-center justify-center overflow-hidden rounded-[var(--radius)] border border-line bg-gradient-to-b from-abyss-2 to-abyss px-4 transition-[border-color,box-shadow] duration-300 hover:border-blood/60 hover:shadow-[0_0_28px_-8px_rgba(255,43,58,.55)] ${box}`} title={n}>
            {logo ? (
              <img src={asset(logo)} alt={n} loading="lazy" decoding="async" className={`h-auto w-auto max-w-full object-contain ${n === 'Chinuk Gym' ? '[filter:brightness(2)_contrast(1.1)]' : '[filter:brightness(1.15)_contrast(1.05)]'} ${img}`} />
            ) : (
              <>
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-ice opacity-[.06] transition-opacity duration-300 group-hover:opacity-[.12]" aria-hidden="true">
                  <LogoMark className="h-16 w-16" title="" />
                </span>
                <span className="relative flex flex-col items-center gap-2">
                  <span className="display chrome text-center text-[1.3rem] leading-[0.95] [text-wrap:balance]">{n}</span>
                  <span className="h-[2px] w-6 bg-blood shadow-[0_0_10px_rgba(255,43,58,.8)]" aria-hidden="true" />
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
