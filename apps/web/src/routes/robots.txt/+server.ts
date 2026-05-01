import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const robotsTxt = `User-agent: *
Allow: /

# Do not index private application routes to avoid crawl errors
Disallow: /settings/
Disallow: /learn/
Disallow: /practice/
Disallow: /progress/
Disallow: /onboarding/

Sitemap: https://typeforge.app/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
