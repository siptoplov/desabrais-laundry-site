/**
 * Локализация интерфейса.
 * Все UI-строки — в словарях ru.ts / en.ts. Контент (бойцы, новости) — в src/content.
 * Для английской версии: NEXT_PUBLIC_LOCALE=en и переведённый контент в src/content/en/*.
 * Ключи словаря типизированы: если в en.ts не хватает строки — TypeScript подскажет.
 */
import { ru } from './ru';
import { en } from './en';

export type Dict = typeof ru;
export type LocaleCode = 'ru' | 'en';

const dicts: Record<LocaleCode, Dict> = { ru, en };
const code = (process.env.NEXT_PUBLIC_LOCALE as LocaleCode) || 'ru';

export const locale = {
  code,
  intl: code === 'ru' ? 'ru-RU' : 'en-GB',
  html: code,
};

export const t: Dict = dicts[code] ?? ru;
