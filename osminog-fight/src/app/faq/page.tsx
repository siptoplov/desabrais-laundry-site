import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Accordion } from '@/components/ui/Actions';
import { Btn } from '@/components/ui/Btn';
import { faq } from '@/content/pages';
import { JsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'FAQ — частые вопросы',
  description: 'Билеты, возврат, возраст, расписание, трансляции, «Рубаха-парень», заявки бойцов и партнёров — ответы на частые вопросы.',
  alternates: { canonical: '/faq/' },
};

export default function FaqPage() {
  const groups = Array.from(new Set(faq.map((f) => f.group)));
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
      <PageHero eyebrow="FAQ" title={['Вопросы', <span key="s" className="text-outline">из зала</span>]} lead="Коротко о билетах, турнирах, эфире и о том, как попасть в ринг." crumbs={[{ name: 'FAQ', path: '/faq/' }]} compact />
      <section className="pb-24">
        <div className="wrap flex flex-col gap-16">
          {groups.map((g) => (
            <div key={g} className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <h2 className="display t-3">{g}</h2>
              <Accordion items={faq.filter((f) => f.group === g).map((f) => ({ q: f.q, a: f.a }))} />
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius)] border border-line p-8">
            <p className="display-upright text-[32px]">Не нашли ответ?</p>
            <Btn href="/contacts/">Написать нам</Btn>
          </div>
        </div>
      </section>
    </>
  );
}
