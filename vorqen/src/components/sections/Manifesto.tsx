"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { manifesto } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/device";
import { CinematicStill } from "@/components/ui/CinematicStill";
import { Clouds } from "@/components/ui/Clouds";

/**
 * The mountain valley with the V of light, dissolving straight out of the
 * hero: no frame, no cut. The scene reaches up over the hero and stays put
 * (CSS sticky, so the compositor holds it, not script) while the hero flies
 * into the emblem; it fades in through a bloom of light and keeps the
 * forward push going. The words then scroll up over it and light up as you
 * read, and the scene leaves with the end of the section.
 */
export function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const words = manifesto.split(" ");

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ws = el.querySelectorAll<HTMLElement>("[data-word]");
    if (prefersReducedMotion()) {
      gsap.set(ws, { opacity: 1 });
      gsap.set("[data-fade]", { opacity: 1 });
      el.querySelector("[data-scene]")?.classList.add("scene-live");
      return;
    }
    const ctx = gsap.context(() => {
      // cross-dissolve out of the hero while it zooms into the emblem. Only
      // the photo and its scrim fade (one layer each, no off-screen pass);
      // the clouds and the light join once the scene is solid, and leave
      // again under the bloom when scrolling back
      const scene = el.querySelector("[data-scene]")!;
      gsap.fromTo("[data-fade]", { opacity: 0 }, {
        opacity: 1,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "top 15%",
          scrub: true,
          onUpdate: ({ progress: p }) => {
            if (p > 0.97) scene.classList.add("scene-live");
            else if (p < 0.5) scene.classList.remove("scene-live");
          },
        },
      });
      // ...through a bloom of light at the crossing point
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "top 5%", scrub: true } })
        .fromTo("[data-flare]", { opacity: 0, scale: 0.55 }, { opacity: 0.9, scale: 1, ease: "power1.in", duration: 1 })
        .to("[data-flare]", { opacity: 0, scale: 1.35, ease: "power1.out", duration: 1.1 });
      // the forward push carries on into the valley and settles
      gsap.fromTo("[data-media]", { scale: 1.45 }, { scale: 1.02, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom top", scrub: true } });
      // words light up one by one as you scroll through
      gsap.fromTo(
        ws,
        { opacity: 0.08, yPercent: 30 },
        { opacity: 1, yPercent: 0, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 55%", end: "top -5%", scrub: true } },
      );
      gsap.fromTo("[data-manifesto-meta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 5%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="manifesto" aria-label="Манифест" className="relative z-10 h-[130svh] min-h-[760px]">
      {/* reaches a screen up over the hero, so the scene can dissolve in on
          top of it and stay fixed on screen until the section ends */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[-100svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div data-scene className="scene absolute inset-0">
            {/* zoom origin sits on the V in the footage */}
            <div data-media data-fade className="absolute inset-0 origin-[50%_62%] opacity-0 will-change-[transform,opacity]">
              <CinematicStill name="mountain-v" focus={[0.5, 0.6]} glints={["flow"]} fxTop={0.3} />
            </div>
            <Clouds />
            <div
              data-fade
              className="absolute inset-0 opacity-0 will-change-[opacity]"
              style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.85) 0%, rgba(5,5,6,0.4) 22%, rgba(5,5,6,0.12) 55%, rgba(5,5,6,0.35) 80%, #050506 100%)" }}
            />
          </div>
          <div
            data-flare
            className="absolute left-1/2 top-[32%] h-[110vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 will-change-[opacity,transform] lg:top-[47%]"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.5), rgba(232,240,255,0.18) 38%, rgba(232,240,255,0.05) 60%, transparent)" }}
          />
        </div>
      </div>

      <div className="shell relative z-10 flex h-full flex-col items-center pt-[26svh] text-center">
        <p className="t-label mb-10 flex items-center gap-5">
          <span className="text-fg">02</span>
          <span className="h-px w-10 bg-line-2" />
          <span data-scramble>Growth / Manifesto</span>
        </p>
        <p className="max-w-[15ch] text-[clamp(40px,6.6vw,118px)] font-light leading-[1] tracking-[-0.045em] [text-shadow:0_2px_40px_rgba(0,0,0,0.5)]">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span data-word className="inline-block opacity-[0.08] will-change-[transform,opacity]">
                {w}
              </span>
              {/* the space lives outside the inline-block, where it can't collapse */}
              {i < words.length - 1 && " "}
            </Fragment>
          ))}
        </p>
        <div data-manifesto-meta className="mt-10 flex flex-col items-center gap-6 opacity-0">
          <span className="dash" />
          <span className="t-label">More than IT / Your growth</span>
        </div>
      </div>
    </section>
  );
}
