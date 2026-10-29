"use client";

import { createContext, useContext, useEffect } from "react";

/**
 * Native scrolling — no scroll-jacking, no inertia layer. Only in-page
 * anchor jumps are animated (browser smooth scroll), honouring the header
 * height and reduced motion.
 */
type ScrollApi = {
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number }) => void;
};

function scrollTo(target: string | number | HTMLElement, opts?: { offset?: number }) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let top: number;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: Math.max(0, top + (opts?.offset ?? 0)), behavior: reduced ? "auto" : "smooth" });
}

const ScrollContext = createContext<ScrollApi>({ scrollTo });
export const useSmoothScroll = () => useContext(ScrollContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);
  return <ScrollContext.Provider value={{ scrollTo }}>{children}</ScrollContext.Provider>;
}
