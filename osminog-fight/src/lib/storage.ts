/**
 * Безопасная работа с localStorage: в приватном режиме или превью он может быть недоступен.
 * Используется для удобств конкретного зрителя: избранное, прогнозы, звук, выбранные места.
 */
'use client';

const PREFIX = 'osm:';

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('osm:storage', { detail: key }));
  } catch {
    /* хранилище недоступно — молча продолжаем */
  }
}
