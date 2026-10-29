/** Pick the lighter encode on small or low-DPR screens. */
export function videoSrc(name: string) {
  if (typeof window === "undefined") return `/media/${name}-1920.mp4`;
  const w = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return `/media/${name}-${w > 1500 ? 1920 : 1280}.mp4`;
}

/** Seeded PRNG (mulberry32) — deterministic "random" for choreography. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
