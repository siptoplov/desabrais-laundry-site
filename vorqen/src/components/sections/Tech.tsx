"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { mountains as copy } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { CinemaVideo } from "@/components/ui/CinemaVideo";
import { SplitWordmark } from "@/components/ui/Brand";
import { SplitReveal } from "@/components/ui/Reveal";

/**
 * Product moment: the black-glass laptop swings in out of perspective like
 * an Apple reveal, a light streak runs along its edge, then the wordmark and
 * the line resolve in the dark half of the frame.
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
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "+=170%", scrub: 0.8, pin: true, anticipatePin: 1 },
      });
      tl.fromTo(
        "[data-device]",
        { rotateX: 38, rotateZ: -8, scale: 1.55, yPercent: 18, opacity: 0.2, filter: "brightness(0.4)" },
        { rotateX: 0, rotateZ: 0, scale: 1, yPercent: 0, opacity: 1, filter: "brightness(1)", duration: 0.45, ease: "power3.out" },
        0,
      )
        .fromTo("[data-streak]", { xPercent: -120, opacity: 0 }, { xPercent: 220, opacity: 1, duration: 0.35, ease: "power1.inOut" }, 0.3)
        .fromTo(letters, { opacity: 0, filter: "blur(14px)", yPercent: 50 }, { opacity: 1, filter: "blur(0px)", yPercent: 0, stagger: 0.03, duration: 0.18 }, 0.35)
        .fromTo("[data-tech-fade]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.15 }, 0.5)
        .to("[data-device]", { scale: 1.08, xPercent: 3, duration: 0.35 }, 0.65);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="Технологии" className="relative z-10 h-[100svh] overflow-hidden bg-ink-0 [perspective:1600px]">
      <div data-device className="absolute inset-0 origin-[70%_40%] will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <CinemaVideo name="laptop" objectPosition="72% 50%" />
      </div>
      {/* travelling edge light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen">
        <div data-streak className="absolute -inset-y-1/4 left-0 w-[30%] rotate-[24deg] bg-[linear-gradient(90deg,transparent,rgba(232,240,255,0.12),transparent)] opacity-0" />
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
