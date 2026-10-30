'use client';

/** Ленивая загрузка 3D-пояса только когда блок виден и есть WebGL; иначе — SVG-иллюстрация */
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';

const BeltScene = dynamic(() => import('./BeltScene'), { ssr: false });

export function BeltVisual({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ok = (() => {
      try {
        if (new URLSearchParams(location.search).has('lite')) return false;
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    })();
    if (!ok || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {on ? (
        <BeltScene className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="relative grid aspect-square w-[46%] place-items-center rounded-[18%] border-4 border-[#d9b25a] bg-abyss shadow-[0_0_80px_rgba(233,196,106,.25)]" style={{ clipPath: 'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)' }}>
            <LogoMark className="h-[70%] w-[70%]" color="#e9c46a" />
          </div>
          <div className="absolute top-1/2 -z-10 h-[24%] w-[94%] -translate-y-1/2 rounded-full bg-[#0c0f14] ring-1 ring-blood/40" />
        </div>
      )}
    </div>
  );
}
