'use client';

/**
 * Щупальца по краям экрана. Проявляются при скролле (тянутся внутрь на скорости),
 * медленно втягиваются в покое. Canvas 2D, ≤ 1.5x DPR, пауза в фоновой вкладке.
 * На узких экранах и при reduced-motion — отключены.
 */
import { useEffect, useRef } from 'react';
import { drawTentacle, type TentacleSpec } from '@/lib/tentacle';

export function EdgeTentacles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    if (!mq.matches || new URLSearchParams(location.search).has('lite')) return;
    const ctx = canvas.getContext('2d')!;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    // параметры щупалец: слева два, справа два
    const base: Omit<TentacleSpec, 'x' | 'y' | 'reach'>[] = [
      { angle: 0.25, length: 0.55, width: 34, curl: 7, phase: 0 },
      { angle: -0.35, length: 0.42, width: 26, curl: -6, phase: 1.7 },
      { angle: Math.PI - 0.2, length: 0.5, width: 32, curl: -7, phase: 0.9 },
      { angle: Math.PI + 0.3, length: 0.38, width: 24, curl: 6, phase: 2.6 },
    ];
    const anchors = [
      { side: 0, y: 0.78 },
      { side: 0, y: 0.22 },
      { side: 1, y: 0.62 },
      { side: 1, y: 0.12 },
    ];
    const reach = [0, 0, 0, 0];

    let lastY = window.scrollY;
    let energy = 0;
    let raf = 0;
    let t0 = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - t0) / 1000, 0.05);
      t0 = now;
      const y = window.scrollY;
      const v = Math.abs(y - lastY);
      lastY = y;
      // «энергия» скролла: растёт на скорости, затухает в покое
      energy = Math.min(1, energy * 0.96 + v * 0.004);
      const scrolled = Math.min(1, y / (h * 0.6));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const time = now / 1000;
      base.forEach((b, i) => {
        const target = scrolled * (0.18 + energy * 0.75) * (i % 2 ? 0.8 : 1);
        reach[i] += (target - reach[i]) * Math.min(1, dt * (target > reach[i] ? 5 : 1.2));
        if (reach[i] < 0.01) return;
        const a = anchors[i];
        const x = a.side === 0 ? -14 : w + 14;
        const grad = ctx.createLinearGradient(x, 0, a.side === 0 ? x + w * 0.3 : x - w * 0.3, 0);
        grad.addColorStop(0, 'rgba(28,28,33,0.95)');
        grad.addColorStop(1, 'rgba(6,6,7,0.9)');
        drawTentacle(
          ctx,
          { ...b, x, y: a.y * h, length: b.length * Math.min(w, 1400), reach: reach[i] },
          { fill: grad, rim: `rgba(236,238,241,${0.18 + energy * 0.35})`, sucker: 'rgba(242,242,243,0.10)', rimWidth: 1.2 },
          time,
        );
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        t0 = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true" />;
}
