import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { SmartForm } from '@/components/forms/FormKit';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Как связаться с лигой «Осьминог»: Instagram, поддержка по билетам TicketPro, аккредитация СМИ, партнёрство.',
  alternates: { canonical: '/contacts/' },
};

export default function ContactsPage() {
  const ts = site.contacts.ticketSupport;
  const cards = [
    { k: 'Лига', v: site.socials.instagramHandle, href: site.socials.instagram, note: 'Анонсы, вопросы, Direct — самый быстрый способ связи' },
    { k: 'Билеты', v: ts.phone, href: `tel:${ts.phoneHref}`, note: `${ts.name} · ${ts.hours} · ${ts.email}` },
    { k: 'Видео', v: 'YouTube · Chinuk Gym', href: site.socials.youtube, note: 'Полные бои и интервью' },
    ...(site.contacts.email ? [{ k: 'E-mail', v: site.contacts.email, href: `mailto:${site.contacts.email}`, note: 'Партнёрство и пресса' }] : []),
  ];
  return (
    <>
      <PageHero eyebrow="Контакты" title={['На связи', <span key="s" className="text-outline-accent">из глубины</span>]} lead={`${site.legalName} · ${site.city}`} crumbs={[{ name: 'Контакты', path: '/contacts/' }]} compact />
      <section className="pb-16">
        <div className="wrap grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <a key={c.k} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group flex flex-col gap-3 rounded-[var(--radius)] border border-line bg-abyss-2 p-6 panel-hover">
              <span className="label">{c.k}</span>
              <span className="display-upright text-[32px] leading-tight transition-colors group-hover:text-accent">{c.v}</span>
              <span className="text-[14px] text-mute">{c.note}</span>
            </a>
          ))}
        </div>
      </section>
      <section className="section-tight border-t border-line">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <h2 className="display t-2">Написать</h2>
            <p className="text-mute">Вопрос, аккредитация СМИ, предложение. Билеты и возвраты — напрямую в {ts.name}.</p>
          </div>
          <div className="panel p-6 md:p-10">
            <SmartForm
              kind="contact"
              title="Сообщение с сайта"
              fields={[
                { name: 'name', label: 'Имя', required: true, autoComplete: 'name' },
                { name: 'email', label: 'E-mail', type: 'email', required: true, autoComplete: 'email' },
                { name: 'topic', label: 'Тема', type: 'select', required: true, options: ['Вопрос о турнире', 'Аккредитация СМИ', 'Партнёрство', 'Заявка бойца', 'Другое'], span: 2 },
                { name: 'message', label: 'Сообщение', type: 'textarea', required: true },
              ]}
              submit="Отправить"
              success={{ title: 'Сообщение отправлено', text: 'Ответим, как только вынырнем из подготовки турнира.' }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
