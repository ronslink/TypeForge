import { withClerkHandler } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const authGuard: Handle = async ({ event, resolve }) => {
  const { userId } = event.locals.auth ?? {};
  const currentPath = event.url.pathname;

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

  // Render a proper 404 for unknown routes
  if (event.route.id === null) {
    return new Response('Not Found', { status: 404 });
  }

  if (!userId && !isPublic && !isSoft && currentPath !== '/') {
    return new Response(null, {
      status: 302,
      headers: { location: `/sign-in?redirect_url=${encodeURIComponent(currentPath)}` }
    });
  }

  return resolve(event);
};

const clerkSafe: Handle = async ({ event, resolve }) => {
  try {
    return await withClerkHandler({
      publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY,
      secretKey: privateEnv.CLERK_SECRET_KEY,
    })({ event, resolve });
  } catch (err) {
    // Clerk middleware threw — log and continue without auth
    console.warn('[Clerk middleware error]', err);
    event.locals.auth = { userId: null };
    try {
      return await resolve(event);
    } catch (resolveErr) {
      // Even resolve failed — return a safe error page instead of crashing
      console.error('[Resolve error after Clerk failure]', resolveErr);
      return new Response('Something went wrong', { status: 500 });
    }
  }
};

export const handle = sequence(clerkSafe, authGuard);