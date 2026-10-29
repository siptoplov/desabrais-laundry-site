import { rng } from "@/lib/media";

/**
 * Fine motes of light drifting up through the frame, a few catching the light
 * and twinkling. Each mote is a tiny element animated by CSS on the
 * compositor (drift on the outer box, twinkle on the inner dot), so the scene
 * costs nothing per frame on the main thread and nothing is repainted.
 * The layout is seeded, so server and client render the same motes.
 */
export function Dust({ count = 36, className }: { count?: number; className?: string }) {
  const r = rng(9);
  const motes = Array.from({ length: count }, (_, i) => {
    const z = 0.3 + r() * 0.7; // depth: size, speed and brightness
    return {
      left: r() * 100,
      top: 8 + r() * 92,
      size: 1.2 + z * 2.4,
      rise: 70 + z * 160,
      drift: (10 + r() * 14) / (0.6 + z * 0.4),
      delay: -r() * 24,
      tw: 2.2 + r() * 3.4,
      twDelay: -r() * 6,
      alpha: 0.35 + z * 0.55,
      mobile: i % 2 === 0,
    };
  });

  return (
    <div aria-hidden className={`dust pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {motes.map((m, i) => (
        <span
          key={i}
          className={`dust-mote absolute ${m.mobile ? "" : "max-md:hidden"}`}
          style={
            {
              left: `${m.left}%`,
              top: `${m.top}%`,
              "--rise": `${-m.rise}px`,
              animationDuration: `${m.drift}s`,
              animationDelay: `${m.delay}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="dust-dot block rounded-full bg-[#e8f0ff]"
            style={
              {
                width: m.size,
                height: m.size,
                "--a": m.alpha.toFixed(2),
                boxShadow: `0 0 ${m.size * 3}px rgba(232,240,255,${(m.alpha * 0.8).toFixed(2)})`,
                animationDuration: `${m.tw}s`,
                animationDelay: `${m.twDelay}s`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
