import { Btn } from '@/components/ui/Btn';
import { site } from '@/content/site';

/** Где следить за анонсами: соцсети лиги вместо формы «оставьте почту» */
export function FollowLinks({ className = '' }: { className?: string }) {
  const links = [
    ['Instagram', site.socials.instagram],
    ['YouTube', site.socials.youtube],
    ['Rutube', site.socials.rutube],
    ['Telegram', site.socials.telegram],
  ].filter(([, href]) => href);
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(([name, href], i) => (
        <Btn key={name} href={href} external variant={i === 0 ? 'primary' : 'ghost'} size="sm" icon="none">
          {name} ↗
        </Btn>
      ))}
    </div>
  );
}
