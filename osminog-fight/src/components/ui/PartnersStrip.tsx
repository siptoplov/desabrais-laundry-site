import { partnerLogos } from '@/content/site';
import { asset } from '@/lib/asset';

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
          <li key={n} className={`flex items-center justify-center rounded-[var(--radius)] border border-line bg-abyss-2/60 px-4 ${box}`} title={n}>
            {logo ? (
              <img src={asset(logo)} alt={n} loading="lazy" decoding="async" className={`h-auto w-auto max-w-full object-contain ${n === 'Chinuk Gym' ? '[filter:brightness(2)_contrast(1.1)]' : '[filter:brightness(1.15)_contrast(1.05)]'} ${img}`} />
            ) : (
              <span className="display-upright text-center text-[1.05rem] leading-[1.05] text-ice/85">{n}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
