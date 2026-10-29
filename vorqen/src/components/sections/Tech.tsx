"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { mountains as copy } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { ScrollSequence } from "@/components/ui/ScrollSequence";
import { SplitWordmark } from "@/components/ui/Brand";
import { SplitReveal } from "@/components/ui/Reveal";

/**
 * Product moment: the black-glass laptop swings in out of perspective as the
 * section scrolls into view (no pinning), a light streak runs along its edge,
 * then the wordmark and the line resolve in the dark half of the frame.
 */
export function Tech() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const letters = el.querySelectorAll("[data-letter]");
    if (prefersReducedMotion()) {
      gsap.set([letters, "[data-tech-fade]"], { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      // the laptop swings in out of perspective while the section rises
      const enter = { trigger: el, start: "top bottom", end: "top top", scrub: true };
      gsap.fromTo("[data-device]", { rotateX: 34, rotateZ: -7, scale: 1.45, yPercent: 14 }, { rotateX: 0, rotateZ: 0, scale: 1, yPercent: 0, ease: "power2.out", scrollTrigger: enter });
      gsap.fromTo("[data-dim]", { opacity: 0.85 }, { opacity: 0, ease: "none", scrollTrigger: enter });
      gsap.fromTo("[data-streak]", { xPercent: -120, opacity: 0 }, { xPercent: 220, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 40%", scrub: true } });
      gsap.fromTo("[data-device]", { xPercent: 0 }, { xPercent: 4, ease: "none", immediateRender: false, scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      // copy resolves as you reach it
      const reveal = { trigger: el, start: "top 35%", once: true };
      gsap.fromTo(letters, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, stagger: 0.06, duration: 1.4, ease: "expo.out", scrollTrigger: reveal });
      gsap.fromTo("[data-tech-fade]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 1.4, delay: 0.3, ease: "expo.out", scrollTrigger: reveal });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="Технологии" className="relative z-10 h-[110svh] min-h-[720px] overflow-hidden bg-ink-0 [perspective:1600px]">
      <div data-device className="absolute inset-0 origin-[70%_40%] will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <ScrollSequence name="laptop" frames={61} focus={[0.72, 0.5]} />
        <div data-dim aria-hidden className="absolute inset-0 bg-ink-0" style={{ opacity: 0.85 }} />
      </div>
      {/* travelling edge light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-streak className="absolute -inset-y-1/4 left-0 w-[30%] rotate-[24deg] bg-[linear-gradient(90deg,transparent,rgba(232,240,255,0.07),transparent)] opacity-0" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.92)_0%,rgba(5,5,6,0.6)_38%,transparent_62%)] max-lg:bg-[linear-gradient(0deg,rgba(5,5,6,0.95)_0%,rgba(5,5,6,0.7)_45%,transparent_75%)]" />

      <div className="shell relative flex h-full flex-col justify-end pb-[12vh] lg:justify-center lg:pb-0">
        <div className="max-w-[560px]">
          <p data-tech-fade className="t-label mb-10 flex items-center gap-5 opacity-0">
            <span className="text-fg">04</span>
            <span className="h-px w-10 bg-line-2" />
            {copy.label}
          </p>
          <SplitWordmark className="w-[min(78vw,420px)]" letterClassName="opacity-0" />
          <SplitReveal as="h2" className="t-h2 mt-10 max-w-[16ch]">
            {copy.title}
          </SplitReveal>
          <p data-tech-fade className="t-body mt-6 max-w-[40ch] opacity-0">
            Сайты, приложения, AI-агенты и интеграции — единая система, которая продаёт, отвечает клиентам и считает деньги, пока вы занимаетесь стратегией.
          </p>
          <div data-tech-fade className="mt-10 flex flex-wrap gap-x-8 gap-y-3 opacity-0">
            {["Web & Mobile", "AI Agents", "CRM", "API Integrations"].map((t) => (
              <span key={t} className="t-label text-[9px] text-fg-2">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
