"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

const RING_TEXT = "VORQEN · BUILD · AUTOMATE · SCALE · ";

/**
 * Brand cursor: the V emblem sits exactly on the pointer; a ring of
 * rotating type ("VORQEN · BUILD · AUTOMATE · SCALE") trails it with a soft
 * lag. Over links the ring opens up and spins faster, over [data-cursor]
 * targets it shows a label, over text fields it tucks away.
 * The spin runs on the compositor; the follow loop only runs while the ring
 * is catching up, so a resting cursor costs nothing.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !ring.current || !core.current) return;
    document.documentElement.classList.add("has-cursor");

    const r = ring.current;
    const c = core.current;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let scale = 1;
    let targetScale = 1;
    let press = 1;
    let visible = false;
    let last = 0;
    let raf = 0;

    // the type spins on the compositor; state changes only retune its speed
    const spin = reduced
      ? null
      : r.querySelector("[data-spin]")?.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 15000, iterations: Infinity });
    const setSpeed = (degPerSec: number) => spin?.updatePlaybackRate(degPerSec / 24);

    // the ring eases after the pointer, then the loop sleeps until it moves
    const loop = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = 1 - Math.pow(0.0009, dt); // frame-rate independent lerp
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      const goal = targetScale * press;
      scale += (goal - scale) * (1 - Math.pow(0.0002, dt));
      const settled = Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) < 0.15 && Math.abs(goal - scale) < 0.002;
      if (settled) {
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        scale = goal;
      }
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = settled ? 0 : requestAnimationFrame(loop);
      if (!raf) last = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const show = (on: boolean) => {
      visible = on;
      r.style.opacity = on ? "1" : "0";
      c.style.opacity = on ? "1" : "0";
    };
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      c.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      if (!visible) {
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        show(true);
      }
      wake();
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [data-cursor], input, textarea, label, select");
      const text = t?.dataset.cursor ?? "";
      const field = !!t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (field) {
        targetScale = 0.45;
        setSpeed(0);
      } else if (text) {
        targetScale = 1.75;
        setSpeed(70);
      } else if (t) {
        targetScale = 1.35;
        setSpeed(110);
      } else {
        targetScale = 1;
        setSpeed(24);
      }
      wake();
      r.dataset.state = field ? "field" : text ? "label" : t ? "link" : "idle";
      c.dataset.state = r.dataset.state;
      if (label.current) label.current.textContent = text;
    };
    const onDown = () => {
      press = 0.82;
      wake();
    };
    const onUp = () => {
      press = 1;
      wake();
    };
    const onLeave = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      spin?.cancel();
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      {/* trailing ring of rotating type */}
      <div
        ref={ring}
        data-state="idle"
        className="group/ring absolute left-0 top-0 h-[84px] w-[84px] opacity-0 transition-opacity duration-500 will-change-transform"
      >
        {/* spun as an HTML box: a transform animation on the <svg> itself
            would not run on the compositor */}
        <div data-spin className="h-full w-full">
          <svg viewBox="0 0 84 84" className="h-full w-full overflow-visible">
            <defs>
              <path id="cursor-ring" d="M42,42 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0" />
            </defs>
            <circle
              cx="42"
              cy="42"
              r="24"
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.75"
              className="transition-[stroke] duration-500 group-data-[state=label]/ring:stroke-[rgba(255,255,255,0.6)] group-data-[state=link]/ring:stroke-[rgba(255,255,255,0.55)]"
            />
            <text
              fill="rgba(237,238,240,0.78)"
              fontSize="6.4"
              letterSpacing="0.6"
              style={{ fontFamily: "var(--font-michroma), sans-serif" }}
              className="transition-opacity duration-500 group-data-[state=field]/ring:opacity-0"
            >
              <textPath href="#cursor-ring" textLength="205" lengthAdjust="spacing">
                {RING_TEXT}
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      {/* exact-position core: the emblem, or a label over [data-cursor] */}
      <div
        ref={core}
        data-state="idle"
        className="group/core absolute left-0 top-0 flex h-10 w-16 items-center justify-center opacity-0 transition-opacity duration-500 will-change-transform"
      >
        <img
          ref={mark}
          src="/brand/emblem.webp"
          alt=""
          width={488}
          height={358}
          className="h-auto w-[18px] drop-shadow-[0_0_6px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-500 group-data-[state=field]/core:scale-50 group-data-[state=label]/core:scale-0 group-data-[state=label]/core:opacity-0 group-data-[state=link]/core:scale-125"
        />
        <span
          ref={label}
          className="t-label absolute whitespace-nowrap text-[7.5px] tracking-[0.32em] text-fg opacity-0 transition-opacity duration-500 group-data-[state=label]/core:opacity-100"
        />
      </div>
    </div>
  );
}
