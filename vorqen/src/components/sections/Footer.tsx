"use client";

import { nav, site } from "@/lib/content";
import { Emblem, Tagline, Wordmark } from "@/components/ui/Brand";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const socials = [
  { href: site.telegram, label: "Telegram" },
  { href: site.whatsapp, label: "WhatsApp" },
  { href: `mailto:${site.email}`, label: "Email" },
];

export function Footer() {
  const { scrollTo } = useSmoothScroll();
  return (
    <footer className="relative z-10 overflow-hidden border-t border-line bg-ink-0 pt-20 lg:pt-28">
      <div className="shell grid-12 gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center gap-4">
            <Emblem className="h-8 w-auto" />
            <Wordmark className="h-[14px] w-auto" alt="VORQEN" />
          </div>
          <Tagline className="mt-8 justify-start" />
        </div>
        <nav aria-label="Навигация в подвале" className="col-span-6 lg:col-span-3 lg:col-start-7">
          <p data-scramble className="t-label mb-6 text-fg-3">Menu</p>
          <ul className="space-y-3">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(n.href);
                  }}
                  className="u-link text-[15px] text-fg-2 transition-colors hover:text-fg"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="col-span-6 lg:col-span-3">
          <p data-scramble className="t-label mb-6 text-fg-3">Social</p>
          <ul className="space-y-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="u-link text-[15px] text-fg-2 transition-colors hover:text-fg">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 flex flex-col justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="t-label text-[9px] text-fg-3">© {site.year} VORQEN. All rights reserved.</p>
          <button type="button" onClick={() => scrollTo(0)} className="t-label u-link text-[9px] text-fg-3 hover:text-fg" data-cursor="Top">
            Back to top ↑
          </button>
        </div>
      </div>
      {/* giant cropped wordmark */}
      <div aria-hidden className="pointer-events-none mt-16 select-none px-[2vw] lg:mt-20">
        <div className="relative h-[clamp(40px,8.6vw,124px)] overflow-hidden">
          <Wordmark className="absolute left-0 top-0 w-full opacity-[0.07] [mask-image:linear-gradient(180deg,#000_30%,transparent)]" />
        </div>
      </div>
    </footer>
  );
}
