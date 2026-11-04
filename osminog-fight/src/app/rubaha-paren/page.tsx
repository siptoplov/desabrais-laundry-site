import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { SmartForm } from '@/components/forms/FormKit';
import { rubaha } from '@/content/pages';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Рубаха-парень — выйди в ринг из зала',
  description: 'Спецпроект «Осьминога»: судьи выбирают двух добровольцев из зала. К-1, 2 раунда по 1,5 минуты. Заполни анкету.',
  alternates: { canonical: '/rubaha-paren/' },
};

export default function RubahaPage() {
  return (
    <>
      <PageHero eyebrow="Спецпроект" title={['Рубаха-', <span key="s" className="text-blood glow-blood">парень</span>]} lead={rubaha.lead} crumbs={[{ name: 'Рубаха-парень', path: '/rubaha-paren/' }]}>
        <dl className="grid max-w-2xl grid-cols-2 gap-6 md:grid-cols-4">
          {rubaha.format.map((r) => (
            <div key={r.k} className="border-l border-blood/60 pl-4">
              <dt className="label">{r.k}</dt>
              <dd className="display-upright text-[24px] leading-tight">{r.v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="section-tight">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="prose-osm">
            {rubaha.text.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ol className="grid gap-4">
            {rubaha.steps.map((s, i) => (
              <li key={s.title} className="flex gap-6 rounded-[var(--radius)] border border-line p-6" data-reveal="" style={{ ['--d' as string]: `${i * 0.08}s` }}>
                <span className="display-upright text-outline text-[72px] leading-none">{i + 1}</span>
                <span>
                  <span className="display-upright block text-[30px] leading-tight">{s.title}</span>
                  <span className="text-mute">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="form" className="section-tight scroll-mt-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <h2 className="display t-2">Анкета смельчака</h2>
            <p className="text-mute">Без подготовки — но с головой. Участвовать могут те, кому исполнилось 18 лет, кто не был профессиональным спортсменом в единоборствах и нигде не выступает. Заниматься в зале можно. Отбор — на усмотрение организаторов.</p>
            <p className="text-[14px] text-faint">Официальная анкета также — в шапке профиля {site.socials.instagramHandle}.</p>
          </div>
          <div className="panel p-6 md:p-10">
            <SmartForm
              kind="rubaha"
              title="Анкета «Рубаха-парень»"
              fields={[
                { name: 'name', label: 'Имя и фамилия', required: true, autoComplete: 'name' },
                { name: 'age', label: 'Возраст (от 18)', type: 'number', required: true },
                { name: 'weight', label: 'Вес, кг', type: 'number', required: true },
                { name: 'profession', label: 'Профессия', required: true, autoComplete: 'organization-title' },
                { name: 'training', label: 'Занимаетесь ли спортом', type: 'select', required: true, options: ['Не занимаюсь', 'Хожу в зал, нигде не выступаю', 'Другой спорт'], span: 2 },
                { name: 'phone', label: 'Телефон', type: 'tel', required: true, autoComplete: 'tel', placeholder: '+375 29 000-00-00' },
                { name: 'telegram', label: 'Telegram или Instagram', placeholder: '@username' },
                { name: 'bio', label: 'Коротко о себе', type: 'textarea', required: true, placeholder: 'Кто вы, чем живёте, почему хотите в ринг' },
                { name: 'eligible', label: 'Подтверждаю: мне 18 лет или больше, я не был(а) профессиональным спортсменом в единоборствах и не выступаю на соревнованиях. Могу заниматься в зале.', type: 'checkbox', required: true, span: 2 },
              ]}
              submit="Хватит смелости"
              success={{ title: 'Анкета принята', text: 'Если вас отберут — организаторы позвонят. Тренируйте взгляд.' }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
