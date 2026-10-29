'use client';

/**
 * Сторителлинг по скроллу: «Восемь щупалец — восемь точек контакта».
 * Секция закреплена на экране, пока зритель прокручивает 4 пары ударов:
 * кулаки → локти → колени → ноги. Каждая пара зажигает два сегмента октагона-ринга.
 * Финал — «Одна победа»: загораются глаза знака.
 */
import { useRef, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { useScrollScene } from '@/lib/useScrollScene';
import { play } from '@/lib/sound';

const steps = [
  { n: '01 · 02', title: 'Кулаки', text: 'Джеб, кросс, хук, апперкот. Первое, что вы услышите из зала, — хлёсткий звук перчатки.' },
  { n: '03 · 04', title: 'Локти', text: 'Короткие, как лезвие. В муай-тай они рассекают — и заканчивают бой за секунду.' },
  { n: '05 · 06', title: 'Колени', text: 'Клинч, хват за шею и колено в корпус. Мёртвая хватка — та самая, от которой не уйти.' },
  { n: '07 · 08', title: 'Ноги', text: 'Лоу-кик подрубает, хай-кик выключает свет. Удар щупальца — в чистом виде.' },
  { n: '∞', title: 'Одна победа', text: 'Восемь точек контакта. Одна цель. Остальное решает ринг.' },
];

export function EightStrikes() {
  const [step, setStep] = useState(0);
  const current = useRef(0);
  const ref = useScrollScene<HTMLElement>((p) => {
    const s = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (s === current.current) return;
    current.current = s;
    play('tick');
    setStep(s);
  });

  // какие сегменты рамки горят: по два на каждый пройденный шаг
  const lit = (i: number) => step >= 4 || i < (step + 1) * 2;

  return (
    <section ref={ref} className="relative" style={{ height: `${steps.length * 85 + 40}vh` }} aria-labelledby="eight-title">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 60% at 30% 50%, var(--deep), transparent 70%)' }} aria-hidden="true" />
        <div className="wrap relative grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          {/* знак с сегментами */}
          <div className="relative mx-auto aspect-square w-[min(78vw,560px)]" aria-hidden="true">
            <div className="absolute inset-0 rounded-full blur-3xl transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(236,238,241,.25), transparent 60%)', opacity: step >= 4 ? 1 : 0.35 }} />
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" fill="none">
              {octagon.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={lit(i) ? (step >= 4 ? '#FF2B3A' : '#ECEEF1') : 'rgba(242,242,243,.12)'}
                  strokeWidth="14"
                  style={{ transition: 'stroke .5s, filter .5s', filter: lit(i) ? `drop-shadow(0 0 10px ${step >= 4 ? '#FF2B3A' : '#ECEEF1'})` : 'none' }}
                />
              ))}
            </svg>
            <div className="absolute inset-[18%] transition-transform duration-700" style={{ transform: `scale(${0.86 + step * 0.035})` }}>
              <LogoMark frame={false} className="h-full w-full" eyes={step >= 4 ? '#FF2B3A' : '#2A2A30'} />
            </div>
            <span className="display-upright absolute -bottom-2 left-1/2 -translate-x-1/2 text-[13px] tracking-[0.3em] text-mute">
              <span className="mono">{String(Math.min(8, (step + 1) * 2)).padStart(2, '0')} / 08</span>
            </span>
          </div>

          {/* текст */}
          <div className="relative">
            <p className="eyebrow mb-6">Восемь точек контакта</p>
            <h2 id="eight-title" className="sr-only">
              Восемь ударов. Одна победа.
            </h2>
            <div className="relative min-h-[300px] md:min-h-[360px]">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className="absolute inset-0 flex flex-col gap-5 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{ opacity: step === i ? 1 : 0, transform: `translateY(${step === i ? 0 : step > i ? -40 : 40}px)`, pointerEvents: step === i ? 'auto' : 'none' }}
                  aria-hidden={step !== i}
                >
                  <span className="mono text-[13px] tracking-[0.3em] text-accent">{s.n}</span>
                  <h3 className={`display t-1 ${i === 4 ? 'text-blood glow-blood' : ''}`}>{s.title}</h3>
                  <p className="lead">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2" aria-hidden="true">
              {steps.map((_, i) => (
                <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-accent' : 'bg-line'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 8 сторон октагона как отдельные отрезки (с зазорами) */
const octagon = (() => {
  const out: string[] = [];
  const R = 190;
  const c = 200;
  for (let i = 0; i < 8; i++) {
    const a1 = ((i - 2) / 8) * Math.PI * 2 + Math.PI / 8 + 0.06;
    const a2 = ((i - 1) / 8) * Math.PI * 2 + Math.PI / 8 - 0.06;
    out.push(`M${(c + R * Math.cos(a1)).toFixed(1)} ${(c + R * Math.sin(a1)).toFixed(1)}L${(c + R * Math.cos(a2)).toFixed(1)} ${(c + R * Math.sin(a2)).toFixed(1)}`);
  }
  return out;
})();
