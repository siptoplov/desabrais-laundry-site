'use client';

/**
 * «Мой Осьминог» — личный кабинет на устройстве: карта болельщика с QR и любимым бойцом
 * (его бои, статистика и записи), избранные бойцы, голоса, выбранные места, подписка,
 * корзина мерча. Всё хранится в браузере.
 * Когда появится бэкенд (Supabase/Firebase/свой API) — эти же данные синхронизируются с аккаунтом.
 */
import Link from '@/components/ui/Link';
import { useEffect, useState } from 'react';
import type { FightEvent, Fighter, Video } from '@/content/types';
import { Btn } from '@/components/ui/Btn';
import { FighterCard } from '@/components/ui/Cards';
import { FanZone } from '@/components/sections/FanZone';
import { read } from '@/lib/storage';

type Vote = { event: string; bout: string; side: 'red' | 'blue' };

export function Cabinet({ fighters, events, videos }: { fighters: Fighter[]; events: FightEvent[]; videos: Video[] }) {
  const [ready, setReady] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [seats, setSeats] = useState<{ event: string; seats: string[] } | null>(null);
  const [cart, setCart] = useState<{ slug: string; qty: number }[]>([]);
  
  useEffect(() => {
    setFavs(read<string[]>('favs', []));
    setSeats(read('seats', null));
    setCart(read('cart', []));
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
      <FanZone fighters={fighters} events={events} videos={videos} />

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
