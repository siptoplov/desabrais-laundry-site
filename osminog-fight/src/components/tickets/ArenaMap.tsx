'use client';

/**
 * Интерактивная схема зала: зоны, ряды, места, корзина, промокод.
 * • Мышь/палец: клик по месту. Клавиатура и скринридеры: список зон с кнопкой «лучшие места».
 * • Продажи открыты (tickets.status = 'onsale') → таймер резерва + переход к оплате у оператора.
 * • Продажи скоро → выбор сохраняется, оформляется заявка «сообщить о старте продаж».
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { blocks, lounges, promoCodes, ticketRules, zones, type ZoneId } from '@/content/arena';
import type { FightEvent } from '@/content/types';
import { SmartForm } from '@/components/forms/FormKit';
import { fmtMoney, pad, plural } from '@/lib/format';
import { read, write } from '@/lib/storage';
import { play } from '@/lib/sound';

type Seat = { id: string; zone: ZoneId; x: number; y: number; label: string; row: string; num: number };

const C = { x: 500, y: 390 };
const RING = 150;
const GAP = 18;

function buildSeats(): Seat[] {
  const out: Seat[] = [];
  for (const b of blocks) {
    for (let r = 0; r < b.rows; r++) {
      for (let s = 0; s < b.seats; s++) {
        const along = (s - (b.seats - 1) / 2) * GAP;
        const out_ = RING / 2 + b.offset + r * GAP;
        const pos =
          b.side === 'N' ? { x: C.x + along, y: C.y - out_ } : b.side === 'S' ? { x: C.x + along, y: C.y + out_ } : b.side === 'E' ? { x: C.x + out_, y: C.y + along } : { x: C.x - out_, y: C.y + along };
        out.push({ id: `${b.id}-${r + 1}-${s + 1}`, zone: b.zone, ...pos, label: b.label, row: String(r + 1), num: s + 1 });
      }
    }
  }
  const corners = { NW: [220, 150], NE: [780, 150], SE: [780, 630], SW: [220, 630] } as const;
  for (const l of lounges) {
    const [cx, cy] = corners[l.corner];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push({ id: `${l.id}-${i + 1}`, zone: 'lounge', x: cx + Math.cos(a) * 26, y: cy + Math.sin(a) * 26, label: `Lounge · ${l.label}`, row: l.label, num: i + 1 });
    }
  }
  return out;
}

export function ArenaMap({ event }: { event: FightEvent }) {
  const seats = useMemo(buildSeats, []);
  const byId = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);
  const zoneById = useMemo(() => new Map(zones.map((z) => [z.id, z])), []);
  const [sel, setSel] = useState<string[]>([]);
  const [hover, setHover] = useState<Seat | null>(null);
  const [focusZone, setFocusZone] = useState<ZoneId | null>(null);
  const [promo, setPromo] = useState('');
  const [promoState, setPromoState] = useState<{ ok: boolean; msg: string } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [holdUntil, setHoldUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [step, setStep] = useState<'pick' | 'checkout'>('pick');
  const [zoom, setZoom] = useState(1);
  const live = useRef<HTMLParagraphElement>(null);
  const onSale = event.tickets?.status === 'onsale';

  // восстановить выбор
  useEffect(() => {
    const saved = read<{ event: string; seats: string[] } | null>('seats', null);
    if (saved?.event === event.slug) setSel(saved.seats.filter((id) => byId.has(id)));
  }, [event.slug, byId]);
  useEffect(() => {
    write('seats', { event: event.slug, seats: sel });
  }, [sel, event.slug]);

  // таймер резерва — только когда продажи открыты
  useEffect(() => {
    if (!onSale) return;
    if (sel.length && !holdUntil) setHoldUntil(Date.now() + ticketRules.holdMinutes * 60e3);
    if (!sel.length) setHoldUntil(null);
  }, [sel.length, holdUntil, onSale]);
  useEffect(() => {
    if (!holdUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [holdUntil]);
  const left = holdUntil ? Math.max(0, holdUntil - now) : 0;
  useEffect(() => {
    if (holdUntil && left === 0) {
      setSel([]);
      setHoldUntil(null);
      if (live.current) live.current.textContent = 'Время резерва истекло, места освобождены.';
    }
  }, [left, holdUntil]);

  const toggle = (id: string) => {
    setSel((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= ticketRules.maxSeats) {
        if (live.current) live.current.textContent = `Не больше ${ticketRules.maxSeats} мест в одном заказе.`;
        return cur;
      }
      play('tick');
      return [...cur, id];
    });
  };

  /** Лучшие свободные места зоны: ближе к центру и к рингу */
  const bestInZone = (z: ZoneId, n = 2) => {
    const free = seats.filter((s) => s.zone === z && !sel.includes(s.id)).sort((a, b) => Math.hypot(a.x - C.x, a.y - C.y) - Math.hypot(b.x - C.x, b.y - C.y));
    const pick = free.slice(0, Math.min(n, ticketRules.maxSeats - sel.length)).map((s) => s.id);
    if (pick.length) {
      setSel((cur) => [...cur, ...pick]);
      play('punch');
      if (live.current) live.current.textContent = `Добавлено мест: ${pick.length}, зона ${zoneById.get(z)!.name}.`;
    }
  };

  const items = sel.map((id) => byId.get(id)!).filter(Boolean);
  const subtotal = items.reduce((n, s) => n + zoneById.get(s.zone)!.price, 0);
  const total = Math.max(0, subtotal * (1 - discount));

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    const d = promoCodes[code];
    if (d) {
      setDiscount(d);
      setPromoState({ ok: true, msg: `Промокод применён: −${Math.round(d * 100)}%` });
    } else {
      setDiscount(0);
      setPromoState({ ok: false, msg: 'Промокод не найден или ещё не действует' });
    }
  };

  const summary = items.map((s) => `${s.label}, ${s.zone === 'lounge' ? s.row : `ряд ${s.row}`}, место ${s.num}`).join('; ');

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <p ref={live} className="sr-only" aria-live="polite" />
      {/* ───── схема ───── */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ul className="flex flex-wrap gap-2" aria-label="Зоны">
            {zones.map((z) => (
              <li key={z.id}>
                <button
                  type="button"
                  className={`chip h-9 gap-2 px-3 transition-colors ${focusZone === z.id ? 'border-ice text-ice' : 'hover:text-ice'}`}
                  onMouseEnter={() => setFocusZone(z.id)}
                  onMouseLeave={() => setFocusZone(null)}
                  onFocus={() => setFocusZone(z.id)}
                  onBlur={() => setFocusZone(null)}
                  onClick={() => bestInZone(z.id)}
                  aria-label={`${z.name}, ${fmtMoney(z.price)}: добавить 2 лучших места`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} aria-hidden="true" />
                  {z.name} · {fmtMoney(z.price)}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 md:hidden">
            <button type="button" className="chip h-9 px-3" onClick={() => setZoom((z) => Math.min(2.2, z + 0.4))} aria-label="Приблизить">
              +
            </button>
            <button type="button" className="chip h-9 px-3" onClick={() => setZoom((z) => Math.max(1, z - 0.4))} aria-label="Отдалить">
              −
            </button>
          </div>
        </div>

        <div className="relative overflow-auto rounded-[var(--radius)] border border-line bg-[radial-gradient(70%_70%_at_50%_50%,var(--deep),var(--abyss))]" style={{ maxHeight: '78vh' }}>
          <svg
            viewBox="0 0 1000 780"
            className="block w-full select-none"
            style={{ minWidth: `${560 * zoom}px` }}
            role="img"
            aria-label="Схема зала. Для выбора с клавиатуры используйте кнопки зон над схемой."
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <radialGradient id="ringGlow">
                <stop offset="0" stopColor="#00e5ff" stopOpacity=".35" />
                <stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* сцена: экраны, вход, выход бойцов */}
            <rect x="380" y="18" width="240" height="26" rx="3" fill="rgba(232,241,248,.08)" />
            <text x="500" y="36" textAnchor="middle" fontSize="12" fill="rgba(232,241,248,.6)" fontFamily="var(--font-mono)" letterSpacing="3">
              ЭКРАН
            </text>
            <path d="M40 700 L 330 520" stroke="rgba(255,43,58,.35)" strokeWidth="26" strokeLinecap="round" />
            <text x="120" y="660" fontSize="11" fill="rgba(255,120,130,.8)" fontFamily="var(--font-mono)" transform="rotate(-33 120 660)" letterSpacing="2">
              ВЫХОД БОЙЦОВ
            </text>
            <text x="500" y="760" textAnchor="middle" fontSize="12" fill="rgba(232,241,248,.45)" fontFamily="var(--font-mono)" letterSpacing="3">
              ▼ ВХОД · ГАРДЕРОБ · БАР
            </text>
            <rect x="842" y="350" width="60" height="80" rx="4" fill="rgba(232,241,248,.06)" />
            <text x="872" y="394" textAnchor="middle" fontSize="11" fill="rgba(232,241,248,.4)" fontFamily="var(--font-mono)">
              ТВ
            </text>

            {/* ринг */}
            <circle cx={C.x} cy={C.y} r="150" fill="url(#ringGlow)" />
            <rect x={C.x - RING / 2} y={C.y - RING / 2} width={RING} height={RING} fill="#0e2440" stroke="#e8f1f8" strokeOpacity=".5" />
            {[10, 20, 30].map((i) => (
              <rect key={i} x={C.x - RING / 2 + i / 2} y={C.y - RING / 2 + i / 2} width={RING - i} height={RING - i} fill="none" stroke="#e8f1f8" strokeOpacity=".12" />
            ))}
            <rect x={C.x - RING / 2 - 4} y={C.y - RING / 2 - 4} width="10" height="10" fill="#ff2b3a" />
            <rect x={C.x + RING / 2 - 6} y={C.y + RING / 2 - 6} width="10" height="10" fill="#00e5ff" />
            <text x={C.x} y={C.y + 6} textAnchor="middle" fontSize="20" fill="#e8f1f8" fontFamily="var(--font-display)" fontWeight="900" fontStyle="italic">
              РИНГ
            </text>

            {/* места */}
            {seats.map((s) => {
              const z = zoneById.get(s.zone)!;
              const on = sel.includes(s.id);
              const dim = focusZone && focusZone !== s.zone;
              const isL = s.zone === 'lounge';
              return (
                <g key={s.id} onClick={() => toggle(s.id)} onMouseEnter={() => setHover(s)} style={{ cursor: 'pointer' }} opacity={dim ? 0.18 : 1}>
                  {isL ? (
                    <circle cx={s.x} cy={s.y} r={on ? 9 : 7} fill={on ? '#fff' : z.color} fillOpacity={on ? 1 : 0.75} stroke={on ? z.color : 'none'} strokeWidth="3" />
                  ) : (
                    <rect x={s.x - 6.5} y={s.y - 6.5} width="13" height="13" rx="3" fill={on ? '#fff' : z.color} fillOpacity={on ? 1 : 0.6} stroke={on ? z.color : 'none'} strokeWidth="3" />
                  )}
                  {on && !isL && <rect x={s.x - 11} y={s.y - 11} width="22" height="22" rx="5" fill="none" stroke="#fff" strokeOpacity=".35" />}
                </g>
              );
            })}
            {lounges.map((l) => {
              const [cx, cy] = { NW: [220, 150], NE: [780, 150], SE: [780, 630], SW: [220, 630] }[l.corner];
              return <circle key={l.id} cx={cx} cy={cy} r="44" fill="none" stroke="#B78CFF" strokeOpacity=".35" strokeDasharray="3 5" pointerEvents="none" />;
            })}
          </svg>

          {hover && (
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-line bg-abyss/90 px-4 py-3 text-[13px] backdrop-blur" aria-hidden="true">
              <p className="mono text-[10px] uppercase tracking-[0.14em]" style={{ color: zoneById.get(hover.zone)!.color }}>
                {zoneById.get(hover.zone)!.name}
              </p>
              <p className="display-upright text-[22px] leading-tight">
                {hover.zone === 'lounge' ? hover.row : `Ряд ${hover.row}`} · место {hover.num}
              </p>
              <p className="text-mute">
                {hover.label} · {fmtMoney(zoneById.get(hover.zone)!.price)}
              </p>
            </div>
          )}
        </div>
        <p className="text-[12px] text-faint">Схема — ориентировочная раскладка зала Prime Hall. Нумерация и цены уточняются при старте продаж у билетного оператора.</p>
      </div>

      {/* ───── корзина ───── */}
      <aside className="xl:sticky xl:top-[calc(var(--header-h)+24px)] xl:self-start" aria-labelledby="cart-title">
        <div className="panel flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <h2 id="cart-title" className="display-upright text-[34px] leading-none">
              Ваши места
            </h2>
            <span className="mono text-[12px] text-mute">
              {items.length}/{ticketRules.maxSeats}
            </span>
          </div>

          {onSale && holdUntil && (
            <div className={`flex items-center justify-between rounded border px-4 py-3 ${left < 60e3 ? 'border-blood bg-blood/10' : 'border-cyan/40 bg-cyan/5'}`} role="timer" aria-live="off">
              <span className="text-[13px] text-mute">Места закреплены за вами</span>
              <span className="mono text-[20px] font-semibold tabular">
                {pad(Math.floor(left / 60e3))}:{pad(Math.floor((left % 60e3) / 1000))}
              </span>
            </div>
          )}

          {items.length ? (
            <ul className="flex max-h-[300px] flex-col gap-2 overflow-auto pr-1">
              {items.map((s) => {
                const z = zoneById.get(s.zone)!;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded border border-line px-3 py-2">
                    <span className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} aria-hidden="true" />
                      <span className="text-[14px] leading-tight">
                        <span className="block">{s.label}</span>
                        <span className="text-mute">
                          {s.zone === 'lounge' ? s.row : `Ряд ${s.row}`}, место {s.num}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="mono text-[13px] tabular">{fmtMoney(z.price)}</span>
                      <button type="button" onClick={() => toggle(s.id)} className="grid h-8 w-8 place-items-center rounded-full border border-line text-mute hover:border-blood hover:text-blood" aria-label={`Убрать место ${s.num}`}>
                        ×
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded border border-dashed border-line p-5 text-center text-[14px] text-mute">Нажмите на место на схеме или на зону — подберём лучшие.</p>
          )}

          <div className="flex gap-2">
            <label htmlFor="promo" className="sr-only">
              Промокод
            </label>
            <input id="promo" className="input min-h-[46px] flex-1 uppercase" placeholder="Промокод" value={promo} onChange={(e) => setPromo(e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={applyPromo}>
              <span>Применить</span>
            </button>
          </div>
          {promoState && (
            <p className={`text-[13px] ${promoState.ok ? 'text-cyan' : 'text-[#ff7a83]'}`} role="status">
              {promoState.msg}
            </p>
          )}

          <dl className="flex flex-col gap-2 border-t border-line pt-4">
            <div className="flex justify-between text-mute">
              <dt>
                {items.length} {plural(items.length, ['место', 'места', 'мест'])}
              </dt>
              <dd className="mono tabular">{fmtMoney(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-cyan">
                <dt>Скидка</dt>
                <dd className="mono tabular">−{fmtMoney(subtotal - total)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="display-upright text-[24px]">Итого</dt>
              <dd className="display-upright text-[40px] leading-none">{fmtMoney(total)}</dd>
            </div>
          </dl>

          {onSale && event.tickets?.url ? (
            <a className="btn btn-primary w-full" href={event.tickets.url} target="_blank" rel="noopener noreferrer" data-impact="dark" aria-disabled={!items.length}>
              <span>Оплатить на {event.tickets.vendor}</span>
            </a>
          ) : (
            <button type="button" className="btn btn-primary w-full" disabled={!items.length} onClick={() => setStep('checkout')} data-impact="dark">
              <span>{items.length ? 'Сообщить о старте продаж' : 'Выберите места'}</span>
            </button>
          )}
          {!onSale && <p className="text-[12px] text-faint">Продажи {event.title} ещё не открыты. Сохраним ваш выбор и напишем первыми — места в заявке будут в приоритете при старте продаж.</p>}
          {items.length > 0 && (
            <button type="button" onClick={() => setSel([])} className="link-arrow self-start text-mute">
              Очистить выбор
            </button>
          )}
        </div>
      </aside>

      {step === 'checkout' && (
        <div className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-abyss/90 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="wl-title">
          <div className="panel relative w-full max-w-2xl p-6 md:p-10">
            <button type="button" onClick={() => setStep('pick')} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-line hover:border-ice" aria-label="Закрыть">
              ×
            </button>
            <h2 id="wl-title" className="display t-3 mb-2">
              Лист ожидания
            </h2>
            <p className="mb-6 text-mute">
              {items.length} {plural(items.length, ['место', 'места', 'мест'])} · {fmtMoney(total)}. Напишем, как только откроются продажи {event.title}.
            </p>
            <SmartForm
              kind="tickets-waitlist"
              title={`Лист ожидания ${event.title}`}
              extra={{ Места: summary, Сумма: fmtMoney(total) }}
              fields={[
                { name: 'name', label: 'Имя', required: true, autoComplete: 'name' },
                { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel', placeholder: '+375 29 000-00-00' },
                { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', span: 2 },
              ]}
              submit="Встать в лист ожидания"
              success={{ title: 'Вы в списке', text: 'Сообщим о старте продаж первыми. Места из заявки — в приоритете.' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
