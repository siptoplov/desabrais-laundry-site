/**
 * Отправка форм.
 * Если задан NEXT_PUBLIC_FORMS_ENDPOINT — POST JSON туда (Formspree, Getform, свой воркер с Telegram-ботом).
 * Если нет — форма переходит в режим «через Direct»: показывает готовый текст заявки,
 * который можно скопировать и отправить в Instagram @osminog.fight.
 */
import { site } from '@/content/site';

export type SubmitResult = { ok: true; mode: 'sent' | 'direct' } | { ok: false; error: string };

export async function submitForm(kind: string, data: Record<string, unknown>): Promise<SubmitResult> {
  // Антиспам: скрытое поле-ловушка и минимальное время заполнения
  if (data._hp) return { ok: true, mode: 'sent' };
  if (typeof data._t === 'number' && Date.now() - data._t < 2500) return { ok: false, error: 'Слишком быстро. Вы точно человек?' };
  const { _hp, _t, ...payload } = data;
  void _hp;
  void _t;

  if (!site.formsEndpoint) return { ok: true, mode: 'direct' };
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

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const phoneRe = /^\+?[\d\s()-]{9,20}$/;
export const urlRe = /^https?:\/\/\S+\.\S+/;
