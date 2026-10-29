"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { kinetic } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { ScrollSequence } from "@/components/ui/ScrollSequence";

/**
 * Black silk in motion behind three statements. Each line's letters flip up
 * from the centre outward; the silk slowly drifts closer.
 */
export function Kinetic() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const lines = el.querySelectorAll<HTMLElement>("[data-kline]");
    if (prefersReducedMotion()) {
      gsap.set([el.querySelectorAll("[data-kchar]"), "[data-kdash]"], { opacity: 1, scaleX: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-silk]", { scale: 1.2, yPercent: -6 }, { scale: 1, yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      // each line flips up as it reaches the middle of the screen
      lines.forEach((line) => {
        gsap.fromTo(
          line.querySelectorAll("[data-kchar]"),
          { opacity: 0, yPercent: 80, rotateX: -70 },
          { opacity: 1, yPercent: 0, rotateX: 0, stagger: { each: 0.04, from: "center" }, ease: "power3.out", scrollTrigger: { trigger: line, start: "top 92%", end: "top 55%", scrub: 0.4 } },
        );
      });
      gsap.fromTo("[data-kdash]", { scaleX: 0 }, { scaleX: 1, ease: "power2.out", scrollTrigger: { trigger: "[data-kdash]", start: "top 85%", end: "top 60%", scrub: 0.4 } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="statement" aria-label="We build, we automate, we scale" className="relative z-10 h-[120svh] min-h-[720px] overflow-hidden bg-ink-0">
      <div data-silk className="absolute inset-0 will-change-transform">
        <ScrollSequence name="silk" frames={81} focus={[0.5, 0.7]} />
      </div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_45%,rgba(5,5,6,0.7),transparent)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[24%] bg-gradient-to-b from-ink-0 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-center gap-[clamp(18px,3vw,44px)] pb-[8vh] text-center">
        {kinetic.map((k) => (
          <p key={k} data-kline className="t-display whitespace-nowrap pl-[0.4em] text-[clamp(20px,4.6vw,78px)] [perspective:600px]">
            {k.split("").map((c, i) => (
              <span key={i} data-kchar className="chrome-text inline-block opacity-0">
                {c === " " ? " " : c}
              </span>
            ))}
          </p>
        ))}
        <span data-kdash className="dash mt-4 w-16 origin-center scale-x-0" />
      </div>
    </section>
  );
}
