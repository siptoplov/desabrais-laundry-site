/**
 * Приём заявок с сайта → Telegram-группа.
 *
 *   POST /api/apply  (multipart/form-data)
 *
 * Переменные окружения (Netlify → Project configuration → Environment variables):
 *   TG_BOT_TOKEN          — токен бота от @BotFather (секрет)
 *   TG_CHAT_ID            — id группы (отрицательное число, например -1001234567890)
 *   TG_THREAD_FIGHTER, TG_THREAD_PARTNER, TG_THREAD_RUBAHA, TG_THREAD_OTHER
 *                         — необязательно: id тем (topics), если группа — форум
 *   TURNSTILE_SECRET      — необязательно: секрет Cloudflare Turnstile (капча)
 *   ALLOWED_ORIGINS       — необязательно: дополнительные домены через запятую
 *
 * Защита: только POST, проверка Origin, поле-ловушка, время заполнения, Turnstile (если включён),
 * белый список полей и длин, проверка фото по сигнатуре файла, лимит частоты на IP, дубли.
 * Без токена бота функция отвечает 503 — сайт тогда показывает запасной вариант (текст для Direct).
 */

type Kind = 'fighter' | 'partner' | 'rubaha' | 'contact' | 'merch';

interface Spec {
  title: string;
  tag: string;
  thread?: string;
  /** name → [подпись, макс. длина, обязательное] */
  fields: Record<string, [string, number, boolean]>;
  photo?: boolean;
}

const SPECS: Record<Kind, Spec> = {
  fighter: {
    title: '🥊 Заявка бойца',
    tag: '#боец',
    thread: 'TG_THREAD_FIGHTER',
    photo: true,
    fields: {
      name: ['Имя и фамилия', 120, true],
      city: ['Страна, город', 120, true],
      discipline: ['Дисциплина', 40, true],
      weight: ['Вес, кг', 10, true],
      record: ['Профессиональный рекорд', 40, true],
      amateur: ['Любительские бои', 300, true],
      titles: ['Регалии', 1200, true],
      video: ['Видео боёв', 400, true],
      phone: ['Телефон', 40, true],
      telegram: ['Telegram / Instagram', 80, false],
      email: ['E-mail', 120, false],
      coach: ['Тренер / менеджер', 160, false],
    },
  },
  partner: {
    title: '🤝 Заявка партнёра',
    tag: '#партнёр',
    thread: 'TG_THREAD_PARTNER',
    fields: {
      name: ['Компания или имя', 160, true],
      contact: ['Контакты', 160, true],
      message: ['Сообщение', 1500, false],
    },
  },
  rubaha: {
    title: '👕 Рубаха-парень',
    tag: '#рубаха',
    thread: 'TG_THREAD_RUBAHA',
    fields: {
      name: ['Имя и фамилия', 120, true],
      age: ['Возраст', 3, true],
      weight: ['Вес, кг', 10, true],
      profession: ['Профессия', 120, true],
      training: ['Спорт', 80, true],
      phone: ['Телефон', 40, true],
      telegram: ['Telegram / Instagram', 80, false],
      bio: ['Биография', 1500, true],
    },
  },
  contact: {
    title: '✉️ Вопрос с сайта',
    tag: '#вопрос',
    thread: 'TG_THREAD_OTHER',
    fields: { name: ['Имя', 120, true], contact: ['Контакты', 160, true], subject: ['Тема', 160, false], message: ['Сообщение', 2000, true] },
  },
  merch: {
    title: '🛍 Предзаказ мерча',
    tag: '#мерч',
    thread: 'TG_THREAD_OTHER',
    fields: { name: ['Имя', 120, true], phone: ['Телефон', 40, true], email: ['E-mail', 120, false], items: ['Состав заказа', 1500, false] },
  },
};

const MAX_BODY = 4_500_000;
const MAX_PHOTO = 3_500_000;
const WINDOW_MS = 10 * 60_000;
const LIMIT = 4;

const hits = new Map<string, number[]>();
const seen = new Map<string, number>();

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (s: string, max: number) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f​-‏‪-‮]/g, '').trim().slice(0, max);

function allowedOrigin(origin: string | null, req: Request): boolean {
  const extra = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const hosts = ['osminog-fight.netlify.app', ...extra];
  const host = (v: string) => {
    try {
      return new URL(v).hostname;
    } catch {
      return '';
    }
  };
  const h = host(origin ?? req.headers.get('referer') ?? '');
  if (!h) return false;
  return hosts.includes(h) || h.endsWith('--osminog-fight.netlify.app') || h === 'localhost';
}

function photoKind(b: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  return null;
}

const urlOk = (v: string) => /^https?:\/\/[^\s]+\.[^\s]{2,}$/i.test(v);
const phoneOk = (v: string) => /^\+?[\d\s()\-]{7,25}$/.test(v) && v.replace(/\D/g, '').length >= 7;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

async function turnstileOk(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: token, remoteip: ip }) });
    const d = (await r.json()) as { success?: boolean };
    return !!d.success;
  } catch {
    return false;
  }
}

async function tg(method: string, body: FormData | Record<string, unknown>): Promise<boolean> {
  const token = process.env.TG_BOT_TOKEN;
  const init: RequestInit = body instanceof FormData ? { method: 'POST', body } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, init);
    return r.ok;
  } catch {
    return false;
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  if (!process.env.TG_BOT_TOKEN || !process.env.TG_CHAT_ID) return json(503, { error: 'not_configured' });
  if (!allowedOrigin(req.headers.get('origin'), req)) return json(403, { error: 'origin' });
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_BODY) return json(413, { error: 'too_large' });

  const ip = (req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return json(429, { error: 'rate' });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: 'bad_form' });
  }

  // ловушка для ботов: отвечаем «успехом», ничего не отправляя
  if (String(form.get('_hp') ?? '').trim()) return json(200, { ok: true });
  const started = Number(form.get('_t') ?? 0);
  if (!started || now - started < 3000 || now - started > 24 * 3600_000) return json(400, { error: 'timing' });
  if (!(await turnstileOk(String(form.get('cf-turnstile-response') ?? ''), ip))) return json(400, { error: 'captcha' });

  const kind = String(form.get('kind') ?? '') as Kind;
  const spec = SPECS[kind];
  if (!spec) return json(400, { error: 'kind' });
  if (form.get('consent') !== 'yes') return json(400, { error: 'consent' });

  const values: Record<string, string> = {};
  for (const [key, [, max, required]] of Object.entries(spec.fields)) {
    const v = clean(String(form.get(key) ?? ''), max);
    if (required && !v) return json(400, { error: 'required', field: key });
    values[key] = v;
  }
  if (values.video && !urlOk(values.video)) return json(400, { error: 'video' });
  if (values.phone && !phoneOk(values.phone)) return json(400, { error: 'phone' });
  if (values.email && !emailOk(values.email)) return json(400, { error: 'email' });
  if (values.age) {
    const a = Number(values.age);
    if (!Number.isFinite(a) || a < 16 || a > 70) return json(400, { error: 'age' });
    if (kind === 'rubaha' && a < 18) return json(400, { error: 'age18' });
  }
  if (kind === 'rubaha' && form.get('eligible') !== 'yes') return json(400, { error: 'eligible' });
  if (values.contact && !(phoneOk(values.contact) || emailOk(values.contact) || /^@?[\w.]{3,}$/.test(values.contact) || /t\.me\//.test(values.contact))) return json(400, { error: 'contact' });
  if (values.message && /https?:\/\/\S+/i.test(values.message) && (values.message.match(/https?:\/\//gi) ?? []).length > 3) return json(400, { error: 'spam' });

  let photo: { bytes: Uint8Array; type: 'jpg' | 'png' | 'webp' } | null = null;
  const file = form.get('photo');
  if (spec.photo) {
    if (!(file instanceof File) || file.size === 0) return json(400, { error: 'photo_required' });
    if (file.size > MAX_PHOTO) return json(413, { error: 'photo_large' });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = photoKind(bytes);
    if (!type) return json(400, { error: 'photo_type' });
    photo = { bytes, type };
  }

  // дубли: одинаковая заявка не чаще раза в 30 минут
  const sig = kind + '|' + Object.values(values).join('|');
  const prev = seen.get(sig);
  if (prev && now - prev < 30 * 60_000) return json(200, { ok: true });
  for (const [k, t] of seen) if (now - t > 3600_000) seen.delete(k);

  const lines = Object.entries(spec.fields)
    .filter(([k]) => values[k])
    .map(([k, [label]]) => `<b>${esc(label)}:</b> ${esc(values[k])}`);
  if (kind === 'rubaha') lines.push('<i>Подтвердил: 18+, не профессионал в единоборствах, не выступает</i>');
  const page = clean(String(form.get('page') ?? ''), 200);
  const text = `${spec.title} ${spec.tag}\n\n${lines.join('\n')}${page ? `\n\n<i>${esc(page)}</i>` : ''}`.slice(0, 4000);
  const thread = spec.thread ? process.env[spec.thread] ?? process.env.TG_THREAD_OTHER : undefined;
  const base: Record<string, unknown> = { chat_id: process.env.TG_CHAT_ID, ...(thread ? { message_thread_id: Number(thread) } : {}) };

  const sent = await tg('sendMessage', { ...base, text, parse_mode: 'HTML', disable_web_page_preview: true });
  if (!sent) return json(502, { error: 'telegram' });
  seen.set(sig, now);
  recent.push(now);
  hits.set(ip, recent);
  if (photo) {
    const fd = new FormData();
    fd.set('chat_id', String(process.env.TG_CHAT_ID));
    if (thread) fd.set('message_thread_id', String(thread));
    fd.set('caption', `Фото: ${values.name}`);
    fd.set('photo', new Blob([photo.bytes], { type: photo.type === 'jpg' ? 'image/jpeg' : `image/${photo.type}` }), `${kind}.${photo.type}`);
    await tg('sendPhoto', fd);
  }
  console.log(`apply ok kind=${kind}`);
  return json(200, { ok: true });
};

export const config = { path: '/api/apply.php' };
