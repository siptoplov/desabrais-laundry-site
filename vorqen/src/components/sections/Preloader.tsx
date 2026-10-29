"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { markIntroDone } from "@/lib/scroll-store";
import { Emblem, EMBLEM_RATIO, SplitWordmark } from "@/components/ui/Brand";
import { rng } from "@/components/three/noise";
import { EMBLEM_GHOST } from "./ghost";

// Fan triangulation of the emblem box → non-overlapping crystal shards.
const RIM: [number, number][] = [
  [0, 0], [22, 0], [44, 0], [62, 0], [80, 0], [100, 0], [100, 30], [100, 62], [100, 100],
  [78, 100], [56, 100], [36, 100], [16, 100], [0, 100], [0, 64], [0, 28],
];
const CORE: [number, number] = [52, 58];
const PIECES = RIM.map((p, i) => {
  const q = RIM[(i + 1) % RIM.length]!;
  return `polygon(${CORE[0]}% ${CORE[1]}%, ${p[0]}% ${p[1]}%, ${q[0]}% ${q[1]}%)`;
});

/**
 * ≤ 2.5s intro: shards fly in from depth and lock into the emblem,
 * a light streak crosses the metal, VORQEN resolves letter by letter.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;
    const reduced = prefersReducedMotion();
    const r = rng(42);

    const ctx = gsap.context(() => {
      const pieces = Array.from(el.querySelectorAll<HTMLElement>("[data-piece]"));
      const whole = el.querySelector<HTMLElement>("[data-whole]");
      const sweep = el.querySelector<HTMLElement>("[data-sweep]");
      const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
      const meta = Array.from(el.querySelectorAll<HTMLElement>("[data-meta]"));
      const progress = { v: 0 };

      const finish = () => {
        html.classList.remove("is-loading");
        setGone(true);
      };

      if (reduced) {
        gsap.set(pieces, { opacity: 0 });
        gsap.set([whole, ...letters], { opacity: 1 });
        if (counter.current) counter.current.textContent = "100";
        gsap.to(el, { opacity: 0, duration: 0.4, delay: 0.5, onStart: markIntroDone, onComplete: finish });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      gsap.set(letters, { opacity: 0, filter: "blur(14px)", yPercent: 30 });
      pieces.forEach((p) => {
        gsap.set(p, {
          opacity: 0,
          x: (r() - 0.5) * 900,
          y: (r() - 0.5) * 600,
          z: -900 - r() * 1400,
          rotationX: (r() - 0.5) * 220,
          rotationY: (r() - 0.5) * 220,
          rotationZ: (r() - 0.5) * 120,
        });
      });

      tl.to(meta, { opacity: 1, duration: 0.6, stagger: 0.05 }, 0)
        .to(progress, {
          v: 100,
          duration: 2.05,
          ease: "power2.inOut",
          onUpdate: () => {
            const v = Math.round(progress.v);
            if (counter.current) counter.current.textContent = String(v).padStart(3, "0");
            if (bar.current) bar.current.style.transform = `scaleX(${progress.v / 100})`;
          },
        }, 0)
        .to(pieces, { opacity: 1, duration: 0.35, stagger: { each: 0.03, from: "random" }, ease: "power1.out" }, 0.05)
        .to(pieces, { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, duration: 1.15, stagger: { each: 0.03, from: "random" } }, 0.05)
        // swap clipped pieces for the seamless whole
        .set(whole, { opacity: 1 }, 1.62)
        .set("[data-ghost]", { opacity: 0 }, 1.62)
        .set(pieces, { opacity: 0 }, 1.62)
        .fromTo(sweep, { backgroundPosition: "-120% 0" }, { backgroundPosition: "220% 0", duration: 0.9, ease: "power2.inOut" }, 1.05)
        .to(letters, { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.8, stagger: 0.06 }, 1.15)
        // exit
        .addLabel("exit", 2.05)
        .add(markIntroDone, "exit")
        .to(letters, { opacity: 0, filter: "blur(10px)", duration: 0.4, stagger: 0.025, ease: "power2.in" }, "exit")
        .to(whole, { scale: 1.18, opacity: 0, filter: "blur(8px)", duration: 0.45, ease: "power2.in" }, "exit")
        .to(meta, { opacity: 0, duration: 0.3 }, "exit")
        .to(el, { opacity: 0, duration: 0.45, ease: "power2.inOut", onComplete: finish }, "exit+=0.05");
    }, el);

    return () => ctx.revert();
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-0"
      role="status"
      aria-live="polite"
      aria-label="Загрузка"
    >
      <div className="relative flex w-[min(68vw,420px)] flex-col items-center" style={{ perspective: "1400px" }}>
        <div className="relative w-[62%]" style={{ aspectRatio: `${EMBLEM_RATIO}`, transformStyle: "preserve-3d" }}>
          {PIECES.map((clip, i) => (
            <div key={i} data-piece className="absolute inset-0 will-change-transform" style={{ clipPath: clip, opacity: 0 }}>
              <Emblem className="h-full w-full" />
            </div>
          ))}
          {/* faint ghost the shards assemble into — inlined, paints at first frame */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-ghost src={EMBLEM_GHOST} alt="" aria-hidden className="absolute inset-0 h-full w-full opacity-[0.07]" />
          <div data-whole className="absolute inset-0" style={{ opacity: 0 }}>
            <Emblem className="h-full w-full" />
            <div
              data-sweep
              className="absolute inset-0 mix-blend-screen"
              style={{
                background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.95) 50%, transparent 65%) no-repeat",
                backgroundSize: "60% 100%",
                WebkitMaskImage: "url(/brand/emblem.webp)",
                maskImage: "url(/brand/emblem.webp)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          </div>
        </div>
        <SplitWordmark className="mt-[12%] w-full" letterClassName="will-change-[filter,transform]" />
      </div>

      <div data-meta className="t-label absolute bottom-8 left-[var(--pad-x)] opacity-0">VORQEN © 2026</div>
      <div data-meta className="absolute bottom-8 right-[var(--pad-x)] flex items-center gap-4 opacity-0">
        <span className="relative block h-px w-16 overflow-hidden bg-white/10">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-white/80" />
        </span>
        <span ref={counter} className="t-num w-[3.2em] text-right text-[10px] text-fg-2">
          000
        </span>
      </div>
    </div>
  );
}
