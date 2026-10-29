"use client";
/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { hero } from "@/lib/content";
import { getTier, hasWebGL, prefersReducedMotion, type Tier } from "@/lib/device";
import { onIntroDone, scrollStore } from "@/lib/scroll-store";
import { Emblem, EMBLEM_RATIO, SplitWordmark, Tagline } from "@/components/ui/Brand";
import { SplitReveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { IconArrow } from "@/components/ui/Icons";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(false);
  const [env, setEnv] = useState<{ tier: Tier; reduced: boolean; webgl: boolean } | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [active, setActive] = useState(true);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    setEnv({ tier: getTier(), reduced: prefersReducedMotion(), webgl: hasWebGL() });
    return onIntroDone(() => setIntro(true));
  }, []);

  // Intro choreography for DOM layers once the preloader hands over
  useEffect(() => {
    const el = section.current;
    if (!el || !intro) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll("[data-letter]");
      if (reduced) {
        gsap.set([letters, "[data-hero-fade]"], { opacity: 1, y: 0, filter: "none" });
        return;
      }
      gsap.fromTo(letters, { opacity: 0, filter: "blur(12px)", yPercent: 40 }, { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 1.4, stagger: 0.07, delay: 0.55 });
      gsap.fromTo("[data-hero-fade]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.08, delay: 0.95 });
    }, el);
    return () => ctx.revert();
  }, [intro]);

  // Scroll-out: drive the WebGL burst + fade the DOM, stop rendering when gone
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scrollStore.hero = self.progress;
          if (stage.current) {
            stage.current.style.opacity = String(1 - gsap.utils.clamp(0, 1, (self.progress - 0.55) / 0.45));
          }
        },
        onLeave: () => setActive(false),
        onEnterBack: () => setActive(true),
      });
      gsap.to("[data-hero-content]", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "60% top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const show3D = env?.webgl;

  return (
    <section ref={section} id="top" aria-label="VORQEN" className="relative h-[100svh] min-h-[640px] w-full">
      {/* WebGL stage — fixed so the burst can travel into the next section */}
      <div ref={stage} className="pointer-events-none fixed inset-0 z-0" style={{ visibility: active ? "visible" : "hidden" }}>
        {show3D && env && <HeroCanvas tier={env.tier} reduced={env.reduced} active={active} onReady={() => setCanvasReady(true)} />}
        {/* no-WebGL / software-GL fallback: rock corners from the key visual */}
        {/* server-rendered under the preloader; fades out once WebGL takes over */}
        <div aria-hidden className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: canvasReady ? 0 : 1 }}>
          <img src="/brand/rock-tr.webp" alt="" width={564} height={560} fetchPriority="high" className="absolute -right-[4vw] -top-[6vh] w-[min(46vw,560px)] mix-blend-screen" />
          <img src="/brand/rock-bl.webp" alt="" width={760} height={564} fetchPriority="high" className="absolute -bottom-[6vh] -left-[4vw] w-[min(54vw,700px)] mix-blend-screen" />
        </div>
        {/* static emblem until WebGL is up (and as a no-WebGL fallback) */}
        <div
          className="absolute left-1/2 top-[33%] w-[min(54vw,300px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 sm:top-[32%] sm:w-[min(24vw,360px)]"
          style={{ aspectRatio: `${EMBLEM_RATIO}`, opacity: canvasReady ? 0 : 1 }}
          aria-hidden
        >
          <Emblem className="h-full w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-b from-transparent to-ink-0/80" />
      </div>

      <div data-hero-content className="shell relative z-10 flex h-full flex-col pb-10 pt-[50svh] sm:pt-[52svh] lg:pb-12">
        <div className="flex flex-col items-center">
          <h1 className="sr-only">VORQEN — {hero.title}</h1>
          <SplitWordmark className="w-[min(72vw,440px)]" letterClassName="opacity-0" />
          <div data-hero-fade className="mt-6 opacity-0">
            <Tagline />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="text-center lg:col-span-6 lg:text-left">
            <SplitReveal as="p" play={intro} delay={0.85} className="mx-auto max-w-[22ch] text-[clamp(24px,2.5vw,40px)] font-light leading-[1.12] tracking-[-0.03em] lg:mx-0">
              {hero.title}
            </SplitReveal>
            <p data-hero-fade className="t-body mt-4 opacity-0">
              {hero.sub}
            </p>
          </div>
          <div data-hero-fade className="flex flex-col items-center justify-end gap-3 opacity-0 sm:flex-row lg:col-span-6">
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
                className="btn btn-chrome sweep"
              >
                {hero.ctaPrimary}
                <IconArrow size={18} className="arrow" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#services");
                }}
                className="btn btn-ghost sweep"
              >
                {hero.ctaSecondary}
              </a>
            </Magnetic>
          </div>
        </div>

        <button
          type="button"
          data-hero-fade
          onClick={() => scrollTo("#manifesto")}
          className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-4 opacity-0 lg:flex"
          aria-label="Scroll — прокрутить вниз"
          data-cursor="Scroll"
        >
          <span className="relative block h-14 w-px overflow-hidden bg-white/10">
            <span className="absolute left-1/2 top-0 h-2 w-[3px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(232,240,255,0.9)] [animation:scroll-dot_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
          </span>
          <span className="t-label text-[9px]">Scroll</span>
        </button>
      </div>
      <style>{`@keyframes scroll-dot{0%{transform:translate(-50%,-10px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(-50%,58px);opacity:0}}`}</style>
    </section>
  );
}
