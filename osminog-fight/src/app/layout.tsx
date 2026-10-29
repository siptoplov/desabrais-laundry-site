import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVars } from './fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomBar } from '@/components/layout/BottomBar';
import { Preloader } from '@/components/fx/Preloader';
import { Cursor } from '@/components/fx/Cursor';
import { SmoothScroll } from '@/components/fx/SmoothScroll';
import { EdgeTentacles } from '@/components/fx/EdgeTentacles';
import { Observers } from '@/components/fx/Observers';
import { Atmosphere } from '@/components/fx/Atmosphere';
import { LogoSprite } from '@/components/brand/Logo';
import { site } from '@/content/site';
import { getUpcoming } from '@/lib/cms';
import { orgJsonLd } from '@/lib/seo';
import { asset } from '@/lib/asset';
import { locale, t } from '@/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.slogan}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.nameLatin,
  keywords: ['Осьминог', 'Octopus Fight', 'кикбоксинг', 'К-1', 'муай-тай', 'ММА', 'бокс', 'турнир', 'Минск', 'Prime Hall', 'бои', 'билеты'],
  openGraph: {
    type: 'website',
    siteName: site.nameLatin,
    locale: 'ru_RU',
    title: `${site.name} — ${site.slogan}`,
    description: site.description,
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: [{ url: asset('/favicon.svg'), type: 'image/svg+xml' }, { url: asset('/icon-192.png'), sizes: '192x192' }], apple: asset('/apple-touch-icon.png') },
  manifest: asset('/manifest.webmanifest'),
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#060607',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Скрипт до отрисовки: включает JS-режим, решает, показывать ли прелоадер,
 * и включает Fight Night в день турнира (или по выбору зрителя).
 */
function headScript(fightDay: string | null) {
  return `(function(){try{var d=document.documentElement;d.classList.add('js');
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm||sessionStorage.getItem('osm:intro')==='1'){d.classList.add('no-intro')}else{d.classList.add('is-loading')}
var m=JSON.parse(localStorage.getItem('osm:mode')||'"auto"');
var fd=${JSON.stringify(fightDay)};
var today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Minsk'}).format(new Date());
if(m==='fight-night'||(m==='auto'&&fd===today)){d.dataset.mode='fight-night'}
}catch(e){}})();`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const next = getUpcoming();
  const fightDay = next?.date ? next.date.slice(0, 10) : null;
  return (
    <html lang={locale.html} className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript(fightDay) }} />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }} />
      </head>
      <body>
        <LogoSprite />
        <a href="#main" className="skip-link">
          {t.skip}
        </a>
        <Preloader />
        <Header />
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          {children}
        </main>
        <Footer />
        <BottomBar />
        <EdgeTentacles />
        <Atmosphere />
        <Cursor />
        <SmoothScroll />
        <Observers />
      </body>
    </html>
  );
}
