/**
 * Звуковые акценты без аудиофайлов: синтез через Web Audio API.
 * По умолчанию звук выключен; включается переключателем в шапке.
 */
'use client';
import { read, write } from './storage';

let ctx: AudioContext | null = null;
let enabled = false;

export function initSound() {
  enabled = read('sound', false);
  return enabled;
}
export const isSoundOn = () => enabled;
export function setSound(on: boolean) {
  enabled = on;
  write('sound', on);
  if (on) {
    ensure();
    play('bell');
  }
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(c: AudioContext, dur: number) {
  const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  return b;
}

export type Sfx = 'punch' | 'tick' | 'whoosh' | 'bell';

export function play(kind: Sfx) {
  if (!enabled) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);

  if (kind === 'punch') {
    // глухой удар: низкий синус с падением частоты + щелчок шума
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    const g = c.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.3);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, 0.08);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1800;
    const ng = c.createGain();
    ng.gain.value = 0.5;
    n.connect(f).connect(ng).connect(out);
    n.start(t);
  } else if (kind === 'tick') {
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.04);
  } else if (kind === 'whoosh') {
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(c, 0.5);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3000, t + 0.4);
    const g = c.createGain();
    g.gain.value = 0.35;
    n.connect(f).connect(g).connect(out);
    n.start(t);
  } else if (kind === 'bell') {
    // гонг ринга: несколько негармоничных обертонов
    [1, 2.76, 5.4, 8.93].forEach((m, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = 520 * m;
      const g = c.createGain();
      g.gain.setValueAtTime(0.18 / (i + 1), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / (i + 1));
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 1.7);
    });
  }
}
