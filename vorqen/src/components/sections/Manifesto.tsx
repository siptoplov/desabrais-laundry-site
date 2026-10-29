"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { manifesto } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { ScrollSequence } from "@/components/ui/ScrollSequence";
import { Mist } from "@/components/ui/Mist";

/**
 * The mountain valley with the V of light. No pinning: the page keeps
 * scrolling freely while the framed window opens to full bleed as the
 * section rises into view, and the words light up as you read down.
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
      const wide = window.innerWidth >= window.innerHeight;
      // window opens while the section travels from the bottom edge to the top
      gsap.fromTo(
        "[data-window]",
        { clipPath: wide ? "inset(18% 22% 18% 22% round 28px)" : "inset(16% 8% 16% 8% round 22px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 10%", scrub: true } },
      );
      // slow push toward the V across the whole pass
      gsap.fromTo("[data-media]", { scale: 1.3 }, { scale: 1.06, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo("[data-scrim]", { opacity: 0.2 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "top top", scrub: true } });
      // words light up one by one as you scroll through
      gsap.fromTo(
        ws,
        { opacity: 0.08, yPercent: 30 },
        { opacity: 1, yPercent: 0, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 55%", end: "top -5%", scrub: true } },
      );
      gsap.fromTo("[data-manifesto-meta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 5%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="manifesto" aria-label="Манифест" className="relative z-10 h-[130svh] min-h-[760px] overflow-hidden bg-ink-0">
      <div data-window className="absolute inset-0" style={{ clipPath: "inset(18% 22% 18% 22% round 28px)" }}>
        {/* zoom origin sits on the V in the footage */}
        <div data-media className="absolute inset-0 origin-[50%_62%] will-change-transform">
          <ScrollSequence name="mountain-v" frames={81} focus={[0.5, 0.6]} />
        </div>
        <Mist />
        <div
          data-scrim
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #050506 0%, rgba(5,5,6,0.55) 22%, rgba(5,5,6,0.1) 55%, rgba(5,5,6,0.25) 80%, #050506 100%)" }}
        />
      </div>

      <div className="shell relative z-10 flex h-full flex-col items-center pt-[26svh] text-center">
        <p className="t-label mb-10 flex items-center gap-5">
          <span className="text-fg">02</span>
          <span className="h-px w-10 bg-line-2" />
          Growth / Manifesto
        </p>
        <p className="max-w-[15ch] text-[clamp(40px,6.6vw,118px)] font-light leading-[1] tracking-[-0.045em] [text-shadow:0_2px_40px_rgba(0,0,0,0.5)]">
          {words.map((w, i) => (
            <span key={i} data-word className="inline-block opacity-[0.08]">
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
