"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { mountains } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { valueNoise3 } from "@/components/three/noise";
import { SplitReveal } from "@/components/ui/Reveal";

const W = 1600;
const H = 1000;
const VALLEY_X = 800;
const VALLEY_FLOOR = 700;

type Layer = { d: string; ridge: string; top: string; fog: string; fogOpacity: number; rim: number; speed: number };

/**
 * Deterministic ridgelines (SSR-safe). Low-frequency ridged noise gives
 * broad peaks; each layer is dark at its crest and dissolves into fog at its
 * base — the atmospheric perspective of a misty B&W photograph.
 */
function buildLayers(): Layer[] {
  const specs = [
    { base: 520, amp: 150, valley: 30, freq: 0.0032, seed: 1, top: "#2b2e34", fog: "#8a9099", fogOpacity: 0.55, rim: 0.28, speed: -4 },
    { base: 575, amp: 170, valley: 60, freq: 0.0038, seed: 2, top: "#1b1d21", fog: "#5d626b", fogOpacity: 0.5, rim: 0.22, speed: -9 },
    { base: 640, amp: 190, valley: 95, freq: 0.0046, seed: 3, top: "#111215", fog: "#3a3e45", fogOpacity: 0.45, rim: 0.18, speed: -16 },
    { base: 720, amp: 220, valley: 120, freq: 0.0055, seed: 4, top: "#0a0a0c", fog: "#1d1f24", fogOpacity: 0.5, rim: 0.14, speed: -26 },
    { base: 830, amp: 250, valley: 130, freq: 0.0066, seed: 5, top: "#050506", fog: "#0b0b0d", fogOpacity: 1, rim: 0.1, speed: -40 },
  ];
  return specs.map((s) => {
    const pts: [number, number][] = [];
    for (let x = -80; x <= W + 80; x += 5) {
      let n = 0, a = 1, f = s.freq, norm = 0;
      for (let o = 0; o < 4; o++) {
        const v = valueNoise3(x * f, s.seed * 13.1, o * 7.7);
        n += (o < 2 ? Math.pow(1 - Math.abs(v), 2) : v * 0.5) * a;
        norm += a;
        a *= 0.42;
        f *= 2.3;
      }
      n /= norm;
      const dist = Math.min(1, Math.abs(x - VALLEY_X) / 760);
      const carve = Math.pow(1 - dist, 2.2) * s.valley;
      const lift = Math.pow(dist, 1.6) * s.amp * 0.35;
      pts.push([x, s.base - n * s.amp + carve - lift]);
    }
    const ridge = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return { d: `${ridge} L${W + 80} ${H + 40} L-80 ${H + 40} Z`, ridge, top: s.top, fog: s.fog, fogOpacity: s.fogOpacity, rim: s.rim, speed: s.speed };
  });
}

// The chrome V light line drawn into the valley
const V_PATH = `M${VALLEY_X - 300} ${VALLEY_FLOOR - 230} L${VALLEY_X} ${VALLEY_FLOOR} L${VALLEY_X + 300} ${VALLEY_FLOOR - 230}`;

export function Mountains() {
  const section = useRef<HTMLElement>(null);
  const layers = useMemo(buildLayers, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const vs = el.querySelectorAll<SVGPathElement>("[data-v]");
    vs.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = prefersReducedMotion() ? "0" : `${len}`;
    });
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "+=130%", scrub: 0.8, pin: true, anticipatePin: 1 },
      });
      el.querySelectorAll<SVGGElement>("[data-layer]").forEach((g) => {
        const speed = Number(g.dataset.speed);
        tl.fromTo(g, { y: -speed * 2.2 }, { y: speed * 2.2, duration: 1 }, 0);
      });
      tl.fromTo("[data-sky]", { scale: 1.15, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 1 }, 0)
        .to(vs, { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" }, 0.18)
        .fromTo("[data-v-flare]", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.15, ease: "power2.out" }, 0.45)
        .fromTo("[data-mist]", { xPercent: -6 }, { xPercent: 6, duration: 1 }, 0)
        .fromTo("[data-mtn-copy]", { y: 60 }, { y: -40, duration: 1 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="Технологии" className="relative z-10 h-[100svh] overflow-hidden bg-ink-0">
      {/* sky glow */}
      <div
        data-sky
        aria-hidden
        className="absolute inset-0 origin-[50%_70%]"
        style={{
          background:
            "radial-gradient(70% 42% at 50% 62%, rgba(232,240,255,0.2), rgba(232,240,255,0.05) 45%, transparent 72%), linear-gradient(180deg, #050506 0%, #121317 52%, #1a1b1f 64%, #050506 100%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        <defs>
          {layers.map((l, i) => (
            <linearGradient key={i} id={`mtn-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={300 + i * 60} x2="0" y2={760 + i * 70}>
              <stop offset="0" stopColor={l.top} />
              <stop offset="0.55" stopColor={l.top} />
              <stop offset="1" stopColor={l.fog} stopOpacity={l.fogOpacity} />
            </linearGradient>
          ))}
          {/* fog brightens toward the valley where the light comes from */}
          <radialGradient id="valley-light" cx="0.5" cy="0.72" r="0.5">
            <stop offset="0" stopColor="#e8f0ff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#e8f0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rim" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#e8f0ff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="flare">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.2" stopColor="#e8f0ff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#e8f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {layers.map((l, i) => (
          <g key={i} data-layer data-speed={l.speed}>
            <path d={l.d} fill={`url(#mtn-${i})`} />
            <path d={l.ridge} fill="none" stroke="url(#rim)" strokeWidth={1} opacity={l.rim} />
            {i === 1 && <rect data-mist x={-200} y={380} width={W + 400} height={520} fill="url(#valley-light)" />}
            {/* the V lives between the 3rd and 4th ridge, inside the valley */}
            {i === 2 && (
              <g>
                {/* layered strokes fake the bloom without SVG filters */}
                <path data-v d={V_PATH} fill="none" stroke="#e8f0ff" strokeWidth={26} opacity={0.04} strokeLinejoin="round" strokeLinecap="round" />
                <path data-v d={V_PATH} fill="none" stroke="#e8f0ff" strokeWidth={12} opacity={0.09} strokeLinejoin="round" strokeLinecap="round" />
                <path data-v d={V_PATH} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.3} strokeLinejoin="round" strokeLinecap="round" />
                <path data-v d={V_PATH} fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="miter" />
                <circle data-v-flare cx={VALLEY_X} cy={VALLEY_FLOOR} r={60} fill="url(#flare)" style={{ transformOrigin: `${VALLEY_X}px ${VALLEY_FLOOR}px` }} />
                {/* reflection running down the river valley */}
                <path d={`M${VALLEY_X} ${VALLEY_FLOOR + 6} C ${VALLEY_X - 20} 800, ${VALLEY_X + 40} 860, ${VALLEY_X - 10} 1000`} fill="none" stroke="#e8f0ff" strokeWidth={1.2} opacity={0.14} />
              </g>
            )}
          </g>
        ))}
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[28vh] bg-gradient-to-b from-ink-0 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-ink-0 to-transparent" />

      <div data-mtn-copy className="shell relative flex h-full flex-col items-center pt-[13vh] text-center">
        <p className="t-label mb-10 flex items-center gap-5">
          <span className="text-fg">04</span>
          <span className="h-px w-10 bg-line-2" />
          {mountains.label}
        </p>
        <SplitReveal as="h2" className="t-h2 max-w-[20ch]" start="top 70%">
          {mountains.title}
        </SplitReveal>
      </div>
    </section>
  );
}
