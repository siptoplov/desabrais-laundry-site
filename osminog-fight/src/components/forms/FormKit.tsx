'use client';

/**
 * Набор для форм: валидация, ловушка для ботов, состояния «отправка / успех / ошибка».
 * Если endpoint не настроен — режим «через Direct»: готовый текст заявки + кнопка копирования.
 */
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { submitForm, emailRe, phoneRe, urlRe } from '@/lib/forms';
import { site } from '@/content/site';
import { t } from '@/i18n';
import { play } from '@/lib/sound';

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  autoComplete?: string;
  span?: 2;
  hint?: string;
};

type Status = { s: 'idle' } | { s: 'sending' } | { s: 'ok'; mode: 'sent' | 'direct'; summary: string } | { s: 'error'; msg: string };

function validate(f: FieldDef, v: string) {
  if (f.required && !v.trim()) return t.forms.required;
  if (!v) return '';
  if (f.type === 'email' && !emailRe.test(v)) return t.forms.email;
  if (f.type === 'tel' && !phoneRe.test(v)) return t.forms.phone;
  if (f.type === 'url' && !urlRe.test(v)) return t.forms.url;
  return '';
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
  const [status, setStatus] = useState<Status>({ s: 'idle' });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = String(fd.get(f.name) ?? '');
      data[f.name] = v;
      const err = validate(f, v);
      if (err) errs[f.name] = err;
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus({ s: 'sending' });
    const res = await submitForm(kind, { ...data, ...extra, _hp: String(fd.get('_hp') ?? ''), _t: started.current });
    if (res.ok) {
      play('bell');
      const summary = [title ?? kind, ...fields.map((f) => (data[f.name] ? `${f.label}: ${data[f.name]}` : '')).filter(Boolean), ...Object.entries(extra ?? {}).map(([k, v]) => `${k}: ${v}`)].join('\n');
      setStatus({ s: 'ok', mode: res.mode, summary });
    } else {
      setStatus({ s: 'error', msg: res.error === 'network' ? t.forms.error : res.error });
    }
  };

  if (status.s === 'ok') return <Success title={success.title} text={success.text} mode={status.mode} summary={status.summary} onReset={() => setStatus({ s: 'idle' })} />;

  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-5 ${compact ? '' : 'md:grid-cols-2'}`}>
      {fields.map((f) => {
        const id = `${kind}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id,
          name: f.name,
          className: 'input',
          placeholder: f.placeholder,
          autoComplete: f.autoComplete,
          'aria-invalid': err ? true : undefined,
          'aria-describedby': err ? `${id}-err` : f.hint ? `${id}-hint` : undefined,
          required: f.required,
          onChange: () => err && setErrors((x) => ({ ...x, [f.name]: '' })),
        };
        return (
          <div key={f.name} className={`field ${f.span === 2 || f.type === 'textarea' ? 'md:col-span-2' : ''}`}>
            <label htmlFor={id}>
              {f.label}
              {f.required && <span className="text-blood"> *</span>}
            </label>
            {f.type === 'select' ? (
              <select {...common} defaultValue="">
                <option value="" disabled>
                  {f.placeholder ?? 'Выберите'}
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea {...common} rows={4} />
            ) : (
              <input {...common} type={f.type ?? 'text'} inputMode={f.type === 'tel' ? 'tel' : f.type === 'number' ? 'decimal' : undefined} />
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
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Не заполняйте
          <input name="_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={`flex flex-col gap-3 ${compact ? '' : 'md:col-span-2'} md:flex-row md:items-center md:justify-between`}>
        <p className="text-[13px] text-faint">Отправляя форму, вы соглашаетесь с <a href="/legal/privacy/" className="underline underline-offset-4 hover:text-ice">политикой конфиденциальности</a>.</p>
        <button type="submit" className="btn btn-primary" disabled={status.s === 'sending'} data-impact="dark">
          <span>{status.s === 'sending' ? t.forms.sending : submit}</span>
        </button>
      </div>
      {status.s === 'error' && (
        <p role="alert" className={`rounded border border-blood/50 bg-blood/10 px-4 py-3 text-[14px] text-[#ffb3b8] ${compact ? '' : 'md:col-span-2'}`}>
          {status.msg}
        </p>
      )}
    </form>
  );
}

function Success({ title, text, mode, summary, onReset }: { title: string; text: string; mode: 'sent' | 'direct'; summary: string; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative overflow-hidden rounded border border-cyan/40 bg-cyan/[0.04] p-6 md:p-8" role="status">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
      <svg viewBox="0 0 48 48" className="mb-5 h-12 w-12 text-cyan" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="140" strokeDashoffset="0" style={{ animation: 'dash .8s ease-out' }} />
        <path d="M14 25l7 7 13-15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ strokeDasharray: 40, animation: 'dash2 .6s .3s ease-out both' }} />
        <style>{`@keyframes dash{from{stroke-dashoffset:140}}@keyframes dash2{from{stroke-dashoffset:40}}`}</style>
      </svg>
      <h3 className="display t-4 mb-3">{title}</h3>
      <p className="text-mute">{mode === 'sent' ? text : 'Последний шаг: отправьте заявку нам в Direct — так она точно дойдёт до организаторов.'}</p>
      {mode === 'direct' && (
        <div className="mt-6 flex flex-col gap-4">
          <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap rounded border border-line bg-abyss/70 p-4 text-[12px] text-mute">{summary}</pre>
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
              <span>{copied ? 'Скопировано ✓' : 'Скопировать текст'}</span>
            </button>
            <a className="btn btn-primary btn-sm" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
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
