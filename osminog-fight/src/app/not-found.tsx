import Link from 'next/link';
import { t } from '@/i18n';

/** 404: щупальце обвивает «страницу» и утаскивает её в бездну */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--header-h)]" aria-labelledby="nf-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 60% at 50% 100%, var(--deep-2), var(--abyss) 70%)' }} />
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-2">
        <div className="relative z-10 flex flex-col gap-6">
          <p className="eyebrow">Ошибка 404</p>
          <h1 id="nf-title" className="display t-1">
            {t.notFound.title}
          </h1>
          <p className="lead">{t.notFound.text}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="btn btn-primary" data-impact="dark">
              <span>{t.notFound.cta}</span>
            </Link>
            <Link href="/fighters/" className="btn btn-ghost">
              <span>К бойцам</span>
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
          {/* «страница», которую утаскивают */}
          <div className="nf-page absolute left-1/2 top-[8%] w-[56%] -translate-x-1/2 rounded border border-line bg-abyss-2 p-5 shadow-2xl">
            <div className="mb-3 h-3 w-2/3 rounded bg-ice/20" />
            <div className="mb-2 h-2 w-full rounded bg-ice/10" />
            <div className="mb-2 h-2 w-5/6 rounded bg-ice/10" />
            <div className="mb-6 h-2 w-3/4 rounded bg-ice/10" />
            <div className="display-upright text-center text-[64px] leading-none text-ice/30">404</div>
          </div>
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible">
            <path
              className="nf-tentacle"
              d="M200 420 C 210 340, 120 320, 150 250 C 175 190, 270 210, 255 150 C 245 105, 175 110, 170 140 C 166 160, 190 168, 200 158"
              fill="none"
              stroke="url(#nfg)"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="nfg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#05070a" />
                <stop offset=".6" stopColor="#0e2440" />
                <stop offset="1" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <style>{`
        .nf-tentacle{stroke-dasharray:700;stroke-dashoffset:700;animation:nf-grab 1.4s .3s cubic-bezier(.16,1,.3,1) forwards, nf-sway 3s 1.7s ease-in-out infinite alternate;filter:drop-shadow(0 0 18px rgba(0,229,255,.35))}
        .nf-page{animation:nf-drag 3.2s 1.6s cubic-bezier(.83,0,.17,1) infinite}
        @keyframes nf-grab{to{stroke-dashoffset:0}}
        @keyframes nf-sway{to{transform:translateX(6px) rotate(1deg)}}
        @keyframes nf-drag{0%{transform:translate(-50%,0) rotate(0)}25%{transform:translate(-50%,-6px) rotate(-3deg)}55%{transform:translate(-40%,160%) rotate(14deg) scale(.6);opacity:.2;filter:blur(2px)}56%,70%{opacity:0;transform:translate(-50%,0) scale(.9)}100%{opacity:1;transform:translate(-50%,0) rotate(0)}}
      `}</style>
    </section>
  );
}
