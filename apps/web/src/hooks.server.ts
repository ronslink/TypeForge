import { withClerkHandler, buildClerkProps } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

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
    '/terms-of-service'
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

  return resolve(event);
};

export const handle = sequence(clerkHandler, authGuard);
