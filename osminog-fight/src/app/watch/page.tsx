import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { WatchHub } from '@/components/sections/WatchHub';
import { VideoCard } from '@/components/ui/VideoCard';
import { Btn } from '@/components/ui/Btn';
import { Countdown } from '@/components/ui/Countdown';
import { Subscribe } from '@/components/forms/Subscribe';
import { getEvents, getPastEvents, getUpcoming, getVideos } from '@/lib/cms';
import { channel } from '@/content/videos';
import { partners } from '@/content/site';
import { fmtViews } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Эфир — трансляции и видео боёв',
  description: 'Полные бои турниров «Осьминог», интервью и закулисье. Расписание трансляций и архив видео.',
  alternates: { canonical: '/watch/' },
};

export default function WatchPage() {
  const videos = getVideos();
  const top = [...videos].filter((v) => v.kind === 'fight').sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  const next = getUpcoming();
  const last = getPastEvents()[0];
  const totalViews = videos.reduce((n, v) => n + (v.views ?? 0), 0);

  return (
    <>
      <PageHero eyebrow="Эфир" title={['Смотри', <span key="s" className="text-blood glow-blood">в упор</span>]} lead="Полные бои без нарезок, интервью и закулисье. Следующая трансляция — у генерального партнёра лиги." crumbs={[{ name: 'Эфир', path: '/watch/' }]} compact />

      {/* Эфир / ближайшая трансляция */}
      <section className="pb-16">
        <div className="wrap grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-line">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-abyss-2 px-5 py-3">
              <span className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mute">
                <span className="h-2 w-2 rounded-full bg-blood shadow-[0_0_8px_#ff2b3a]" /> Нокаут недели · хит архива
              </span>
              <span className="mono text-[11px] text-faint">{fmtViews(top.views)} просмотров</span>
            </div>
            <VideoCard v={top} big />
          </div>
          <div className="panel flex flex-col justify-between gap-8 p-6 md:p-8">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Следующая трансляция</p>
              <p className="display t-3">{next?.title ?? 'Скоро'}</p>
              <p className="text-mute">
                {partners.general.name} — генеральный партнёр лиги. {partners.tv.name} — телевизионный партнёр. Ссылка на эфир появится здесь в день турнира.
              </p>
            </div>
            <Countdown date={next?.date ?? null} since={last?.date ?? undefined} size="md" />
            <div className="flex flex-col gap-3">
              <p className="text-[14px] text-mute">Напомнить о начале эфира:</p>
              <Subscribe id="watch-sub" />
            </div>
          </div>
        </div>
      </section>

      {/* Доступ */}
      <section className="pb-16">
        <div className="wrap grid gap-5 md:grid-cols-3">
          {[
            { t: 'Бесплатно', d: 'Полные бои прошлых турниров — в архиве и на YouTube-канале Chinuk Gym.', c: 'border-cyan/40' },
            { t: 'Прямой эфир', d: `Трансляции турниров — у партнёров лиги: ${partners.general.name}, ${partners.tv.name}.`, c: 'border-line' },
            { t: 'PPV · скоро', d: 'Платный доступ к эфиру в HD с мультикамерой и комментариями бойцов — в разработке.', c: 'border-blood/40' },
          ].map((x) => (
            <div key={x.t} className={`rounded-[var(--radius)] border ${x.c} bg-abyss-2 p-6`}>
              <p className="display-upright text-[32px] leading-none">{x.t}</p>
              <p className="mt-3 text-mute">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="display t-2">Архив</h2>
            <div className="flex flex-wrap items-center gap-6">
              <span className="label-mute">{fmtViews(totalViews)} просмотров</span>
              <Btn href={channel.videos} variant="ghost" external icon="play">
                YouTube · {channel.name}
              </Btn>
            </div>
          </div>
          <WatchHub videos={videos} events={getEvents()} />
          <p className="mt-10 text-[13px] text-faint">Субтитры включаются в плеере YouTube (кнопка CC). Видео — с официального канала Chinuk Gym.</p>
        </div>
      </section>
    </>
  );
}
