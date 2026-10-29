"use client";

import { useEffect, useRef } from "react";
import { rng } from "@/lib/media";

/**
 * Fine motes of light drifting through the frame, a few catching the light
 * and twinkling. One small 2D canvas at device-pixel ratio 1, animated only
 * while on screen; nothing on reduced motion.
 */
export function Dust({ count = 70, className }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const r = rng(9);
    const n = window.innerWidth < 768 ? Math.round(count * 0.5) : count;
    const motes = Array.from({ length: n }, () => ({
      x: r(),
      y: r(),
      z: 0.3 + r() * 0.7, // depth: size, speed and brightness
      s: r() * Math.PI * 2,
      sp: 0.6 + r() * 1.4,
    }));
    let w = 0;
    let h = 0;
    const size = () => {
      w = cv.width = cv.clientWidth;
      h = cv.height = cv.clientHeight;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    let raf = 0;
    let visible = false;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= dt * 0.012 * m.z;
        m.x += dt * 0.006 * Math.sin(now / 4000 + m.s);
        if (m.y < -0.02) (m.y = 1.02), (m.x = Math.random());
        const tw = 0.35 + 0.65 * Math.max(0, Math.sin(now / 1000 * m.sp + m.s));
        const a = m.z * tw * 0.75;
        const rad = 0.6 + m.z * 1.4;
        ctx.fillStyle = `rgba(232,240,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, rad, 0, Math.PI * 2);
        ctx.fill();
        if (tw > 0.97 && m.z > 0.8) {
          // a brief cross-shaped sparkle on the brightest motes
          ctx.fillRect(m.x * w - 6, m.y * h - 0.4, 12, 0.8);
          ctx.fillRect(m.x * w - 0.4, m.y * h - 6, 0.8, 12);
        }
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver((e) => {
      visible = e.some((x) => x.isIntersecting);
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(cv);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`} />;
}
