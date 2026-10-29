"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { onIntroDone, scrollStore } from "@/lib/scroll-store";

const scrollStoreIntro = () => scrollStore.introDone;

/**
 * Footage that plays as you scroll: a WebP frame sequence drawn to a
 * canvas, so the river runs and the clouds travel only while the page
 * moves, forwards or backwards.
 *
 * Cheap by design:
 * - after the intro every sequence is preloaded in page order (a section
 *   the reader reaches early jumps the queue), coarse-to-fine: every 8th
 *   frame first, then the gaps, six requests at a time;
 * - they stay compressed in memory; only ~20 frames around the playhead are
 *   decoded, off the main thread (createImageBitmap), and released when the
 *   section leaves the screen;
 * - the canvas is redrawn only when the frame index changes;
 * - phones and 1x screens get the 960px set, retina gets 1600px.
 * The poster still (next/image) paints first and stays as the fallback.
 */
/**
 * Page-wide preload queue: after the intro every sequence is fetched in page
 * order, one sequence at a time, so by the time the reader scrolls there the
 * frames are already in memory.
 */
const queue: (() => Promise<void>)[] = [];
let queueRunning = false;
function enqueue(job: () => Promise<void>) {
  queue.push(job);
  if (queueRunning) return;
  queueRunning = true;
  const run = async () => {
    while (queue.length) await queue.shift()!();
    queueRunning = false;
  };
  onIntroDone(() => void run());
}

export function ScrollSequence({
  name,
  frames,
  focus = [0.5, 0.5],
  start = "top bottom",
  end = "bottom top",
  className,
  priority = false,
}: {
  name: string;
  frames: number;
  /** focal point (0..1) kept in view when the frame is cropped to cover */
  focus?: [number, number];
  start?: string;
  end?: string;
  className?: string;
  priority?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fx, fy] = focus;

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv || prefersReducedMotion()) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const set = window.innerWidth * dpr > 1300 ? 1600 : 960;
    // compressed frames stay in memory (~30 KB each); only a sliding window
    // around the playhead is kept decoded, and decoding happens off the main
    // thread (createImageBitmap) so scrolling never waits on it
    const blobs: (Blob | null)[] = new Array(frames).fill(null);
    const bitmaps = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    const WINDOW = 8;
    const MAX = 20;
    let current = 0;
    let target = 0;
    let drawn = -1;
    let visible = false;
    let raf = 0;
    let started = false;
    let alive = true;

    const url = (i: number) => `/media/seq/${name}/${set}/${String(i).padStart(3, "0")}.webp`;

    const size = () => {
      const r = el.getBoundingClientRect();
      // never render more pixels than the frames carry
      const scale = Math.min(dpr, (set * 1.15) / Math.max(1, r.width));
      cv.width = Math.max(1, Math.round(r.width * scale));
      cv.height = Math.max(1, Math.round(r.height * scale));
      drawn = -1;
      draw();
    };

    const nearestDecoded = (i: number) => {
      if (bitmaps.has(i)) return i;
      let best = -1;
      let bd = Infinity;
      bitmaps.forEach((_, k) => {
        const d = Math.abs(k - i);
        if (d < bd) (bd = d), (best = k);
      });
      return best;
    };

    function draw() {
      const i = nearestDecoded(Math.round(current));
      if (i < 0 || i === drawn) return;
      const bmp = bitmaps.get(i)!;
      const cw = cv!.width;
      const ch = cv!.height;
      const s = Math.max(cw / bmp.width, ch / bmp.height);
      const w = bmp.width * s;
      const h = bmp.height * s;
      ctx!.drawImage(bmp, (cw - w) * fx, (ch - h) * fy, w, h);
      if (drawn < 0) cv!.style.opacity = "1";
      drawn = i;
    }

    // decode the frames nearest the playhead, drop the farthest
    const pump = () => {
      if (!alive) return;
      const t = Math.round(target);
      const want: number[] = [];
      for (let d = 0; d <= WINDOW; d++) {
        if (t + d < frames) want.push(t + d);
        if (d && t - d >= 0) want.push(t - d);
      }
      for (const i of want) {
        if (decoding.size >= 3) break;
        if (bitmaps.has(i) || decoding.has(i) || !blobs[i]) continue;
        decoding.add(i);
        createImageBitmap(blobs[i]!)
          .then((bmp) => {
            decoding.delete(i);
            if (!alive) return bmp.close();
            bitmaps.set(i, bmp);
            if (bitmaps.size > MAX) {
              let far = -1;
              let fd = -1;
              bitmaps.forEach((_, k) => {
                const d = Math.abs(k - target);
                if (d > fd && k !== drawn) (fd = d), (far = k);
              });
              if (far >= 0) (bitmaps.get(far)!.close(), bitmaps.delete(far));
            }
            if (Math.abs(i - current) <= Math.abs(drawn - current) || drawn < 0) {
              drawn = -2;
              draw();
            }
            pump();
          })
          .catch(() => decoding.delete(i));
      }
    };

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.25;
      if (Math.abs(target - current) < 0.01) current = target;
      draw();
      if (visible && current !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      pump();
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    // coarse-to-fine fetch order, six requests at a time; resolves when done
    const load = () =>
      new Promise<void>((resolve) => {
      if (started || !alive) return resolve();
      started = true;
      const order: number[] = [];
      const seen = new Set<number>();
      for (const stride of [8, 4, 2, 1]) {
        for (let i = 0; i < frames; i += stride) if (!seen.has(i)) (seen.add(i), order.push(i));
      }
      let cursor = 0;
      let inflight = 0;
      const next = (): void => {
        if (!alive || cursor >= order.length) {
          if (inflight === 0) resolve();
          return;
        }
        const i = order[cursor++]!;
        inflight++;
        fetch(url(i))
          .then((r) => (r.ok ? r.blob() : null))
          .then((b) => {
            if (b) blobs[i] = b;
            pump();
          })
          .catch(() => {})
          .finally(() => {
            inflight--;
            next();
          });
      };
      for (let k = 0; k < 6; k++) next();
      });

    // join the page-wide queue (starts after the intro, in page order);
    // a section the reader reaches early jumps the queue
    enqueue(load);
    const near = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting) && scrollStoreIntro()) void load();
      },
      { rootMargin: "60% 0px" },
    );
    const vis = new IntersectionObserver((e) => {
      visible = e.some((x) => x.isIntersecting);
      if (visible) kick();
      else {
        // off screen: release decoded frames except the one on the canvas
        bitmaps.forEach((b, k) => k !== drawn && (b.close(), bitmaps.delete(k)));
      }
    });
    near.observe(el);
    vis.observe(el);

    const ro = new ResizeObserver(size);
    ro.observe(el);

    const trigger = el.closest("section") ?? el;
    const st = ScrollTrigger.create({
      trigger,
      start,
      end,
      onUpdate: (self) => {
        target = self.progress * (frames - 1);
        kick();
      },
    });
    target = st.progress * (frames - 1);
    current = target;

    return () => {
      cancelAnimationFrame(raf);
      near.disconnect();
      vis.disconnect();
      ro.disconnect();
      st.kill();
      alive = false;
      bitmaps.forEach((b) => b.close());
      bitmaps.clear();
    };
  }, [name, frames, fx, fy, start, end]);

  return (
    <div ref={box} className={`absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden>
      <Image
        src={`/media/${name}.jpg`}
        alt=""
        fill
        priority={priority}
        loading={priority ? undefined : "eager"}
        sizes="100vw"
        quality={85}
        className="object-cover"
        style={{ objectPosition: `${fx * 100}% ${fy * 100}%` }}
      />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700" />
    </div>
  );
}
