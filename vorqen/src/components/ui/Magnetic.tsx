"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

/** Pulls its child toward the pointer while hovered. */
export function Magnetic({ children, strength = 0.32, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  return (
    <m.div
      ref={ref}
      className={className ?? "inline-block"}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const b = ref.current.getBoundingClientRect();
        x.set((e.clientX - (b.left + b.width / 2)) * strength);
        y.set((e.clientY - (b.top + b.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.div>
  );
}
