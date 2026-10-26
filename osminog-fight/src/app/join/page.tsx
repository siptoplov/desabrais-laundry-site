import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { SmartForm } from '@/components/forms/FormKit';
import { sponsorFormats } from '@/content/pages';
import { partners } from '@/content/site';

export const metadata: Metadata = {
  title: 'Бойцам и партнёрам',
  description: 'Хотите выступать в «Осьминоге»? Отправьте рекорд, вес и видео. Партнёрам — медиакит и форматы сотрудничества.',
  alternates: { canonical: '/join/' },
};

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Бойцам и партнёрам"
        title={['Хочешь', <span key="s" className="text-blood glow-blood">в ринг?</span>]}
        lead="Матчмейкер ищет равные пары: рекорд, вес, видео и характер. Партнёрам — аудитория, которая смотрит стоя."
        crumbs={[{ name: 'Бойцам и партнёрам', path: '/join/' }]}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#fighters" className="btn btn-primary">
            <span>Заявка бойца</span>
          </a>
          <a href="#partners" className="btn btn-ghost">
            <span>Партнёрство</span>
          </a>
        </div>
      </PageHero>

      <section id="fighters" className="section-tight scroll-mt-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">Для бойцов</p>
            <h2 className="display t-2">Хочу выступать у вас</h2>
            <ul className="flex flex-col gap-3 text-mute">
              <li>— Профессиональный или серьёзный любительский рекорд.</li>
              <li>— Ссылка на видео полных боёв (YouTube, VK, Google Drive).</li>
              <li>— Готовность к взвешиванию и медицинскому допуску.</li>
              <li>— Контакт менеджера или тренера.</li>
            </ul>
            <p className="text-[14px] text-faint">Мы отвечаем, когда есть подходящая пара. Отсутствие ответа — не отказ: заявка остаётся в базе матчмейкера.</p>
          </div>
          <div className="panel p-6 md:p-10">
            <SmartForm
              kind="fighter-application"
              title="Заявка бойца"
              fields={[
                { name: 'name', label: 'Имя и фамилия', required: true, autoComplete: 'name' },
                { name: 'country', label: 'Страна, город', required: true },
                { name: 'discipline', label: 'Дисциплина', type: 'select', required: true, options: ['К-1', 'Муай-тай', 'Бокс', 'ММА', 'Евро-тай'] },
                { name: 'weight', label: 'Весовая категория, кг', type: 'number', required: true },
                { name: 'record', label: 'Рекорд (W-L-D)', required: true, placeholder: '12-3-0' },
                { name: 'age', label: 'Возраст', type: 'number', required: true },
                { name: 'video', label: 'Ссылка на видео боёв', type: 'url', required: true, placeholder: 'https://', span: 2 },
                { name: 'manager', label: 'Менеджер / тренер', placeholder: 'Имя, телефон или @' },
                { name: 'phone', label: 'Ваш телефон', type: 'tel', required: true, autoComplete: 'tel' },
                { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
                { name: 'instagram', label: 'Instagram', placeholder: '@username' },
                { name: 'about', label: 'Титулы и коротко о себе', type: 'textarea' },
              ]}
              submit="Отправить заявку"
              success={{ title: 'Заявка у матчмейкера', text: 'Изучим рекорд и видео. Если пара найдётся — свяжемся с вами или вашим менеджером.' }}
            />
          </div>
        </div>
      </section>

      <section id="partners" className="section-tight scroll-mt-20 border-t border-line">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div className="flex flex-col gap-6">
              <p className="eyebrow">Для партнёров</p>
              <h2 className="display t-2">Бренд в свете ринга</h2>
              <p className="text-mute">
                С нами — {partners.general.name} (генеральный партнёр), {partners.tv.name} (ТВ), {partners.list.slice(1, 6).join(', ')} и другие. Пришлём медиакит с аудиторией, охватами и форматами.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sponsorFormats.map((f, i) => (
                <div key={f.title} className="rounded-[var(--radius)] border border-line p-6" data-reveal="" style={{ ['--d' as string]: `${i * 0.05}s` }}>
                  <p className="mono text-[12px] text-accent">0{i + 1}</p>
                  <p className="display-upright mt-3 text-[28px] leading-tight">{f.title}</p>
                  <p className="mt-2 text-[15px] text-mute">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <h3 className="display t-3">Запросить медиакит</h3>
            </div>
            <div className="panel p-6 md:p-10">
              <SmartForm
                kind="sponsor"
                title="Запрос медиакита"
                fields={[
                  { name: 'company', label: 'Компания', required: true, autoComplete: 'organization' },
                  { name: 'name', label: 'Контактное лицо', required: true, autoComplete: 'name' },
                  { name: 'email', label: 'E-mail', type: 'email', required: true, autoComplete: 'email' },
                  { name: 'phone', label: 'Телефон', type: 'tel', autoComplete: 'tel' },
                  { name: 'format', label: 'Интересующий формат', type: 'select', options: sponsorFormats.map((f) => f.title), span: 2 },
                  { name: 'message', label: 'Задача и бюджет (по желанию)', type: 'textarea' },
                ]}
                submit="Получить медиакит"
                success={{ title: 'Запрос принят', text: 'Пришлём медиакит и предложение по формату.' }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
