/**
 * Генератор OG-картинок (1200×630) для соцсетей: общая, по турнирам и по бойцам.
 * Рендерит HTML-шаблоны в headless Chromium (Playwright) и кладёт JPG в public/og/.
 * Запуск: npm run og   (нужен установленный playwright: npx playwright install chromium)
 * Данные берутся из собранного сайта (out/og-data.json, создаётся при build) или из src/content через tsx.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(root, 'scripts/og-data.json'), 'utf8'));
const f = (p) => pathToFileURL(resolve(root, p)).href;
const font = (n) => f(`src/fonts/${n}`);

const css = `
@font-face{font-family:D;src:url(${font('sofia-sans-extra-condensed-cyrillic-wght-italic.woff2')});font-style:italic;font-weight:100 1000;unicode-range:U+0400-045F}
@font-face{font-family:D;src:url(${font('sofia-sans-extra-condensed-latin-wght-italic.woff2')});font-style:italic;font-weight:100 1000}
@font-face{font-family:DU;src:url(${font('sofia-sans-extra-condensed-cyrillic-wght-normal.woff2')});font-weight:100 1000;unicode-range:U+0400-045F}
@font-face{font-family:DU;src:url(${font('sofia-sans-extra-condensed-latin-wght-normal.woff2')});font-weight:100 1000}
@font-face{font-family:M;src:url(${font('jetbrains-mono-latin-wght-normal.woff2')})}
@font-face{font-family:M;src:url(${font('jetbrains-mono-cyrillic-wght-normal.woff2')});unicode-range:U+0400-045F}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(80% 90% at 75% 20%,#0e2440,#0a1a2f 35%,#05070a 75%);color:#e8f1f8;font-family:DU,sans-serif;position:relative}
.d{font-family:D;font-style:italic;font-weight:900;text-transform:uppercase;line-height:.82}
.u{font-family:DU;font-weight:860;text-transform:uppercase;line-height:.9}
.m{font-family:M;font-size:18px;letter-spacing:.24em;text-transform:uppercase;color:#00e5ff}
.logo{position:absolute;left:56px;top:48px;display:flex;align-items:center;gap:16px}
.logo img{width:64px;height:64px}
.bar{position:absolute;left:0;right:0;bottom:0;height:8px;background:linear-gradient(90deg,#ff2b3a,#ff2b3a 50%,#00e5ff 50%)}
.rays{position:absolute;inset:0;background:linear-gradient(100deg,transparent 40%,rgba(0,229,255,.08) 45%,transparent 52%),linear-gradient(80deg,transparent 58%,rgba(232,241,248,.06) 62%,transparent 68%)}
`;
const logo = `<div class="logo"><img src="${f('public/brand/osminog-mark.svg')}"><div><div class="d" style="font-size:40px">Осьминог</div><div class="m" style="font-size:12px;color:rgba(232,241,248,.6)">Fight League · с 2009</div></div></div>`;

const pages = [];
pages.push({
  out: 'public/og/default.jpg',
  html: `<div class="rays"></div>${logo}
  <img src="${f('public/brand/osminog-mark.svg')}" style="position:absolute;right:-150px;top:30px;width:560px;opacity:.85;filter:drop-shadow(0 0 60px rgba(0,229,255,.35))">
  <div style="position:absolute;left:56px;bottom:84px"><div class="m">Belarusian Fight League · Минск</div><div class="d" style="font-size:190px;margin-top:14px">Осьминог</div><div class="u" style="font-size:54px;margin-top:10px">Восемь ударов. <span style="color:#ff2b3a">Одна победа.</span></div></div><div class="bar"></div>`,
});
for (const e of data.events) {
  const img = e.poster ? `<img src="${f(`public${e.poster}-1080.webp`)}" style="position:absolute;right:56px;top:40px;height:550px;border-radius:6px;box-shadow:0 30px 80px rgba(0,0,0,.6)">` : '';
  pages.push({
    out: `public/og/events/${e.slug}.jpg`,
    html: `<div class="rays"></div>${logo}${img}<div style="position:absolute;left:56px;bottom:84px;max-width:${img ? 640 : 1080}px"><div class="m">${e.when}</div><div class="d" style="font-size:${img ? 118 : 150}px;margin-top:14px">${e.title}</div>${e.collab ? `<div class="u" style="font-size:56px;color:#00e5ff">${e.collab}</div>` : ''}<div class="u" style="font-size:30px;margin-top:14px;color:rgba(232,241,248,.75)">${e.place}</div></div><div class="bar"></div>`,
  });
}
for (const x of data.fighters) {
  pages.push({
    out: `public/og/fighters/${x.slug}.jpg`,
    html: `<div class="rays"></div><img src="${f(`public${x.photo}.webp`)}" style="position:absolute;right:0;top:0;height:630px;width:600px;object-fit:cover;object-position:50% 15%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 30%)">
    <div style="position:absolute;inset:0;background:radial-gradient(50% 60% at 100% 30%,rgba(0,229,255,.25),transparent 70%)"></div>${logo}
    <div style="position:absolute;left:56px;bottom:84px"><div class="m">${x.meta}</div><div class="d" style="font-size:56px;margin-top:14px;color:rgba(232,241,248,.7)">${x.first}</div><div class="d" style="font-size:150px">${x.last}</div><div class="u" style="font-size:48px;margin-top:8px">Рекорд <span style="color:#ff2b3a">${x.record}</span></div></div><div class="bar"></div>`,
  });
}

const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const pg of pages) {
  const dir = dirname(resolve(root, pg.out));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  // file:// страница может читать локальные шрифты и фото (setContent — нет)
  const tmp = resolve(tmpdir(), `osm-og-${process.pid}.html`);
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${pg.html}</body></html>`);
  await p.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  rmSync(tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: resolve(root, pg.out), type: 'jpeg', quality: 86 });
  console.log('✓', pg.out);
}
await b.close();
