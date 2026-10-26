'use client';

/**
 * Курсор — «глаз осьминога»: радужка-кольцо и горизонтальный зрачок-щель
 * (у настоящих осьминогов он именно такой). Зрачок смотрит по направлению движения,
 * сужается на скорости, расширяется на ссылках, краснеет и «хватает» на CTA,
 * показывает подсказку на видео и слайдерах. Иногда моргает.
 * Здесь же — магнитные кнопки, заливка кнопок из точки входа и «удар» по [data-impact].
 * Только для устройств с мышью.
 */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { impact } from '@/lib/impact';
import { play } from '@/lib/sound';

type Mode = 'default' | 'link' | 'cta' | 'play' | 'drag' | 'view' | 'hide';

export function Cursor() {
  const eye = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  // клик-«удар» работает и на тач-устройствах
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-impact]') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      impact(x, y, el.dataset.impact === 'light' ? '#E8F1F8' : '#05070A');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || !eye.current) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };
    const vel = { x: 0, y: 0 };
    let mode: Mode = 'default';
    let visible = false;
    let magnet: HTMLElement | null = null;
    let raf = 0;
    let lastHover: Element | null = null;

    const setMode = (m: Mode, text = '') => {
      if (m === mode && label.current?.textContent === text) return;
      mode = m;
      eye.current!.dataset.mode = m;
      if (label.current) label.current.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        eye.current!.style.opacity = '1';
        cur.x = pos.x;
        cur.y = pos.y;
      }
      const t = e.target as HTMLElement;
      if (t === lastHover) {
        if (magnet) applyMagnet(e);
        return;
      }
      lastHover = t;
      const c = t.closest<HTMLElement>('[data-cursor]');
      const interactive = t.closest<HTMLElement>('a, button, [role="button"], summary, label, select');
      const field = t.closest('input, textarea, [contenteditable]');
      if (field) setMode('hide');
      else if (c) setMode(c.dataset.cursor as Mode, c.dataset.cursorLabel ?? '');
      else if (interactive?.classList.contains('btn-primary')) setMode('cta', 'Хват');
      else if (interactive) setMode('link');
      else setMode('default');

      const m = t.closest<HTMLElement>('[data-magnetic], .btn');
      if (m !== magnet) {
        if (magnet) releaseMagnet(magnet);
        magnet = m;
        if (magnet) {
          const r = magnet.getBoundingClientRect();
          magnet.style.setProperty('--mx', `${e.clientX - r.left}px`);
          magnet.style.setProperty('--my', `${e.clientY - r.top}px`);
          if (mode === 'cta') play('whoosh');
        }
      }
      if (magnet) applyMagnet(e);
    };

    const applyMagnet = (e: PointerEvent) => {
      if (!magnet || reduce) return;
      const r = magnet.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const k = magnet.dataset.magnetic ? parseFloat(magnet.dataset.magnetic) || 0.3 : 0.22;
      magnet.style.transform = `translate3d(${dx * k}px, ${dy * k}px, 0)`;
      magnet.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1)';
    };
    const releaseMagnet = (el: HTMLElement) => {
      el.style.transform = '';
      el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)';
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${pos.x - r.left}px`);
      el.style.setProperty('--my', `${pos.y - r.top}px`);
    };

    const onDown = () => eye.current?.classList.add('is-down');
    const onUp = () => eye.current?.classList.remove('is-down');
    const onLeave = () => {
      visible = false;
      eye.current!.style.opacity = '0';
    };

    const loop = () => {
      const k = reduce ? 1 : 0.22;
      const nx = cur.x + (pos.x - cur.x) * k;
      const ny = cur.y + (pos.y - cur.y) * k;
      vel.x = vel.x * 0.8 + (nx - cur.x) * 0.2;
      vel.y = vel.y * 0.8 + (ny - cur.y) * 0.2;
      cur.x = nx;
      cur.y = ny;
      eye.current!.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      const speed = Math.min(Math.hypot(vel.x, vel.y), 30);
      const ang = Math.atan2(vel.y, vel.x);
      const off = Math.min(speed * 0.5, 7);
      pupil.current!.style.transform = `translate(${Math.cos(ang) * off}px, ${Math.sin(ang) * off}px) scale(${1 + speed * 0.02}, ${Math.max(0.55, 1 - speed * 0.02)})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const blink = window.setInterval(() => {
      if (document.hidden || reduce) return;
      eye.current?.classList.add('is-blink');
      window.setTimeout(() => eye.current?.classList.remove('is-blink'), 160);
    }, 5200);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(blink);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      root.classList.remove('has-cursor');
    };
  }, []);

  // при смене страницы — сбросить состояние
  useEffect(() => {
    if (eye.current) eye.current.dataset.mode = 'default';
  }, [pathname]);

  return (
    <div ref={eye} className="osm-cursor" data-mode="default" aria-hidden="true">
      <div className="osm-cursor__iris">
        <div ref={pupil} className="osm-cursor__pupil" />
      </div>
      <span ref={label} className="osm-cursor__label mono" />
      <style>{`
        .osm-cursor{position:fixed;left:0;top:0;z-index:250;pointer-events:none;opacity:0;transition:opacity .3s;mix-blend-mode:normal;display:none}
        html.has-cursor .osm-cursor{display:block}
        .osm-cursor__iris{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(232,241,248,.9);background:radial-gradient(circle,rgba(0,229,255,.22) 0%,rgba(0,229,255,.06) 55%,transparent 70%);display:grid;place-items:center;transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),left .35s cubic-bezier(.16,1,.3,1),top .35s cubic-bezier(.16,1,.3,1),border-color .3s,background .3s,transform .16s;box-shadow:0 0 18px rgba(0,229,255,.25)}
        .osm-cursor__pupil{width:12px;height:5px;border-radius:3px;background:#E8F1F8;transition:width .3s,height .3s,background .3s;will-change:transform}
        .osm-cursor__label{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#05070A;font-weight:700;opacity:0;transition:opacity .2s;white-space:nowrap}
        .osm-cursor.is-blink .osm-cursor__iris{transform:scaleY(.08)}
        .osm-cursor.is-down .osm-cursor__iris{transform:scale(.75)}
        .osm-cursor[data-mode=link] .osm-cursor__iris{left:-24px;top:-24px;width:48px;height:48px;border-color:var(--accent);background:radial-gradient(circle,rgba(0,229,255,.18),transparent 70%)}
        .osm-cursor[data-mode=link] .osm-cursor__pupil{width:16px;height:9px;background:var(--accent)}
        .osm-cursor[data-mode=cta] .osm-cursor__iris,.osm-cursor[data-mode=play] .osm-cursor__iris,.osm-cursor[data-mode=drag] .osm-cursor__iris,.osm-cursor[data-mode=view] .osm-cursor__iris{left:-42px;top:-42px;width:84px;height:84px;border-color:transparent;background:#E8F1F8;box-shadow:0 0 40px rgba(232,241,248,.35)}
        .osm-cursor[data-mode=cta] .osm-cursor__iris{background:#FF2B3A;box-shadow:0 0 50px rgba(255,43,58,.6)}
        .osm-cursor[data-mode=cta] .osm-cursor__label{color:#fff}
        .osm-cursor[data-mode=cta] .osm-cursor__pupil,.osm-cursor[data-mode=play] .osm-cursor__pupil,.osm-cursor[data-mode=drag] .osm-cursor__pupil,.osm-cursor[data-mode=view] .osm-cursor__pupil{opacity:0}
        .osm-cursor[data-mode=cta] .osm-cursor__label,.osm-cursor[data-mode=play] .osm-cursor__label,.osm-cursor[data-mode=drag] .osm-cursor__label,.osm-cursor[data-mode=view] .osm-cursor__label{opacity:1}
        .osm-cursor[data-mode=hide]{opacity:0!important}
      `}</style>
    </div>
  );
}
