import type { CSSProperties } from 'react';
import { logoCollar, logoEyes, logoFrame, logoHead, logoTentacles } from './logoPaths';

/**
 * Спрайт знака: геометрия логотипа один раз в документе (<symbol>), дальше — <use>.
 * Экономит ~7 КБ HTML на каждое появление знака. Подключается в layout.
 */
export function LogoSprite() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <symbol id="osm-frame" viewBox="0 0 400 400">
          <g fill="none" stroke="currentColor" strokeWidth="20" strokeLinejoin="miter">
            {logoFrame.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </symbol>
        <symbol id="osm-body" viewBox="0 0 400 400">
          <g fill="currentColor">
            {logoTentacles.map((d, i) => (
              <path key={i} d={d} />
            ))}
            <path d={logoCollar} />
            <path d={logoHead} />
          </g>
          <g style={{ fill: 'var(--osm-eye, #FF2B3A)' }}>
            {logoEyes.map((e, i) => (
              <ellipse key={i} cx={e.cx} cy={e.cy} rx="15" ry="7" transform={`rotate(${e.rot} ${e.cx} ${e.cy})`} />
            ))}
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

type MarkProps = {
  className?: string;
  /** mono — одноцветная версия (без красных глаз) */
  mono?: boolean;
  color?: string;
  eyes?: string;
  title?: string;
  frame?: boolean;
  /** Полная inline-геометрия с data-атрибутами (нужна прелоадеру для анимации частей) */
  animated?: boolean;
};

/** Знак: октагон-ринг + осьминог. */
export function LogoMark({ className, mono, color = 'currentColor', eyes = '#FF2B3A', title = 'Осьминог', frame = true, animated }: MarkProps) {
  if (!animated) {
    const style = { color, ['--osm-eye' as string]: mono ? 'var(--abyss, #060607)' : eyes } as CSSProperties;
    return (
      <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title} style={style}>
        {frame && <use href="#osm-frame" />}
        <use href="#osm-body" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title} fill="none">
      {frame && (
        <g data-part="frame" stroke={color} strokeWidth="20" strokeLinejoin="miter">
          {logoFrame.map((d, i) => (
            <path key={i} d={d} data-seg={i} />
          ))}
        </g>
      )}
      <g data-part="body" fill={color}>
        <g data-part="tentacles">
          {logoTentacles.map((d, i) => (
            <path key={i} d={d} data-t={i} />
          ))}
        </g>
        <path d={logoCollar} />
        <path d={logoHead} data-part="head" />
      </g>
      <g data-part="eyes" fill={mono ? 'var(--abyss, #060607)' : eyes}>
        {logoEyes.map((e, i) => (
          <ellipse key={i} cx={e.cx} cy={e.cy} rx="15" ry="7" transform={`rotate(${e.rot} ${e.cx} ${e.cy})`} />
        ))}
      </g>
    </svg>
  );
}

/** Словесный знак — наклонный сжатый гротеск, как на официальных постерах */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={`display inline-block leading-none ${className ?? ''}`} aria-hidden="true">
      Осьминог
    </span>
  );
}

/** Полная версия: знак + словесный знак */
export function LogoFull({ className, sub = true }: { className?: string; sub?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <LogoMark className="h-[1.9em] w-[1.9em] shrink-0" />
      <span className="flex flex-col">
        <LogoWordmark className="text-[1.5em]" />
        {sub && <span className="mono text-[0.42em] tracking-[0.3em] text-mute">FIGHT LEAGUE</span>}
      </span>
    </span>
  );
}
