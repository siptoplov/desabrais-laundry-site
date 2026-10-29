"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/device";

/** Pick the lighter encode on small or low-DPR screens. */
export function videoSrc(name: string) {
  if (typeof window === "undefined") return `/media/${name}-1920.mp4`;
  const w = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return `/media/${name}-${w > 1500 ? 1920 : 1280}.mp4`;
}

/**
 * Full-bleed cinematic loop. The still (served through next/image) paints
 * first; the video is only fetched when the section approaches the viewport,
 * plays while visible and pauses off-screen. Reduced motion keeps the still.
 */
export function CinemaVideo({
  name,
  priority = false,
  className,
  sizes = "100vw",
  objectPosition = "50% 50%",
}: {
  name: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  objectPosition?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v || prefersReducedMotion()) return;
    let loaded = false;
    const near = new IntersectionObserver(
      (entries) => {
        if (!loaded && entries.some((e) => e.isIntersecting)) {
          loaded = true;
          v.src = videoSrc(name);
          v.load();
        }
      },
      { rootMargin: "120% 0px" },
    );
    const vis = new IntersectionObserver((entries) => {
      const on = entries.some((e) => e.isIntersecting);
      if (on && loaded) v.play().catch(() => {});
      else v.pause();
    });
    near.observe(el);
    vis.observe(el);
    const onPlaying = () => setReady(true);
    const onCanPlay = () => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) v.play().catch(() => {});
    };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    return () => {
      near.disconnect();
      vis.disconnect();
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [name]);

  return (
    <div ref={box} className={`absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden>
      <Image
        src={`/media/${name}.jpg`}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        quality={80}
        className="object-cover"
        style={{ objectPosition }}
      />
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]"
        style={{ objectPosition, opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
