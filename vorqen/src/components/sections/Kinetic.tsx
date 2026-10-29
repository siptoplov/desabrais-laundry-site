"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { kinetic } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { CinemaVideo } from "@/components/ui/CinemaVideo";

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
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "+=190%", scrub: 0.7, pin: true, anticipatePin: 1 },
      });
      tl.fromTo("[data-silk]", { scale: 1.18, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 3.4 }, 0);
      lines.forEach((line, i) => {
        const chars = line.querySelectorAll("[data-kchar]");
        tl.fromTo(
          chars,
          { opacity: 0, yPercent: 80, rotateX: -70 },
          { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.5, stagger: { each: 0.035, from: "center" }, ease: "power3.out" },
          i * 0.9,
        );
      });
      tl.fromTo("[data-kdash]", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, ">-0.4").to({}, { duration: 0.4 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="We build, we automate, we scale" className="relative z-10 h-[100svh] overflow-hidden bg-ink-0">
      <div data-silk className="absolute inset-0 will-change-transform">
        <CinemaVideo name="silk" objectPosition="50% 70%" />
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
