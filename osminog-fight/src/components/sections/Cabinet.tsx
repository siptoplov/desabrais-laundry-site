'use client';

/**
 * «Мой Осьминог» — личный кабинет на устройстве: карта болельщика с QR, избранные бойцы,
 * голоса, выбранные места, подписка, корзина мерча. Всё хранится в браузере.
 * Когда появится бэкенд (Supabase/Firebase/свой API) — эти же данные синхронизируются с аккаунтом.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import qrcode from 'qrcode-generator';
import type { FightEvent, Fighter } from '@/content/types';
import { FighterCard } from '@/components/ui/Cards';
import { LogoMark } from '@/components/brand/Logo';
import { read, write } from '@/lib/storage';
import { site } from '@/content/site';

type Vote = { event: string; bout: string; side: 'red' | 'blue' };

function QR({ text }: { text: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    const q = qrcode(0, 'M');
    q.addData(text);
    q.make();
    setSvg(q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
  }, [text]);
  return <div className="h-full w-full [&_path]:fill-[#05070A] [&_rect]:fill-[#E8F1F8] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR-код карты болельщика" role="img" />;
}

export function Cabinet({ fighters, events }: { fighters: Fighter[]; events: FightEvent[] }) {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [favs, setFavs] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [seats, setSeats] = useState<{ event: string; seats: string[] } | null>(null);
  const [sub, setSub] = useState<{ channel: string; contact: string } | null>(null);
  const [cart, setCart] = useState<{ slug: string; qty: number }[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    let fid = read<string>('fanId', '');
    if (!fid) {
      fid = `OSM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${String(Date.now()).slice(-4)}`;
      write('fanId', fid);
    }
    setId(fid);
    setName(read('fanName', ''));
    setFavs(read('favs', []));
    setSeats(read('seats', null));
    setSub(read('subscribed', null));
    setCart(read('cart', []));
    setReminders(read('reminders', []));
    const v: Vote[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        const m = k.match(/^osm:vote:([^:]+):(.+)$/);
        if (m) v.push({ event: m[1], bout: m[2], side: JSON.parse(localStorage.getItem(k)!) });
      }
    } catch {}
    setVotes(v);
    setReady(true);
  }, []);

  const favFighters = fighters.filter((f) => favs.includes(f.slug));
  const ev = (s: string) => events.find((e) => e.slug === s);
  const corner = (slug: string) => {
    const f = fighters.find((x) => x.slug === slug);
    return f ? f.lastName : slug;
  };

  const wipe = () => {
    if (!confirm('Удалить все данные «Мой Осьминог» с этого устройства?')) return;
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('osm:'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    location.reload();
  };

  if (!ready) return <div className="h-[60vh]" aria-busy="true" />;

  return (
    <div className="flex flex-col gap-16">
      {/* карта болельщика */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-center">
        <div className="relative aspect-[1.6] overflow-hidden rounded-[18px] border border-line p-6 shadow-[0_40px_120px_-40px_rgba(0,229,255,.45)]" style={{ background: 'radial-gradient(80% 90% at 0% 0%, #0e2440, #05070a 70%), #05070a' }}>
          <div className="caustics" />
          <LogoMark className="absolute -right-10 -top-10 h-56 w-56 opacity-10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="display text-[28px]">Осьминог</span>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-mute">Карта болельщика</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="display-upright text-[clamp(1.6rem,4vw,2.4rem)] leading-none">{name || 'Ваше имя'}</span>
                <span className="mono text-[12px] tracking-[0.2em] text-accent">{id}</span>
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  Любимец: {favFighters[0] ? favFighters[0].lastName : '—'} · голосов: {votes.length}
                </span>
              </div>
              <div className="h-24 w-24 shrink-0 rounded bg-[#E8F1F8] p-2 sm:h-28 sm:w-28">
                <QR text={`${site.url}/?fan=${id}`} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <label htmlFor="fan-name" className="mono text-[11px] uppercase tracking-[0.16em] text-mute">
            Имя на карте
          </label>
          <input
            id="fan-name"
            className="input max-w-sm"
            value={name}
            maxLength={24}
            placeholder="Как вас зовут?"
            onChange={(e) => {
              setName(e.target.value);
              write('fanName', e.target.value);
            }}
          />
          <p className="max-w-md text-[14px] text-faint">Карта и все данные ниже хранятся только на этом устройстве. С запуском аккаунтов — билеты в QR, напоминания и лидерборд прогнозов будут синхронизироваться.</p>
        </div>
      </div>

      {/* избранные */}
      <div>
        <h2 className="display t-3 mb-6">Избранные бойцы</h2>
        {favFighters.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {favFighters.map((f) => (
              <FighterCard key={f.slug} f={f} />
            ))}
          </div>
        ) : (
          <p className="text-mute">
            Пока никого. Откройте <Link href="/fighters/" className="text-ice underline underline-offset-4">профиль бойца</Link> и нажмите «В избранное».
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* голоса */}
        <div className="panel p-6">
          <p className="eyebrow mb-4">Мои голоса</p>
          {votes.length ? (
            <ul className="flex flex-col gap-2">
              {votes.map((v) => {
                const e = ev(v.event);
                const b = e?.bouts.find((x) => x.id === v.bout);
                if (!e || !b) return null;
                return (
                  <li key={`${v.event}${v.bout}`} className="flex justify-between gap-3 border-b border-line pb-2 text-[14px]">
                    <span className={v.side === 'red' ? 'tag-corner-red' : 'tag-corner-blue'}>{corner(v.side === 'red' ? b.red : b.blue)}</span>
                    <span className="text-faint">
                      {e.title} · vs {corner(v.side === 'red' ? b.blue : b.red)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-mute">
              Голосуйте за любимцев в <Link href="/fight-card/" className="text-ice underline underline-offset-4">Fight Card</Link>.
            </p>
          )}
        </div>
        {/* места */}
        <div className="panel p-6">
          <p className="eyebrow mb-4">Мои места</p>
          {seats?.seats?.length ? (
            <>
              <p className="display-upright text-[36px] leading-none">
                {seats.seats.length} · {ev(seats.event)?.title}
              </p>
              <p className="mono mt-2 text-[12px] text-mute">{seats.seats.join(', ')}</p>
              <Link href="/tickets/" className="link-arrow mt-4">
                Открыть схему зала →
              </Link>
            </>
          ) : (
            <p className="text-mute">
              Выберите места на <Link href="/tickets/" className="text-ice underline underline-offset-4">схеме зала</Link>.
            </p>
          )}
        </div>
        {/* подписка и напоминания */}
        <div className="panel p-6">
          <p className="eyebrow mb-4">Уведомления</p>
          <p className="text-mute">{sub ? `Подписка: ${sub.channel === 'email' ? 'e-mail' : 'Telegram'} · ${sub.contact}` : 'Подписки нет — оформите в футере сайта.'}</p>
          {reminders.length > 0 && <p className="mt-2 text-mute">В календаре: {reminders.map((r) => ev(r)?.title ?? r).join(', ')}</p>}
        </div>
        {/* корзина */}
        <div className="panel p-6">
          <p className="eyebrow mb-4">Мерч</p>
          <p className="text-mute">{cart.length ? `В листе желаний: ${cart.reduce((n, l) => n + l.qty, 0)} шт.` : 'Лист желаний пуст.'}</p>
          <Link href="/shop/" className="link-arrow mt-4">
            В магазин →
          </Link>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={wipe} className="link-arrow text-faint hover:text-blood">
          Удалить мои данные с устройства
        </button>
      </div>
    </div>
  );
}
