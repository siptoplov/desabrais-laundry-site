"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import { serviceIcons, IconArrowUpRight } from "@/components/ui/Icons";
import { SplitReveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

export function Services() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 1023px), (prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const cards = el.querySelectorAll<HTMLElement>("[data-card]");
        if (desktop) {
          const distance = () => tr.scrollWidth - window.innerWidth;
          const tween = gsap.to(tr, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              },
            },
          });
          // cards drift in from depth as they travel into view
          cards.forEach((c) => {
            gsap.fromTo(
              c,
              { opacity: 0.25, rotateY: -18, z: -120 },
              {
                opacity: 1,
                rotateY: 0,
                z: 0,
                ease: "power2.out",
                scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
              },
            );
          });
        } else {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: tr, start: "top 80%", once: true } },
          );
        }
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} id="services" aria-label="Услуги" className="relative z-10 overflow-hidden bg-ink-0 lg:h-[100svh]">
      <div
        ref={track}
        className="flex flex-col gap-5 px-[var(--pad-x)] py-[var(--section-y)] lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-7 lg:py-0 lg:pr-[12vw] [perspective:1400px]"
      >
        {/* intro panel */}
        <div className="mb-12 shrink-0 lg:mb-0 lg:w-[34vw] lg:pr-[4vw]">
          <div className="mb-10 flex items-center gap-5">
            <span className="t-label text-fg">03</span>
            <span className="h-px w-10 bg-line-2" />
            <span className="t-label">Services</span>
          </div>
          <SplitReveal as="h2" className="t-h2 max-w-[11ch]">
            Что мы делаем для вашего роста
          </SplitReveal>
          <p className="t-body mt-8 max-w-[38ch]">
            Четыре направления, которые закрывают путь от идеи до работающего, автоматизированного и масштабируемого бизнеса.
          </p>
          <div className="mt-14 hidden items-center gap-5 lg:flex">
            <span className="relative block h-px w-40 overflow-hidden bg-white/10">
              <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-white" />
            </span>
            <span className="t-label text-[9px]">Scroll →</span>
          </div>
        </div>

        {services.map((s) => {
          const Icon = serviceIcons[s.icon];
          return (
            <div key={s.n} data-card className="shrink-0 lg:w-[min(30vw,440px)]" style={{ transformStyle: "preserve-3d" }}>
              <TiltCard className="flex h-full min-h-[440px] flex-col p-8 lg:h-[min(64vh,560px)] lg:p-10">
                <div className="flex items-start justify-between">
                  <span className="t-num text-[11px] text-fg-3">{s.n} / 04</span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-2 text-fg">
                    <Icon size={24} />
                  </span>
                </div>
                <span
                  aria-hidden
                  className="chrome-text pointer-events-none mt-10 font-[family-name:var(--font-display)] text-[clamp(72px,7vw,120px)] leading-none opacity-[0.16]"
                >
                  {s.n}
                </span>
                <div className="mt-auto">
                  <h3 className="t-h3 max-w-[16ch]">{s.title}</h3>
                  <p className="t-small mt-4 max-w-[32ch] text-[15px] text-fg-2">{s.text}</p>
                  <div className="hairline my-7" />
                  <div className="flex items-center justify-between gap-4">
                    <ul className="flex flex-wrap gap-x-4 gap-y-2">
                      {s.tags.map((t) => (
                        <li key={t} className="t-label text-[8.5px] tracking-[0.3em] text-fg-3">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <IconArrowUpRight size={18} className="shrink-0 text-fg-3 transition-all duration-700 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg" />
                  </div>
                </div>
              </TiltCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}
