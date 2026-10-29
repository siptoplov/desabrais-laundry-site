'use client';

/**
 * Чемпион лиги — чёрный осьминог из Higgsfield — на первом экране:
 *  • сразу виден стоп-кадр (он же LCP), видео-петля подключается поверх, когда может играть;
 *  • на десктопе персонаж справа и растворяется к заголовку, на телефоне — квадратный кроп по центру;
 *  • reduced-motion и экономия трафика — только стоп-кадр;
 *  • лёгкий параллакс за курсором вместо прежней 3D-сцены.
 */
import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { asset } from '@/lib/asset';

const MOBILE = '(max-width: 767px)';

function canPlayVideo() {
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function HeroVisual({ className = '' }: { className?: string }) {
  const { heroVideo, heroVideoMobile, heroPoster, heroPosterMobile } = site.media;
  const [video, setVideo] = useState(false);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVideo(canPlayVideo());
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -18;
        const y = (e.clientY / window.innerHeight - 0.5) * -10;
        layer.current?.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0) scale(1.04)`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (!heroPoster) return null;

  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 md:left-auto md:w-[78%] [mask-image:linear-gradient(to_bottom,black_55%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_32%),linear-gradient(to_bottom,black_60%,transparent)] md:[mask-composite:intersect]">
        <div ref={layer} className="absolute inset-0 scale-[1.04] transition-transform duration-700 ease-out">
          <picture>
            {heroPosterMobile && <source media={MOBILE} srcSet={asset(heroPosterMobile)} />}
            <img src={asset(heroPoster)} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          </picture>
          {video && heroVideo && (
            <video className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" autoPlay muted loop playsInline preload="auto">
              {heroVideoMobile && <source media={MOBILE} src={asset(heroVideoMobile)} type="video/mp4" />}
              <source src={asset(heroVideo)} type="video/mp4" />
            </video>
          )}
        </div>
        {/* красный контровой свет — в тон глазам чемпиона */}
        <div className="absolute inset-0 mix-blend-screen" style={{ background: 'radial-gradient(40% 50% at 55% 30%, rgba(255,43,58,.12), transparent 70%)' }} />
      </div>
      {/* сверху в воде яркий свет — притемняем под меню; на телефоне — ещё и под текстом */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-abyss/85 via-abyss/40 to-transparent" />
      <div className="absolute inset-0 bg-abyss/35 md:hidden" />
    </div>
  );
}
