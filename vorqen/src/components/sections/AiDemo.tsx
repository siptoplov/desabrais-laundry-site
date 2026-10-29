"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { aiDemo, type ChatLine } from "@/lib/content";
import { EASE } from "@/lib/gsap";
import { useInView, prefersReducedMotion } from "@/lib/device";
import { SectionHead } from "@/components/ui/SectionHead";
import { useRevealGroup } from "@/components/ui/Reveal";
import { Emblem } from "@/components/ui/Brand";
import { IconCheck, IconDatabase, IconSpark } from "@/components/ui/Icons";

type Rendered = ChatLine & { id: number; typed: string; done: boolean };

const sleep = (ms: number, signal: { cancelled: boolean }) =>
  new Promise<void>((res, rej) => setTimeout(() => (signal.cancelled ? rej(new Error("cancel")) : res()), ms));

export function AiDemo() {
  const section = useRef<HTMLElement>(null);
  const chat = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inView = useInView(chat, "-10% 0px");
  const [lines, setLines] = useState<Rendered[]>([]);
  const [typing, setTyping] = useState(false);
  const [crm, setCrm] = useState(0); // 0 none · 1 qualified · 2 synced
  useRevealGroup(section);

  useEffect(() => {
    if (!inView) return;
    const signal = { cancelled: false };
    const reduced = prefersReducedMotion();

    const run = async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        setLines([]);
        setCrm(0);
        await sleep(500, signal);
        for (let i = 0; i < aiDemo.script.length; i++) {
          const line = aiDemo.script[i]!;
          if (line.from === "agent") {
            setTyping(true);
            await sleep(reduced ? 100 : 900, signal);
            setTyping(false);
            setLines((l) => [...l, { ...line, id: i, typed: "", done: false }]);
            if (reduced) {
              setLines((l) => l.map((x) => (x.id === i ? { ...x, typed: line.text, done: true } : x)));
            } else {
              for (let c = 1; c <= line.text.length; c++) {
                await sleep(16 + Math.random() * 22, signal);
                setLines((l) => l.map((x) => (x.id === i ? { ...x, typed: line.text.slice(0, c) } : x)));
              }
              setLines((l) => l.map((x) => (x.id === i ? { ...x, done: true } : x)));
            }
            await sleep(600, signal);
          } else if (line.from === "client") {
            await sleep(reduced ? 100 : 700, signal);
            setLines((l) => [...l, { ...line, id: i, typed: line.text, done: true }]);
            await sleep(500, signal);
          } else {
            await sleep(500, signal);
            setLines((l) => [...l, { ...line, id: i, typed: line.text, done: true }]);
            setCrm(line.kind === "qualify" ? 1 : 2);
            await sleep(900, signal);
          }
        }
        await sleep(5200, signal);
      }
    };
    run().catch(() => {});
    return () => {
      signal.cancelled = true;
      setTyping(false);
    };
  }, [inView]);

  useEffect(() => {
    const s = scroller.current;
    // instant: a smooth scroll per typed character queued dozens of animations
    if (s) s.scrollTop = s.scrollHeight;
  }, [lines, typing]);

  return (
    <section ref={section} aria-label="AI-сотрудник" className="section relative z-10 overflow-hidden bg-ink-0">
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-1/2 h-[70vw] w-[70vw] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(232,240,255,0.06),transparent)]" />
      <div className="shell grid-12 items-center gap-y-16">
        <div className="col-span-12 lg:col-span-5">
          <SectionHead index="06" label={aiDemo.label} title={aiDemo.title} />
          <p data-reveal className="t-body mt-8 max-w-[40ch]">
            {aiDemo.text}
          </p>
          <ul className="mt-10 space-y-4">
            {aiDemo.points.map((p) => (
              <li key={p} data-reveal className="flex items-center gap-4 text-[15px] text-fg-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-2">
                  <IconCheck size={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div ref={chat} data-reveal className="relative col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="glass overflow-hidden">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-3.5">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line-2 bg-ink-2">
                  <Emblem className="h-[14px] w-auto" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-1 bg-white shadow-[0_0_8px_rgba(232,240,255,0.9)]" />
                </span>
                <div>
                  <p className="text-[14px] font-medium">VORQEN Agent</p>
                  <p className="t-label mt-1 text-[8.5px] text-fg-3">{typing ? "Typing…" : "Online · 24/7"}</p>
                </div>
              </div>
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            <div ref={scroller} data-lenis-prevent className="no-scrollbar h-[420px] space-y-3 overflow-y-auto px-5 py-6 sm:px-6" aria-live="polite">
              <AnimatePresence initial={false}>
                {lines.map((l) =>
                  l.from === "system" ? (
                    <m.div
                      key={l.id}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="sweep mx-auto flex w-fit max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5"
                    >
                      {l.kind === "crm" ? <IconDatabase size={14} /> : <IconSpark size={14} />}
                      <span className="text-[12.5px] text-fg-2">{l.text}</span>
                    </m.div>
                  ) : (
                    <m.div
                      key={l.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className={`flex ${l.from === "client" ? "justify-end" : "justify-start"}`}
                    >
                      <p
                        className={`max-w-[82%] rounded-[18px] px-4 py-3 text-[14.5px] leading-[1.5] ${
                          l.from === "client"
                            ? "rounded-br-[6px] bg-[linear-gradient(180deg,#f2f3f5,#c9cdd3)] text-ink-0"
                            : "rounded-bl-[6px] border border-line bg-white/[0.04] text-fg"
                        }`}
                      >
                        {l.typed}
                        {!l.done && <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-fg" />}
                      </p>
                    </m.div>
                  ),
                )}
                {typing && (
                  <m.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex">
                    <span className="flex gap-1 rounded-[18px] rounded-bl-[6px] border border-line bg-white/[0.04] px-4 py-4">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-2" style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </span>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-t border-line px-6 py-4">
              <span className="flex-1 text-[13px] text-fg-3">Сообщение…</span>
              <span className="t-label text-[8.5px]">AI · Auto</span>
            </div>
          </div>

          {/* CRM card */}
          <m.div
            initial={false}
            animate={{ opacity: crm ? 1 : 0, y: crm ? 0 : 20, scale: crm ? 1 : 0.97 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="glass relative mt-4 w-full p-5 lg:absolute lg:-bottom-14 lg:-left-20 lg:mt-0 lg:w-[290px]"
            aria-hidden={!crm}
          >
            <div className="flex items-center justify-between">
              <span className="t-label text-[8.5px]">CRM · New deal</span>
              <span className={`t-label text-[8.5px] transition-colors duration-700 ${crm === 2 ? "text-fg" : "text-fg-3"}`}>
                {crm === 2 ? "Synced" : "Pending"}
              </span>
            </div>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              {[
                ["Направление", "E-commerce"],
                ["Бюджет", "до 1,5 млн"],
                ["Статус", crm >= 1 ? "Квалифицирован" : "—"],
                ["Звонок", crm === 2 ? "Завтра, 14:00" : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-fg-3">{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </m.div>
        </div>
      </div>
    </section>
  );
}
