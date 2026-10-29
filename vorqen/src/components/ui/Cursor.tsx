"use client";

import { useEffect, useRef } from "react";

/**
 * Small ring that trails the pointer with blend-difference.
 * Grows over interactive elements; shows an optional label via data-cursor="Label".
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || !ring.current || !dot.current) return;
    document.documentElement.classList.add("has-cursor");

    const r = ring.current;
    const d = dot.current;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      scale += (targetScale - scale) * 0.16;
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        r.style.opacity = "1";
        d.style.opacity = "1";
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [data-cursor], input, textarea, label");
      const text = t?.dataset.cursor;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
        targetScale = 0.5;
      } else {
        targetScale = t ? (text ? 3.2 : 2.1) : 1;
      }
      r.dataset.active = t ? "true" : "false";
      if (label.current) label.current.textContent = text ?? "";
    };
    const onLeave = () => {
      visible = false;
      r.style.opacity = "0";
      d.style.opacity = "0";
    };
    const onDown = () => (targetScale *= 0.8);
    const onUp = () => (targetScale /= 0.8);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-white opacity-0 transition-[opacity,background-color] duration-500 data-[active=true]:bg-white/10"
      >
        <span ref={label} className="t-label scale-[0.32] whitespace-nowrap text-white" />
      </div>
      <div ref={dot} className="absolute left-0 top-0 h-1 w-1 rounded-full bg-white opacity-0" />
    </div>
  );
}
