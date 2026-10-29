"use client";

import { useEffect } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>—·";

/**
 * Labels marked with [data-scramble] decode out of random glyphs the first
 * time they scroll into view — a quiet nod to the AI side of the studio.
 */
export function Scramble() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scramble]"));
    const run = (el: HTMLElement) => {
      const text = el.dataset.text ?? el.textContent ?? "";
      el.dataset.text = text;
      const n = text.length;
      const offsets = Array.from({ length: n }, () => Math.random() * 0.35);
      const t0 = performance.now();
      const dur = 700 + n * 18;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        let out = "";
        for (let i = 0; i < n; i++) {
          const c = text[i]!;
          const settle = i / n * 0.65 + offsets[i]!;
          out += c === " " || p >= settle ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = text;
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          run(e.target as HTMLElement);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
