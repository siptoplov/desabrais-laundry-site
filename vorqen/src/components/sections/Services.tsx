"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { services } from "@/lib/content";
import { serviceIcons, IconArrowUpRight } from "@/components/ui/Icons";
import { SplitReveal } from "@/components/ui/Reveal";

/**
 * Desktop: pinned horizontal gallery. Each card is a full-height photograph
 * revealed by a mask wipe, with its image drifting inside the frame (parallax)
 * as the track moves. Mobile: vertical stack with the same mask reveals.
 */
export function Services() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
        if (desktop) {
          const distance = () => tr.scrollWidth - window.innerWidth;
          const tween = gsap.to(tr, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => `+=${distance() * 1.1}`,
              scrub: 0.9,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
                if (count.current) count.current.textContent = `0${Math.min(4, Math.floor(self.progress * 4) + 1)}`;
              },
            },
          });
          gsap.to("[data-bg]", { xPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance() * 1.1}`, scrub: true } });
          cards.forEach((c) => {
            const img = c.querySelector("[data-img]");
            const mask = c.querySelector("[data-mask]");
            gsap.fromTo(img, { xPercent: 10 }, { xPercent: -10, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
            gsap.fromTo(
              mask,
              { clipPath: "inset(0% 0% 0% 100%)" },
              { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 105%", end: "left 55%", scrub: true } },
            );
            gsap.fromTo(
              c.querySelectorAll("[data-copy] > *"),
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left 75%", end: "left 45%", scrub: true } },
            );
          });
        } else {
          cards.forEach((c) => {
            gsap.fromTo(
              c.querySelector("[data-mask]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 85%", once: true } },
            );
            gsap.fromTo(c.querySelector("[data-img]"), { scale: 1.3 }, { scale: 1.05, duration: 2, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 85%", once: true } });
          });
        }
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} id="services" aria-label="Услуги" className="relative z-10 overflow-hidden bg-ink-0 lg:h-[100svh]">
      {/* faceted glass with converging beams, drifting behind the gallery */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[130%] opacity-50">
        <div data-bg className="absolute inset-0">
          <Image src="/media/beams.jpg" alt="" fill sizes="130vw" quality={70} className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.2),rgba(5,5,6,0.85)_60%)]" />
      </div>

      <div
        ref={track}
        className="relative flex flex-col gap-6 px-[var(--pad-x)] py-[var(--section-y)] lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:py-0 lg:pr-[10vw]"
      >
        <div className="mb-10 shrink-0 lg:mb-0 lg:w-[36vw] lg:pr-[5vw]">
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
            <span ref={count} className="t-num text-[12px] text-fg">
              01
            </span>
            <span className="relative block h-px w-40 overflow-hidden bg-white/10">
              <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-white" />
            </span>
            <span className="t-num text-[12px] text-fg-3">04</span>
          </div>
        </div>

        {services.map((s) => {
          const Icon = serviceIcons[s.icon];
          return (
            <article
              key={s.n}
              data-card
              data-cursor="Explore"
              className="group relative h-[128vw] max-h-[680px] shrink-0 sm:h-[90vw] lg:h-[78vh] lg:max-h-[760px] lg:w-[min(31vw,500px)]"
            >
              <div data-mask className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/[0.08] bg-ink-2">
                <div data-img className="absolute inset-[-4%_-14%] transition-transform duration-[1600ms] ease-[var(--ease-expo)] group-hover:scale-[1.06]">
                  <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 40vw, 100vw" quality={80} className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.55)_0%,transparent_28%,transparent_42%,rgba(5,5,6,0.88)_74%,#050506_100%)]" />
                <div className="sweep absolute inset-0" />
                <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
              </div>

              <div className="relative flex h-full flex-col p-7 sm:p-9">
                <div className="flex items-start justify-between">
                  <span className="t-num text-[11px] text-fg-2">{s.n} / 04</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-ink-0/40 backdrop-blur-md transition-colors duration-700 group-hover:border-white/50">
                    <Icon size={20} />
                  </span>
                </div>
                <div data-copy className="mt-auto">
                  <span aria-hidden className="chrome-text block font-[family-name:var(--font-display)] text-[clamp(56px,5vw,88px)] leading-none opacity-40">
                    {s.n}
                  </span>
                  <h3 className="mt-5 max-w-[16ch] text-[clamp(24px,2vw,32px)] font-light leading-[1.1] tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.55] text-fg-2">{s.text}</p>
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
    </section>
  );
}
