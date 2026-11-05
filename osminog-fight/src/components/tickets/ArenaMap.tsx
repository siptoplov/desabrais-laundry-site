'use client';

/**
 * Интерактивная схема зала: зоны, ряды, места, корзина, промокод.
 * • Мышь/палец: клик по месту. Клавиатура и скринридеры: список зон с кнопкой «лучшие места».
 * • Продажи открыты (tickets.status = 'onsale') → таймер резерва + переход к оплате у оператора.
 * • Продажи скоро → схема показывает зоны и цены, кнопка ведёт на сайт билетного оператора.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { boxes, promoCodes, ringsideRows, sectors, ticketRules, zones, type ZoneId } from '@/content/arena';
import type { FightEvent } from '@/content/types';
import { fmtMoney, pad, plural } from '@/lib/format';
import { read, write } from '@/lib/storage';
import { play } from '@/lib/sound';

type Seat = { id: string; zone: ZoneId; x: number; y: number; label: string; row: string; num: number };

/** Ринг на танцполе; амфитеатр расходится дугами от точки O (центр зала) */
const C = { x: 500, y: 555 };
const RING = 116;
const O = { x: 500, y: 610 };
const GAP = 17;
const R0 = 215;
const BOX_R = 400;

const polar = (deg: number, r: number) => ({ x: O.x + Math.sin((deg * Math.PI) / 180) * r, y: O.y - Math.cos((deg * Math.PI) / 180) * r });

/** Центры столиков лож балкона */
const boxCenters = Array.from({ length: boxes.count }, (_, i) => polar(-80 + (160 * i) / (boxes.count - 1), BOX_R));

function buildSeats(): Seat[] {
  const out: Seat[] = [];
  // ringside: ряды слева, справа и сверху от ринга
  for (let r = 0; r < ringsideRows; r++) {
    const off = RING / 2 + 20 + r * GAP;
    const n = Math.round((RING + 40) / GAP);
    for (let k = 0; k < n; k++) {
      const along = (k - (n - 1) / 2) * GAP;
      out.push({ id: `RS-N-${r + 1}-${k + 1}`, zone: 'ringside', x: C.x + along, y: C.y - off, label: 'Ringside · у ринга', row: String(r + 1), num: k + 1 });
    }
    for (const [side, sx] of [['W', -1], ['E', 1]] as const) {
      const m = Math.round((RING + 10) / GAP);
      for (let k = 0; k < m; k++) {
        out.push({ id: `RS-${side}-${r + 1}-${k + 1}`, zone: 'ringside', x: C.x + sx * off, y: C.y - RING / 2 + 6 + k * GAP, label: side === 'W' ? 'Ringside · слева' : 'Ringside · справа', row: String(r + 1), num: k + 1 });
      }
    }
  }
  // амфитеатр: сектора A–E
  for (const sc of sectors) {
    for (let r = 0; r < sc.rows; r++) {
      const rad = R0 + r * GAP;
      const arc = ((sc.to - sc.from) * Math.PI * rad) / 180;
      const n = Math.max(2, Math.floor(arc / GAP));
      for (let k = 0; k < n; k++) {
        const deg = sc.from + ((sc.to - sc.from) * (k + 0.5)) / n;
        const zone: ZoneId = r < sc.vipRows ? 'vip' : sc.zone;
        out.push({ id: `${sc.id}-${r + 1}-${k + 1}`, zone, ...polar(deg, rad), label: sc.label, row: String(r + 1), num: k + 1 });
      }
    }
  }
  // балкон: ложи со столиком
  boxCenters.forEach((c, i) => {
    for (let k = 0; k < boxes.seats; k++) {
      const a = (k / boxes.seats) * Math.PI * 2 + Math.PI / 4;
      out.push({ id: `L${i + 1}-${k + 1}`, zone: 'lounge', x: c.x + Math.cos(a) * 15, y: c.y + Math.sin(a) * 15, label: `Балкон · ложа ${i + 1}`, row: `Ложа ${i + 1}`, num: k + 1 });
    }
  });
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
                <stop offset="0" stopColor="#ECEEF1" stopOpacity=".35" />
                <stop offset="1" stopColor="#ECEEF1" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* сцена с экраном — в торце, ринг на танцполе перед ней */}
            <rect x="330" y="712" width="340" height="40" rx="4" fill="rgba(242,242,243,.1)" stroke="rgba(242,242,243,.25)" />
            <text x="500" y="737" textAnchor="middle" fontSize="13" fill="rgba(242,242,243,.7)" fontFamily="var(--font-mono)" letterSpacing="4">
              СЦЕНА · ЭКРАН
            </text>
            <path d={`M500 712 L500 ${C.y + RING / 2 + 6}`} stroke="rgba(255,43,58,.4)" strokeWidth="22" />
            <text x="512" y="690" fontSize="10" fill="rgba(255,120,130,.9)" fontFamily="var(--font-mono)" letterSpacing="2">
              ВЫХОД БОЙЦОВ
            </text>
            <rect x="330" y={C.y - RING / 2 - 62} width="340" height={RING + 130} rx="10" fill="none" stroke="rgba(242,242,243,.12)" strokeDasharray="4 6" />
            <text x="340" y={C.y + RING / 2 + 58} fontSize="10" fill="rgba(242,242,243,.35)" fontFamily="var(--font-mono)" letterSpacing="2">
              ТАНЦПОЛ
            </text>
            {/* подписи секторов и балкона */}
            {sectors.map((sc) => {
              const p = { x: O.x + Math.sin((((sc.from + sc.to) / 2) * Math.PI) / 180) * (R0 - 20), y: O.y - Math.cos((((sc.from + sc.to) / 2) * Math.PI) / 180) * (R0 - 20) };
              return (
                <text key={sc.id} x={p.x} y={p.y} textAnchor="middle" fontSize="11" fill="rgba(242,242,243,.45)" fontFamily="var(--font-mono)" letterSpacing="2">
                  {sc.label.toUpperCase()}
                </text>
              );
            })}
            <text x="500" y={O.y - BOX_R - 28} textAnchor="middle" fontSize="11" fill="rgba(183,140,255,.7)" fontFamily="var(--font-mono)" letterSpacing="3">
              БАЛКОН · ЛОЖИ
            </text>
            {boxCenters.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r="7" fill="rgba(183,140,255,.18)" stroke="#B78CFF" strokeOpacity=".4" pointerEvents="none" />
            ))}
            <text x="500" y="772" textAnchor="middle" fontSize="11" fill="rgba(242,242,243,.4)" fontFamily="var(--font-mono)" letterSpacing="3">
              ВХОД · ГАРДЕРОБ · БАР — ПО БОКАМ ЗАЛА
            </text>

            {/* ринг */}
            <circle cx={C.x} cy={C.y} r="120" fill="url(#ringGlow)" />
            <rect x={C.x - RING / 2} y={C.y - RING / 2} width={RING} height={RING} fill="#1C1C21" stroke="#F2F2F3" strokeOpacity=".5" />
            {[10, 20, 30].map((i) => (
              <rect key={i} x={C.x - RING / 2 + i / 2} y={C.y - RING / 2 + i / 2} width={RING - i} height={RING - i} fill="none" stroke="#F2F2F3" strokeOpacity=".12" />
            ))}
            <rect x={C.x - RING / 2 - 4} y={C.y - RING / 2 - 4} width="10" height="10" fill="#ff2b3a" />
            <rect x={C.x + RING / 2 - 6} y={C.y + RING / 2 - 6} width="10" height="10" fill="#ECEEF1" />
            <text x={C.x} y={C.y + 6} textAnchor="middle" fontSize="18" fill="#F2F2F3" fontFamily="var(--font-display)" fontWeight="900" fontStyle="italic">
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
                    <circle cx={s.x} cy={s.y} r={on ? 7 : 5.5} fill={on ? '#fff' : z.color} fillOpacity={on ? 1 : 0.75} stroke={on ? z.color : 'none'} strokeWidth="3" />
                  ) : (
                    <rect x={s.x - 6} y={s.y - 6} width="12" height="12" rx="3" fill={on ? '#fff' : z.color} fillOpacity={on ? 1 : 0.6} stroke={on ? z.color : 'none'} strokeWidth="3" />
                  )}
                  {on && !isL && <rect x={s.x - 10} y={s.y - 10} width="20" height="20" rx="5" fill="none" stroke="#fff" strokeOpacity=".35" />}
                </g>
              );
            })}
          </svg>

          {hover && (
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-line bg-abyss/90 px-4 py-3 text-[13px] backdrop-blur" aria-hidden="true">
              <p className="mono text-[11px] uppercase tracking-[0.14em]" style={{ color: zoneById.get(hover.zone)!.color }}>
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
        <p className="text-[12px] text-faint">Схема — по раскладке Prime Hall на TicketPro: сцена с экраном, ринг на танцполе, амфитеатр A–E и балкон с ложами. Точная нумерация мест и цены — при старте продаж у билетного оператора.</p>
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
            <a className="btn btn-primary w-full" href={event.tickets?.url ?? 'https://www.ticketpro.by/'} target="_blank" rel="noopener noreferrer">
              <span>Билеты на {event.tickets?.vendor ?? 'TicketPro'} ↗</span>
            </a>
          )}
          {!onSale && <p className="text-[12px] text-faint">Продажи {event.title} ещё не открыты — билеты появятся на {event.tickets?.vendor ?? 'TicketPro'}. Схема показывает зоны и цены прошлого турнира.</p>}
          {items.length > 0 && (
            <button type="button" onClick={() => setSel([])} className="link-arrow self-start text-mute">
              Очистить выбор
            </button>
          )}
        </div>
      </aside>

    </div>
  );
}
