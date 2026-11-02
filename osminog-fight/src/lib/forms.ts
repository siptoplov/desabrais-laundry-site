/**
 * Отправка форм.
 * 1. NEXT_PUBLIC_FORMS_ENDPOINT задан — POST JSON туда (Formspree, свой воркер с Telegram-ботом).
 * 2. Иначе — Netlify Forms: все формы сайта уходят в одну форму «zayavka» (каркас — public/__forms.html),
 *    спам режут Akismet и поле-ловушка _hp. Заявки — в панели Netlify → Forms, оттуда письмо на почту.
 * 3. Если отправить не вышло (локальная разработка, форма не подключена) — режим «через Direct»:
 *    готовый текст заявки, который можно скопировать и отправить в Instagram @osminog.fight.
 * Антиспам до отправки: ловушка _hp и минимальное время заполнения формы.
 */
import { site } from '@/content/site';

export type SubmitResult = { ok: true; mode: 'sent' | 'direct' } | { ok: false; error: string };

/** Поля, которые Netlify хранит отдельно; всё остальное — одним текстом в details */
const NETLIFY_FIELDS = ['name', 'email', 'phone'] as const;

export async function submitForm(kind: string, data: Record<string, unknown>): Promise<SubmitResult> {
  if (data._hp) return { ok: true, mode: 'sent' };
  if (typeof data._t === 'number' && Date.now() - data._t < 2500) return { ok: false, error: 'Слишком быстро. Вы точно человек?' };
  const { _hp, _t, ...payload } = data;
  void _hp;
  void _t;

  if (site.formsEndpoint) {
    try {
      const res = await fetch(site.formsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: kind, ...payload, page: location.href }),
      });
      if (!res.ok) throw new Error(String(res.status));
      return { ok: true, mode: 'sent' };
    } catch {
      return { ok: false, error: 'network' };
    }
  }

  // Netlify Forms
  const body = new URLSearchParams({ 'form-name': 'zayavka', subject: `Осьминог: ${kind}`, kind, _hp: '', page: location.href });
  const rest: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    const val = String(v ?? '').slice(0, 2000);
    if (!val) continue;
    if ((NETLIFY_FIELDS as readonly string[]).includes(k)) body.set(k, val);
    else if (k === 'contact' && /@/.test(val)) body.set('email', val);
    else if (k === 'contact') body.set('phone', val);
    else rest.push(`${k}: ${val}`);
  }
  if (rest.length) body.set('details', rest.join('\n'));
  try {
    const res = await fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    if (!res.ok) throw new Error(String(res.status));
    return { ok: true, mode: 'sent' };
  } catch {
    return { ok: true, mode: 'direct' };
  }
}

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const phoneRe = /^\+?[\d\s()-]{9,20}$/;
export const urlRe = /^https?:\/\/\S+\.\S+/;
