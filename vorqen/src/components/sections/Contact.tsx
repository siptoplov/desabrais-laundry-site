"use client";

import { AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import { contact, site } from "@/lib/content";
import { EASE } from "@/lib/gsap";
import { Emblem, EMBLEM_RATIO, Wordmark } from "@/components/ui/Brand";
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
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [flash, setFlash] = useState(0);
  useRevealGroup(section, { stagger: 0.08 });

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
    <section ref={section} id="contact" aria-label="Контакты" className="section relative z-10 overflow-hidden bg-ink-0">
      {/* light rays behind the emblem */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[clamp(120px,14vw,220px)] h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-[38%]">
        <div
          className="absolute inset-0 animate-[spin_60s_linear_infinite] opacity-60"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(232,240,255,0.07) 0deg 2deg, transparent 2deg 11deg, rgba(232,240,255,0.035) 11deg 12.5deg, transparent 12.5deg 24deg)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.6) 30%, transparent 75%)",
            maskImage: "radial-gradient(closest-side, #000 0%, rgba(0,0,0,0.6) 30%, transparent 75%)",
          }}
        />
        <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(closest-side,rgba(232,240,255,0.16),transparent)]" />
      </div>

      <div className="shell relative">
        <div className="flex flex-col items-center text-center">
          <div data-reveal className="relative w-[clamp(120px,14vw,200px)]" style={{ aspectRatio: `${EMBLEM_RATIO}` }}>
            <div className="animate-[float_7s_ease-in-out_infinite]">
              <Emblem className="h-full w-full drop-shadow-[0_0_40px_rgba(232,240,255,0.25)]" />
            </div>
            {/* success flash — light sweep across the metal */}
            <AnimatePresence>
              {flash > 0 && (
                <m.div
                  key={flash}
                  className="absolute inset-0 mix-blend-screen"
                  initial={{ backgroundPosition: "-150% 0", opacity: 1 }}
                  animate={{ backgroundPosition: "250% 0", opacity: [1, 1, 0.6] }}
                  transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                  style={{
                    background: "linear-gradient(105deg, transparent 35%, #fff 50%, transparent 65%) no-repeat",
                    backgroundSize: "60% 100%",
                    WebkitMaskImage: "url(/brand/emblem.webp)",
                    maskImage: "url(/brand/emblem.webp)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                  }}
                />
              )}
            </AnimatePresence>
            {flash > 0 && (
              <m.div
                key={`glow-${flash}`}
                aria-hidden
                className="absolute inset-[-60%] rounded-full bg-[radial-gradient(closest-side,rgba(232,240,255,0.55),transparent)]"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.4] }}
                transition={{ duration: 1.8, ease: "easeOut" }}
              />
            )}
          </div>
          <div data-reveal className="mt-10 w-[clamp(200px,26vw,380px)]">
            <Wordmark alt="VORQEN" className="h-auto w-full" />
          </div>
          <h2 data-reveal className="t-label-lg mt-10 leading-[2.1] text-fg">
            {contact.titleLines[0]}
            <br />
            {contact.titleLines[1]}
          </h2>
          <p data-reveal className="t-body mt-6 max-w-[42ch]">
            {contact.lead}
          </p>
        </div>

        <div className="grid-12 mt-20 gap-y-10 lg:mt-28">
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
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
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
