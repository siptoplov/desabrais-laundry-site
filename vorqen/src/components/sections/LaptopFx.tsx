"use client";

import { useEffect, useRef, useState } from "react";

/** Laptop geometry traced from the footage, in fractions of the 1928×1076 frame. */
const FRAME = { w: 1928, h: 1076 };
const LID: [number, number][] = [
  [0.508, 0.238],
  [0.935, -0.02],
  [1.02, -0.02],
  [1.02, 0.475],
  [0.74, 0.69],
];
const EDGE_FRONT: [[number, number], [number, number]] = [
  [0.508, 0.238],
  [0.74, 0.69],
];
const EDGE_SIDE: [[number, number], [number, number]] = [
  [0.74, 0.69],
  [1.02, 0.475],
];
const EMBLEM: [number, number] = [0.8, 0.325];

type Geo = {
  lid: string;
  /** same polygon relative to the hotspot box */
  lidLocal: string;
  box: { x: number; y: number; w: number; h: number };
  front: [number, number, number, number];
  side: [number, number, number, number];
  emblem: [number, number];
  scale: number;
};

/**
 * Hover the laptop and it wakes up: it tilts toward the cursor, the cursor
 * becomes a light gliding over the black glass, the chrome emblem ignites
 * and a seam of light opens along the lid edge as if it were lifting.
 * On touch screens a tap toggles the same state.
 */
export function LaptopFx({ focus, tilt }: { focus: [number, number]; tilt: React.RefObject<HTMLDivElement | null> }) {
  const root = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [on, setOn] = useState(false);
  const target = useRef({ rx: 0, ry: 0, lift: 0 });

  // map frame fractions to element pixels with the same cover-fit as the canvas
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = Math.max(W / FRAME.w, H / FRAME.h);
      const ox = (W - FRAME.w * s) * focus[0];
      const oy = (H - FRAME.h * s) * focus[1];
      const P = ([fx, fy]: [number, number]): [number, number] => [ox + fx * FRAME.w * s, oy + fy * FRAME.h * s];
      const lid = LID.map(P);
      const xs = lid.map((p) => p[0]);
      const ys = lid.map((p) => p[1]);
      const box = { x: Math.min(...xs), y: Math.max(0, Math.min(...ys)), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.max(0, Math.min(...ys)) };
      const f0 = P(EDGE_FRONT[0]);
      const f1 = P(EDGE_FRONT[1]);
      const s0 = P(EDGE_SIDE[0]);
      const s1 = P(EDGE_SIDE[1]);
      const poly = (pts: [number, number][], dx = 0, dy = 0) =>
        `polygon(${pts.map(([x, y]) => `${(x - dx).toFixed(1)}px ${(y - dy).toFixed(1)}px`).join(", ")})`;
      setGeo({
        lid: poly(lid),
        lidLocal: poly(lid, box.x, box.y),
        box,
        front: [f0[0], f0[1], f1[0], f1[1]],
        side: [s0[0], s0[1], s1[0], s1[1]],
        emblem: P(EMBLEM),
        scale: s,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [focus]);

  // eased 3D tilt toward the pointer
  useEffect(() => {
    const t = tilt.current;
    if (!t) return;
    const cur = { rx: 0, ry: 0, lift: 0 };
    let raf = 0;
    const loop = () => {
      const g = target.current;
      cur.rx += (g.rx - cur.rx) * 0.1;
      cur.ry += (g.ry - cur.ry) * 0.1;
      cur.lift += (g.lift - cur.lift) * 0.1;
      t.style.transform = `perspective(1400px) translateY(${cur.lift}px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      const settled = Math.abs(g.rx - cur.rx) + Math.abs(g.ry - cur.ry) + Math.abs(g.lift - cur.lift) < 0.01;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    (t as HTMLDivElement & { __kick?: () => void }).__kick = start;
    return () => cancelAnimationFrame(raf);
  }, [tilt]);

  const kick = () => (tilt.current as (HTMLDivElement & { __kick?: () => void }) | null)?.__kick?.();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !geo) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    target.current = { rx: -ny * 3, ry: nx * 4, lift: -6 };
    kick();
    const g = glass.current;
    if (g) {
      const host = root.current!.getBoundingClientRect();
      g.style.setProperty("--mx", `${e.clientX - host.left}px`);
      g.style.setProperty("--my", `${e.clientY - host.top}px`);
    }
  };
  const enter = () => {
    setOn(true);
    target.current.lift = -6;
    kick();
  };
  const leave = () => {
    setOn(false);
    target.current = { rx: 0, ry: 0, lift: 0 };
    kick();
  };

  const len = (l: [number, number, number, number]) => Math.hypot(l[2] - l[0], l[3] - l[1]);

  return (
    <div ref={root} className="absolute inset-0" data-on={on ? "true" : "false"}>
      {geo && (
        <>
          {/* light spilling out of the opening seam onto the table */}
          <div
            aria-hidden
            className="pointer-events-none absolute transition-opacity duration-[1200ms] ease-[var(--ease-expo)]"
            style={{
              left: geo.front[0] - 140 * geo.scale,
              top: geo.front[1],
              width: geo.front[2] - geo.front[0] + 520 * geo.scale,
              height: geo.front[3] - geo.front[1] + 300 * geo.scale,
              background: "radial-gradient(50% 40% at 40% 45%, rgba(232,240,255,0.22), transparent 70%)",
              opacity: on ? 1 : 0,
            }}
          />

          {/* the cursor as a light source gliding over the black glass */}
          <div
            ref={glass}
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              clipPath: geo.lid,
              opacity: on ? 1 : 0,
              background:
                "radial-gradient(300px circle at var(--mx, 80%) var(--my, 30%), rgba(232,240,255,0.28), rgba(232,240,255,0.07) 40%, transparent 70%), linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
            }}
          />

          {/* emblem ignition */}
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-full transition-[opacity,transform] duration-[900ms] ease-[var(--ease-expo)]"
            style={{
              left: geo.emblem[0],
              top: geo.emblem[1],
              width: 460 * geo.scale,
              height: 460 * geo.scale,
              transform: `translate(-50%, -50%) scale(${on ? 1 : 0.4})`,
              opacity: on ? 1 : 0,
              background: "radial-gradient(closest-side, rgba(255,255,255,0.6), rgba(232,240,255,0.18) 35%, transparent 72%)",
              animation: on ? "laptop-pulse 2.4s ease-in-out infinite" : "none",
            }}
          />

          {/* seam of light opening along the lid edges */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="seam" gradientUnits="userSpaceOnUse" x1={geo.front[0]} y1={geo.front[1]} x2={geo.side[2]} y2={geo.side[3]}>
                <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#e8f0ff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {[
              { w: 14, o: 0.08 },
              { w: 5, o: 0.25 },
              { w: 1.6, o: 1 },
            ].map(({ w, o }) =>
              [geo.front, geo.side].map((l, i) => {
                const L = len(l);
                return (
                  <line
                    key={`${w}-${i}`}
                    x1={l[0]}
                    y1={l[1]}
                    x2={l[2]}
                    y2={l[3]}
                    stroke="url(#seam)"
                    strokeWidth={w}
                    strokeLinecap="round"
                    opacity={o}
                    strokeDasharray={L}
                    strokeDashoffset={on ? 0 : L}
                    style={{ transition: `stroke-dashoffset 1.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.35}s` }}
                  />
                );
              }),
            )}
          </svg>

          {/* interaction hotspot over the lid */}
          <div
            className="absolute"
            data-cursor={on ? "Online" : "Open"}
            style={{ left: geo.box.x, top: geo.box.y, width: geo.box.w, height: geo.box.h, clipPath: geo.lidLocal }}
            onPointerEnter={(e) => e.pointerType === "mouse" && enter()}
            onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
            onPointerMove={onMove}
            onClick={(e) => {
              if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
              if (on) leave();
              else enter();
            }}
          />
        </>
      )}
      <style>{`@keyframes laptop-pulse{0%,100%{opacity:1}50%{opacity:.65}}`}</style>
    </div>
  );
}
