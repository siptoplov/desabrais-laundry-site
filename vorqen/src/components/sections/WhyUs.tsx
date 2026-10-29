"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { why } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { SectionHead } from "@/components/ui/SectionHead";
import { useRevealGroup } from "@/components/ui/Reveal";

function Counter({ value, placeholder }: { value: number | null; placeholder: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || value == null) return;
    if (prefersReducedMotion()) {
      el.textContent = String(value);
      return;
    }
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: value,
        duration: 2.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v));
        },
      });
    });
    return () => ctx.revert();
  }, [value]);
  return <span ref={ref}>{value == null ? placeholder : "0"}</span>;
}

export function WhyUs() {
  const section = useRef<HTMLElement>(null);
  useRevealGroup(section, { stagger: 0.12 });

  return (
    <section ref={section} id="why" aria-label="Почему мы" className="section relative z-10 bg-ink-0">
      <div className="shell">
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-7">
            <SectionHead index="07" label="Why VORQEN" title="Почему с нами растут быстрее" />
          </div>
          <p data-reveal className="t-body col-span-12 max-w-[40ch] lg:col-span-4 lg:col-start-9">
            Одна команда закрывает стратегию, продукт, разработку и AI. Меньше подрядчиков — больше результата.
          </p>
        </div>

        <ul className="mt-20 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:mt-28 lg:grid-cols-4">
          {why.map((w, i) => (
            <li
              key={w.title}
              data-reveal
              className={`group relative py-10 sm:px-8 lg:py-14 ${i % 2 ? "sm:border-l sm:border-line" : ""} ${i > 0 ? "lg:border-l lg:border-line" : ""} ${
                i > 1 ? "border-t border-line lg:border-t-0" : i === 1 ? "border-t border-line sm:border-t-0" : ""
              } first:sm:pl-0`}
            >
              <span className="absolute left-0 top-0 h-px w-0 bg-white transition-[width] duration-1000 ease-[var(--ease-expo)] group-hover:w-full" />
              <p className="chrome-text t-num flex items-start text-[clamp(56px,5.6vw,92px)] font-normal leading-none tracking-[-0.02em]">
                <Counter value={w.value} placeholder={w.placeholder} />
                <span className="ml-1 mt-[0.12em] text-[0.42em]">{w.suffix}</span>
              </p>
              <h3 className="mt-10 text-[17px] font-medium tracking-[-0.01em]">{w.title}</h3>
              <p className="t-small mt-3 max-w-[28ch] text-[14px]">{w.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
