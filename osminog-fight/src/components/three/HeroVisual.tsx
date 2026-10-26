'use client';

/**
 * Выбирает визуал hero под устройство:
 *  • десктоп с WebGL → 3D-сцена (Three.js грузится лениво, по первому взаимодействию);
 *  • телефон / слабое железо / экономия трафика → лёгкий Canvas 2D.
 * Так Lighthouse на мобильных не платит за Three.js.
 */
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import { asset } from '@/lib/asset';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });
const OctoFallback = dynamic(() => import('./OctoFallback'), { ssr: false });

function canUse3D() {
  try {
    // ?lite — принудительно лёгкий режим (слабые устройства, отладка, скриншоты)
    if (new URLSearchParams(location.search).has('lite')) return false;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory && nav.deviceMemory < 4) return false;
    if (!window.matchMedia('(min-width: 900px) and (hover: hover)').matches) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroVisual({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<'none' | '3d' | '2d'>('none');

  useEffect(() => {
    // 3D/2D-сцена подгружается по первому взаимодействию (мышь, касание, скролл, клавиша)
    // или через 6 с простоя — первый экран остаётся лёгким, а пользователь ничего не ждёт.
    let started = false;
    let timer = 0;
    const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const;
    const start = () => {
      if (started) return;
      started = true;
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, start));
      setMode(canUse3D() ? '3d' : '2d');
    };
    const arm = () => {
      events.forEach((ev) => window.addEventListener(ev, start, { passive: true, once: true }));
      timer = window.setTimeout(start, 6000);
    };
    if (document.documentElement.classList.contains('is-loading')) window.addEventListener('osm:intro-done', arm, { once: true });
    else arm();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('osm:intro-done', arm);
      events.forEach((ev) => window.removeEventListener(ev, start));
    };
  }, []);

  return (
    <div className={className} aria-hidden="true">
      {site.media.heroVideo && (
        <video className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen" src={asset(site.media.heroVideo)} poster={site.media.heroPoster ? asset(site.media.heroPoster) : undefined} autoPlay muted loop playsInline preload="none" />
      )}
      <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${mode === 'none' ? 'opacity-0' : 'opacity-100'}`}>
        {mode === '3d' && <HeroScene className="h-full w-full" modelUrl={site.media.heroModel ? asset(site.media.heroModel) : undefined} />}
        {mode === '2d' && <OctoFallback className="h-full w-full" />}
      </div>
    </div>
  );
}
