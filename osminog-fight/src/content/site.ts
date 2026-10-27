import type { CountryCode, Discipline } from './types';

/** Глобальные настройки бренда. Менять здесь — изменится по всему сайту. */
export const site = {
  name: 'ОСЬМИНОГ',
  nameLatin: 'OSMINOG FIGHT',
  league: 'Belarusian Fight League',
  legalName: 'ООО «Октопус файтинг»',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://osminog.fight',
  since: 2009,
  city: 'Минск',
  description:
    'ОСЬМИНОГ — международная лига профессиональных боёв в Минске с 2009 года. Муай-тай, К-1, бокс и ММА. Турниры, бойцы, билеты, видео боёв.',

  slogan: 'Восемь ударов. Одна победа.',
  /** Альтернативные слоганы (для рекламы, мерча, соцсетей) */
  sloganAlternatives: ['Хватка, от которой не уйти.', 'Из тьмы — в свет ринга.', 'Бездна выбирает сильнейших.'],
  /** Варианты заголовка hero — активный задаётся индексом */
  heroHeadlines: ['Выходи из тьмы', 'Восемь ударов. Одна победа.', 'Глубина зовёт сильнейших'],
  heroHeadlineIndex: 1,
  /** Варианты подзаголовка главного боя */
  mainEventHeadlines: ['Хозяин ринга против «Того самого 34»', 'Дом против опыта', 'Титулы против шрамов'],

  socials: {
    instagram: 'https://www.instagram.com/osminog.fight/',
    instagramHandle: '@osminog.fight',
    youtube: 'https://www.youtube.com/@chinukgym',
    /** ⚠ Заполните, когда появится официальный канал */
    telegram: '',
  },
  contacts: {
    /** ⚠ Уточнить официальный e-mail организатора */
    email: '',
    ticketSupport: { name: 'TicketPro', phone: '+375 29 693-59-35', phoneHref: '+375296935935', email: 'help@ticketpro.by', hours: '9:00–20:00' },
  },
  /**
   * Слоты под ассеты из Higgsfield (или любого 3D/видео-редактора).
   * heroModel — GLB-модель осьминога (public/models/octopus.glb) заменит процедурную 3D-модель на главной.
   * heroVideo — зацикленное видео (public/video/hero.mp4, 6–10 с, без звука) под 3D-сценой.
   */
  media: {
    heroModel: '',
    heroVideo: '',
    heroPoster: '',
  },
  /** Куда отправлять формы (Formspree, Getform, свой воркер с Telegram-ботом…). Пусто — режим «через Direct». */
  formsEndpoint: process.env.NEXT_PUBLIC_FORMS_ENDPOINT || '',
};

export const nav = [
  { href: '/events/', label: 'Турниры' },
  { href: '/fight-card/', label: 'Кард' },
  { href: '/fighters/', label: 'Бойцы' },
  { href: '/rankings/', label: 'Чемпионы' },
  { href: '/watch/', label: 'Эфир' },
  { href: '/media/', label: 'Медиа' },
  { href: '/about/', label: 'О лиге' },
];

export const navSecondary = [
  { href: '/tickets/', label: 'Билеты' },
  { href: '/results/', label: 'Результаты' },
  { href: '/rubaha-paren/', label: 'Рубаха-парень' },
  { href: '/join/', label: 'Бойцам и партнёрам' },
  { href: '/shop/', label: 'Мерч' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contacts/', label: 'Контакты' },
  { href: '/me/', label: 'Мой Осьминог' },
];

export const disciplines: Record<Discipline, { label: string; short: string; text: string }> = {
  k1: { label: 'К-1', short: 'К-1', text: 'Кикбоксинг в стойке: руки, ноги, колени. Короткий клинч, взрывные размены.' },
  muaythai: { label: 'Муай-тай', short: 'Муай-тай', text: 'Искусство восьми конечностей: кулаки, локти, колени, ноги и клинч.' },
  boxing: { label: 'Бокс', short: 'Бокс', text: 'Только руки. Дистанция, тайминг и тактика.' },
  mma: { label: 'ММА', short: 'ММА', text: 'Смешанные единоборства: стойка, борьба и партер.' },
  eurothai: { label: 'Евро-тай', short: 'Евро-тай', text: 'Тайский бокс по европейским правилам: без ударов локтями.' },
};

export const countries: Record<CountryCode, { name: string; flag: string }> = {
  BY: { name: 'Беларусь', flag: '🇧🇾' },
  RU: { name: 'Россия', flag: '🇷🇺' },
  IR: { name: 'Иран', flag: '🇮🇷' },
  KZ: { name: 'Казахстан', flag: '🇰🇿' },
  UA: { name: 'Украина', flag: '🇺🇦' },
  PL: { name: 'Польша', flag: '🇵🇱' },
  LT: { name: 'Литва', flag: '🇱🇹' },
  MD: { name: 'Молдова', flag: '🇲🇩' },
  RO: { name: 'Румыния', flag: '🇷🇴' },
  UZ: { name: 'Узбекистан', flag: '🇺🇿' },
  KG: { name: 'Кыргызстан', flag: '🇰🇬' },
  AF: { name: 'Афганистан', flag: '🇦🇫' },
  TJ: { name: 'Таджикистан', flag: '🇹🇯' },
  TR: { name: 'Турция', flag: '🇹🇷' },
  XX: { name: 'Страна не указана', flag: '' },
};

/** Партнёры: генеральный и ТВ — отдельно, остальные — бегущей строкой */
export const partners = {
  general: { name: 'Rutube', role: 'Генеральный партнёр' },
  tv: { name: 'Беларусь 5 · SPORT5.BY', role: 'Телевизионный партнёр' },
  list: [
    'belbet',
    'Северный Берег',
    'Алютех',
    'СТФ Монтаж',
    'Toyota',
    'Geely · Лакшери Моторс',
    'Hongqi',
    'Zira',
    'Fightershop.by',
    'Principium',
    'Chinuk Gym',
    'Team Fighting Grodno',
  ],
  federations: ['Федерация кикбоксинга России', 'Федерация профессионального бокса', 'Белорусская федерация тайского бокса и кикбоксинга'],
};
