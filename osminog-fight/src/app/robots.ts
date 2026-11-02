import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export const dynamic = 'force-static';

/**
 * Индексация: открыто всё публичное, закрыты личный кабинет и служебный каркас форм.
 * ИИ-поисковики (ChatGPT, Claude, Perplexity, Gemini, Яндекс-нейро) допущены явно —
 * чтобы лига попадала в ответы ИИ (GEO); краткая справка для них — /llms.txt.
 */
const closed = ['/me/', '/__forms.html'];
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'YandexAdditional', 'YandexAdditionalBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: closed },
      { userAgent: aiBots, allow: '/', disallow: closed },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
