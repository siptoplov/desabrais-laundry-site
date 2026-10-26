/**
 * Шрифты: Sofia Sans Extra Condensed (заголовки), Manrope (текст), JetBrains Mono (цифры).
 * Каждый шрифт разбит на кириллицу и латиницу (unicode-range) — браузер качает только нужное.
 * (next/font требует литералы прямо в вызове — поэтому unicode-range повторяется.)
 * Кириллица заголовков и текста предзагружается: заголовки не «прыгают» при загрузке (CLS).
 */
import localFont from 'next/font/local';

export const displayCyr = localFont({
  src: [
    { path: '../fonts/sofia-sans-extra-condensed-cyrillic-wght-normal.woff2', weight: '100 1000', style: 'normal' },
    { path: '../fonts/sofia-sans-extra-condensed-cyrillic-wght-italic.woff2', weight: '100 1000', style: 'italic' },
  ],
  variable: '--f-display-cyr',
  declarations: [{ prop: 'unicode-range', value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' }],
  adjustFontFallback: false,
  fallback: [],
  preload: true,
});
export const displayLat = localFont({
  src: [
    { path: '../fonts/sofia-sans-extra-condensed-latin-wght-normal.woff2', weight: '100 1000', style: 'normal' },
    { path: '../fonts/sofia-sans-extra-condensed-latin-wght-italic.woff2', weight: '100 1000', style: 'italic' },
  ],
  variable: '--f-display-lat',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
  adjustFontFallback: 'Arial',
  preload: false,
});
export const sansCyr = localFont({
  src: [{ path: '../fonts/manrope-cyrillic-wght-normal.woff2', weight: '200 800', style: 'normal' }],
  variable: '--f-sans-cyr',
  declarations: [{ prop: 'unicode-range', value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' }],
  adjustFontFallback: false,
  fallback: [],
  preload: true,
});
export const sansLat = localFont({
  src: [{ path: '../fonts/manrope-latin-wght-normal.woff2', weight: '200 800', style: 'normal' }],
  variable: '--f-sans-lat',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
  adjustFontFallback: 'Arial',
  preload: false,
});
export const monoCyr = localFont({
  src: [{ path: '../fonts/jetbrains-mono-cyrillic-wght-normal.woff2', weight: '100 800', style: 'normal' }],
  variable: '--f-mono-cyr',
  declarations: [{ prop: 'unicode-range', value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' }],
  adjustFontFallback: false,
  fallback: [],
  preload: false,
});
export const monoLat = localFont({
  src: [{ path: '../fonts/jetbrains-mono-latin-wght-normal.woff2', weight: '100 800', style: 'normal' }],
  variable: '--f-mono-lat',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'monospace'],
  preload: false,
});

export const fontVars = [displayCyr, displayLat, sansCyr, sansLat, monoCyr, monoLat].map((f) => f.variable).join(' ');
