'use client';

/** Переключатели «Звук» и «Fight Night». Состояние — в localStorage этого зрителя. */
import { useEffect, useState } from 'react';
import { initSound, setSound } from '@/lib/sound';
import { read, write } from '@/lib/storage';
import { t } from '@/i18n';

export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(initSound()), []);
  return (
    <button
      type="button"
      className={`group relative grid h-11 w-11 place-items-center rounded-full border border-line hover:border-cyan ${className}`}
      aria-pressed={on}
      aria-label={on ? t.soundOff : t.soundOn}
      title={on ? t.soundOff : t.soundOn}
      onClick={() => {
        setSound(!on);
        setOn(!on);
      }}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded bg-ice"
            style={{
              height: on ? undefined : 3,
              animation: on ? `eq 0.${7 + i}s ${i * 0.1}s ease-in-out infinite alternate` : undefined,
            }}
          />
        ))}
      </span>
      <style>{`@keyframes eq{from{height:3px}to{height:16px}}`}</style>
    </button>
  );
}

export function FightNightToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(document.documentElement.dataset.mode === 'fight-night'), []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next) document.documentElement.dataset.mode = 'fight-night';
    else delete document.documentElement.dataset.mode;
    write('mode', next ? 'fight-night' : 'abyss');
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={on} className="inline-flex items-center gap-3 label-mute hover:text-ice">
      <span className={`relative h-6 w-11 rounded-full border transition-colors ${on ? 'border-blood bg-blood/30' : 'border-line'}`}>
        <span className={`absolute top-[3px] h-4 w-4 rounded-full transition-all ${on ? 'left-[22px] bg-blood shadow-[0_0_12px_#ff2b3a]' : 'left-[3px] bg-ice/70'}`} />
      </span>
      {t.fightNight}
    </button>
  );
}

/** Прочитать сохранённый режим (используется инлайн-скриптом в <head>) */
export const readMode = () => read<string>('mode', 'auto');
