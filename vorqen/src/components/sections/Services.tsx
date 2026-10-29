"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { serviceIcons, IconArrowUpRight } from "@/components/ui/Icons";
import { SplitReveal } from "@/components/ui/Reveal";

/**
 * Editorial two-column gallery (second column offset) that scrolls
 * naturally. Each photograph wipes in as it enters and drifts inside its
 * frame while it crosses the viewport.
 */
export function Services() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-card]").forEach((c) => {
        const mask = c.querySelector("[data-mask]");
        const img = c.querySelector("[data-img]");
        const copy = c.querySelectorAll("[data-copy] > *");
        gsap.fromTo(
          mask,
          { clipPath: "inset(100% 0% 0% 0% round 22px)" },
          { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%", once: true } },
        );
        gsap.fromTo(img, { yPercent: -7, scale: 1.18 }, { yPercent: 7, scale: 1.08, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.fromTo(copy, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.07, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 70%", once: true } });
      });
      gsap.fromTo("[data-bg]", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="services" aria-label="Услуги" className="section relative z-10 overflow-hidden bg-ink-0">
      {/* faceted glass with converging beams, drifting slowly behind */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[90vh] opacity-60">
        <div data-bg className="absolute inset-0">
          <Image src="/media/beams.jpg" alt="" fill sizes="100vw" quality={70} className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.4),#050506_95%)]" />
      </div>

      <div className="shell relative">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-10 flex items-center gap-5">
              <span className="t-label text-fg">03</span>
              <span className="h-px w-10 bg-line-2" />
              <span className="t-label">Services</span>
            </div>
            <SplitReveal as="h2" className="t-h2 max-w-[14ch]">
              Что мы делаем для вашего роста
            </SplitReveal>
          </div>
          <p className="t-body col-span-12 max-w-[38ch] lg:col-span-4 lg:col-start-9">
            Четыре направления, которые закрывают путь от идеи до работающего, автоматизированного и масштабируемого бизнеса.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-24 lg:gap-8">
          {services.map((s, i) => {
            const Icon = serviceIcons[s.icon];
            return (
              <article
                key={s.n}
                data-card
                data-cursor="Explore"
                className={`group relative aspect-[4/5] max-h-[820px] w-full ${i % 2 === 1 ? "sm:translate-y-[18%]" : ""}`}
              >
                <div data-mask className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/[0.08] bg-ink-2">
                  <div data-img className="absolute inset-0 will-change-transform">
                    <div className="absolute inset-0 transition-transform duration-[1600ms] ease-[var(--ease-expo)] group-hover:scale-[1.05]">
                      <Image src={s.image} alt={s.title} fill sizes="(min-width:640px) 50vw, 100vw" quality={80} className="object-cover" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.5)_0%,transparent_26%,transparent_44%,rgba(5,5,6,0.85)_74%,#050506_100%)]" />
                  <div className="sweep absolute inset-0" />
                  <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
                </div>

                <div className="relative flex h-full flex-col p-7 sm:p-9 lg:p-11">
                  <div className="flex items-start justify-between">
                    <span className="t-num text-[11px] text-fg-2">{s.n} / 04</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-ink-0/60 transition-colors duration-700 group-hover:border-white/50">
                      <Icon size={20} />
                    </span>
                  </div>
                  <div data-copy className="mt-auto">
                    <span aria-hidden className="chrome-text block font-[family-name:var(--font-display)] text-[clamp(56px,5.4vw,96px)] leading-none opacity-40">
                      {s.n}
                    </span>
                    <h3 className="mt-5 max-w-[18ch] text-[clamp(24px,2.2vw,36px)] font-light leading-[1.1] tracking-[-0.02em]">{s.title}</h3>
                    <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.55] text-fg-2">{s.text}</p>
                    <div className="hairline my-6" />
                    <div className="flex items-center justify-between gap-4">
                      <ul className="flex flex-wrap gap-x-4 gap-y-2">
                        {s.tags.map((t) => (
                          <li key={t} className="t-label text-[8.5px] tracking-[0.3em] text-fg-2">
                            {t}
                          </li>
                        ))}
                      </ul>
                      <IconArrowUpRight size={18} className="shrink-0 text-fg-2 transition-all duration-700 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {/* room for the offset column */}
        <div aria-hidden className="hidden sm:block sm:h-[12vw]" />
      </div>
    </section>
  );
}
