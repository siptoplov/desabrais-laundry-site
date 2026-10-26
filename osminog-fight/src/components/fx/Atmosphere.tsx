/**
 * Атмосферные слои: зерно плёнки и SVG-фильтр «жидкость» (используется на hover гигантских заголовков).
 */
export function Atmosphere() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id="liquid" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="8" result="n">
            <animate attributeName="baseFrequency" dur="9s" values="0.012 0.04;0.02 0.06;0.012 0.04" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}
