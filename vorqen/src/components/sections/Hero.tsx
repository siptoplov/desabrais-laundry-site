"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { hero } from "@/lib/content";
import { hasWebGL, prefersReducedMotion } from "@/lib/device";
import { onIntroDone, scrollStore } from "@/lib/scroll-store";
import { SplitWordmark, Tagline } from "@/components/ui/Brand";
import { SplitReveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { IconArrow } from "@/components/ui/Icons";
import { videoSrc } from "@/components/ui/CinemaVideo";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const VideoFx = dynamic(() => import("@/components/three/VideoFx"), { ssr: false });

/** Where the emblem sits in the hero footage (uv, origin bottom-left). */
const FOCUS: [number, number] = [0.5, 0.515];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<"pending" | "gl" | "plain" | "still">("pending");
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(true);
  const cssZoom = useRef(true);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => onIntroDone(() => setIntro(true)), []);

  // Create the hero video once; WebGL samples it, or it's shown directly.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setMode("still");
      return;
    }
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.preload = "auto";
    // The shader only earns its cost under a mouse; touch screens get the
    // plain loop. The shader samples the 1280 encode: it's uploaded to the
    // GPU every frame and the lens softens it anyway.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const gl = fine && hasWebGL();
    v.src = gl ? "/media/hero-1280.mp4" : videoSrc("hero");
    v.addEventListener("playing", () => setPlaying(true), { once: true });
    v.play().catch(() => {});
    setVideo(v);
    setMode(gl ? "gl" : "plain");
    return () => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, []);

  useEffect(() => {
    if (!video) return;
    if (active) video.play().catch(() => {});
    else video.pause();
  }, [active, video]);

  // DOM intro once the preloader hands over
  useEffect(() => {
    const el = section.current;
    if (!el || !intro) return;
    const ctx = gsap.context(() => {
      const letters = el.querySelectorAll("[data-letter]");
      if (prefersReducedMotion()) {
        gsap.set([letters, "[data-hero-fade]"], { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        letters,
        { opacity: 0, yPercent: 60, scaleY: 1.3 },
        { opacity: 1, yPercent: 0, scaleY: 1, duration: 1.8, stagger: 0.08, delay: 0.5, ease: "expo.out" },
      );
      gsap.fromTo("[data-hero-fade]", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.09, delay: 0.9 });
      gsap.fromTo("[data-hero-line]", { scaleX: 0 }, { scaleX: 1, duration: 1.8, delay: 0.7, ease: "expo.inOut" });
    }, el);
    return () => ctx.revert();
  }, [intro]);

  // Scroll: fly into the emblem, fade the DOM, stop rendering once gone
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
          if (stage.current && cssZoom.current) {
            const p = self.progress;
            stage.current.style.transform = `scale(${1 + p * p * 1.4})`;
            stage.current.style.opacity = String(1 - gsap.utils.clamp(0, 1, (p - 0.45) / 0.5));
          }
        },
        onLeave: () => setActive(false),
        onEnterBack: () => setActive(true),
      });
      gsap.to("[data-hero-content]", {
        yPercent: -14,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "55% top", scrub: true },
      });
      gsap.to("[data-hero-wordmark]", {
        yPercent: 40,
        scale: 1.08,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // the shader handles the fly-in once footage is live; otherwise CSS does
  cssZoom.current = mode !== "gl" || !playing;
  useEffect(() => {
    if (!cssZoom.current && stage.current) {
      stage.current.style.transform = "";
      stage.current.style.opacity = "";
    }
  }, [playing, mode]);

  const showStill = mode === "still" || mode === "pending" || !playing;

  return (
    <section ref={section} id="top" aria-label="VORQEN" className="relative h-[100svh] min-h-[680px] w-full">
      {/* stage is fixed so the fly-in keeps going while the next section slides over */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ visibility: active ? "visible" : "hidden" }}
      >
        <div ref={stage} className="absolute inset-x-0 top-0 h-[64%] origin-[49%_47%] will-change-transform lg:h-full">
          {/* on narrow screens the 16:9 frame is shown wider than the
              viewport so the whole emblem fits; its edges fade into black */}
          <div className="absolute left-1/2 top-1/2 aspect-video w-[168%] -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:top-0 lg:aspect-auto lg:h-full lg:w-full lg:translate-x-0 lg:translate-y-0">
            <Image
              src="/media/hero.jpg"
              alt=""
              fill
              priority
              sizes="(min-width:1024px) 100vw, 170vw"
              quality={82}
              className="object-cover transition-opacity duration-1000"
              style={{ objectPosition: "49% 50%", opacity: showStill ? 1 : 0 }}
            />
            {mode === "plain" && video && (
              <div
                className="absolute inset-0"
                ref={(el) => {
                  if (el && !el.contains(video)) {
                    video.className = "absolute inset-0 h-full w-full object-cover";
                    video.style.objectPosition = "49% 50%";
                    el.appendChild(video);
                  }
                }}
              />
            )}
            <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink-0 to-transparent lg:hidden" />
            <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-ink-0 to-transparent lg:hidden" />
          </div>
          {mode === "gl" && video && (
            <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: playing ? 1 : 0 }}>
              <VideoFx video={video} active={active} focus={FOCUS} />
            </div>
          )}
        </div>
        {/* legibility scrims */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(5,5,6,0.78)_0%,rgba(5,5,6,0.25)_32%,transparent_55%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(0deg,#050506_42%,rgba(5,5,6,0.7)_70%,transparent)] lg:h-[42%] lg:bg-[linear-gradient(0deg,#050506,rgba(5,5,6,0.7)_45%,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-0/80 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div data-hero-content className="shell flex flex-1 flex-col justify-end pb-9 pt-28 lg:justify-center lg:pb-[6vh]">
          <div className="max-w-[420px] text-center lg:text-left">
            <div data-hero-fade className="opacity-0">
              <Tagline className="justify-center max-lg:text-[8.5px] lg:justify-start" />
            </div>
            <span data-hero-line className="dash mx-auto mt-8 hidden origin-left scale-x-0 lg:block lg:mx-0" />
            <h1 className="mt-5 lg:mt-8">
              <SplitReveal
                as="span"
                play={intro}
                delay={0.8}
                className="block text-[clamp(23px,2.7vw,44px)] font-light leading-[1.1] tracking-[-0.035em]"
              >
                {hero.title}
              </SplitReveal>
            </h1>
            <p data-hero-fade className="t-body mt-3 opacity-0 max-lg:text-[14px] lg:mt-5">
              {hero.sub}
            </p>
            <div data-hero-fade className="mt-6 flex items-center justify-center gap-2.5 opacity-0 lg:mt-10 lg:justify-start lg:gap-3">
              <Magnetic>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("#contact");
                  }}
                  className="btn btn-chrome sweep max-lg:!h-12 max-lg:!px-5 max-lg:!text-[14px]"
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
                  className="btn btn-ghost sweep max-lg:!h-12 max-lg:!px-5 max-lg:!text-[14px]"
                >
                  {hero.ctaSecondary}
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* right rail */}
        <div data-hero-content className="pointer-events-none absolute right-[var(--pad-x)] top-[40%] hidden flex-col items-end gap-3 text-right lg:flex">
          <span data-hero-fade className="t-label text-[9px] opacity-0">
            Digital products · AI · Automation
          </span>
          <span data-hero-fade className="t-label text-[9px] text-fg-3 opacity-0">
            Est. 2026 — Worldwide
          </span>
        </div>

        {/* giant wordmark across the foot of the frame */}
        <div data-hero-wordmark className="pointer-events-none absolute inset-x-0 top-[54%] px-[var(--pad-x)] lg:bottom-[5vh] lg:top-auto">
          <SplitWordmark className="mx-auto w-[82%] max-w-[1296px] lg:w-full" letterClassName="opacity-0" />
        </div>

        <button
          type="button"
          data-hero-fade
          onClick={() => scrollTo("#manifesto")}
          className="absolute bottom-[calc(6vh+min(9vw,150px)+28px)] right-[var(--pad-x)] hidden flex-col items-center gap-3 opacity-0 lg:flex"
          aria-label="Scroll — прокрутить вниз"
          data-cursor="Scroll"
        >
          <span className="t-label text-[9px]">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-white/10">
            <span className="absolute left-1/2 top-0 h-2 w-[3px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(232,240,255,0.9)] [animation:scroll-dot_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
          </span>
        </button>
      </div>
      <style>{`@keyframes scroll-dot{0%{transform:translate(-50%,-10px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(-50%,50px);opacity:0}}`}</style>
    </section>
  );
}
