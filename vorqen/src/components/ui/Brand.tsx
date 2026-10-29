/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

/**
 * The supplied VORQEN marks. Rendered from the client's artwork — never
 * re-typeset. Intrinsic sizes: emblem 488×358, wordmark 740×86.
 */
export const EMBLEM_RATIO = 488 / 358;
export const WORDMARK_RATIO = 740 / 86;

/** Letter boundaries (percent of wordmark width) for per-letter reveals. */
export const WORDMARK_LETTERS: [number, number][] = [
  [0, 17],
  [17, 34.5],
  [34.5, 50.5],
  [50.5, 68.5],
  [68.5, 84],
  [84, 100],
];

export function Emblem({ className, style, alt = "" }: { className?: string; style?: CSSProperties; alt?: string }) {
  return (
    <picture>
      <source srcSet="/brand/emblem.webp" type="image/webp" />
      <img
        src="/brand/emblem.png"
        width={488}
        height={358}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className={className}
        style={style}
        draggable={false}
        decoding="async"
      />
    </picture>
  );
}

export function Wordmark({ className, style, alt = "" }: { className?: string; style?: CSSProperties; alt?: string }) {
  return (
    <picture>
      <source srcSet="/brand/wordmark.webp" type="image/webp" />
      <img
        src="/brand/wordmark.png"
        width={740}
        height={86}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className={className}
        style={style}
        draggable={false}
        decoding="async"
      />
    </picture>
  );
}

/** Wordmark split into six clip-path slices so letters can animate independently. */
export function SplitWordmark({ className, letterClassName }: { className?: string; letterClassName?: string }) {
  return (
    <span className={`relative block ${className ?? ""}`} style={{ aspectRatio: `${WORDMARK_RATIO}` }} role="img" aria-label="VORQEN">
      {WORDMARK_LETTERS.map(([a, b], i) => (
        <span
          key={i}
          data-letter
          className={`absolute inset-0 block ${letterClassName ?? ""}`}
          style={{ clipPath: `inset(-20% ${100 - b}% -20% ${a}%)` }}
        >
          <Wordmark className="block h-full w-full" />
        </span>
      ))}
    </span>
  );
}

export function Tagline({ className }: { className?: string }) {
  return (
    <p className={`t-label flex items-center justify-center gap-[1.6em] ${className ?? ""}`}>
      <span>Build</span>
      <span aria-hidden className="opacity-50">/</span>
      <span>Automate</span>
      <span aria-hidden className="opacity-50">/</span>
      <span>Scale</span>
    </p>
  );
}
