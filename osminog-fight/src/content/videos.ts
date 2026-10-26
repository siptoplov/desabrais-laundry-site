import type { Video } from './types';

/**
 * Видеоархив — официальный YouTube-канал Chinuk Gym (@chinukgym).
 * Добавить видео: возьмите ID из ссылки youtube.com/watch?v=<ID>.
 * Просмотры — на 26.10.2026, обновляются вручную (или из YouTube Data API).
 */
export const videos: Video[] = [
  // ОСЬМИНОГ-9 × UralFC
  { id: 'XFMdcpi639k', title: 'Серпитовский — Сайдуло', red: 'Серпитовский', blue: 'Сайдуло', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 7200, published: '2026-06-10' },
  { id: 'VzgDubq30xA', title: 'Быбочкин — Ибрагимов', red: 'Быбочкин', blue: 'Ибрагимов', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 7100, published: '2026-06-09' },
  { id: 'cJ1XCkEgR3o', title: 'Кокош — Мамедов', red: 'Кокош', blue: 'Мамедов', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 5600, published: '2026-06-07' },
  { id: 'pN6g3AR1UU4', title: 'Кувакина — Татару', red: 'Кувакина', blue: 'Татару', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 3400, published: '2026-06-08' },
  { id: 'tvqGd_gay8w', title: 'Зиновьев — Сари', red: 'Зиновьев', blue: 'Сари', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 1300, published: '2026-06-10' },
  { id: 'zDU3FGei81E', title: 'Степаненко — Вербин', red: 'Степаненко', blue: 'Вербин', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 1300, published: '2026-06-09' },
  { id: 'VjwPpcLkhFw', title: 'Мамедов — Артющенко', red: 'Мамедов', blue: 'Артющенко', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 1000, published: '2026-06-12' },
  { id: 'zMbwyXq771w', title: 'Гавриш — Цякалло', red: 'Гавриш', blue: 'Цякалло', event: 'osminog-9', discipline: 'eurothai', kind: 'fight', views: 802, published: '2026-06-09' },
  { id: 'riRlX6I-SCA', title: 'Лапаник — Мамедов', red: 'Лапаник', blue: 'Мамедов', event: 'osminog-9', discipline: 'k1', kind: 'fight', views: 754, published: '2026-07-24' },
  { id: 'vDpGCBTXHUc', title: 'Мамедов и Артющенко: интервью перед боем', event: 'osminog-9', kind: 'interview', views: 392, published: '2026-05-13' },
  { id: 'uWU7CBP_IMc', title: 'Эльмар Мамедов: интервью после боя', event: 'osminog-9', kind: 'interview', views: 151, published: '2026-05-13' },
  { id: 'EgR86eUuuyE', title: 'Роман Артющенко: интервью', event: 'osminog-9', kind: 'interview', views: 94, published: '2026-05-13' },
  { id: 'zsbvM2MNYj0', title: 'Встреча бойцов перед турниром', event: 'osminog-9', kind: 'backstage', views: 49, published: '2026-05-13' },
  { id: 'cNlfmFJHHY4', title: 'Награждение Юрия Быбочкина', event: 'osminog-9', kind: 'ceremony', views: 126, published: '2026-05-12' },
  // ОСЬМИНОГ-8 × BFC 86
  { id: '69gN0FBu100', title: 'Сулейманов — Кокош', red: 'Сулейманов', blue: 'Кокош', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 1300 },
  { id: 'tTYP6pYX49A', title: 'Федоринчик — Варнавский', red: 'Федоринчик', blue: 'Варнавский', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 1000 },
  { id: 'a2LnbOobxog', title: 'Нечитайло — Песецкий', red: 'Нечитайло', blue: 'Песецкий', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 1000 },
  { id: '1esZ2oWW7V8', title: 'Фокин — Штырков', red: 'Фокин', blue: 'Штырков', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 996 },
  { id: 'NROK36qwinI', title: 'Матвеев — Юзефович', red: 'Матвеев', blue: 'Юзефович', event: 'osminog-8', discipline: 'mma', kind: 'fight', views: 669 },
  { id: 'cZEZGQr10-s', title: 'Мамедов — Магомедов', red: 'Мамедов', blue: 'Магомедов', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 513 },
  { id: 'nPiBQ6Qswgg', title: 'Спадаренко — Мадаев', red: 'Спадаренко', blue: 'Мадаев', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 469 },
  { id: 'NovC_5h7xsQ', title: 'Распопов — Силос', red: 'Распопов', blue: 'Силос', event: 'osminog-8', discipline: 'mma', kind: 'fight', views: 455 },
  { id: 'eGO42KcYi4o', title: 'Джумабоев — Куличков', red: 'Джумабоев', blue: 'Куличков', event: 'osminog-8', discipline: 'mma', kind: 'fight', views: 300 },
  { id: 'S-5LYZs2WFI', title: 'Гаджиев — Литвин', red: 'Гаджиев', blue: 'Литвин', event: 'osminog-8', discipline: 'mma', kind: 'fight', views: 280 },
  { id: 'lWPmY2g-S-Q', title: 'Колонтаевский — Миляков', red: 'Колонтаевский', blue: 'Миляков', event: 'osminog-8', discipline: 'k1', kind: 'fight', views: 274 },
  // ОСЬМИНОГ-7
  { id: 'fv66CPRzcBc', title: 'Хмарик — Жовнер', red: 'Хмарик', blue: 'Жовнер', event: 'osminog-7', discipline: 'muaythai', kind: 'fight', views: 2400 },
  { id: '72F_cxHgPoA', title: 'Колесников — Кокош', red: 'Колесников', blue: 'Кокош', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 1800 },
  { id: '_SP5WVso1dg', title: 'Черкас — Мамедов', red: 'Черкас', blue: 'Мамедов', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 958 },
  { id: 'Eeg1wiHaX3Y', title: 'Таккаллю — Бангура', red: 'Таккаллю', blue: 'Бангура', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 957 },
  { id: '4LQgVQ1aVvs', title: 'Чангелия — Федоринчик', red: 'Чангелия', blue: 'Федоринчик', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 919 },
  { id: '1NBUPAi8Hyw', title: 'Серпитовский — Якимович', red: 'Серпитовский', blue: 'Якимович', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 915 },
  { id: 'vA7yhoPt41w', title: 'Хотак — Пархугаджиев · титул WTKF', red: 'Хотак', blue: 'Пархугаджиев', event: 'osminog-7', discipline: 'mma', kind: 'fight', views: 887 },
  { id: 'OfwJJ6kZq-0', title: 'Менча — Савин', red: 'Менча', blue: 'Савин', event: 'osminog-7', discipline: 'boxing', kind: 'fight', views: 805 },
  { id: '4-AuwirjLac', title: 'Вафайе — Быбочкин', red: 'Вафайе', blue: 'Быбочкин', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 719 },
  { id: 'l3J2MotTkuc', title: 'Кямалов — Лапаник', red: 'Кямалов', blue: 'Лапаник', event: 'osminog-7', discipline: 'k1', kind: 'fight', views: 687 },
];

export const channel = {
  name: 'Chinuk Gym',
  url: 'https://www.youtube.com/@chinukgym',
  videos: 'https://www.youtube.com/@chinukgym/videos',
};
