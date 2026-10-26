'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { SoundToggle, FightNightToggle } from '@/components/fx/Toggles';
import { Btn } from '@/components/ui/Btn';
import { nav, navSecondary, site } from '@/content/site';
import { getUpcoming } from '@/lib/cms';
import { fmtDate } from '@/lib/format';
import { t } from '@/i18n';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const next = getUpcoming();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] transition-[transform,background,border-color] duration-500 ${hidden && !open ? '-translate-y-full' : ''} ${scrolled || open ? 'border-b border-line bg-abyss/70 backdrop-blur-xl' : 'border-b border-transparent'}`}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} — на главную`}>
            <LogoMark className="h-10 w-10 transition-transform duration-700 group-hover:rotate-[22.5deg]" />
            <span className="flex flex-col leading-none">
              <span className="display text-[28px] tracking-tight">Осьминог</span>
              <span className="mono mt-1 hidden text-[9px] tracking-[0.32em] text-mute sm:block">FIGHT LEAGUE · С {site.since}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Основная навигация">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`relative px-3 py-2 font-display text-[19px] font-[800] uppercase tracking-[0.04em] transition-colors ${isActive(n.href) ? 'text-ice' : 'text-mute hover:text-ice'}`}
                aria-current={isActive(n.href) ? 'page' : undefined}
              >
                {n.label}
                <span className={`absolute inset-x-3 -bottom-0.5 h-[2px] origin-left bg-accent transition-transform duration-500 ${isActive(n.href) ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {next && (
              <Link href={`/events/${next.slug}/`} className="mono hidden items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ice 2xl:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blood" />
                {next.title} · {next.date ? fmtDate(next.date, { day: 'numeric', month: 'short' }) : 'скоро'}
              </Link>
            )}
            <SoundToggle className="hidden sm:grid" />
            <Btn href="/tickets/" size="sm" className="hidden md:inline-flex" impact>
              {t.tickets}
            </Btn>
            <button
              type="button"
              className="group grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ice"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t.close : t.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 h-[2px] w-5 bg-ice transition-all duration-300 ${open ? 'top-[5px] rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-[2px] bg-ice transition-all duration-300 ${open ? 'top-[5px] w-5 -rotate-45' : 'top-[10px] w-3 group-hover:w-5'}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Полноэкранное меню */}
      <div
        id="site-menu"
        className={`fixed inset-0 z-[75] overflow-y-auto bg-abyss transition-[clip-path] duration-700 ease-[cubic-bezier(.83,0,.17,1)] ${open ? '[clip-path:circle(150%_at_100%_0)]' : 'pointer-events-none [clip-path:circle(0%_at_100%_0)]'}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 85% 10%, var(--deep-2), transparent 70%)' }} />
        <div className="wrap relative grid min-h-full gap-12 pb-28 pt-[calc(var(--header-h)+40px)] lg:grid-cols-[1.4fr_1fr]">
          <nav aria-label="Меню" className="flex flex-col">
            {[{ href: '/', label: 'Главная' }, ...nav].map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                className="group flex items-baseline gap-4 border-b border-line py-2 md:py-3"
                style={{ transitionDelay: open ? `${0.15 + i * 0.04}s` : '0s' }}
              >
                <span className="mono w-8 text-[11px] text-faint">{String(i).padStart(2, '0')}</span>
                <span className={`display text-[clamp(2.6rem,7vw,5.6rem)] transition-all duration-500 group-hover:translate-x-3 group-hover:text-accent ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: open ? `${0.15 + i * 0.04}s` : '0s' }}>
                  {n.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex flex-col justify-between gap-10">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {navSecondary.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-arrow">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-6">
              <Btn href="/tickets/" impact>
                {t.buyTickets}
              </Btn>
              <div className="flex flex-wrap items-center gap-6">
                <SoundToggle />
                <FightNightToggle />
              </div>
              <div className="flex gap-6">
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="link-arrow">
                  Instagram ↗
                </a>
                <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className="link-arrow">
                  YouTube ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
