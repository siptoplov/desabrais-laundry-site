"use client";

/**
 * Набор для форм: валидация, ловушка для ботов, состояния «отправка / успех / ошибка».
 * Если endpoint не настроен — режим «через Direct»: готовый текст заявки + кнопка копирования.
 */
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitForm, shrinkPhoto, emailRe, phoneOk, urlRe } from "@/lib/forms";
import { site } from "@/content/site";
import { t } from "@/i18n";
import { play } from "@/lib/sound";

export type FieldDef = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "url"
    | "number"
    | "select"
    | "textarea"
    | "file"
    | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  autoComplete?: string;
  span?: 2;
  hint?: string;
};

type Status =
  | { s: "idle" }
  | { s: "sending" }
  | { s: "ok"; mode: "sent" | "direct"; summary: string }
  | { s: "error"; msg: string };

function validate(f: FieldDef, v: string) {
  if (f.required && !v.trim())
    return f.type === "checkbox"
      ? "Нужно подтвердить"
      : f.type === "file"
        ? "Добавьте фото"
        : t.forms.required;
  if (!v) return "";
  if (f.type === "email" && !emailRe.test(v)) return t.forms.email;
  if (f.type === "tel" && !phoneOk(v)) return t.forms.phone;
  if (f.type === "url" && !urlRe.test(v)) return t.forms.url;
  return "";
}

export function SmartForm({
  kind,
  title,
  fields,
  submit,
  success,
  extra,
  compact,
}: {
  kind: string;
  title?: string;
  fields: FieldDef[];
  submit: string;
  success: { title: string; text: string };
  extra?: Record<string, string>;
  compact?: boolean;
}) {
  const started = useRef(Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ s: "idle" });
  const [token, setToken] = useState("");
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;
  const tsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !tsRef.current) return;
    const w = window as unknown as {
      turnstile?: { render: (el: HTMLElement, o: object) => void };
    };
    const draw = () =>
      w.turnstile?.render(tsRef.current!, {
        sitekey: siteKey,
        callback: (x: string) => setToken(x),
        "expired-callback": () => setToken(""),
        theme: "dark",
      });
    if (w.turnstile) return draw();
    const sc = document.createElement("script");
    sc.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    sc.async = true;
    sc.onload = draw;
    document.head.appendChild(sc);
  }, [siteKey]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    const errs: Record<string, string> = {};
    let photo: File | null = null;
    for (const f of fields) {
      let v = "";
      if (f.type === "file") {
        const file = fd.get(f.name);
        if (file instanceof File && file.size > 0) {
          photo = file;
          v = file.name;
        }
      } else if (f.type === "checkbox") {
        v = fd.get(f.name) ? "yes" : "";
      } else v = String(fd.get(f.name) ?? "");
      data[f.name] = v;
      const err = validate(f, v);
      if (err) errs[f.name] = err;
    }
    if (!fd.get("consent")) errs.consent = "Нужно согласие";
    if (siteKey && !token) errs._captcha = "Подтвердите, что вы не робот";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = e.currentTarget.querySelector<HTMLElement>(
        `[name="${Object.keys(errs)[0]}"]`,
      );
      first?.focus();
      return;
    }
    setStatus({ s: "sending" });
    if (photo) {
      try {
        photo = await shrinkPhoto(photo);
      } catch {
        setErrors({ photo: "Фото должно быть JPG, PNG или WebP до 3 МБ" });
        setStatus({ s: "idle" });
        return;
      }
    }
    const values: Record<string, string> = {};
    for (const f of fields)
      if (f.type !== "file" && data[f.name]) values[f.name] = data[f.name];
    Object.assign(values, extra ?? {}, { consent: "yes" });
    const res = await submitForm(kind, values, photo, {
      hp: String(fd.get("_hp") ?? ""),
      t: started.current,
      token,
    });
    if (res.ok) {
      play("bell");
      const summary = [
        title ?? kind,
        ...fields
          .filter((f) => f.type !== "file")
          .map((f) =>
            data[f.name]
              ? `${f.label}: ${data[f.name] === "yes" ? "да" : data[f.name]}`
              : "",
          )
          .filter(Boolean),
        ...Object.entries(extra ?? {}).map(
          ([k, v]) => `${k === "items" ? "Заказ" : k}: ${v}`,
        ),
        ...(photo ? ["Фото: приложу в Direct"] : []),
      ].join("\n");
      setStatus({ s: "ok", mode: res.mode, summary });
    } else {
      setStatus({ s: "error", msg: res.error });
    }
  };

  if (status.s === "ok")
    return (
      <Success
        title={success.title}
        text={success.text}
        mode={status.mode}
        summary={status.summary}
        onReset={() => setStatus({ s: "idle" })}
      />
    );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`grid gap-5 ${compact ? "" : "md:grid-cols-2"}`}
    >
      {fields.map((f) => {
        const id = `${kind}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id,
          name: f.name,
          className: "input",
          placeholder: f.placeholder,
          autoComplete: f.autoComplete,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err
            ? `${id}-err`
            : f.hint
              ? `${id}-hint`
              : undefined,
          required: f.required,
          onChange: () => err && setErrors((x) => ({ ...x, [f.name]: "" })),
        };
        return (
          <div
            key={f.name}
            className={`field ${f.span === 2 || f.type === "textarea" ? "md:col-span-2" : ""}`}
          >
            {f.type === "checkbox" ? (
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 !font-sans !text-[14px] !normal-case !tracking-normal !text-ice/90"
              >
                <input
                  {...common}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--blood,#e11d2e)]"
                />
                <span>
                  {f.label}
                  {f.required && <span className="text-blood"> *</span>}
                </span>
              </label>
            ) : (
              <label htmlFor={id}>
                {f.label}
                {f.required && <span className="text-blood"> *</span>}
              </label>
            )}
            {f.type === "checkbox" ? null : f.type === "file" ? (
              <>
                <label htmlFor={id} className="input !flex cursor-pointer items-center gap-4 !py-2 !normal-case !tracking-normal !text-[15px] hover:border-ice/60">
                  <span className="btn btn-ghost btn-sm pointer-events-none">
                    <span>Выбрать фото</span>
                  </span>
                  <span className="min-w-0 truncate text-mute">{fileNames[f.name] || "Файл не выбран"}</span>
                </label>
                <input
                  {...common}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    common.onChange();
                    setFileNames((x) => ({ ...x, [f.name]: e.target.files?.[0]?.name ?? "" }));
                  }}
                />
              </>
            ) : f.type === "select" ? (
              <select {...common} defaultValue="">
                <option value="" disabled>
                  {f.placeholder ?? "Выберите"}
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea {...common} rows={4} />
            ) : (
              <input
                {...common}
                type={f.type ?? "text"}
                inputMode={
                  f.type === "tel"
                    ? "tel"
                    : f.type === "number"
                      ? "decimal"
                      : undefined
                }
              />
            )}
            {f.hint && !err && (
              <span id={`${id}-hint`} className="text-[13px] text-faint">
                {f.hint}
              </span>
            )}
            {err && (
              <span id={`${id}-err`} className="field-error" role="alert">
                {err}
              </span>
            )}
          </div>
        );
      })}
      {/* ловушка для ботов: людям не видно */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Не заполняйте
          <input name="_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {siteKey && (
        <div className={compact ? "" : "md:col-span-2"}>
          <div ref={tsRef} />
          {errors._captcha && (
            <span className="field-error" role="alert">
              {errors._captcha}
            </span>
          )}
        </div>
      )}
      <div className={`field ${compact ? "" : "md:col-span-2"}`}>
        <label
          htmlFor={`${kind}-consent`}
          className="flex cursor-pointer items-start gap-3 !font-sans !text-[14px] !normal-case !tracking-normal !text-ice/90"
        >
          <input
            id={`${kind}-consent`}
            name="consent"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--blood,#e11d2e)]"
            aria-invalid={errors.consent ? true : undefined}
            onChange={() =>
              errors.consent && setErrors((x) => ({ ...x, consent: "" }))
            }
          />
          <span>
            Я согласен(на) на обработку моих персональных данных, в том числе их
            передачу организаторам через мессенджер Telegram, в соответствии с{" "}
            <a
              href="/legal/privacy/"
              target="_blank"
              className="underline underline-offset-4 hover:text-ice"
            >
              политикой конфиденциальности
            </a>
            . <span className="text-blood">*</span>
          </span>
        </label>
        {errors.consent && (
          <span className="field-error" role="alert">
            {errors.consent}
          </span>
        )}
      </div>
      <div
        className={`flex flex-col gap-3 ${compact ? "" : "md:col-span-2"} md:flex-row md:items-center md:justify-end`}
      >
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status.s === "sending"}
          data-impact="dark"
        >
          <span>{status.s === "sending" ? t.forms.sending : submit}</span>
        </button>
      </div>
      {status.s === "error" && (
        <p
          role="alert"
          className={`rounded border border-blood/50 bg-blood/10 px-4 py-3 text-[14px] text-[#ffb3b8] ${compact ? "" : "md:col-span-2"}`}
        >
          {status.msg}
        </p>
      )}
    </form>
  );
}

function Success({
  title,
  text,
  mode,
  summary,
  onReset,
}: {
  title: string;
  text: string;
  mode: "sent" | "direct";
  summary: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded border border-cyan/40 bg-cyan/[0.04] p-6 md:p-8"
      role="status"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
      <svg
        viewBox="0 0 48 48"
        className="mb-5 h-12 w-12 text-cyan"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="140"
          strokeDashoffset="0"
          style={{ animation: "dash .8s ease-out" }}
        />
        <path
          d="M14 25l7 7 13-15"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: 40,
            animation: "dash2 .6s .3s ease-out both",
          }}
        />
        <style>{`@keyframes dash{from{stroke-dashoffset:140}}@keyframes dash2{from{stroke-dashoffset:40}}`}</style>
      </svg>
      <h3 className="display t-4 mb-3">{title}</h3>
      <p className="text-mute">
        {mode === "sent"
          ? text
          : "Последний шаг: отправьте заявку нам в Direct — так она точно дойдёт до организаторов."}
      </p>
      {mode === "direct" && (
        <div className="mt-6 flex flex-col gap-4">
          <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap rounded border border-line bg-abyss/70 p-4 text-[12px] text-mute">
            {summary}
          </pre>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  setCopied(true);
                } catch {}
              }}
            >
              <span>{copied ? "Скопировано ✓" : "Скопировать текст"}</span>
            </button>
            <a
              className="btn btn-primary btn-sm"
              href={site.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Открыть {site.socials.instagramHandle}</span>
            </a>
          </div>
        </div>
      )}
      <button type="button" onClick={onReset} className="link-arrow mt-6">
        Заполнить ещё раз
      </button>
    </div>
  );
}

export function FormSection({ children }: { children: ReactNode }) {
  return <div className="panel p-6 md:p-10">{children}</div>;
}
