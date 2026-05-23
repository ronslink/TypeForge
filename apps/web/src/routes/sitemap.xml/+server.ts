import { ALL_LANGUAGES } from '$lib/i18n/languages';
import { PUBLIC_SITEMAP_ROUTES, absoluteUrl } from '$lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const staticUrls = PUBLIC_SITEMAP_ROUTES.map(
    (route) => `
    <url>
      <loc>${absoluteUrl(route.path)}</loc>
      <changefreq>${route.changefreq}</changefreq>
      <priority>${route.priority}</priority>
    </url>
  `
  ).join('');

  const dynamicUrls = ALL_LANGUAGES.map(
    (lang) => `
    <url>
      <loc>${absoluteUrl(`/languages/${lang.code}`)}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>
  `
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${dynamicUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
