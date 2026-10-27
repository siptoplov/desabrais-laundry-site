// PNG 300 dpi с прозрачным фоном — для DTF и проверки у печатника
import { chromium } from 'playwright';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = resolve(process.argv[2] ?? fileURLToPath(new URL('.', import.meta.url)));
const b = await chromium.launch();
for (const f of readdirSync(dir + '/print').filter((f) => f.endsWith('.svg'))) {
  const svg = readFileSync(`${dir}/print/${f}`, 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  // 01-znak используется максимум 15 см (шорты) — экспортируем в этом размере
  const scale = f.startsWith('01-znak') ? 150 / w : 1;
  const W = Math.round((w * scale / 25.4) * 300), H = Math.round((h * scale / 25.4) * 300);
  writeFileSync(`${dir}/tmp.html`, `<body style="margin:0;background:transparent"><img src="print/${f}" style="display:block;width:${W}px;height:${H}px"></body>`);
  // большие кадры в программном рендере иногда не снимаются с первого раза — до трёх попыток
  for (let attempt = 1; ; attempt++) {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    try {
      await p.goto(`file://${dir}/tmp.html`); await p.waitForTimeout(150);
      await p.screenshot({ path: `${dir}/png/${f.replace('.svg', '_300dpi.png')}`, omitBackground: true });
      break;
    } catch (e) {
      if (attempt === 3) throw e;
    } finally {
      await p.close();
    }
  }
  console.log(f, W + 'x' + H);
}
await b.close();
rmSync(`${dir}/tmp.html`, { force: true });
