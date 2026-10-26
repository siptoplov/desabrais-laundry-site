/**
 * Схема для Sanity Studio (v3) — повторяет типы из src/content/types.ts.
 * Как подключить:
 *   1) npm create sanity@latest  (в отдельной папке studio/)
 *   2) скопируйте этот файл в studio/schemaTypes/osminog.ts и экспортируйте schemaTypes
 *   3) в src/lib/cms.ts замените чтение из src/content на запросы GROQ (пример — в README)
 * Объекты ниже — обычный формат Sanity (defineType не обязателен).
 */

const disciplineOptions = [
  { title: 'К-1', value: 'k1' },
  { title: 'Муай-тай', value: 'muaythai' },
  { title: 'Бокс', value: 'boxing' },
  { title: 'ММА', value: 'mma' },
  { title: 'Евро-тай', value: 'eurothai' },
];

export const fighter = {
  name: 'fighter',
  title: 'Боец',
  type: 'document',
  fields: [
    { name: 'firstName', title: 'Имя', type: 'string' },
    { name: 'lastName', title: 'Фамилия', type: 'string', validation: (r: { required: () => unknown }) => r.required() },
    { name: 'slug', title: 'Адрес страницы', type: 'slug', options: { source: 'lastName' } },
    { name: 'nickname', title: 'Прозвище', type: 'string' },
    { name: 'country', title: 'Страна (код: BY, RU…)', type: 'string' },
    { name: 'city', title: 'Город', type: 'string' },
    { name: 'disciplines', title: 'Дисциплины', type: 'array', of: [{ type: 'string' }], options: { list: disciplineOptions } },
    { name: 'weightKg', title: 'Весовая категория, кг', type: 'number' },
    { name: 'record', title: 'Рекорд', type: 'object', fields: [{ name: 'w', title: 'Победы', type: 'number' }, { name: 'l', title: 'Поражения', type: 'number' }, { name: 'd', title: 'Ничьи', type: 'number' }] },
    { name: 'winRate', title: 'Доля побед, %', type: 'number' },
    { name: 'age', title: 'Возраст', type: 'number' },
    { name: 'heightCm', title: 'Рост, см', type: 'number' },
    { name: 'photo', title: 'Портрет 4:5', type: 'image', options: { hotspot: true } },
    { name: 'bio', title: 'Биография (абзацы)', type: 'array', of: [{ type: 'text' }] },
    { name: 'titles', title: 'Титулы', type: 'array', of: [{ type: 'string' }] },
    { name: 'status', title: 'Статус', type: 'string', options: { list: ['active', 'retired'] }, initialValue: 'active' },
    { name: 'badges', title: 'Метки', type: 'array', of: [{ type: 'string' }], options: { list: ['champion', 'replacement', 'veteran', 'prospect', 'unbeaten', 'home'] } },
    { name: 'featured', title: 'Показывать на главной', type: 'boolean' },
  ],
};

export const bout = {
  name: 'bout',
  title: 'Бой',
  type: 'object',
  fields: [
    { name: 'red', title: 'Красный угол', type: 'reference', to: [{ type: 'fighter' }] },
    { name: 'redName', title: '…или фамилия (если профиля нет)', type: 'string' },
    { name: 'blue', title: 'Синий угол', type: 'reference', to: [{ type: 'fighter' }] },
    { name: 'blueName', title: '…или фамилия (если профиля нет)', type: 'string' },
    { name: 'discipline', title: 'Дисциплина', type: 'string', options: { list: disciplineOptions } },
    { name: 'weightKg', title: 'Вес, кг', type: 'number' },
    { name: 'rules', title: 'Регламент', type: 'string' },
    { name: 'position', title: 'Позиция в карде', type: 'string', options: { list: ['main', 'co-main', 'main-card', 'undercard', 'special', 'title'] } },
    { name: 'headline', title: 'Заголовок боя', type: 'string' },
    { name: 'note', title: 'Описание', type: 'text' },
    { name: 'video', title: 'YouTube ID', type: 'string' },
    { name: 'titleFight', title: 'Титул на кону', type: 'string' },
    {
      name: 'result',
      title: 'Результат',
      type: 'object',
      fields: [
        { name: 'winner', title: 'Победитель', type: 'string', options: { list: ['red', 'blue', 'draw'] } },
        { name: 'method', title: 'Способ', type: 'string', options: { list: ['KO', 'TKO', 'UD', 'SD', 'MD', 'DEC', 'DQ', 'NC', 'DRAW'] } },
        { name: 'round', title: 'Раунд', type: 'number' },
        { name: 'time', title: 'Время', type: 'string' },
        { name: 'scorecards', title: 'Записки судей', type: 'array', of: [{ type: 'string' }] },
        { name: 'note', title: 'Комментарий', type: 'string' },
      ],
    },
  ],
};

export const event = {
  name: 'event',
  title: 'Турнир',
  type: 'document',
  fields: [
    { name: 'title', title: 'Название', type: 'string' },
    { name: 'slug', title: 'Адрес страницы', type: 'slug', options: { source: 'title' } },
    { name: 'number', title: 'Номер', type: 'number' },
    { name: 'collab', title: 'Совместно с', type: 'string' },
    { name: 'tagline', title: 'Подзаголовок', type: 'string' },
    { name: 'date', title: 'Дата и время (пусто — «скоро»)', type: 'datetime' },
    { name: 'status', title: 'Статус', type: 'string', options: { list: ['upcoming', 'past'] } },
    { name: 'venue', title: 'Площадка', type: 'string' },
    { name: 'city', title: 'Город', type: 'string' },
    { name: 'address', title: 'Адрес', type: 'string' },
    { name: 'poster', title: 'Постер 4:5', type: 'image' },
    { name: 'posters', title: 'Пресс-постеры', type: 'array', of: [{ type: 'image', fields: [{ name: 'alt', type: 'string', title: 'Описание' }] }] },
    { name: 'story', title: 'Описание (абзацы)', type: 'array', of: [{ type: 'text' }] },
    { name: 'schedule', title: 'Расписание', type: 'array', of: [{ type: 'object', fields: [{ name: 'time', type: 'string' }, { name: 'title', type: 'string' }, { name: 'text', type: 'string' }] }] },
    { name: 'bouts', title: 'Кард', type: 'array', of: [{ type: 'bout' }] },
    {
      name: 'tickets',
      title: 'Билеты',
      type: 'object',
      fields: [
        { name: 'status', title: 'Статус', type: 'string', options: { list: ['soon', 'onsale', 'soldout', 'closed'] } },
        { name: 'url', title: 'Ссылка на продажу', type: 'url' },
        { name: 'vendor', title: 'Оператор', type: 'string' },
        { name: 'from', title: 'Цена от', type: 'number' },
        { name: 'to', title: 'Цена до', type: 'number' },
        { name: 'refund', title: 'Условия возврата', type: 'text' },
      ],
    },
  ],
};

export const news = {
  name: 'news',
  title: 'Новость',
  type: 'document',
  fields: [
    { name: 'title', title: 'Заголовок', type: 'string' },
    { name: 'slug', title: 'Адрес', type: 'slug', options: { source: 'title' } },
    { name: 'date', title: 'Дата', type: 'date' },
    { name: 'tag', title: 'Рубрика', type: 'string', options: { list: ['Анонс', 'Кард', 'Итоги', 'Лига', 'Шоу', 'Замена'] } },
    { name: 'lead', title: 'Лид', type: 'text' },
    { name: 'body', title: 'Текст (абзацы)', type: 'array', of: [{ type: 'text' }] },
    { name: 'image', title: 'Картинка', type: 'image' },
    { name: 'event', title: 'Турнир', type: 'reference', to: [{ type: 'event' }] },
  ],
};

export const video = {
  name: 'video',
  title: 'Видео',
  type: 'document',
  fields: [
    { name: 'id', title: 'YouTube ID', type: 'string' },
    { name: 'title', title: 'Название', type: 'string' },
    { name: 'event', title: 'Турнир', type: 'reference', to: [{ type: 'event' }] },
    { name: 'kind', title: 'Тип', type: 'string', options: { list: ['fight', 'interview', 'backstage', 'ceremony'] } },
    { name: 'discipline', title: 'Дисциплина', type: 'string', options: { list: disciplineOptions } },
    { name: 'views', title: 'Просмотры', type: 'number' },
  ],
};

export const schemaTypes = [fighter, bout, event, news, video];
