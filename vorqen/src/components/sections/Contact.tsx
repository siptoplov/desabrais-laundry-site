"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { contact, site } from "@/lib/content";
import { EASE, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { Emblem, EMBLEM_RATIO, Tagline, Wordmark } from "@/components/ui/Brand";
import { ScrollSequence } from "@/components/ui/ScrollSequence";
import { Clouds } from "@/components/ui/Clouds";
import { Magnetic } from "@/components/ui/Magnetic";
import { useRevealGroup } from "@/components/ui/Reveal";
import { IconArrow, IconArrowUpRight, IconMail, IconTelegram, IconWhatsApp } from "@/components/ui/Icons";

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

function validate(data: { name: string; contact: string; message: string }): Errors {
  const e: Errors = {};
  if (data.name.trim().length < 2) e.name = "Как к вам обращаться?";
  const c = data.contact.trim();
  const phone = c.replace(/[\s()-]/g, "");
  if (!(/^\+?\d{10,15}$/.test(phone) || /^@?[a-zA-Z0-9_]{5,32}$/.test(c) || /t\.me\//.test(c))) e.contact = "Укажите телефон или Telegram (@username)";
  if (data.message.trim().length < 5) e.message = "Пара слов о задаче";
  return e;
}

const channels = [
  { href: site.telegram, label: "Telegram", handle: "@vorqen", Icon: IconTelegram },
  { href: site.whatsapp, label: "WhatsApp", handle: "Написать", Icon: IconWhatsApp },
  { href: `mailto:${site.email}`, label: "Email", handle: site.email, Icon: IconMail },
];

export function Contact() {
  const section = useRef<HTMLElement>(null);
  const valley = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [flash, setFlash] = useState(0);
  useRevealGroup(section, { stagger: 0.08 });

  // the valley drifts back as it enters; the title rises out of the mist
  useEffect(() => {
    const el = valley.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-valley]", { scale: 1.3, yPercent: -6 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
      gsap.fromTo(
        "[data-valley-copy] > *",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 45%", once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? ""), // honeypot
    };
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      setFlash((f) => f + 1);
    } catch {
      setState("error");
    }
  };

  return (
    <section ref={section} id="contact" aria-label="Контакты" className="relative z-10 overflow-hidden bg-ink-0 pb-[var(--section-y)]">
      {/* the closing frame: valley at dawn */}
      <div ref={valley} className="relative h-[100svh] min-h-[660px] overflow-hidden">
        <div data-valley className="absolute inset-0 origin-[50%_35%] will-change-transform">
          <ScrollSequence name="valley" frames={81} focus={[0.5, 0.4]} />
        </div>
        <Clouds />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(5,5,6,0.88) 0%, rgba(5,5,6,0.35) 30%, rgba(5,5,6,0.05) 52%, rgba(5,5,6,0.55) 78%, #050506 100%)" }}
        />
        <div data-valley-copy className="shell relative flex h-full flex-col items-center pt-[15vh] text-center">
          <div className="relative w-[clamp(84px,8vw,120px)]" style={{ aspectRatio: `${EMBLEM_RATIO}` }}>
            <div className="animate-[float_7s_ease-in-out_infinite]">
              <Emblem className="h-full w-full drop-shadow-[0_0_30px_rgba(232,240,255,0.35)]" />
            </div>
          </div>
          <div className="mt-8 w-[clamp(220px,30vw,440px)]">
            <Wordmark alt="VORQEN" className="h-auto w-full" />
          </div>
          <Tagline className="mt-7" />
          <h2 className="t-label-lg mt-auto mb-[18vh] leading-[2.1] text-fg [text-shadow:0_2px_30px_rgba(0,0,0,0.8)]">
            {contact.titleLines[0]}
            <br />
            {contact.titleLines[1]}
            <span aria-hidden className="mx-auto mt-6 block w-fit animate-[nudge_2.4s_var(--ease-soft)_infinite] text-fg-2">
              <IconArrow size={22} className="rotate-90" />
            </span>
          </h2>
        </div>
      </div>

      <div className="shell relative -mt-[14vh]">
        <p data-reveal className="t-body mx-auto mb-14 max-w-[42ch] text-center">
          {contact.lead}
        </p>
        <div className="grid-12 gap-y-10">
          <div data-reveal className="glass col-span-12 p-7 sm:p-10 lg:col-span-7 lg:p-12">
            <AnimatePresence mode="wait" initial={false}>
              {state === "done" ? (
                <m.div
                  key="ok"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="flex min-h-[380px] flex-col items-start justify-center"
                  role="status"
                >
                  <div className="relative mb-8 w-[110px]" style={{ aspectRatio: `${EMBLEM_RATIO}` }}>
                    <Emblem className="h-full w-full" />
                    <m.div
                      key={flash}
                      aria-hidden
                      className="absolute inset-0 mix-blend-screen"
                      initial={{ backgroundPosition: "-150% 0" }}
                      animate={{ backgroundPosition: "250% 0" }}
                      transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
                      style={{
                        background: "linear-gradient(105deg, transparent 35%, #fff 50%, transparent 65%) no-repeat",
                        backgroundSize: "60% 100%",
                        WebkitMaskImage: "url(/brand/emblem.webp)",
                        maskImage: "url(/brand/emblem.webp)",
                        WebkitMaskSize: "100% 100%",
                        maskSize: "100% 100%",
                      }}
                    />
                    <m.div
                      aria-hidden
                      className="absolute inset-[-70%] rounded-full bg-[radial-gradient(closest-side,rgba(232,240,255,0.45),transparent)]"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.4] }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="t-label">Request / Received</span>
                  <p className="mt-6 max-w-[18ch] text-[clamp(28px,2.8vw,44px)] font-light leading-[1.1] tracking-[-0.03em]">{contact.success}</p>
                  <span className="dash mt-8" />
                  <button type="button" onClick={() => setState("idle")} className="u-link mt-10 text-[14px] text-fg-2 hover:text-fg">
                    Отправить ещё одну заявку
                  </button>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  onSubmit={onSubmit}
                  noValidate
                  className="space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field name="name" label="Имя" autoComplete="name" error={errors.name} />
                    <Field name="contact" label="Телефон / Telegram" autoComplete="tel" error={errors.contact} />
                  </div>
                  <Field name="message" label="Опишите задачу" textarea error={errors.message} />
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  <div className="flex flex-col-reverse items-start justify-between gap-6 pt-4 sm:flex-row sm:items-center">
                    <p className="t-small max-w-[34ch] text-[12px]">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                      {state === "error" && <span className="mt-2 block text-fg">Не удалось отправить. Напишите нам в Telegram.</span>}
                    </p>
                    <Magnetic>
                      <button type="submit" disabled={state === "sending"} className="btn btn-chrome sweep disabled:opacity-60">
                        {state === "sending" ? "Отправляем…" : contact.submit}
                        <IconArrow size={18} className="arrow" />
                      </button>
                    </Magnetic>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>

          <ul className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            {channels.map(({ href, label, handle, Icon }) => (
              <li key={label} data-reveal className="flex-1">
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="glass sweep group flex h-full min-h-[104px] items-center gap-6 px-7 py-6 transition-colors duration-700 hover:border-white/20"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line-2 transition-colors duration-700 group-hover:border-white/40">
                    <Icon size={22} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[clamp(20px,1.7vw,26px)] font-light tracking-[-0.02em]">{label}</span>
                    <span className="t-small mt-1 block">{handle}</span>
                  </span>
                  <IconArrowUpRight size={20} className="text-fg-3 transition-all duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes nudge{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(8px);opacity:1}}`}</style>
    </section>
  );
}

function Field({
  name,
  label,
  textarea,
  autoComplete,
  error,
}: {
  name: string;
  label: string;
  textarea?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className="field" data-invalid={error ? "true" : "false"}>
      {textarea ? (
        <textarea id={id} name={name} placeholder=" " rows={3} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      ) : (
        <input id={id} name={name} placeholder=" " autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      )}
      <label htmlFor={id}>{label}</label>
      <span className="bar" />
      <AnimatePresence>
        {error && (
          <m.span
            id={`${id}-err`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 block text-[12px] text-fg-2"
          >
            {error}
          </m.span>
        )}
      </AnimatePresence>
    </div>
  );
}
