import Link from 'next/link';
import type { ReactNode } from 'react';
import { SplitTitle } from './Primitives';
import { breadcrumbs, JsonLd } from '@/lib/seo';

/** Шапка внутренней страницы: хлебные крошки, гигантский заголовок, лид, фон-глубина */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  aside,
  compact,
}: {
  eyebrow?: string;
  title: ReactNode[];
  lead?: ReactNode;
  crumbs: { name: string; path: string }[];
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden pt-[calc(var(--header-h)+48px)] ${compact ? 'pb-10' : 'pb-16 md:pb-24'}`}>
      <JsonLd data={breadcrumbs(crumbs)} />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 80% at 80% 0%, var(--deep-2) 0%, var(--deep) 25%, transparent 70%)' }} />
        <div className="godrays" />
        <div className="caustics" />
      </div>
      <div className="wrap">
        <nav aria-label="Хлебные крошки" className="mb-10">
          <ol className="mono flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint">
            <li>
              <Link href="/" className="hover:text-ice">
                Главная
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-mute">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="hover:text-ice">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className={`grid gap-10 ${aside ? 'lg:grid-cols-[1.3fr_1fr] lg:items-end' : ''}`}>
          <div>
            {eyebrow && (
              <p className="eyebrow mb-6" data-reveal="load">
                {eyebrow}
              </p>
            )}
            <SplitTitle as="h1" lines={title} className="display t-1" instant />
            {lead && (
              <p className="lead mt-8" data-reveal="load" style={{ ['--d' as string]: '.2s' }}>
                {lead}
              </p>
            )}
            {children && (
              <div className="mt-10" data-reveal="load" style={{ ['--d' as string]: '.3s' }}>
                {children}
              </div>
            )}
          </div>
          {aside && (
            <div data-reveal="load" style={{ ['--d' as string]: '.25s' }}>
              {aside}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
