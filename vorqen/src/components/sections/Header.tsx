"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { nav, hero } from "@/lib/content";
import { EASE } from "@/lib/gsap";
import { Emblem, Wordmark } from "@/components/ui/Brand";
import { Magnetic } from "@/components/ui/Magnetic";
import { IconArrow } from "@/components/ui/Icons";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollTo, lenis } = useSmoothScroll();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 480 && y > last + 2) setHidden(true);
      else if (y < last - 2 || y <= 480) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href, { offset: href === "#top" ? 0 : -20 });
  };

  return (
    <>
      <m.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !open ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: hidden ? 0 : 0.1 }}
        className="fixed inset-x-0 top-0 z-[80]"
      >
        <div
          className={`absolute inset-0 transition-[background-color,backdrop-filter,border-color] duration-700 ${
            scrolled ? "border-b border-line bg-ink-0/55 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent"
          }`}
        />
        <div className="shell relative flex h-[76px] items-center justify-between lg:h-[88px]">
          <a href="#top" onClick={go("#top")} aria-label="VORQEN — на главную" className="group flex items-center gap-3.5">
            <Emblem className="h-[22px] w-auto transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-[-8deg]" />
            <Wordmark className="h-[11px] w-auto opacity-90" />
          </a>

          <nav aria-label="Основная навигация" className="hidden lg:block">
            <ul className="flex items-center gap-11">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} onClick={go(n.href)} className="u-link text-[14px] text-fg-2 transition-colors duration-500 hover:text-fg">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Magnetic className="hidden sm:inline-block">
              <a href="#contact" onClick={go("#contact")} className="btn btn-sm btn-chrome sweep">
                {hero.ctaPrimary}
                <IconArrow size={16} className="arrow" />
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-2 lg:hidden"
            >
              <span className={`absolute h-px w-4 bg-fg transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-fg transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
        </div>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-[79] flex flex-col justify-between bg-ink-0 px-[var(--pad-x)] pb-10 pt-32 lg:hidden"
          >
            <nav aria-label="Мобильная навигация">
              <ul className="space-y-2">
                {nav.map((n, i) => (
                  <li key={n.href} className="overflow-hidden">
                    <m.a
                      href={n.href}
                      onClick={go(n.href)}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.06 }}
                      className="flex items-baseline gap-5 py-2 text-[clamp(34px,9vw,56px)] font-light tracking-[-0.03em]"
                    >
                      <span className="t-label text-fg-3">0{i + 1}</span>
                      {n.label}
                    </m.a>
                  </li>
                ))}
              </ul>
            </nav>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <a href="#contact" onClick={go("#contact")} className="btn btn-chrome w-full">
                {hero.ctaPrimary}
                <IconArrow size={16} className="arrow" />
              </a>
              <p className="t-label mt-8 text-center">Build / Automate / Scale</p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
