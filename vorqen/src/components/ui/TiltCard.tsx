"use client";

import { useRef } from "react";

/**
 * Glass card with 3D tilt toward the pointer, a soft spotlight that tracks
 * the cursor and the diagonal light sweep on hover.
 */
export function TiltCard({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width;
    const py = (e.clientY - b.top) / b.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`glass sweep group transition-transform duration-[900ms] ease-[var(--ease-expo)] will-change-transform ${className ?? ""}`}
      style={{ transform: "perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(232,240,255,0.08), transparent 60%)" }}
      />
      {children}
    </div>
  );
}
