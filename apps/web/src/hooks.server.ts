import { withClerkHandler, buildClerkProps } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'it', 'ru'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Parse Accept-Language header and return the best matching supported locale */
function detectLocale(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return 'en';
  for (const part of acceptLanguage.split(',')) {
    const code = part.trim().split(';')[0]!.split('-')[0]!.toLowerCase();
    if (SUPPORTED_LOCALES.includes(code as SupportedLocale)) return code as SupportedLocale;
  }
  return 'en';
}

const clerkHandler: Handle = async ({ event, resolve }) => {
  return clerkForApp({ event, resolve });
};

const clerkForApp: Handle = async ({ event, resolve }) => {
  return withClerkHandler({
    publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY,
    secretKey: privateEnv.CLERK_SECRET_KEY,
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
  })({ event, resolve });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { userId } = event.locals.auth ?? {};
  const currentPath = event.url.pathname;

  if (event.route.id === null) {
    return resolve(event);
  }

  const publicRoutes = [
    '/',
    '/onboarding',
    '/games/cascade',
    '/api',
    '/pricing',
    '/contact',
    '/languages',
    '/typing-guide',
    '/privacy-policy',
    '/terms-of-service',
    '/sitemap.xml',
    '/robots.txt'
  ];
  const softAuthPages = ['/learn', '/progress', '/practice', '/sign-in', '/sign-up'];

  const isPublic = publicRoutes.some((r) => currentPath === r || currentPath.startsWith(r + '/'));
  const isSoft = softAuthPages.some((r) => currentPath.startsWith(r));

  if (!userId && !isPublic && !isSoft && currentPath !== '/') {
    return new Response(null, {
      status: 302,
      headers: { location: `/sign-in?redirect_url=${encodeURIComponent(currentPath)}` }
    });
  }

  // Detect locale from Accept-Language for SSR
  const detectedLocale = detectLocale(event.request.headers.get('Accept-Language'));
  event.locals.detectedLocale = detectedLocale;

  const isRtl = ['ar', 'he'].includes(detectedLocale);
  const htmlAttributes = `lang="${detectedLocale}"${isRtl ? ' dir="rtl"' : ''}`;

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%sveltekit.htmlAttributes%', htmlAttributes),
  });
};

export const handle = sequence(clerkHandler, authGuard);
