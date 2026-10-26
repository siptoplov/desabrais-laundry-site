/**
 * Процедурное щупальце для Canvas 2D.
 * Позвоночник строится накоплением углов (как у настоящего щупальца — каждый сегмент
 * поворачивается относительно предыдущего), затем обводится сужающимся контуром с присосками.
 * Используется слоем щупалец по краям экрана и лёгкой мобильной версией hero.
 */

export interface TentacleSpec {
  /** Точка крепления, px */
  x: number;
  y: number;
  /** Базовый угол, рад (0 — вправо) */
  angle: number;
  length: number;
  width: number;
  /** Скручивание к кончику (знак — направление) */
  curl: number;
  phase: number;
  /** 0..1 — насколько щупальце «вытянуто» из-за края */
  reach: number;
  segments?: number;
}

export interface TentacleStyle {
  fill: CanvasGradient | string;
  rim: string;
  sucker: string;
  rimWidth?: number;
}

export function spine(spec: TentacleSpec, time: number) {
  const n = spec.segments ?? 34;
  const seg = (spec.length * (0.25 + 0.75 * spec.reach)) / n;
  const pts: { x: number; y: number; a: number }[] = [];
  let x = spec.x;
  let y = spec.y;
  let a = spec.angle;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({ x, y, a });
    // волна бежит от основания к кончику + скручивание растёт к концу
    const wave = Math.sin(time * 1.6 - t * 5.2 + spec.phase) * 0.11 * (0.3 + t);
    const curl = spec.curl * Math.pow(t, 2.2) * (1.25 - spec.reach * 0.45) * 0.18;
    a += wave * 0.5 + curl;
    x += Math.cos(a) * seg;
    y += Math.sin(a) * seg;
  }
  return pts;
}

export function drawTentacle(ctx: CanvasRenderingContext2D, spec: TentacleSpec, style: TentacleStyle, time: number) {
  const pts = spine(spec, time);
  const n = pts.length - 1;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = spec.width * Math.pow(1 - t, 0.85) * 0.5 + 0.6;
    const p = pts[i];
    const nx = -Math.sin(p.a);
    const ny = Math.cos(p.a);
    left.push([p.x + nx * w, p.y + ny * w]);
    right.push([p.x - nx * w, p.y - ny * w]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i <= n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fillStyle = style.fill;
  ctx.fill();
  ctx.lineWidth = style.rimWidth ?? 1.2;
  ctx.strokeStyle = style.rim;
  ctx.stroke();

  // присоски — на внутренней стороне изгиба
  const side = spec.curl >= 0 ? 1 : -1;
  ctx.fillStyle = style.sucker;
  const step = n > 26 ? 2 : 3;
  for (let i = 3; i < n - 2; i += step) {
    const t = i / n;
    const p = pts[i];
    const w = spec.width * Math.pow(1 - t, 0.85) * 0.5;
    const r = Math.max(0.6, w * 0.32);
    const nx = -Math.sin(p.a) * side;
    const ny = Math.cos(p.a) * side;
    ctx.beginPath();
    ctx.ellipse(p.x + nx * w * 0.55, p.y + ny * w * 0.55, r, r * 0.8, p.a, 0, Math.PI * 2);
    ctx.fill();
  }
  return pts;
}
