"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useEffect, useRef } from "react";

export type Glint = "sweep" | "flow" | "pulse";

/**
 * A full-resolution still brought to life without losing a pixel of it.
 * The light only ever touches the image's own highlights
 * (/media/fx/<name>.webp: the water, the V of light, chrome edges), and every
 * effect is a plain image layer moved or faded on the compositor — no
 * animated masks, no repaints:
 *
 * - pulse: the highlights breathing (opacity)
 * - flow:  three baked phases of glints along the river, cross-faded in a
 *          loop so the light reads as running downstream (scripts/mkfx.py)
 * - sweep: a soft band of light crossing the chrome; the band slides one way
 *          while the highlights inside it slide back, so they stay in place
 *
 * Every layer uses the same cover fit and focal point as the photo, so the
 * light stays pinned to its features at any viewport size. `fxTop` clips the
 * effect layers to the part of the frame that has highlights (the river
 * below the horizon), so the compositor never draws the empty sky. Effects
 * pause while the image is off screen.
 */
export function CinematicStill({
  name,
  focus = [0.5, 0.5],
  glints = [],
  priority = false,
  sizes = "100vw",
  fxTop = 0,
}: {
  name: string;
  focus?: [number, number];
  glints?: Glint[];
  priority?: boolean;
  sizes?: string;
  /** fraction of the height above which there is nothing to light */
  fxTop?: number;
}) {
  const fx = useRef<HTMLDivElement>(null);
  const pos = `${focus[0] * 100}% ${focus[1] * 100}%`;

  useEffect(() => {
    const el = fx.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => el.classList.toggle("fx-on", e.some((x) => x.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const layer = (src: string, className = "") => (
    <img src={src} alt="" draggable={false} decoding="async" className={`absolute inset-0 h-full w-full object-cover ${className}`} style={{ objectPosition: pos }} />
  );

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
        <div ref={fx} className="still-fx absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: `${fxTop * 100}%` }}>
          {/* back to the full frame inside the clip, so the fit matches the photo */}
          <div className="absolute inset-x-0" style={{ top: `${(-fxTop / (1 - fxTop)) * 100}%`, height: `${100 / (1 - fxTop)}%` }}>
            {glints.includes("pulse") && layer(`/media/fx/${name}.webp`, "fx-pulse")}
            {glints.includes("flow") && (
              <div className="absolute inset-0">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="fx-flow absolute inset-0" style={{ animationDelay: `${-((3 - k) % 3) * 0.4}s` }}>
                    {layer(`/media/fx/${name}-flow-${k}.webp`)}
                  </div>
                ))}
              </div>
            )}
            {glints.includes("sweep") && (
              <div className="fx-band absolute inset-y-0 left-0 w-[34%] overflow-hidden">
                <div className="fx-band-inner absolute inset-y-0 left-0 w-[294.12%]">{layer(`/media/fx/${name}.webp`)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
