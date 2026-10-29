# VORQEN — BUILD / AUTOMATE / SCALE

Landing site for VORQEN: dark-luxury, cinematic, monochrome chrome. Russian copy with English accent labels.

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · React Three Fiber + drei + postprocessing · GSAP + ScrollTrigger + SplitText · Lenis · Framer Motion (LazyMotion)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint       # tsc --noEmit
```

## Structure

```
src/
  app/                 layout (fonts, SEO, OG, JSON-LD), page, icons, /api/lead
  lib/
    content.ts         ← ALL copy, links and the Why-Us numbers live here
    gsap.ts            plugin registration + shared easing
    device.ts          tier / reduced-motion / WebGL detection, viewport hooks
    scroll-store.ts    mutable bridge between DOM scroll and the WebGL loop
  components/
    sections/          Preloader, Header, Hero, Manifesto, Services, Mountains,
                       Process, AiDemo, WhyUs, Kinetic, Contact, Footer
    three/             HeroCanvas, Emblem (crystal shards), Rocks, Dust,
                       StudioEnv (strip-light studio), WavesCanvas (silk shader)
    ui/                Brand marks, Cursor, Magnetic, TiltCard, SplitReveal, Icons
    providers/         SmoothScroll (Lenis ↔ ScrollTrigger), Motion (LazyMotion)
public/brand/          emblem / wordmark extracted from the supplied key visual
```

## Design system

| Token | Value |
| --- | --- |
| Background | `#050506` → `#0B0B0D` (+ `#111114`, `#18191D` surfaces) |
| Foreground | `#EDEEF0` at 100 / 62 / 52 / 16 % |
| Chrome | `#FFFFFF → #C9CDD3 → #6B7078 → #1A1B1F` |
| Glow | `#E8F0FF` (the only "colour") |
| Display / labels | Michroma, uppercase, tracking 0.3–0.5em |
| Headings / body | Manrope 300–500 (cyrillic) |
| Easing | `--ease-expo: cubic-bezier(0.16,1,0.3,1)`, `--ease-quint: cubic-bezier(0.83,0,0.17,1)` |
| Durations | 0.45s (UI) · 0.9s (state) · 1.4s (reveals) |
| Grid | 12 columns, max 1440px, gutter `clamp(16px,2vw,32px)`, side pad `clamp(20px,5vw,72px)` |
| Glass | `rgba(255,255,255,.03–.045)`, blur 20px, 1px `rgba(255,255,255,.08)`, radius 20px, bevelled top edge |

Reusable classes in `globals.css`: `.glass`, `.sweep` (diagonal light pass on hover), `.u-link` (underline draws L→R), `.btn-chrome`, `.btn-ghost`, `.dash`, `.hairline`, `.t-label`, `.t-h1/.t-h2/.t-h3`, `.chrome-text`.

## Brand assets

The emblem and wordmark are **cut from the supplied artwork** (`public/brand/emblem.*`, `wordmark.*`; luminance → alpha). The wordmark is never re-typeset. When you have master SVG/PNG files, replace those four files at the same aspect ratio (emblem 488×358, wordmark 740×86). If the wordmark's letter spacing changes, also update `WORDMARK_LETTERS` in `ui/Brand.tsx`, which drives the per-letter reveal.

The 3D emblem is four crystal shards traced from the logo (`three/shards.ts`). If you get a modelled GLB, swap it into `Emblem.tsx`. Keep it Draco-compressed and lazy-loaded the same way.

## Things to fill in

- **Why-Us numbers:** in `lib/content.ts` → `why[]`, set `value` to a number and the counter animates. `null` shows the `[XX]` placeholder.
- **Contacts:** `site.telegram`, `site.whatsapp`, `site.email` in `lib/content.ts`.
- **Lead delivery:** set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (see `.env.example`). Without them, `/api/lead` validates and returns `ok` but doesn't forward the lead anywhere.
- **Domain:** `site.url` (canonical + OG).

## Motion & performance notes

- **Preloader (≤2.5s):** 16 non-overlapping shards fly in from depth, the light sweeps across the emblem, then the wordmark letters resolve from blur. A faint inlined "ghost" emblem paints in the first frame, so LCP lands at FCP.
- **Hero:** physical chrome (metalness 1, roughness 0.1, clearcoat 1) lit by a strip-light studio built from Lightformers, so there's no HDRI download. On high-tier devices one strip travels across the set every 7s (the recurring light sweep). Pointer tilt is capped at ±15°; phones use the gyroscope or a slow auto-rotation. On scroll the shards burst toward the camera. The canvas stops rendering (`frameloop="never"`) once the hero has scrolled away.
- **Tiers:** touch devices, narrow screens, ≤4 cores or ≤4GB RAM get DPR ≤1.25, 220 dust particles, no chromatic aberration, a static environment, and lower-detail rocks. `PerformanceMonitor` lowers DPR further if fps drops.
- **Software WebGL** (SwiftShader / llvmpipe, which includes Lighthouse and PageSpeed) gets the 2D fallback: the PNG emblem plus the rock corners from the key visual. Append `?gl=force` to the URL to force WebGL for testing.
- **`prefers-reduced-motion`:** Lenis is off, there are no pins or scrubs, all content is visible immediately, the preloader shortens to 0.9s, and the 3D scene is static.
- **Lighthouse 12.8** (local production build, headless): desktop **99** perf / 96 a11y / 100 best practices / 100 SEO. Mobile (simulated 4× CPU) **79** perf. The remaining cost is about 400ms of startup JS (GSAP/SplitText/ScrollTrigger setup with pinned sections). Real throttled LCP measures 0.2–2.2s.
