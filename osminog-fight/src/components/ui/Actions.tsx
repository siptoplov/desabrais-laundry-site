'use client';

/** Мелкие интерактивные действия: поделиться, в избранное, в календарь, аккордеон */
import { useEffect, useState, type ReactNode } from 'react';
import type { FightEvent } from '@/content/types';
import { googleCalendarUrl, icsContent } from '@/lib/calendar';
import { read, write } from '@/lib/storage';
import { play } from '@/lib/sound';
import { site } from '@/content/site';

export function ShareButton({ title, text, path, className = '' }: { title: string; text?: string; path: string; className?: string }) {
  const [done, setDone] = useState<'idle' | 'copied'>('idle');
  const share = async () => {
    const url = `${location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDone('copied');
      setTimeout(() => setDone('idle'), 2200);
    } catch {
      /* пользователь закрыл диалог */
    }
  };
  const enc = (s: string) => encodeURIComponent(s);
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button type="button" onClick={share} className="btn btn-ghost btn-sm">
        <span>{done === 'copied' ? 'Ссылка скопирована ✓' : 'Поделиться'}</span>
      </button>
      <a className="chip hover:text-ice" target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${enc(`${site.url}${path}`)}&text=${enc(title)}`}>
        Telegram
      </a>
      <a className="chip hover:text-ice" target="_blank" rel="noopener noreferrer" href={`https://vk.com/share.php?url=${enc(`${site.url}${path}`)}&title=${enc(title)}`}>
        VK
      </a>
      <a className="chip hover:text-ice" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(`${title} ${site.url}${path}`)}`}>
        WhatsApp
      </a>
    </div>
  );
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    const load = () => setFavs(read<string[]>('favs', []));
    load();
    const on = (e: Event) => (e as CustomEvent).detail === 'favs' && load();
    window.addEventListener('osm:storage', on);
    return () => window.removeEventListener('osm:storage', on);
  }, []);
  const toggle = (slug: string) => {
    const next = favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug];
    write('favs', next);
    setFavs(next);
    if (!favs.includes(slug)) play('punch');
  };
  return { favs, toggle };
}

export function FavButton({ slug, name }: { slug: string; name: string }) {
  const { favs, toggle } = useFavorites();
  const on = favs.includes(slug);
  return (
    <button type="button" onClick={() => toggle(slug)} aria-pressed={on} className={`btn btn-sm ${on ? 'btn-primary' : 'btn-ghost'}`} aria-label={on ? `Убрать ${name} из избранного` : `Добавить ${name} в избранное`}>
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.2 4.3 2.4.8-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" />
        </svg>
        {on ? 'В избранном' : 'В избранное'}
      </span>
    </button>
  );
}

export function AddToCalendar({ event }: { event: FightEvent }) {
  if (!event.date) return null;
  const download = () => {
    const blob = new Blob([icsContent(event)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${event.slug}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    const r = read<string[]>('reminders', []);
    if (!r.includes(event.slug)) write('reminders', [...r, event.slug]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn btn-ghost btn-sm" href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
        <span>Google Календарь</span>
      </a>
      <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
        <span>Apple / Outlook (.ics)</span>
      </button>
    </div>
  );
}

export function Accordion({ items, defaultOpen = -1 }: { items: { q: ReactNode; a: ReactNode; id?: string }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col border-t border-line">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = it.id ?? `acc-${i}`;
        return (
          <div key={i} className="border-b border-line">
            <h3>
              <button type="button" className="group flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span className={`display-upright text-[clamp(1.5rem,2.4vw,2.2rem)] leading-tight transition-colors ${isOpen ? 'text-accent' : 'group-hover:text-accent'}`}>{it.q}</span>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${isOpen ? 'rotate-45 border-accent text-accent' : 'border-line'}`} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div id={id} role="region" className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="max-w-3xl pb-8 text-[17px] leading-relaxed text-mute">{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
