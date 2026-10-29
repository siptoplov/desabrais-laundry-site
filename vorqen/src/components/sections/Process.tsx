"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { process } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { SectionHead } from "@/components/ui/SectionHead";
import { useRevealGroup } from "@/components/ui/Reveal";

export function Process() {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  useRevealGroup(section);

  useEffect(() => {
    const el = list.current;
    if (!el || !fill.current) return;
    const steps = el.querySelectorAll<HTMLElement>("[data-step]");
    if (prefersReducedMotion()) {
      gsap.set(fill.current, { scaleY: 1 });
      steps.forEach((s) => s.setAttribute("data-active", "true"));
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.5 } },
      );
      steps.forEach((s) =>
        ScrollTrigger.create({
          trigger: s,
          start: "top 60%",
          onEnter: () => s.setAttribute("data-active", "true"),
          onLeaveBack: () => s.setAttribute("data-active", "false"),
        }),
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="process" aria-label="Процесс" className="section relative z-10 bg-ink-0">
      <div className="shell grid-12 gap-y-16">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[22vh]">
            <SectionHead index="05" label="Process" title="Пять шагов от идеи до роста" />
            <p data-reveal className="t-body mt-8 max-w-[36ch]">
              Прозрачный процесс без сюрпризов: на каждом этапе вы видите результат и понимаете, что будет дальше.
            </p>
          </div>
        </div>

        <ol ref={list} className="relative col-span-12 lg:col-span-6 lg:col-start-7">
          {/* rail */}
          <span aria-hidden className="absolute bottom-6 left-[7px] top-6 w-px bg-white/[0.07]" />
          <span
            ref={fill}
            aria-hidden
            className="absolute bottom-6 left-[7px] top-6 w-px origin-top scale-y-0 bg-gradient-to-b from-white via-glow to-white/40 shadow-[0_0_14px_1px_rgba(232,240,255,0.55)]"
          />
          {process.map((p) => (
            <li
              key={p.n}
              data-step
              data-active="false"
              className="group relative grid grid-cols-[15px_1fr] gap-x-8 py-10 sm:gap-x-12 [&+li]:border-t [&+li]:border-white/[0.05]"
            >
              <span className="relative z-10 mt-[14px] flex h-[15px] w-[15px] items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-white/25 bg-ink-0 transition-all duration-700 group-data-[active=true]:border-white group-data-[active=true]:shadow-[0_0_18px_3px_rgba(232,240,255,0.6)]" />
                <span className="relative h-[5px] w-[5px] scale-0 rounded-full bg-white transition-transform duration-700 ease-[var(--ease-expo)] group-data-[active=true]:scale-100" />
              </span>
              <div className="opacity-50 transition-[opacity,transform] duration-1000 ease-[var(--ease-expo)] group-data-[active=true]:translate-x-0 group-data-[active=true]:opacity-100 lg:-translate-x-3">
                <div className="flex items-baseline gap-5">
                  <span className="t-num text-[13px] text-fg-3">{p.n}</span>
                  <span className="t-label text-[9px]">{p.en}</span>
                </div>
                <h3 className="mt-4 text-[clamp(28px,2.6vw,44px)] font-light leading-[1.05] tracking-[-0.03em]">{p.title}</h3>
                <p className="t-body mt-3 max-w-[34ch]">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
