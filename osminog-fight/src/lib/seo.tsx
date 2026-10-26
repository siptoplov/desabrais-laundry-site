/** Структурированные данные schema.org: Organization, SportsEvent, Person, BreadcrumbList */
import type { FightEvent, Fighter, NewsItem } from '@/content/types';
import { site } from '@/content/site';
import { fullName, resolveCorner } from './cms';

const abs = (p: string) => `${site.url}${p}`;

export function orgJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: site.nameLatin,
    alternateName: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: abs('/brand/osminog-mark.svg'),
    foundingDate: String(site.since),
    sport: ['Kickboxing', 'Muay Thai', 'Boxing', 'Mixed Martial Arts'],
    address: { '@type': 'PostalAddress', addressLocality: 'Минск', addressCountry: 'BY' },
    sameAs: [site.socials.instagram, site.socials.youtube].filter(Boolean),
  };
}

export function eventJsonLd(e: FightEvent) {
  const performers = e.bouts.flatMap((b) => [b.red, b.blue]).map((c) => resolveCorner(c).name);
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${e.title}${e.collab ? ' ' + e.collab : ''}`,
    description: e.tagline,
    ...(e.date ? { startDate: e.date } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'Kickboxing',
    url: abs(`/events/${e.slug}/`),
    image: e.poster ? [abs(`${e.poster}-1080.webp`)] : [abs('/og/default.jpg')],
    location: {
      '@type': 'Place',
      name: e.venue ?? e.city,
      address: { '@type': 'PostalAddress', streetAddress: e.address, addressLocality: e.city, addressCountry: 'BY' },
    },
    organizer: { '@type': 'Organization', name: site.legalName, url: site.url },
    ...(performers.length ? { performer: performers.map((name) => ({ '@type': 'Person', name })) } : {}),
    ...(e.tickets?.from
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: e.tickets.currency,
            lowPrice: e.tickets.from,
            highPrice: e.tickets.to,
            url: e.tickets.url ?? abs('/tickets/'),
            availability: e.tickets.status === 'onsale' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          },
        }
      : {}),
  };
}

export function personJsonLd(f: Fighter) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName(f),
    ...(f.nickname ? { alternateName: f.nickname } : {}),
    nationality: f.country,
    ...(f.heightCm ? { height: { '@type': 'QuantitativeValue', value: f.heightCm, unitCode: 'CMT' } } : {}),
    ...(f.photo ? { image: abs(`${f.photo}.webp`) } : {}),
    url: abs(`/fighters/${f.slug}/`),
    memberOf: { '@type': 'SportsOrganization', name: site.nameLatin },
    ...(f.titles?.length ? { award: f.titles } : {}),
  };
}

export function newsJsonLd(n: NewsItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.title,
    description: n.lead,
    datePublished: n.date,
    ...(n.image ? { image: [abs(`${n.image}-1080.webp`)] } : {}),
    publisher: { '@type': 'Organization', name: site.nameLatin, logo: { '@type': 'ImageObject', url: abs('/brand/osminog-mark.svg') } },
    mainEntityOfPage: abs(`/news/${n.slug}/`),
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Главная', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
