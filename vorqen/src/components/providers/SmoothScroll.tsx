"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";

type ScrollApi = {
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
  lenis: Lenis | null;
};

const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {}, lenis: null });
export const useSmoothScroll = () => useContext(ScrollContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [api, setApi] = useState<ScrollApi>({
    lenis: null,
    scrollTo: (target) => {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el instanceof HTMLElement) el.scrollIntoView({ behavior: "smooth" });
      else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    },
  });

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setApi({
      lenis,
      scrollTo: (target, opts) =>
        lenis.scrollTo(target, {
          offset: opts?.offset ?? 0,
          immediate: opts?.immediate,
          duration: 1.6,
          easing: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
        }),
    });

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
