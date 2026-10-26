'use client';

/** Нижняя панель быстрых действий на телефоне: Билеты · Эфир · Бойцы · Кард */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/tickets/', label: 'Билеты', icon: 'M4 7h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z M14 7v10' },
  { href: '/watch/', label: 'Эфир', icon: 'M8 5v14l11-7z' },
  { href: '/fighters/', label: 'Бойцы', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0' },
  { href: '/fight-card/', label: 'Кард', icon: 'M4 6h16M4 12h16M4 18h10' },
];

export function BottomBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-[70] grid grid-cols-4 overflow-hidden rounded-[14px] border border-line bg-abyss/80 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Быстрые действия"
    >
      {items.map((it, i) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${i === 0 ? 'bg-blood/90 text-white' : active ? 'text-ice' : 'text-mute'}`}
            aria-current={active ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d={it.icon} fill={it.label === 'Эфир' ? 'currentColor' : 'none'} />
            </svg>
            {it.label}
            {active && i !== 0 && <span className="absolute top-0 h-[2px] w-8 bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}
