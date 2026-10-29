"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";

type Layer = { name: "far" | "mid" | "near"; top: string; height: string; opacity: number; drift: number; scroll: number };

const DEFAULT: Layer[] = [
  { name: "far", top: "16%", height: "44%", opacity: 0.6, drift: 70, scroll: 18 },
  { name: "mid", top: "32%", height: "48%", opacity: 0.72, drift: 40, scroll: 34 },
  { name: "near", top: "46%", height: "62%", opacity: 0.8, drift: 24, scroll: 60 },
];

/**
 * Cloud banks flying through the scene. Each layer is a horizontally
 * tileable cloud texture (two copies side by side) that drifts on its own
 * and is pushed further by scrolling — farther layers slower, nearer ones
 * faster. Transforms only: no filters, no blend modes.
 */
export function Clouds({ layers = DEFAULT, className }: { layers?: Layer[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = el.closest("section") ?? el;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-cloud]").forEach((c) => {
        const k = Number(c.dataset.scroll);
        gsap.fromTo(c, { xPercent: k }, { xPercent: -k, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
    }, el);
    // only animate the drift while the scene is on screen
    const io = new IntersectionObserver((e) => el.classList.toggle("clouds-on", e.some((x) => x.isIntersecting)));
    io.observe(el);
    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={`clouds pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {layers.map((l) => (
        <div key={l.name} data-cloud data-scroll={l.scroll} className="absolute -inset-x-[20%] will-change-transform" style={{ top: l.top, height: l.height, opacity: l.opacity }}>
          <div
            className="cloud-strip absolute inset-y-0 left-0 w-[200%]"
            style={{
              backgroundImage: `url(/media/clouds/${l.name}.webp)`,
              backgroundSize: "50% 100%",
              backgroundRepeat: "repeat-x",
              animationDuration: `${l.drift}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
