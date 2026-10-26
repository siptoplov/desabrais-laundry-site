'use client';

/**
 * Лёгкий осьминог на Canvas 2D — для телефонов и слабых устройств (≈3 КБ кода вместо Three.js).
 * Щупальца тянутся к пальцу/курсору, глаза горят. При reduced-motion — один статичный кадр.
 */
import { useEffect, useRef } from 'react';
import { drawTentacle } from '@/lib/tentacle';

export default function OctoFallback({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    window.addEventListener('resize', resize);
    const touch = { x: -1, y: -1, t: 0 };
    const onPoint = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      touch.x = e.clientX - r.left;
      touch.y = e.clientY - r.top;
      touch.t = performance.now();
    };
    window.addEventListener('pointerdown', onPoint, { passive: true });
    window.addEventListener('pointermove', onPoint, { passive: true });

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      // ~20 к/с: для медленного «подводного» движения достаточно, бережёт батарею и поток
      if (now - last < 50) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = now;
      const time = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.42 + Math.sin(time * 0.8) * 6;
      const s = Math.min(w, h) / 520;
      const active = now - touch.t < 2500;

      // щупальца (позади головы)
      for (let k = 0; k < 8; k++) {
        const side = k < 4 ? -1 : 1;
        const i = k % 4;
        const baseAngle = Math.PI / 2 + side * (0.25 + i * 0.32);
        let angle = baseAngle;
        if (active) {
          const ta = Math.atan2(touch.y - (cy + 60 * s), touch.x - cx);
          const diff = Math.atan2(Math.sin(ta - baseAngle), Math.cos(ta - baseAngle));
          angle += diff * 0.35;
        }
        drawTentacle(
          ctx,
          { x: cx + side * (16 + i * 9) * s, y: cy + 70 * s, angle, length: (250 + (i % 2) * 40) * s, width: 34 * s, curl: side * -(6 + i), phase: k * 0.8, reach: 1, segments: 22 },
          { fill: '#0b1b30', rim: 'rgba(0,229,255,0.45)', sucker: 'rgba(200,235,255,0.18)', rimWidth: 1.2 },
          reduce ? 0 : time,
        );
      }
      // голова
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);
      const hg = ctx.createRadialGradient(-30, -60, 10, 0, -10, 140);
      hg.addColorStop(0, '#1b3a5c');
      hg.addColorStop(0.6, '#0a1a2f');
      hg.addColorStop(1, '#05070a');
      ctx.beginPath();
      ctx.moveTo(-70, 70);
      ctx.bezierCurveTo(-120, 20, -110, -130, 0, -140);
      ctx.bezierCurveTo(110, -130, 120, 20, 70, 70);
      ctx.closePath();
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // глаза
      for (const ex of [-34, 34]) {
        ctx.save();
        ctx.translate(ex, 22);
        ctx.rotate(ex < 0 ? 0.5 : -0.5);
        ctx.shadowColor = '#ff2b3a';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#ff2b3a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#05070a';
        ctx.fillRect(-7, -1.6, 14, 3.2);
        ctx.restore();
      }
      ctx.restore();
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onPoint);
      window.removeEventListener('pointermove', onPoint);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
