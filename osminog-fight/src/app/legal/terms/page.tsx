import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'Правила использования сайта', alternates: { canonical: '/legal/terms/' } };

/** ⚠ Шаблон. Перед запуском согласуйте текст с юристом. */
export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Документы" title={['Правила сайта']} crumbs={[{ name: 'Правила сайта', path: '/legal/terms/' }]} compact />
      <section className="pb-24">
        <div className="wrap prose-osm max-w-3xl">
          <p>Сайт лиги «{site.name}» носит информационный характер. Состав кардов, даты и площадки могут меняться — актуальная информация публикуется на сайте и в {site.socials.instagramHandle}.</p>
          <h2>Билеты</h2>
          <p>Продажу и возврат билетов осуществляет билетный оператор ({site.contacts.ticketSupport.name}) по своим правилам. Схема зала на сайте — ориентировочная; цены — информационные до старта продаж.</p>
          <h2>Материалы</h2>
          <p>Логотипы, постеры и фото принадлежат лиге и правообладателям. Использование в СМИ — со ссылкой на источник; в рекламе — только с письменного согласия.</p>
          <h2>Голосования и прогнозы</h2>
          <p>Голоса за «любимца зрителей» носят развлекательный характер и не являются ставками.</p>
          <p>Редакция от 26 октября 2026 года.</p>
        </div>
      </section>
    </>
  );
}
