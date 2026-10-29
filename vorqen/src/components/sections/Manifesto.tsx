"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { manifesto } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";

/**
 * Pinned statement on a bevelled black-glass slab. Three light beams
 * converge behind it (reference frame 2) and the copy lights up word
 * by word as you scroll.
 */
export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const words = manifesto.split(" ");

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ws = el.querySelectorAll<HTMLElement>("[data-word]");
    const beams = el.querySelectorAll<SVGPathElement>("[data-beam]");
    if (prefersReducedMotion()) {
      gsap.set(ws, { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      beams.forEach((b) => {
        const len = b.getTotalLength();
        gsap.set(b, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "+=160%", scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      tl.fromTo("[data-slab]", { rotateX: 28, rotateZ: -10, yPercent: 14, opacity: 0.2 }, { rotateX: 12, rotateZ: -6, yPercent: 0, opacity: 1, duration: 0.5 }, 0)
        .to(beams, { strokeDashoffset: 0, duration: 0.55, stagger: 0.06 }, 0.05)
        .fromTo("[data-streak]", { xPercent: -100 }, { xPercent: 260, duration: 1 }, 0)
        .fromTo(ws, { opacity: 0.08, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.12, stagger: 0.075 }, 0.15)
        .fromTo("[data-manifesto-meta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.75);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="manifesto" aria-label="Манифест" className="relative z-10 h-[100svh] overflow-hidden bg-gradient-to-b from-transparent via-ink-0 to-ink-0">
      {/* converging beams */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="beam" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#e8f0ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <filter id="beam-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g fill="none" strokeLinecap="round">
          {["M-40 120 L1010 330", "M1650 -40 L1010 330", "M1300 940 L1010 330"].map((d) => (
            <g key={d}>
              <path data-beam d={d} stroke="url(#beam)" strokeWidth="5" filter="url(#beam-glow)" opacity="0.35" />
              <path data-beam d={d} stroke="url(#beam)" strokeWidth="1" />
            </g>
          ))}
        </g>
      </svg>

      {/* black glass slab */}
      <div className="absolute inset-0 flex items-center justify-center [perspective:1600px]">
        <div
          data-slab
          className="relative h-[62vh] w-[118vw] rounded-[28px] border border-white/[0.06] will-change-transform"
          style={{
            background: "linear-gradient(165deg, rgba(22,23,27,0.92) 0%, rgba(10,10,12,0.9) 38%, rgba(5,5,6,0.95) 100%)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 80px 160px -40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.09)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* bevel highlight along the top edge with a travelling streak */}
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden rounded-full bg-white/10">
            <div data-streak className="h-full w-[40%] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_24px_4px_rgba(232,240,255,0.6)]" />
          </div>
          <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(80%_60%_at_30%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>
      </div>

      <div className="shell relative flex h-full flex-col items-center justify-center text-center">
        <p data-manifesto-meta className="t-label mb-12 flex items-center gap-5 opacity-0">
          <span className="text-fg">02</span>
          <span className="h-px w-10 bg-line-2" />
          Manifesto
        </p>
        <p className="max-w-[16ch] text-[clamp(38px,6.4vw,112px)] font-light leading-[1.02] tracking-[-0.045em]">
          {words.map((w, i) => (
            <span key={i} data-word className="inline-block opacity-[0.08] will-change-[opacity,filter]">
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <span data-manifesto-meta className="dash mt-14 opacity-0" />
      </div>
    </section>
  );
}
