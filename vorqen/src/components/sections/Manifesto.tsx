"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { manifesto } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { CinemaVideo } from "@/components/ui/CinemaVideo";

/**
 * Pinned scene over the mountain valley with the V of light.
 * 1) a small framed window expands to full bleed,
 * 2) the statement lights up word by word,
 * 3) the camera pushes into the V.
 */
export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const words = manifesto.split(" ");

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ws = el.querySelectorAll<HTMLElement>("[data-word]");
    if (prefersReducedMotion()) {
      gsap.set(ws, { opacity: 1 });
      gsap.set("[data-window]", { clipPath: "inset(0% 0% 0% 0% round 0px)" });
      return;
    }
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-aspect-ratio: 1/1)", tall: "(max-aspect-ratio: 1/1)" }, (c) => {
        const { wide } = c.conditions as { wide: boolean };
        const start = wide ? "inset(24% 31% 24% 31% round 26px)" : "inset(30% 12% 30% 12% round 22px)";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=240%", scrub: 0.8, pin: true, anticipatePin: 1 },
        });
        tl.fromTo("[data-window]", { clipPath: start }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.32, ease: "power2.inOut" }, 0)
          .fromTo("[data-media]", { scale: 1.45 }, { scale: 1.06, duration: 0.32, ease: "power2.inOut" }, 0)
          .fromTo("[data-frame-label]", { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0.05)
          .fromTo("[data-scrim]", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.18)
          .fromTo(ws, { opacity: 0.06, filter: "blur(10px)", yPercent: 20 }, { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.09, stagger: 0.06 }, 0.3)
          .fromTo("[data-manifesto-meta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.12 }, 0.72)
          .to("[data-media]", { scale: 1.5, duration: 0.5, ease: "power1.in" }, 0.5)
          .to("[data-v-glow]", { opacity: 1, scale: 1.2, duration: 0.35 }, 0.62)
          .to("[data-copy]", { yPercent: -18, opacity: 0, duration: 0.14 }, 0.88);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="manifesto" aria-label="Манифест" className="relative z-10 h-[100svh] overflow-hidden bg-ink-0">
      <div data-frame-label aria-hidden className="absolute inset-x-0 top-[13%] z-10 flex justify-center">
        <span className="t-label flex items-center gap-5">
          <span className="text-fg">02</span>
          <span className="h-px w-10 bg-line-2" />
          Growth / Manifesto
        </span>
      </div>

      <div data-window className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: "inset(24% 31% 24% 31% round 26px)" }}>
        {/* zoom origin sits on the V in the footage */}
        <div data-media className="absolute inset-0 origin-[50%_66%] will-change-transform">
          <CinemaVideo name="mountain-v" objectPosition="50% 60%" />
          <div
            data-v-glow
            aria-hidden
            className="absolute left-1/2 top-[64%] h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 mix-blend-screen"
            style={{ background: "radial-gradient(closest-side, rgba(232,240,255,0.35), transparent)" }}
          />
        </div>
        <div data-scrim aria-hidden className="absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.82) 0%, rgba(5,5,6,0.35) 45%, rgba(5,5,6,0.1) 70%, rgba(5,5,6,0.55) 100%)" }} />
      </div>

      <div data-copy className="shell relative z-10 flex h-full flex-col items-center pt-[16vh] text-center">
        <p className="max-w-[15ch] text-[clamp(40px,6.6vw,118px)] font-light leading-[1] tracking-[-0.045em] [text-shadow:0_2px_40px_rgba(0,0,0,0.5)]">
          {words.map((w, i) => (
            <span key={i} data-word className="inline-block opacity-[0.06] will-change-[opacity,filter,transform]">
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <div data-manifesto-meta className="mt-10 flex flex-col items-center gap-6 opacity-0">
          <span className="dash" />
          <span className="t-label">More than IT / Your growth</span>
        </div>
      </div>
    </section>
  );
}
