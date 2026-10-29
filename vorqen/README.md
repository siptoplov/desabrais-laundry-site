# VORQEN — BUILD / AUTOMATE / SCALE

Landing site for VORQEN: dark-luxury, cinematic, monochrome chrome. Russian copy with English accent labels.

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · React Three Fiber + drei + postprocessing · GSAP + ScrollTrigger + SplitText · Lenis · Framer Motion (LazyMotion)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint       # tsc --noEmit
```

## Deploy (Netlify)

Live: https://vorqen-znfh.netlify.app (project `vorqen-znfh`, team `siptoplov`).
`netlify.toml` builds with `npm run build` on Node 22, publishes `.next`, and enables
`@netlify/plugin-nextjs`. That plugin turns `/api/lead` into a Netlify Function; without it
the site deploys as raw files and every route returns 404. After you set the Telegram env vars in Netlify,
trigger a new deploy: env values are read at build time.

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
    three/             VideoFx (WebGL treatment of the hero footage)
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

## Cinematic media (`public/media/`)

Stills and loops were generated in Higgsfield from the client's moodboard frames
(Nano Banana 2.1 stills, Kling 3.0 Pro loops with start frame = end frame, so they loop seamlessly):

| File | Used in |
| --- | --- |
| `hero` | Hero: chrome V among rim-lit rocks |
| `mountain-v` | Manifesto: valley with the V of light |
| `laptop` | Technology: black-glass laptop with the emblem |
| `silk` | WE BUILD / AUTOMATE / SCALE |
| `valley` | Final CTA: river valley at dawn |
| `beams.jpg`, `svc-*.jpg` | Services background and the four service cards (stills only) |

Each loop ships as `<name>-1920.mp4` (CRF 21) and `<name>-1280.mp4` (CRF 27), H.264, muted, faststart.
`<name>.jpg` is the first frame, so the poster swaps to video without a jump. `CinemaVideo`
loads a loop only when its section is near, plays it while visible and pauses it off-screen.
Reduced motion keeps the stills.

## Things to fill in

- **Why-Us numbers:** in `lib/content.ts` → `why[]`, set `value` to a number and the counter animates. `null` shows the `[XX]` placeholder.
- **Contacts:** `site.telegram`, `site.whatsapp`, `site.email` in `lib/content.ts`.
- **Lead delivery:** set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (see `.env.example`). Without them, `/api/lead` validates and returns `ok` but doesn't forward the lead anywhere.
- **Domain:** `site.url` (canonical + OG).

## Motion & performance notes

- **Preloader (≤2.5s):** 16 non-overlapping shards fly in from depth, the light sweeps across the emblem, then the wordmark letters resolve from blur. A faint inlined "ghost" emblem paints in the first frame, so LCP lands at FCP.
- **Hero:** the footage is drawn through a WebGL shader (`three/VideoFx.tsx`). A liquid lens and ripple follow the cursor, and RGB separation appears at the frame edges as you scroll or move fast. On scroll the camera flies into the emblem. On touch screens the lens drifts on its own. On portrait screens the frame is fitted to width and the overflow fades into black, so the whole emblem stays visible. Rendering stops once the hero has scrolled away.
- **Pinned scenes:** the manifesto window expands to full screen, the words light up, then the camera pushes into the V. Services scroll horizontally with photo cards that reveal behind a mask and drift inside their frames. The laptop swings in from perspective. The silk section opens its tracking line by line. The valley drifts back as the final screen enters.
- **Software WebGL** (SwiftShader / llvmpipe, which includes Lighthouse and PageSpeed) plays the hero loop as a plain `<video>` without the shader. Append `?gl=force` to the URL to force WebGL for testing.
- **`prefers-reduced-motion`:** Lenis is off, there are no pins or scrubs, all content is visible immediately, the preloader shortens to 0.9s, and the 3D scene is static.
- **Lighthouse 12.8** (local production build, headless): desktop **99** perf / 96 a11y / 100 best practices / 100 SEO. Mobile (simulated 4× CPU) **79** perf. The remaining cost is about 400ms of startup JS (GSAP/SplitText/ScrollTrigger setup with pinned sections). Real throttled LCP measures 0.2–2.2s.
