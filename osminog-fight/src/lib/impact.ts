/**
 * «Удар»: чернильная клякса из точки клика + микротряска экрана + вспышка + звук.
 * Вызывается на главных CTA. Уважает prefers-reduced-motion.
 */
'use client';
import { play } from './sound';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Органичная клякса: случайный «звёздчатый» контур с брызгами */
function blobPath(r: number) {
  const pts = 14;
  let d = '';
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (0.72 + Math.random() * 0.5);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    const a2 = ((i + 0.5) / pts) * Math.PI * 2;
    const r2 = r * (0.55 + Math.random() * 0.25);
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` Q${(Math.cos(a2 - 0.2) * r2).toFixed(1)},${(Math.sin(a2 - 0.2) * r2).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + 'Z';
}

export function impact(x: number, y: number, color = '#05070A') {
  play('punch');
  if (reduced()) return;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const size = 520;
  svg.setAttribute('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  Object.assign(svg.style, {
    position: 'fixed',
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    zIndex: '96',
    pointerEvents: 'none',
    overflow: 'visible',
  } as CSSStyleDeclaration);
  const g = document.createElementNS(ns, 'g');
  const main = document.createElementNS(ns, 'path');
  main.setAttribute('d', blobPath(120));
  main.setAttribute('fill', color);
  g.appendChild(main);
  // брызги
  for (let i = 0; i < 9; i++) {
    const c = document.createElementNS(ns, 'circle');
    const a = Math.random() * Math.PI * 2;
    const dist = 130 + Math.random() * 110;
    c.setAttribute('cx', (Math.cos(a) * dist).toFixed(1));
    c.setAttribute('cy', (Math.sin(a) * dist).toFixed(1));
    c.setAttribute('r', (4 + Math.random() * 14).toFixed(1));
    c.setAttribute('fill', color);
    g.appendChild(c);
  }
  svg.appendChild(g);
  document.body.appendChild(svg);
  g.animate(
    [
      { transform: 'scale(0.1) rotate(0deg)', opacity: 0.95 },
      { transform: 'scale(1) rotate(12deg)', opacity: 0.85, offset: 0.35 },
      { transform: 'scale(1.25) rotate(18deg)', opacity: 0 },
    ],
    { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' },
  ).onfinish = () => svg.remove();

  const flash = document.createElement('div');
  flash.className = 'impact-flash';
  flash.style.setProperty('--x', `${x}px`);
  flash.style.setProperty('--y', `${y}px`);
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);

  const main_ = document.getElementById('main');
  if (main_) {
    main_.classList.remove('shake');
    void main_.offsetWidth;
    main_.classList.add('shake');
  }
}
