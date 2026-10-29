"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";

/**
 * Low cloud drifting across the frame as you scroll. Soft radial banks of
 * haze at three depths, each travelling at its own speed — transforms only,
 * no blur filters, so it costs almost nothing.
 */
export function Mist({ className, strength = 1 }: { className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = el.closest("section") ?? el;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-bank]").forEach((b) => {
        const speed = Number(b.dataset.speed);
        gsap.fromTo(b, { xPercent: -speed }, { xPercent: speed, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const bank = (o: number) =>
    `radial-gradient(closest-side, rgba(225,230,238,${0.16 * o * strength}), rgba(225,230,238,${0.06 * o * strength}) 55%, transparent)`;

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <div data-bank data-speed="18" className="absolute left-[-30%] top-[38%] h-[34%] w-[90%] will-change-transform" style={{ background: bank(1) }} />
      <div data-bank data-speed="34" className="absolute left-[30%] top-[52%] h-[26%] w-[80%] will-change-transform" style={{ background: bank(0.8) }} />
      <div data-bank data-speed="55" className="absolute left-[-10%] top-[66%] h-[40%] w-[110%] will-change-transform" style={{ background: bank(0.7) }} />
    </div>
  );
}
