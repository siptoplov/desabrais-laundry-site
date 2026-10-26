'use client';

/**
 * Мерч: выбор цвета и размера, корзина-предзаказ (хранится на устройстве), отправка заявки.
 * Когда появятся цены и склад — поставьте status: 'available' и price в content/pages.ts
 * и подключите оплату (bePaid / ЮKassa / Stripe) в onCheckout.
 */
import { useEffect, useState } from 'react';
import type { Product } from '@/content/types';
import { ProductArt } from './ProductArt';
import { SmartForm } from '@/components/forms/FormKit';
import { read, write } from '@/lib/storage';
import { play } from '@/lib/sound';

type Line = { slug: string; color: string; size?: string; qty: number };

export function Shop({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [choice, setChoice] = useState<Record<string, { color: string; size?: string }>>({});
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => setCart(read<Line[]>('cart', [])), []);
  useEffect(() => write('cart', cart), [cart]);

  const pick = (p: Product) => choice[p.slug] ?? { color: p.colors[0], size: p.sizes?.[Math.min(1, (p.sizes?.length ?? 1) - 1)] };
  const add = (p: Product) => {
    const c = pick(p);
    setCart((cur) => {
      const i = cur.findIndex((l) => l.slug === p.slug && l.color === c.color && l.size === c.size);
      if (i >= 0) return cur.map((l, k) => (k === i ? { ...l, qty: l.qty + 1 } : l));
      return [...cur, { slug: p.slug, color: c.color, size: c.size, qty: 1 }];
    });
    play('punch');
    setOpen(true);
  };
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const byslug = (s: string) => products.find((p) => p.slug === s)!;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const c = pick(p);
          return (
            <article key={p.slug} className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-abyss-2 panel-hover">
              <div className="relative aspect-square overflow-hidden">
                <div className="h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105">
                  <ProductArt p={p} color={c.color} />
                </div>
                <span className="chip chip-blood absolute left-4 top-4 bg-abyss/60 backdrop-blur">{p.status === 'available' ? 'В наличии' : p.status === 'preorder' ? 'Предзаказ' : 'Скоро'}</span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <p className="label">{p.kind}</p>
                  <h3 className="display-upright text-[28px] leading-tight">{p.name}</h3>
                  <p className="text-[14px] text-mute">{p.tagline}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Цвет">
                  {p.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      role="radio"
                      aria-checked={c.color === col}
                      aria-label={`Цвет ${col}`}
                      onClick={() => setChoice((x) => ({ ...x, [p.slug]: { ...c, color: col } }))}
                      className={`h-8 w-8 rounded-full border-2 transition-transform ${c.color === col ? 'scale-110 border-cyan' : 'border-line'}`}
                      style={{ background: col }}
                    />
                  ))}
                </div>
                {p.sizes && (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Размер">
                    {p.sizes.map((s) => (
                      <button key={s} type="button" role="radio" aria-checked={c.size === s} onClick={() => setChoice((x) => ({ ...x, [p.slug]: { ...c, size: s } }))} className={`chip h-9 min-w-[44px] justify-center px-3 ${c.size === s ? 'chip-cyan' : 'hover:text-ice'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <span className="display-upright text-[26px]">{p.price ? `${p.price} BYN` : 'Цена — скоро'}</span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => add(p)}>
                    <span>{p.status === 'available' ? 'В корзину' : 'Хочу'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* плавающая кнопка корзины */}
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-[65] flex items-center gap-3 rounded-full border border-line bg-abyss/90 px-5 py-3 backdrop-blur md:bottom-8 md:right-8" aria-label={`Корзина: ${count}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 7h14l-1.5 12h-11zM9 7a3 3 0 016 0" />
        </svg>
        <span className="mono text-[13px]">{count}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-abyss/70 backdrop-blur-sm" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Корзина">
          <div className="flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto border-l border-line bg-abyss p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="display t-4">Лист желаний</p>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Закрыть">
                ×
              </button>
            </div>
            {cart.length ? (
              <ul className="flex flex-col gap-3">
                {cart.map((l, i) => {
                  const p = byslug(l.slug);
                  return (
                    <li key={i} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded border border-line p-2">
                      <div className="aspect-square overflow-hidden rounded">
                        <ProductArt p={p} color={l.color} />
                      </div>
                      <div>
                        <p className="text-[15px] leading-tight">{p.name}</p>
                        <p className="mono text-[11px] text-faint">
                          {l.size ? `${l.size} · ` : ''}
                          {l.color}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="chip h-8 w-8 justify-center p-0" onClick={() => setCart((c) => c.map((x, k) => (k === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))} aria-label="Меньше">
                          −
                        </button>
                        <span className="mono w-5 text-center">{l.qty}</span>
                        <button type="button" className="chip h-8 w-8 justify-center p-0" onClick={() => setCart((c) => c.map((x, k) => (k === i ? { ...x, qty: x.qty + 1 } : x)))} aria-label="Больше">
                          +
                        </button>
                        <button type="button" className="chip h-8 w-8 justify-center p-0 hover:text-blood" onClick={() => setCart((c) => c.filter((_, k) => k !== i))} aria-label="Удалить">
                          ×
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-mute">Пока пусто. Нажмите «Хочу» на любой вещи.</p>
            )}
            {cart.length > 0 && !checkout && (
              <button type="button" className="btn btn-primary" onClick={() => setCheckout(true)}>
                <span>Оформить предзаказ</span>
              </button>
            )}
            {checkout && (
              <SmartForm
                kind="merch-preorder"
                compact
                title="Предзаказ мерча"
                extra={{ Заказ: cart.map((l) => `${byslug(l.slug).name} ${l.size ?? ''} ${l.color} ×${l.qty}`).join('; ') }}
                fields={[
                  { name: 'name', label: 'Имя', required: true, autoComplete: 'name' },
                  { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel' },
                  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
                ]}
                submit="Отправить предзаказ"
                success={{ title: 'Предзаказ принят', text: 'Напишем, когда коллекция будет готова, и согласуем доставку.' }}
              />
            )}
            <p className="text-[12px] text-faint">Коллекция в производстве. Предзаказ ни к чему не обязывает — мы просто узнаем, что шить в первую очередь.</p>
          </div>
        </div>
      )}
    </>
  );
}
