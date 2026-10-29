"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

/**
 * Line-by-line mask reveal. Lines rise from beneath a clipping mask
 * as the element enters the viewport (or when `play` flips true).
 */
export function SplitReveal({
  as: As = "p",
  children,
  className,
  delay = 0,
  stagger = 0.09,
  play,
  start = "top 86%",
}: {
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  /** if provided, animation waits for this to become true instead of ScrollTrigger */
  play?: boolean;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const split = useRef<SplitText | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.visibility = "visible";
      return;
    }
    let st: ScrollTrigger | undefined;
    const ctx = gsap.context(() => {
      split.current = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        aria: "none",
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          tween.current?.kill();
          const t = gsap.fromTo(
            self.lines,
            { yPercent: 115, rotate: 2.5 },
            { yPercent: 0, rotate: 0, duration: 1.5, stagger, delay, ease: "expo.out", paused: true },
          );
          tween.current = t;
          if (play === undefined) {
            st?.kill();
            st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => t.play() });
          }
          return t;
        },
      });
    }, el);
    return () => {
      st?.kill();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (play) tween.current?.play();
  }, [play]);

  return (
    // @ts-expect-error polymorphic ref
    <As ref={ref} data-split className={className}>
      {children}
    </As>
  );
}

/** Fades-up every [data-reveal] descendant with a stagger when the container enters. */
export function useRevealGroup(ref: React.RefObject<HTMLElement | null>, opts?: { stagger?: number; start?: string; y?: number }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: opts?.y ?? 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: opts?.stagger ?? 0.1,
          scrollTrigger: { trigger: el, start: opts?.start ?? "top 82%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [ref, opts?.stagger, opts?.start, opts?.y]);
}
