import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { NewsCard } from '@/components/ui/Cards';
import { Gallery } from '@/components/ui/Gallery';
import { VideoCard } from '@/components/ui/VideoCard';
import { Btn } from '@/components/ui/Btn';
import { LogoMark } from '@/components/brand/Logo';
import { getEvent, getNews, getVideos } from '@/lib/cms';
import { asset } from '@/lib/asset';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Медиа — новости, галереи, пресс-кит',
  description: 'Новости, интервью, закулисье, постеры и пресс-кит лиги «Осьминог»: логотипы и фото для СМИ.',
  alternates: { canonical: '/media/' },
};

const brandFiles = [
  { file: '/brand/osminog-mark.svg', name: 'Знак · полный цвет', bg: '#05070A', note: 'SVG · для тёмного фона' },
  { file: '/brand/osminog-mark-mono-white.svg', name: 'Знак · одноцветный', bg: '#0A1A2F', note: 'SVG · белый' },
  { file: '/brand/osminog-mark-black.svg', name: 'Знак · для светлого фона', bg: '#E8F1F8', note: 'SVG · чёрный' },
  { file: '/icon-512.png', name: 'Иконка', bg: '#05070A', note: 'PNG · 512×512' },
];

export default function MediaPage() {
  const news = getNews();
  const interviews = getVideos().filter((v) => v.kind !== 'fight');
  const posters = getEvent('osminog-10')?.posters ?? [];
  return (
    <>
      <PageHero eyebrow="Медиа" title={['Медиа', <span key="s" className="text-outline">и пресса</span>]} lead="Новости, интервью, закулисье, постеры и всё, что нужно журналисту — в одном месте." crumbs={[{ name: 'Медиа', path: '/media/' }]} compact>
        <div className="flex flex-wrap gap-3">
          <a href="#news" className="chip h-10 px-4 hover:text-ice">
            Новости
          </a>
          <a href="#interviews" className="chip h-10 px-4 hover:text-ice">
            Интервью и закулисье
          </a>
          <a href="#gallery" className="chip h-10 px-4 hover:text-ice">
            Галерея
          </a>
          <a href="#press-kit" className="chip h-10 px-4 hover:text-ice">
            Пресс-кит
          </a>
        </div>
      </PageHero>

      <section id="news" className="section-tight scroll-mt-20">
        <div className="wrap">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="display t-2">Новости</h2>
            <Btn href="/news/" variant="ghost">
              Все новости
            </Btn>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {news.slice(0, 5).map((n, i) => (
              <NewsCard key={n.slug} n={n} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section id="interviews" className="section-tight scroll-mt-20">
        <div className="wrap">
          <h2 className="display t-2 mb-10">Интервью и закулисье</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="section-tight scroll-mt-20">
        <div className="wrap">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="display t-2">Галерея · ОСЬМИНОГ-10</h2>
            <span className="label-mute">{posters.length} постеров</span>
          </div>
          <Gallery items={posters} />
        </div>
      </section>

      <section id="press-kit" className="section-tight scroll-mt-20 border-t border-line">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">Для журналистов</p>
            <h2 className="display t-2">Пресс-кит</h2>
            <p className="text-mute">Логотипы, постеры и фото бойцов можно использовать в материалах о лиге со ссылкой на «{site.name}». Нужны аккредитация, интервью или фото в высоком разрешении — напишите нам.</p>
            <ul className="flex flex-col gap-2 text-[14px] text-mute">
              <li>— Не искажайте пропорции и цвета знака.</li>
              <li>— Минимальное свободное поле — высота глаза осьминога.</li>
              <li>— На светлом фоне — чёрная версия знака.</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Btn href="/contacts/" variant="ghost">
                Аккредитация
              </Btn>
              <Btn href={site.socials.instagram} variant="ghost" external>
                {site.socials.instagramHandle}
              </Btn>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {brandFiles.map((b) => (
              <a key={b.file} href={asset(b.file)} download className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-line transition-colors hover:border-cyan/50">
                <div className="grid aspect-[4/3] place-items-center" style={{ background: b.bg }}>
                  {b.file.endsWith('.png') ? <img src={asset(b.file)} alt="" width={120} height={120} className="h-28 w-28" loading="lazy" /> : <img src={asset(b.file)} alt="" width={140} height={140} className="h-32 w-32 transition-transform duration-700 group-hover:rotate-[22.5deg]" loading="lazy" />}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <span>
                    <span className="block">{b.name}</span>
                    <span className="mono text-[11px] uppercase tracking-[0.12em] text-faint">{b.note}</span>
                  </span>
                  <span className="chip group-hover:text-ice">Скачать</span>
                </div>
              </a>
            ))}
            <div className="flex items-center gap-4 rounded-[var(--radius)] border border-line p-5 sm:col-span-2">
              <LogoMark className="h-14 w-14 shrink-0" />
              <div>
                <p className="display-upright text-[24px]">Цвета бренда</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
                  {[
                    ['Бездна', '#05070A'],
                    ['Глубина', '#0A1A2F'],
                    ['Кровь', '#FF2B3A'],
                    ['Биолюминесценция', '#00E5FF'],
                    ['Холодный белый', '#E8F1F8'],
                  ].map(([n, c]) => (
                    <span key={c} className="mono flex items-center gap-2 text-mute">
                      <span className="h-4 w-4 rounded-sm border border-line" style={{ background: c }} />
                      {n} {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
