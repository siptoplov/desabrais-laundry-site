"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";

export type Glint = "sweep" | "flow" | "pulse";

/**
 * A full-resolution still brought to life without losing a pixel of it.
 * Light effects run only inside a highlight mask derived from the image
 * itself (/media/fx/<name>.webp): the water, the V of light, chrome edges.
 *
 * - sweep: a band of light crossing the chrome every few seconds
 * - flow:  glints running downstream along the river, pushed by scrolling
 * - pulse: the light sources breathing
 *
 * The mask uses the same cover fit and focal point as the image, so the
 * effects stay pinned to their features at any viewport size.
 */
export function CinematicStill({
  name,
  focus = [0.5, 0.5],
  glints = [],
  priority = false,
  sizes = "100vw",
}: {
  name: string;
  focus?: [number, number];
  glints?: Glint[];
  priority?: boolean;
  sizes?: string;
}) {
  const fx = useRef<HTMLDivElement>(null);
  const hasFlow = glints.includes("flow");
  const pos = `${focus[0] * 100}% ${focus[1] * 100}%`;

  // run the light effects only while the image is on screen
  useEffect(() => {
    const el = fx.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => el.classList.toggle("fx-on", e.some((x) => x.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = fx.current;
    if (!el || prefersReducedMotion() || !hasFlow) return;
    const trigger = el.closest("section") ?? el;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-flow-scroll]", { yPercent: -18 }, { yPercent: 18, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0.4 } });
    }, el);
    return () => ctx.revert();
  }, [hasFlow]);

  const mask = `url(/media/fx/${name}.webp)`;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={`/media/${name}-hd.jpg`}
        alt=""
        fill
        priority={priority}
        loading={priority ? undefined : "eager"}
        sizes={sizes}
        quality={90}
        className="object-cover"
        style={{ objectPosition: pos }}
      />
      {glints.length > 0 && (
        <div
          ref={fx}
          className="still-fx absolute inset-0"
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskSize: "cover",
            maskSize: "cover",
            WebkitMaskPosition: pos,
            maskPosition: pos,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {glints.includes("pulse") && <div className="fx-pulse absolute inset-0 bg-white" />}
          {glints.includes("flow") && (
            <div data-flow-scroll className="absolute -inset-y-1/4 inset-x-0">
              <div
                className="fx-flow absolute inset-x-0 top-0 h-[200%]"
                style={{
                  background:
                    "repeating-linear-gradient(176deg, transparent 0px, transparent 26px, rgba(255,255,255,0.75) 31px, rgba(232,240,255,0.25) 36px, transparent 44px)",
                }}
              />
            </div>
          )}
          {glints.includes("sweep") && (
            <div className="fx-sweep absolute -inset-y-1/4 left-0 w-[60%]" style={{ background: "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)" }} />
          )}
        </div>
      )}
    </div>
  );
}
