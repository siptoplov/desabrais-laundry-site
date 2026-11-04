'use client';

/**
 * Карта болельщика: нажал на карту → открылись все бойцы лиги → выбрал своего (сердечко) →
 * ниже его рекорд, статистика, аналитика и все бои со ссылками на записи.
 * Стоит на главной и в «Мой Осьминог»; всё хранится в браузере.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import type { FightEvent, Fighter, Video } from '@/content/types';
import { Btn } from '@/components/ui/Btn';
import { BoutHistory, FighterAnalyticsPanel, StatsGrid } from '@/components/ui/BoutHistory';
import { Flag } from '@/components/ui/Primitives';
import { LogoMark } from '@/components/brand/Logo';
import { getLenis } from '@/components/fx/SmoothScroll';
import { FanPicker, FighterAvatar } from '@/components/sections/FanPicker';
import { fullName, recordStr } from '@/lib/cms';
import { read, write } from '@/lib/storage';
import { analyticsOf, boutsOf, statsOf } from '@/lib/stats';
import { play } from '@/lib/sound';
import { site } from '@/content/site';
import { plural } from '@/lib/format';
import { ShareButton } from '@/components/ui/Actions';

function QR({ text }: { text: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    const q = qrcode(0, 'M');
    q.addData(text);
    q.make();
    setSvg(q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
  }, [text]);
  return <div className="h-full w-full [&_path]:fill-[#060607] [&_rect]:fill-[#F2F2F3] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR-код карты болельщика" role="img" />;
}

function Heart({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${on ? 'heart-pop text-blood [filter:drop-shadow(0_0_8px_rgba(255,43,58,.7))]' : 'text-mute'}`} aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** Сколько боёв показывать сразу на главной; остальные — по кнопке */
const FIRST = 5;

export function FanZone({ fighters, events, videos, compact = false }: { fighters: Fighter[]; events: FightEvent[]; videos: Video[]; compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [fan, setFan] = useState('');
  const [picking, setPicking] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [favs, setFavs] = useState<string[]>([]);
  const [all, setAll] = useState(!compact);

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
    setReady(true);
  }, []);

  const fanF = fighters.find((f) => f.slug === fan);
  const bouts = useMemo(() => (fan ? boutsOf(events, fan) : []), [events, fan]);
  const st = useMemo(() => statsOf(bouts, videos), [bouts, videos]);
  const an = useMemo(() => analyticsOf(bouts), [bouts]);
  const hearted = !!fanF && favs.includes(fanF.slug);
  const closePicker = useCallback(() => setPicking(false), []);

  const setFavList = (next: string[]) => {
    setFavs(next);
    write('favs', next);
  };
  const pick = (slug: string) => {
    setFan(slug);
    write('fanFighter', slug);
    if (!favs.includes(slug)) setFavList([slug, ...favs]);
    setPicking(false);
    setAll(!compact);
    play('punch');
    requestAnimationFrame(() => {
      const el = document.getElementById('my-fighter');
      if (!el) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  /** Сердечко = «мой боец»: поставить — закрепить, снять — вернуть карту к выбору */
  const toggleHeart = () => {
    if (!fanF) return setPicking(true);
    if (hearted) {
      setFavList(favs.filter((s) => s !== fanF.slug));
      setFan('');
      write('fanFighter', '');
    } else {
      setFavList([fanF.slug, ...favs]);
      play('punch');
    }
  };

  if (!ready) return <div className="h-[60vh]" aria-busy="true" />;
  const shown = all ? bouts : bouts.slice(0, FIRST);

  return (
    <div className="flex flex-col gap-14">
      {/* карта */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-center">
        <button
          type="button"
          onClick={() => setPicking(true)}
          aria-haspopup="dialog"
          aria-label={fanF ? `Карта болельщика. Мой боец: ${fullName(fanF)}. Нажмите, чтобы сменить бойца` : 'Карта болельщика. Нажмите, чтобы выбрать любимого бойца'}
          className="fan-card group relative block aspect-[1.6] w-full overflow-hidden rounded-[18px] border border-line p-5 text-left shadow-[0_40px_120px_-40px_rgba(236,238,241,.45)] transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-cyan/50 focus-visible:border-cyan sm:p-6"
          style={{ background: 'radial-gradient(80% 90% at 0% 0%, #1C1C21, #060607 70%), #060607' }}
        >
          <div className="caustics" />
          <span className="fan-card__shine" aria-hidden="true" />
          <LogoMark className="absolute -right-10 -top-10 h-56 w-56 opacity-10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="display text-[24px] sm:text-[28px]">Осьминог</span>
              <span className="mono text-[9px] uppercase tracking-[0.2em] text-mute sm:text-[10px]">Карта болельщика</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="display-upright truncate text-[clamp(1.4rem,4vw,2.4rem)] leading-none">{name || 'Ваше имя'}</span>
                <span className="mono text-[11px] tracking-[0.2em] text-accent sm:text-[12px]">{id}</span>
                {fanF ? (
                  <span className="mt-2 flex items-center gap-3">
                    <FighterAvatar f={fanF} className="h-14 w-11 shrink-0 overflow-hidden rounded-[5px] border border-ice/30 sm:h-[72px] sm:w-[58px]" text="text-[18px]" />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="mono flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-faint">
                        <Heart on className="h-3 w-3" /> Мой боец
                      </span>
                      <span className="display-upright truncate text-[18px] leading-none group-hover:text-accent sm:text-[22px]">{fullName(fanF)}</span>
                      <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute">
                        {fanF.record ? `рекорд ${recordStr(fanF)} · ` : ''}
                        {st.fights} {plural(st.fights, ['бой', 'боя', 'боёв'])} в лиге
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="mono mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-cyan/50 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-cyan sm:text-[10px]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
                    Нажмите — выберите бойца
                  </span>
                )}
              </div>
              <div className="h-20 w-20 shrink-0 rounded bg-[#F2F2F3] p-1.5 sm:h-28 sm:w-28 sm:p-2">
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
          <Btn className="w-fit" onClick={() => setPicking(true)}>
            {fanF ? 'Сменить бойца' : 'Выбрать любимого бойца'}
          </Btn>
          <p className="max-w-md text-[14px] text-faint">Нажмите на карту — откроются все {fighters.length} бойцов «Осьминога». Поставьте сердечко своему — ниже появятся его рекорд, статистика и все бои со ссылками на записи.</p>
        </div>
      </div>

      {/* мой боец */}
      <section id="my-fighter" aria-labelledby="my-fighter-title" className="scroll-mt-24">
        {fanF ? (
          <div className="flex flex-col gap-8">
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
                  {fanF.club && <span>· клуб «{fanF.club}»</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={toggleHeart} aria-pressed={hearted} aria-label={hearted ? 'Убрать сердечко' : 'Поставить сердечко'} className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-blood">
                  <Heart on={hearted} className="h-6 w-6" />
                </button>
                <Btn href={`/fighters/${fanF.slug}/`} variant="ghost" size="sm">
                  Профиль бойца
                </Btn>
                <ShareButton title={`${fullName(fanF)} — мой боец «Осьминога»`} path={`/fighters/${fanF.slug}/`} />
                <Btn variant="ghost" size="sm" icon="none" onClick={() => setPicking(true)}>
                  Сменить
                </Btn>
              </div>
            </div>

            <StatsGrid f={fanF} bouts={bouts} st={st} />
            <FighterAnalyticsPanel a={an} />

            <div>
              <h3 className="display t-3 mb-6">Все бои · {bouts.length}</h3>
              <BoutHistory bouts={shown} />
              {!all && bouts.length > FIRST && (
                <Btn variant="ghost" size="sm" icon="none" className="mt-6" onClick={() => setAll(true)}>
                  Показать все {bouts.length}
                </Btn>
              )}
            </div>
          </div>
        ) : (
          <div className="panel flex flex-col items-start gap-4 p-6 md:p-10">
            <p className="eyebrow">Мой боец</p>
            <h2 id="my-fighter-title" className="display t-3">
              За кого болеете?
            </h2>
            <p className="max-w-xl text-mute">Выберите любимого бойца из всех {fighters.length} бойцов лиги — здесь появятся его рекорд, статистика, аналитика и ссылки на все бои.</p>
            <Btn onClick={() => setPicking(true)}>Выбрать бойца</Btn>
          </div>
        )}
      </section>

      {picking && <FanPicker fighters={fighters} events={events} current={fan} favs={favs} onPick={pick} onClose={closePicker} />}
    </div>
  );
}
