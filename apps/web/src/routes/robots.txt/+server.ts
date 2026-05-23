import type { RequestHandler } from './$types';
import { SITE } from '$lib/seo';

export const GET: RequestHandler = async () => {
  const robotsTxt = `User-agent: *
Allow: /

# Keep private and low-value application surfaces out of crawl paths.
Disallow: /api/
Disallow: /settings
Disallow: /billing
Disallow: /org
Disallow: /progress
Disallow: /certificate
Disallow: /onboarding

# Keep individual app lesson screens out while allowing the /learn landing page.
Disallow: /learn/

Sitemap: ${SITE.url}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
