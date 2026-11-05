import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SmartForm } from "@/components/forms/FormKit";
import { sponsorFormats } from "@/content/pages";
import { PartnersStrip } from '@/components/ui/PartnersStrip';
import { partners } from "@/content/site";

export const metadata: Metadata = {
  title: "Бойцам и партнёрам",
  description:
    "Хотите выступать в «Осьминоге»? Отправьте рекорд, вес и видео. Партнёрам — медиакит и форматы сотрудничества.",
  alternates: { canonical: "/join/" },
};

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Бойцам и партнёрам"
        title={[
          "Хочешь",
          <span key="s" className="text-blood glow-blood">
            в ринг?
          </span>,
        ]}
        lead="Матчмейкер ищет равные пары: рекорд, вес, видео и характер. Партнёрам — аудитория, которая смотрит стоя."
        crumbs={[{ name: "Бойцам и партнёрам", path: "/join/" }]}
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
              <li>— Фото для профиля и вес.</li>
              <li>— Профессиональный рекорд, любительские бои, регалии.</li>
              <li>
                — Ссылка на видео боёв (YouTube, Rutube, VK, Google Drive).
              </li>
              <li>— Готовность к взвешиванию и медицинскому допуску.</li>
              <li>— Ваши контакты: телефон, Telegram или e-mail.</li>
            </ul>
            <p className="text-[14px] text-faint">
              Мы отвечаем, когда есть подходящая пара. Отсутствие ответа — не
              отказ: заявка остаётся в базе матчмейкера.
            </p>
          </div>
          <div className="panel p-6 md:p-10">
            <SmartForm
              kind="fighter"
              title="Заявка бойца"
              fields={[
                {
                  name: "photo",
                  label: "Фото для профиля (портрет, лицо крупно)",
                  type: "file",
                  required: true,
                  span: 2,
                  hint: "JPG, PNG или WebP. Лучше светлый фон и вертикальный кадр.",
                },
                {
                  name: "name",
                  label: "Имя и фамилия",
                  required: true,
                  autoComplete: "name",
                },
                { name: "city", label: "Страна, город", required: true },
                {
                  name: "discipline",
                  label: "Дисциплина",
                  type: "select",
                  required: true,
                  options: ["К-1", "Муай-тай", "Бокс", "ММА", "Евро-тай"],
                },
                {
                  name: "weight",
                  label: "Вес, кг",
                  type: "number",
                  required: true,
                },
                {
                  name: "record",
                  label: "Профессиональный рекорд (победы-поражения-ничьи)",
                  required: true,
                  placeholder: "12-3-0, или 0-0-0 если боёв не было",
                },
                {
                  name: "amateur",
                  label: "Любительские бои",
                  required: true,
                  placeholder: "Например: 20 боёв, 16 побед",
                  span: 2,
                },
                {
                  name: "titles",
                  label: "Регалии и титулы",
                  type: "textarea",
                  required: true,
                  placeholder:
                    "Чемпионаты, звания, пояса. Если нет — напишите «нет»",
                },
                {
                  name: "video",
                  label: "Ссылка на видео боёв",
                  type: "url",
                  required: true,
                  placeholder: "https://",
                  span: 2,
                  hint: "YouTube, Rutube, VK или Google Drive",
                },
                {
                  name: "phone",
                  label: "Телефон",
                  type: "tel",
                  required: true,
                  autoComplete: "tel",
                  placeholder: "+375 29 000-00-00",
                },
                {
                  name: "telegram",
                  label: "Telegram или Instagram",
                  placeholder: "@username",
                },
                {
                  name: "email",
                  label: "E-mail",
                  type: "email",
                  autoComplete: "email",
                },
                {
                  name: "coach",
                  label: "Тренер или менеджер",
                  placeholder: "Имя и контакт",
                },
              ]}
              submit="Отправить заявку"
              success={{
                title: "Заявка у матчмейкера",
                text: "Изучим рекорд и видео. Если пара найдётся — свяжемся с вами или вашим менеджером.",
              }}
            />
          </div>
        </div>
      </section>

      <section
        id="partners"
        className="section-tight scroll-mt-20 border-t border-line"
      >
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div className="flex flex-col gap-6">
              <p className="eyebrow">Для партнёров</p>
              <h2 className="display t-2">Бренд в свете ринга</h2>
              <p className="text-mute">Оставьте контакты — расскажем про аудиторию, охваты и форматы. С лигой уже работают:</p>
              <PartnersStrip names={[partners.general.name, partners.tv.name, ...partners.list]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sponsorFormats.map((f, i) => (
                <div
                  key={f.title}
                  className="rounded-[var(--radius)] border border-line p-6"
                  data-reveal=""
                  style={{ ["--d" as string]: `${i * 0.05}s` }}
                >
                  <p className="mono text-[12px] text-accent">0{i + 1}</p>
                  <p className="display-upright mt-3 text-[28px] leading-tight">
                    {f.title}
                  </p>
                  <p className="mt-2 text-[15px] text-mute">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <h3 className="display t-3">Связаться по партнёрству</h3>
            </div>
            <div className="panel p-6 md:p-10">
              <SmartForm
                kind="partner"
                title="Заявка партнёра"
                fields={[
                  {
                    name: "name",
                    label: "Компания или ваше имя",
                    required: true,
                    autoComplete: "organization",
                  },
                  {
                    name: "contact",
                    label: "Контакты: телефон, e-mail или Telegram",
                    required: true,
                    autoComplete: "off",
                    span: 2,
                  },
                  {
                    name: "message",
                    label: "Что хотите обсудить (по желанию)",
                    type: "textarea",
                  },
                ]}
                submit="Отправить"
                success={{
                  title: "Заявка принята",
                  text: "Свяжемся с вами по указанным контактам.",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
