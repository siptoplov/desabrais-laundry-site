"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { kinetic } from "@/lib/content";
import { getTier, hasWebGL, prefersReducedMotion, useInView, useNearViewport } from "@/lib/device";

const WavesCanvas = dynamic(() => import("@/components/three/WavesCanvas"), { ssr: false });

export function Kinetic() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const near = useNearViewport(section, "80% 0px");
  const inView = useInView(section, "10% 0px");
  const [dpr, setDpr] = useState(1);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setDpr(getTier() === "high" ? 1.5 : 1);
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const lines = el.querySelectorAll<HTMLElement>("[data-kline]");
    if (prefersReducedMotion()) {
      gsap.set([lines, "[data-kdash]"], { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=180%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          onUpdate: (s) => (progress.current = s.progress),
        },
      });
      lines.forEach((line, i) => {
        const chars = line.querySelectorAll("[data-kchar]");
        tl.fromTo(
          chars,
          { opacity: 0, yPercent: 60, filter: "blur(16px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.04, ease: "power3.out" },
          i * 0.9,
        );
      });
      tl.fromTo("[data-kdash]", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, ">-0.4").to({}, { duration: 0.4 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="We build, we automate, we scale" className="relative z-10 h-[100svh] overflow-hidden bg-ink-0">
      <div className="absolute inset-0">{near && webgl && <WavesCanvas active={inView} progress={progress} dpr={dpr} />}</div>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(5,5,6,0.65),transparent)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-ink-0 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-ink-0 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-center gap-[clamp(18px,3vw,44px)] text-center">
        {kinetic.map((k) => (
          <p
            key={k}
            data-kline
            className="t-display whitespace-nowrap pl-[0.4em] text-[clamp(20px,4.8vw,80px)]"
          >
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
