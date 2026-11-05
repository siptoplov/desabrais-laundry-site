import { partnerLogos, partnerWordmarks } from '@/content/site';
import { asset } from '@/lib/asset';

/**
 * Логотип партнёра или спонсора; если файла нет — название тем же «весом», что и логотипы.
 * В покое — монохром, на наведении — фирменные цвета.
 */
export function PartnerLogo({ name, logo = partnerLogos[name], className = 'h-9', caption, vivid }: { name: string; logo?: string; className?: string; caption?: boolean; vivid?: boolean }) {
  if (logo) {
    const img = (
      <img
        src={asset(logo)}
        alt={caption && !partnerWordmarks.has(name) ? '' : name}
        loading="lazy"
        decoding="async"
        className={`w-auto max-w-[200px] object-contain transition-[filter,opacity] duration-300 ${vivid ? 'opacity-95 [filter:brightness(1.15)_contrast(1.05)]' : 'opacity-75 [filter:grayscale(1)_brightness(1.3)] hover:opacity-100 hover:[filter:none]'} ${className}`}
      />
    );
    // у значков без надписи (belbet, Toyota…) — подпись снизу
    if (!caption || partnerWordmarks.has(name)) return img;
    return (
      <span className="flex flex-col items-center gap-2">
        {img}
        <span className="mono text-[11px] uppercase tracking-[0.16em] text-faint">{name}</span>
      </span>
    );
  }
  return <span className={`display-upright text-mute ${name.length > 22 ? 'max-w-[14rem] text-[1.15rem] leading-tight' : 'whitespace-nowrap text-[clamp(1.3rem,2.2vw,1.7rem)] leading-none'}`}>{name}</span>;
}
