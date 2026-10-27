'use client';

/**
 * «Мой Осьминог» — личный кабинет на устройстве: карта болельщика с QR и любимым бойцом
 * (его бои, статистика и записи), избранные бойцы, голоса, выбранные места, подписка,
 * корзина мерча. Всё хранится в браузере.
 * Когда появится бэкенд (Supabase/Firebase/свой API) — эти же данные синхронизируются с аккаунтом.
 */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import type { FightEvent, Fighter, Video } from '@/content/types';
import { Btn } from '@/components/ui/Btn';
import { FighterCard } from '@/components/ui/Cards';
import { BoutHistory, StatsGrid } from '@/components/ui/BoutHistory';
import { Flag } from '@/components/ui/Primitives';
import { LogoMark } from '@/components/brand/Logo';
import { getLenis } from '@/components/fx/SmoothScroll';
import { FanPicker, FighterAvatar } from '@/components/sections/FanPicker';
import { fullName } from '@/lib/cms';
import { read, write } from '@/lib/storage';
import { boutsOf, statsOf } from '@/lib/stats';
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

export function Cabinet({ fighters, events, videos }: { fighters: Fighter[]; events: FightEvent[]; videos: Video[] }) {
  const [ready, setReady] = useState(false);
  const [fan, setFan] = useState('');
  const [picking, setPicking] = useState(false);
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
    const fv = read<string[]>('favs', []);
    setFavs(fv);
    setFan(read('fanFighter', '') || fv[0] || '');
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
  const fanF = fighters.find((f) => f.slug === fan);
  const fanBouts = useMemo(() => (fan ? boutsOf(events, fan) : []), [events, fan]);
  const st = useMemo(() => statsOf(fanBouts, videos), [fanBouts, videos]);
  const closePicker = useCallback(() => setPicking(false), []);
  const pick = (slug: string) => {
    setFan(slug);
    write('fanFighter', slug);
    setPicking(false);
    // к боям выбранного бойца — после того как окно закроется и блок отрисуется
    requestAnimationFrame(() => {
      const el = document.getElementById('my-fighter');
      if (!el) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
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
        <button
          type="button"
          onClick={() => setPicking(true)}
          aria-haspopup="dialog"
          aria-label={fanF ? `Карта болельщика. Мой боец: ${fullName(fanF)}. Нажмите, чтобы сменить бойца` : 'Карта болельщика. Нажмите, чтобы выбрать любимого бойца'}
          className="group relative block aspect-[1.6] w-full overflow-hidden rounded-[18px] border border-line p-6 text-left shadow-[0_40px_120px_-40px_rgba(0,229,255,.45)] transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-cyan/50 focus-visible:border-cyan"
          style={{ background: 'radial-gradient(80% 90% at 0% 0%, #0e2440, #05070a 70%), #05070a' }}
        >
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
                {fanF ? (
                  <span className="mt-2 flex items-center gap-2.5">
                    <FighterAvatar f={fanF} className="h-10 w-9 shrink-0 overflow-hidden rounded-[4px] border border-line" text="text-[15px]" />
                    <span className="flex flex-col">
                      <span className="mono text-[9px] uppercase tracking-[0.18em] text-faint">Мой боец</span>
                      <span className="display-upright text-[20px] leading-none group-hover:text-accent">{fullName(fanF)}</span>
                    </span>
                  </span>
                ) : (
                  <span className="mono mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-cyan/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-cyan">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
                    Нажмите — выберите своего бойца
                  </span>
                )}
              </div>
              <div className="h-24 w-24 shrink-0 rounded bg-[#E8F1F8] p-2 sm:h-28 sm:w-28">
                <QR text={`${site.url}/?fan=${id}`} />
              </div>
            </div>
          </div>
        </button>
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
          <Btn variant="ghost" size="sm" className="w-fit" onClick={() => setPicking(true)}>
            {fanF ? 'Сменить бойца' : 'Выбрать любимого бойца'}
          </Btn>
          <p className="max-w-md text-[14px] text-faint">Нажмите на карту — откроются все бойцы «Осьминога». Выберите своего, и ниже появятся все его бои в лиге, статистика и записи боёв. Карта и все данные хранятся только на этом устройстве. С запуском аккаунтов — билеты в QR, напоминания и лидерборд прогнозов будут синхронизироваться.</p>
        </div>
      </div>

      {/* мой боец: статистика и все бои */}
      <section id="my-fighter" aria-labelledby="my-fighter-title" className="scroll-mt-24">
        {fanF ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <FighterAvatar f={fanF} className="h-40 w-32 shrink-0 overflow-hidden rounded-[var(--radius)] border border-line" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="eyebrow">Мой боец</p>
                <h2 id="my-fighter-title" className="display t-2 leading-[0.9]">
                  {fanF.firstName && <span className="block text-[0.45em] text-mute">{fanF.firstName}</span>}
                  {fanF.lastName}
                </h2>
                <p className="flex flex-wrap items-center gap-2 text-mute">
                  <Flag code={fanF.country} withName />
                  {fanF.city && <span>· {fanF.city}</span>}
                  {fanF.nickname && <span className="text-accent">· «{fanF.nickname}»</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Btn href={`/fighters/${fanF.slug}/`} variant="ghost" size="sm">
                  Профиль бойца
                </Btn>
                <Btn variant="ghost" size="sm" icon="none" onClick={() => setPicking(true)}>
                  Сменить бойца
                </Btn>
              </div>
            </div>

            <StatsGrid f={fanF} bouts={fanBouts} st={st} />

            <div>
              <h3 className="display t-3 mb-6">
                Все бои · {fanBouts.length}
              </h3>
              <BoutHistory bouts={fanBouts} />
            </div>
          </div>
        ) : (
          <div className="panel flex flex-col items-start gap-4 p-6 md:p-10">
            <p className="eyebrow">Мой боец</p>
            <h2 id="my-fighter-title" className="display t-3">
              За кого болеете?
            </h2>
            <p className="max-w-xl text-mute">Выберите любимого бойца из всех {fighters.length} бойцов лиги — здесь появятся его бои, статистика и ссылки на записи боёв.</p>
            <Btn onClick={() => setPicking(true)}>Выбрать бойца</Btn>
          </div>
        )}
      </section>

      {picking && <FanPicker fighters={fighters} events={events} current={fan} onPick={pick} onClose={closePicker} />}

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
