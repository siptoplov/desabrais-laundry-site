import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Shop } from '@/components/shop/Shop';
import { products } from '@/content/pages';

export const metadata: Metadata = {
  title: 'Мерч — футболки, худи, перчатки, пояс-реплика',
  description: 'Официальный мерч лиги «Осьминог»: одежда, экипировка и реплика пояса чемпиона. Предзаказ.',
  alternates: { canonical: '/shop/' },
};

export default function ShopPage() {
  return (
    <>
      <PageHero eyebrow="Мерч" title={['Носи', <span key="s" className="text-outline-accent">хватку</span>]} lead="Первая коллекция лиги: одежда, экипировка и пояс-реплика. Отметьте, что хотите, — запустим в производство первым." crumbs={[{ name: 'Мерч', path: '/shop/' }]} compact />
      <section className="pb-28">
        <div className="wrap">
          <Shop products={products} />
        </div>
      </section>
    </>
  );
}
