import Link from 'next/link';
import type { ReactNode } from 'react';

export function Arrow({ className = 'btn-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function PlayIcon({ className = 'btn-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  );
}

type Props = {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'sm';
  impact?: boolean;
  icon?: 'arrow' | 'play' | 'none';
  external?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
};

/**
 * Кнопка лиги: магнитная (см. Cursor), заливка «чернилами» из точки входа курсора,
 * щупальца на углах (CSS ::after в globals.css). impact — «удар» по клику (клякса + тряска + звук).
 */
export function Btn({ children, href, variant = 'primary', size = 'md', impact, icon = 'arrow', external, className = '', onClick, type = 'button', disabled, ariaLabel }: Props) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {icon === 'arrow' && <Arrow />}
      {icon === 'play' && <PlayIcon />}
    </>
  );
  const data = impact ? { 'data-impact': variant === 'primary' ? 'dark' : 'light' } : {};
  if (href) {
    if (external || href.startsWith('http')) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} {...data}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-label={ariaLabel} {...data}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel} {...data}>
      {inner}
    </button>
  );
}
