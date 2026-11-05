/**
 * Отправка заявок: multipart POST на /api/apply.php (PHP на хостинге или функция Netlify) → Telegram-бот → группа организаторов.
 * Если функция не настроена (503), недоступна (локальная разработка, сеть) — режим «через Direct»:
 * готовый текст заявки, который можно скопировать и отправить в Instagram.
 * Защита на клиенте: ловушка _hp, время заполнения, Turnstile (если задан ключ). Остальное проверяет сервер.
 */

export type SubmitResult =
  | { ok: true; mode: "sent" | "direct" }
  | { ok: false; error: string };

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export { phoneOk } from './phone';
export const urlRe = /^https?:\/\/\S+\.\S+/;

const ERRORS: Record<string, string> = {
  rate: "Слишком много заявок с этого адреса. Попробуйте через 10 минут.",
  timing: "Слишком быстро. Проверьте данные и отправьте ещё раз.",
  captcha:
    "Не прошла проверка «я не робот». Обновите страницу и попробуйте снова.",
  consent: "Нужно согласие на обработку данных.",
  eligible: "Участвовать могут только те, кто подтвердил условия.",
  age18: "Участие — только с 18 лет.",
  age: "Проверьте возраст.",
  phone: "Проверьте номер телефона.",
  email: "Проверьте e-mail.",
  video: "Ссылка на видео должна начинаться с https://",
  contact: "Укажите телефон, e-mail или ник в Telegram.",
  photo_required: "Добавьте фото.",
  photo_large: "Фото слишком большое.",
  photo_type: "Фото должно быть в формате JPG, PNG или WebP.",
  required: "Заполните все обязательные поля.",
  spam: "В сообщении слишком много ссылок.",
  too_large: "Файл слишком большой.",
};

/** Уменьшаем фото до 1600 px и пережимаем в JPEG, чтобы заявка быстро уходила с телефона */
export async function shrinkPhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error("photo_type");
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) =>
      c.toBlob(r, "image/jpeg", 0.85),
    );
    if (blob && blob.size < file.size)
      return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {}
  if (file.size > 3_400_000) throw new Error("photo_large");
  return file;
}

export async function submitForm(
  kind: string,
  values: Record<string, string>,
  photo: File | null,
  meta: { hp: string; t: number; token?: string },
): Promise<SubmitResult> {
  if (meta.hp) return { ok: true, mode: "sent" };
  if (Date.now() - meta.t < 2500) return { ok: false, error: ERRORS.timing };
  const fd = new FormData();
  fd.set("kind", kind);
  fd.set("page", location.pathname);
  fd.set("_hp", "");
  fd.set("_t", String(meta.t));
  if (meta.token) fd.set("cf-turnstile-response", meta.token);
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  if (photo) fd.set("photo", photo);
  try {
    const res = await fetch("/api/apply.php", { method: "POST", body: fd });
    if (res.ok) return { ok: true, mode: "sent" };
    if (
      res.status === 503 ||
      res.status === 404 ||
      res.status === 502 ||
      res.status >= 500
    )
      return { ok: true, mode: "direct" };
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    return {
      ok: false,
      error:
        ERRORS[d.error ?? ""] ??
        "Не удалось отправить. Проверьте поля и попробуйте ещё раз.",
    };
  } catch {
    return { ok: true, mode: "direct" };
  }
}
