/**
 * Спонсоры лиги — страница /sponsors/.
 * Чтобы добавить спонсора, впишите его в список `sponsors`:
 *   name — название; tier — уровень (см. sponsorTiers);
 *   logo — логотип в public/img/sponsors/ (SVG или PNG на прозрачном фоне), без него выводится название;
 *   url — сайт спонсора; text — одна строка о роли («Спонсор главного боя», «Официальная вода лиги»).
 * Пока список пуст, страница показывает свободные места, не попадает в меню и карту сайта
 * и закрыта от индексации. С первым спонсором всё это включится само.
 */
export type SponsorTier = 'general' | 'official' | 'supporting';

export interface Sponsor {
  name: string;
  tier: SponsorTier;
  logo?: string;
  url?: string;
  text?: string;
}

/** Уровни по порядку на странице; slots — сколько мест показывать, пока они не заняты */
export const sponsorTiers: { tier: SponsorTier; label: string; one: string; text: string; slots: number }[] = [
  { tier: 'general', label: 'Генеральный спонсор', one: 'Генеральный спонсор', text: 'Имя в названии вечера, центр ринга, эфир и вся рекламная кампания турнира.', slots: 1 },
  { tier: 'official', label: 'Официальные спонсоры', one: 'Официальный спонсор', text: 'Брендинг ринга и зала, постеры, видео боёв и анонсы в соцсетях лиги.', slots: 3 },
  { tier: 'supporting', label: 'Спонсоры', one: 'Спонсор', text: 'Логотип на сайте, в программе вечера и на экранах зала.', slots: 4 },
];

export const sponsors: Sponsor[] = [
  // { name: 'Название', tier: 'general', logo: '/img/sponsors/name.svg', url: 'https://…', text: 'Генеральный спонсор ОСЬМИНОГ-11' },
];

export const sponsorsReady = sponsors.length > 0;
