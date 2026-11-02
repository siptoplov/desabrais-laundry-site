import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Ссылка без предзагрузки: Next.js по умолчанию заранее качает данные каждой страницы,
 * на которую есть ссылка в видимой части экрана. Для статического сайта на Netlify это
 * сотни лишних запросов и мегабайты трафика на посетителя (а трафик и запросы стоят кредитов).
 * Переход всё равно мгновенный: страница грузится при клике.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
