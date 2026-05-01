import { ALL_LANGUAGES } from '$lib/i18n/languages';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://typeforge.app';

  // Core static routes
  const staticRoutes = [
    '',
    '/languages',
    '/pricing',
    '/contact',
    '/typing-guide',
    '/privacy-policy',
    '/terms-of-service',
    '/sign-up',
    '/sign-in'
  ];

  const now = new Date().toISOString();

  // Generate URL elements for static routes
  const staticUrls = staticRoutes.map((route) => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('');

  // Generate URL elements for dynamic language landing pages
  const dynamicUrls = ALL_LANGUAGES.map((lang) => `
    <url>
      <loc>${baseUrl}/languages/${lang.code}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${dynamicUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
