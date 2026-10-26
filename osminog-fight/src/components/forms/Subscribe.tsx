'use client';

/** Подписка на новые турниры: e-mail или Telegram */
import { useRef, useState, type FormEvent } from 'react';
import { submitForm, emailRe } from '@/lib/forms';
import { write } from '@/lib/storage';
import { play } from '@/lib/sound';
import { site } from '@/content/site';
import { t } from '@/i18n';

export function Subscribe({ id = 'sub', tone = 'default' }: { id?: string; tone?: 'default' | 'hero' }) {
  const started = useRef(Date.now());
  const [channel, setChannel] = useState<'email' | 'telegram'>('email');
  const [value, setValue] = useState('');
  const [err, setErr] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'direct'>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return setErr(t.forms.required);
    if (channel === 'email' && !emailRe.test(v)) return setErr(t.forms.email);
    if (channel === 'telegram' && !/^@?[a-zA-Z0-9_]{5,32}$/.test(v)) return setErr('Ник в Telegram: от 5 символов, латиница');
    setErr('');
    setState('sending');
    const hp = (e.currentTarget.elements.namedItem('_hp') as HTMLInputElement)?.value;
    const res = await submitForm('subscribe', { channel, contact: v, _hp: hp, _t: started.current });
    if (!res.ok) {
      setState('idle');
      return setErr(res.error === 'network' ? t.forms.error : res.error);
    }
    write('subscribed', { channel, contact: v, at: Date.now() });
    play('bell');
    setState(res.mode === 'sent' ? 'ok' : 'direct');
  };

  if (state === 'ok' || state === 'direct') {
    return (
      <div className="flex flex-col gap-3" role="status">
        <p className="display t-4 text-cyan glow-cyan">{t.subscribe.ok}</p>
        {state === 'direct' && (
          <p className="text-[14px] text-mute">
            Пока рассылка в подготовке — включите уведомления в{' '}
            <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-ice underline underline-offset-4">
              {site.socials.instagramHandle}
            </a>
            , чтобы точно не пропустить старт продаж.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-3">
      <div className="flex gap-2" role="radiogroup" aria-label="Канал уведомлений">
        {(['email', 'telegram'] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={channel === c}
            onClick={() => {
              setChannel(c);
              setErr('');
            }}
            className={`chip transition-colors ${channel === c ? 'chip-cyan' : 'hover:text-ice'}`}
          >
            {c === 'email' ? 'E-mail' : 'Telegram'}
          </button>
        ))}
      </div>
      <div className={`flex flex-col gap-3 sm:flex-row ${tone === 'hero' ? '' : ''}`}>
        <label htmlFor={`${id}-contact`} className="sr-only">
          {channel === 'email' ? t.subscribe.email : 'Ник в Telegram'}
        </label>
        <input
          id={`${id}-contact`}
          className="input flex-1"
          type={channel === 'email' ? 'email' : 'text'}
          inputMode={channel === 'email' ? 'email' : 'text'}
          autoComplete={channel === 'email' ? 'email' : 'off'}
          placeholder={channel === 'email' ? 'you@mail.com' : '@username'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (err) setErr('');
          }}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-err` : undefined}
        />
        <input name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'} data-impact="dark">
          <span>{state === 'sending' ? t.forms.sending : t.subscribe.cta}</span>
        </button>
      </div>
      {err && (
        <span id={`${id}-err`} className="field-error" role="alert">
          {err}
        </span>
      )}
    </form>
  );
}
