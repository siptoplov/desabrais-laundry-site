"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low";

export function getTier(): Tier {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return coarse || small || cores <= 4 || mem <= 4 ? "low" : "high";
}

let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (webglCache !== null) return webglCache;
  if (/[?&]gl=force\b/.test(window.location.search)) return (webglCache = true);
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      webglCache = false;
    } else {
      // Software rasterisers (SwiftShader, llvmpipe, WARP) would render the
      // scene on the CPU and freeze the main thread — use the 2D fallback.
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      webglCache = !/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>("high");
  useEffect(() => setTier(getTier()), []);
  return tier;
}

/** True once the element has been near the viewport; used to lazy-mount WebGL. */
export function useNearViewport<T extends Element>(ref: React.RefObject<T | null>, rootMargin = "50% 0px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}

/** Live visibility (for pausing render loops off-screen). */
export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
