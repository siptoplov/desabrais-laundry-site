import Link from 'next/link';
import { LogoMark } from '@/components/brand/Logo';
import { FightNightToggle } from '@/components/fx/Toggles';
import { Subscribe } from '@/components/forms/Subscribe';
import { nav, navSecondary, partners, site } from '@/content/site';
import { getUpcoming } from '@/lib/cms';

export function Footer() {
  const next = getUpcoming();
  return (
    <footer className="relative overflow-hidden border-t border-line pb-28 pt-20 md:pb-10" aria-labelledby="footer-title">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 100%, var(--deep), transparent 70%)' }} aria-hidden="true" />
      <div className="wrap relative">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">Подписка</p>
            <h2 id="footer-title" className="display t-2">
              Глубина
              <br />
              <span className="text-outline">напишет первой</span>
            </h2>
            <p className="lead">Дата {next?.title ?? 'следующего турнира'}, кард и старт продаж — раньше всех.</p>
            <div className="max-w-xl">
              <Subscribe id="footer-sub" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="mono mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">Лига</p>
              <ul className="flex flex-col gap-2.5">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-mute transition-colors hover:text-ice">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mono mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">Зрителям</p>
              <ul className="flex flex-col gap-2.5">
                {navSecondary.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-mute transition-colors hover:text-ice">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="mono mb-4 text-[11px] uppercase tracking-[0.2em] text-faint">На связи</p>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ice">
                    Instagram {site.socials.instagramHandle} ↗
                  </a>
                </li>
                <li>
                  <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ice">
                    YouTube · Chinuk Gym ↗
                  </a>
                </li>
                <li className="pt-3 text-[13px] text-faint">
                  Билеты: {site.contacts.ticketSupport.name}
                  <br />
                  <a href={`tel:${site.contacts.ticketSupport.phoneHref}`} className="inline-block py-1 text-mute hover:text-ice">
                    {site.contacts.ticketSupport.phone}
                  </a>
                  <br />
                  <a href={`mailto:${site.contacts.ticketSupport.email}`} className="inline-block py-1 text-mute hover:text-ice">
                    {site.contacts.ticketSupport.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 border-y border-line py-8">
          <p className="mono mb-5 text-[11px] uppercase tracking-[0.2em] text-faint">
            {partners.general.role}: <span className="text-ice">{partners.general.name}</span> · {partners.tv.role}: <span className="text-ice">{partners.tv.name}</span>
          </p>
          <p className="text-[14px] text-faint">{partners.list.join(' · ')}</p>
        </div>

        {/* гигантский словесный знак */}
        <div className="relative mt-12 select-none" aria-hidden="true">
          <p className="display text-outline whitespace-nowrap text-center leading-[0.8]" style={{ fontSize: 'clamp(4rem, 19vw, 19rem)' }}>
            Осьминог
          </p>
          <LogoMark className="absolute left-1/2 top-1/2 h-[18vw] max-h-[220px] w-[18vw] max-w-[220px] -translate-x-1/2 -translate-y-1/2 opacity-90 drop-shadow-[0_0_40px_rgba(236,238,241,.25)]" />
        </div>

        <div className="mt-10 flex flex-col gap-6 text-[13px] text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.nameLatin} · {site.legalName}. {site.slogan}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <FightNightToggle />
            <Link href="/legal/privacy/" className="hover:text-ice">
              Конфиденциальность
            </Link>
            <Link href="/legal/terms/" className="hover:text-ice">
              Правила сайта
            </Link>
            <Link href="/media/#press-kit" className="hover:text-ice">
              Пресс-кит
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
