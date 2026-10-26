/** Путь к файлу из public/ с учётом basePath (если сайт живёт в подпапке) */
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (p: string) => `${base}${p}`;
/** Адаптивный набор для портретов бойцов: <slug>-480.webp и <slug>.webp (960) */
export const photoSrcSet = (p: string) => `${asset(p)}-480.webp 480w, ${asset(p)}.webp 960w`;
/** Постеры: <name>-560.webp и <name>-1080.webp */
export const posterSrcSet = (p: string) => `${asset(p)}-560.webp 560w, ${asset(p)}-1080.webp 1080w`;
export const ytThumb = (id: string, q: 'hq' | 'mq' | 'maxres' = 'hq') => `https://i.ytimg.com/vi/${id}/${q}default.jpg`;
