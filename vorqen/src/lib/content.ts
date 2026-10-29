/**
 * All site copy in one place. Values marked `null` are placeholders the
 * client will fill in — the UI renders them as [XX] and skips the counter.
 */

export const site = {
  name: "VORQEN",
  tagline: ["BUILD", "AUTOMATE", "SCALE"] as const,
  url: "https://vorqen.com",
  description:
    "VORQEN — создаём цифровые продукты и бизнесы под ключ: сайты и приложения, AI-агенты и автоматизация, интеграции и CRM. От идеи до масштабирования.",
  email: "hello@vorqen.com",
  telegram: "https://t.me/vorqen",
  whatsapp: "https://wa.me/00000000000",
  year: 2026,
};

export const nav = [
  { href: "#services", label: "Услуги" },
  { href: "#process", label: "Процесс" },
  { href: "#why", label: "Почему мы" },
  { href: "#contact", label: "Контакты" },
] as const;

export const hero = {
  title: "Мы создаём цифровые продукты и бизнесы под ключ.",
  sub: "От идеи до масштабирования.",
  ctaPrimary: "Обсудить проект",
  ctaSecondary: "Наши услуги",
};

export const manifesto = "Больше, чем просто IT. Это — ваш рост.";

export type ServiceIcon = "monitor" | "bot" | "chart" | "cloud";
export const services: { n: string; icon: ServiceIcon; image: string; title: string; text: string; tags: string[] }[] = [
  {
    n: "01",
    icon: "monitor",
    image: "/media/svc-web.jpg",
    title: "Разработка сайтов и приложений",
    text: "Современные сайты, веб-приложения, e-commerce, MVP.",
    tags: ["Web", "Mobile", "E-commerce", "MVP"],
  },
  {
    n: "02",
    icon: "bot",
    image: "/media/svc-ai.jpg",
    title: "AI-решения и автоматизация",
    text: "AI-агенты, чат-боты, автоматизация процессов, интеграции.",
    tags: ["AI Agents", "LLM", "Chatbots", "Workflows"],
  },
  {
    n: "03",
    icon: "chart",
    image: "/media/svc-biz.jpg",
    title: "Бизнес под ключ",
    text: "Анализ, стратегия, маркетинг, продукт, команда, запуск.",
    tags: ["Strategy", "Marketing", "Product", "Launch"],
  },
  {
    n: "04",
    icon: "cloud",
    image: "/media/svc-crm.jpg",
    title: "Интеграции и CRM",
    text: "Связь всех процессов в единую систему для максимальной эффективности.",
    tags: ["CRM", "API", "Data", "Analytics"],
  },
];

export const mountains = {
  label: "Technology / Systems",
  title: "Технологии, которые работают на ваш бизнес.",
};

export const process = [
  { n: "01", en: "Analysis", title: "Анализ", text: "Разбираем ваш бизнес и находим точки роста." },
  { n: "02", en: "Strategy", title: "Стратегия", text: "Проектируем решение и считаем эффект." },
  { n: "03", en: "Development", title: "Разработка", text: "Создаём продукт, сайт или AI-систему." },
  { n: "04", en: "Automation", title: "Автоматизация", text: "Подключаем AI-агентов и интеграции." },
  { n: "05", en: "Scale", title: "Масштабирование", text: "Растим результат вместе с вами." },
];

export type ChatLine =
  | { from: "client"; text: string }
  | { from: "agent"; text: string }
  | { from: "system"; text: string; kind: "crm" | "qualify" };

export const aiDemo = {
  label: "AI Employee / 24/7",
  title: "Так работает ваш AI-сотрудник 24/7",
  text: "Агент отвечает клиенту за секунды, уточняет задачу, квалифицирует лид и передаёт его в CRM — без участия менеджера, днём и ночью.",
  points: [
    "Отвечает в мессенджерах и на сайте",
    "Квалифицирует заявку по вашим критериям",
    "Создаёт сделку в CRM и ставит задачу",
  ],
  script: [
    { from: "client", text: "Здравствуйте! Нужен интернет-магазин, сроки горят." },
    { from: "agent", text: "Здравствуйте! Помогу. Сколько товаров планируете на старте и есть ли уже бренд?" },
    { from: "client", text: "Около 300 позиций, логотип есть. Бюджет — до 1,5 млн." },
    { from: "agent", text: "Отлично, это наш профиль. Когда удобно созвониться с проектным менеджером?" },
    { from: "client", text: "Завтра после 14:00." },
    { from: "system", kind: "qualify", text: "Лид квалифицирован · E-commerce · бюджет подтверждён" },
    { from: "system", kind: "crm", text: "Сделка создана в CRM · звонок назначен на завтра, 14:00" },
  ] as ChatLine[],
};

/** `value: null` → shows the placeholder, no counter. Fill in real numbers later. */
export const why: { value: number | null; placeholder: string; suffix: string; title: string; text: string }[] = [
  { value: null, placeholder: "[XX]", suffix: "+", title: "Запущенных проектов", text: "Сайты, продукты и AI-системы в продакшене." },
  { value: null, placeholder: "[XX]", suffix: "%", title: "Процессов автоматизируем", text: "Рутина уходит агентам — команда занимается ростом." },
  { value: null, placeholder: "[XX]", suffix: "×", title: "Рост конверсии", text: "Средний эффект после запуска и автоматизации." },
  { value: 24, placeholder: "24", suffix: "/7", title: "Работают ваши AI-агенты", text: "Без выходных, больничных и потерянных заявок." },
];

export const kinetic = ["WE BUILD", "WE AUTOMATE", "WE SCALE"] as const;

export const contact = {
  label: "Contact / Start",
  title: "ПРИСОЕДИНЯЙСЯ К БУДУЩЕМУ БИЗНЕСА",
  titleLines: ["Присоединяйся", "к будущему бизнеса"] as const,
  lead: "Расскажите о задаче — ответим в течение часа и предложим решение.",
  success: "Спасибо! Свяжемся с вами в течение часа.",
  submit: "Отправить заявку",
};
