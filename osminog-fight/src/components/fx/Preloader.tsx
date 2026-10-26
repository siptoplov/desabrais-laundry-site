'use client';

/**
 * Кинематографичный прелоадер (один раз за сессию). Вся хореография — на CSS,
 * поэтому он играет с первого кадра, ещё до загрузки JS, и не нагружает поток.
 * 1) Из черноты щупальце завязывает «восьмёрку».
 * 2) Восемь ударов: сегменты октагона-ринга вспыхивают по одному, счётчик 1→8.
 * 3) Проступает осьминог, щупальца разворачиваются, загораются глаза.
 * 4) Вспышка — и занавес уходит, открывая сайт.
 * Если JS не загрузился — оверлей сам исчезнет по CSS-таймингу.
 */
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { play } from '@/lib/sound';

const HIT0 = 1200; // мс: первый удар
const HIT_STEP = 110;
const TOTAL = 3300;

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finish = () => {
      setDone(true);
      document.documentElement.classList.remove('is-loading');
      window.dispatchEvent(new Event('osm:intro-done'));
      try {
        sessionStorage.setItem('osm:intro', '1');
      } catch {}
    };
    if (document.documentElement.classList.contains('no-intro')) {
      finish();
      return;
    }
    // сколько уже проиграно до гидратации — синхронизируем звук и счётчик
    const elapsed = performance.now();
    const timers: number[] = [];
    const counter = root.current?.querySelector<HTMLElement>('[data-count]');
    for (let i = 0; i < 8; i++) {
      const at = HIT0 + i * HIT_STEP - elapsed;
      if (at < 0) continue;
      timers.push(
        window.setTimeout(() => {
          if (counter) counter.textContent = String(i + 1).padStart(2, '0');
          play('tick');
        }, at),
      );
    }
    timers.push(window.setTimeout(() => play('punch'), Math.max(0, 2550 - elapsed)));
    timers.push(window.setTimeout(finish, Math.max(0, TOTAL - elapsed)));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="pl-stage">
        <svg className="pl-eight" viewBox="0 0 200 320" fill="none">
          <path d="M100 160 C 30 120, 30 30, 100 30 C 170 30, 170 120, 100 160 C 25 200, 25 290, 100 290 C 175 290, 175 200, 100 160 Z" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" pathLength={1} />
        </svg>
        <LogoMark className="pl-logo" color="#E8F1F8" animated />
        <div className="pl-meta mono">
          <span>Удар</span>
          <span data-count>00</span>
          <span>/ 08</span>
        </div>
      </div>
      <style>{`
        .preloader{position:fixed;inset:0;z-index:300;background:radial-gradient(70% 60% at 50% 45%,#0a1a2f 0%,#05070a 70%);display:grid;place-items:center;animation:pl-out .9s 2.75s cubic-bezier(.83,0,.17,1) forwards}
        html.no-intro .preloader{display:none}
        .pl-stage{position:relative;width:min(56vmin,420px);aspect-ratio:1;display:grid;place-items:center;opacity:0;animation:pl-in .4s ease-out forwards,pl-stage-out .6s 2.6s cubic-bezier(.7,0,.84,0) forwards}
        .pl-eight{position:absolute;width:38%;filter:drop-shadow(0 0 14px rgba(0,229,255,.8));animation:pl-eight-out .45s 1s cubic-bezier(.7,0,.84,0) forwards}
        .pl-eight path{stroke-dasharray:1;stroke-dashoffset:1;animation:pl-draw 1s .1s cubic-bezier(.65,0,.35,1) forwards}
        .pl-logo{width:100%;height:100%;filter:drop-shadow(0 0 30px rgba(0,229,255,.25))}
        .pl-logo [data-seg]{opacity:0;transform-box:fill-box;transform-origin:center;animation:pl-seg .5s cubic-bezier(.16,1,.3,1) forwards}
        ${Array.from({ length: 7 }, (_, i) => `.pl-logo [data-seg="${i}"]{animation-delay:${(HIT0 + i * HIT_STEP) / 1000}s}`).join('')}
        .pl-logo [data-part="body"]>path{opacity:0;animation:pl-rise .8s 1.55s cubic-bezier(.16,1,.3,1) forwards}
        .pl-logo [data-t]{opacity:0;transform-box:view-box;transform-origin:200px 200px;animation:pl-tent 1.1s cubic-bezier(.34,1.56,.64,1) forwards}
        ${Array.from({ length: 8 }, (_, i) => `.pl-logo [data-t="${i}"]{animation-delay:${(1.6 + i * 0.04).toFixed(2)}s}`).join('')}
        .pl-logo [data-part="eyes"]{opacity:0;animation:pl-eyes .5s 2.05s steps(1) forwards}
        .pl-meta{position:absolute;bottom:-56px;left:50%;transform:translateX(-50%);display:flex;gap:10px;font-size:12px;letter-spacing:.3em;color:rgba(232,241,248,.6);text-transform:uppercase}
        .pl-meta [data-count]{color:#ff2b3a;min-width:2ch}
        .preloader::after{content:"";position:absolute;inset:0;background:#fff;opacity:0;mix-blend-mode:screen;animation:pl-flash .5s 2.55s ease-out}
        @keyframes pl-in{to{opacity:1}}
        @keyframes pl-draw{to{stroke-dashoffset:0}}
        @keyframes pl-eight-out{to{opacity:0;transform:scale(.6)}}
        @keyframes pl-seg{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
        @keyframes pl-rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
        @keyframes pl-tent{from{opacity:0;transform:scale(0) rotate(-40deg)}to{opacity:1;transform:none}}
        @keyframes pl-eyes{0%{opacity:1}20%{opacity:0}40%{opacity:1}60%{opacity:0}80%,100%{opacity:1}}
        @keyframes pl-flash{0%{opacity:.95}100%{opacity:0}}
        @keyframes pl-stage-out{to{opacity:0;transform:scale(1.6)}}
        @keyframes pl-out{from{clip-path:circle(150% at 50% 50%)}to{clip-path:circle(0% at 50% 50%);visibility:hidden}}
      `}</style>
    </div>
  );
}
