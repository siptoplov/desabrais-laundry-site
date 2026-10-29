'use client';

/**
 * Живой таймер.
 *  • дата турнира известна и в будущем → обратный отсчёт «До гонга»;
 *  • турнир идёт (5 часов от старта) → «Бой идёт»;
 *  • даты нет → прямой отсчёт «С последнего гонга» от прошлого турнира: бездна не молчит.
 */
import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { pad } from '@/lib/format';

type Props = { date: string | null; since?: string; size?: 'xl' | 'md'; className?: string };

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ date, since, size = 'xl', className = '' }: Props) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = date ? new Date(date).getTime() : null;
  let mode: 'to' | 'live' | 'since' = 'since';
  let parts = { d: 0, h: 0, m: 0, s: 0 };
  if (now !== null) {
    if (target && now < target) {
      mode = 'to';
      parts = split(target - now);
    } else if (target && now < target + 5 * 3600e3) {
      mode = 'live';
    } else if (since) {
      parts = split(now - new Date(since).getTime());
    }
  } else if (target) {
    mode = 'to';
  }

  const label = mode === 'to' ? t.countdown.title : mode === 'live' ? 'Бой идёт' : t.countdown.since;
  const cells: [number, string][] = [
    [parts.d, t.countdown.days],
    [parts.h, t.countdown.hours],
    [parts.m, t.countdown.minutes],
    [parts.s, t.countdown.seconds],
  ];
  const big = size === 'xl';

  return (
    <div className={`flex flex-col gap-3 ${className}`} role="timer" aria-live="off" aria-label={label}>
      <span className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-mute">
        <span className={`inline-block h-2 w-2 rounded-full ${mode === 'since' ? 'bg-cyan shadow-[0_0_10px_#ECEEF1]' : 'bg-blood shadow-[0_0_10px_#ff2b3a]'} animate-pulse`} />
        {label}
      </span>
      {mode === 'live' ? (
        <span className="display text-blood glow-blood" style={{ fontSize: big ? 'clamp(3rem,7vw,6rem)' : '2.4rem' }}>
          В эфире
        </span>
      ) : (
        <div className="flex items-start gap-2 md:gap-4">
          {cells.map(([v, u], i) => (
            <div key={u} className="flex items-start gap-2 md:gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="mono tabular leading-none font-semibold text-ice"
                  style={{ fontSize: big ? 'clamp(2.2rem,5vw,4.6rem)' : 'clamp(1.6rem,3vw,2.2rem)', minWidth: i === 0 ? '2ch' : undefined, textAlign: 'center' }}
                >
                  {now === null ? '--' : i === 0 ? String(v).padStart(2, '0') : pad(v)}
                </span>
                <span className="mono mt-2 text-[10px] uppercase tracking-[0.2em] text-faint">{u}</span>
              </div>
              {i < 3 && (
                <span className="mono leading-none text-accent/60" style={{ fontSize: big ? 'clamp(2rem,4.4vw,4rem)' : '1.6rem' }} aria-hidden="true">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
