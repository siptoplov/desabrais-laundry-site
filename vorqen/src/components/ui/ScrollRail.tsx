"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "manifesto", label: "Manifesto" },
  { id: "services", label: "Services" },
  { id: "tech", label: "Technology" },
  { id: "process", label: "Process" },
  { id: "ai", label: "AI Agent" },
  { id: "why", label: "Why us" },
  { id: "statement", label: "Statement" },
  { id: "contact", label: "Contact" },
];

/**
 * Thin chrome rail on the right edge: page progress plus the index and
 * name of the section under the middle of the screen. Desktop only.
 */
export function ScrollRail() {
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (fill.current) fill.current.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(SECTIONS.findIndex((s) => s.id === e.target.id));
        }),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const s = SECTIONS[Math.max(0, active)]!;
  return (
    <div aria-hidden className="pointer-events-none fixed right-6 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex">
      <span key={`n-${active}`} className="t-num animate-[rail-in_0.8s_var(--ease-expo)] text-[10px] text-fg">
        {String(Math.max(0, active) + 1).padStart(2, "0")}
      </span>
      <span className="relative block h-36 w-px overflow-hidden bg-white/10">
        <span ref={fill} className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-white to-white/40" />
      </span>
      <span key={`l-${active}`} className="t-label animate-[rail-in_0.8s_var(--ease-expo)] text-[8px] text-fg-2 [writing-mode:vertical-rl]">
        {s.label}
      </span>
      <style>{`@keyframes rail-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
