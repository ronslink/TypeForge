import { withClerkHandler } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const authGuard: Handle = async ({ event, resolve }) => {
  // Extract auth context injected by svelte-clerk
  const { userId } = event.locals.auth ?? {};
  const currentPath = event.url.pathname;

  // Paths that do not enforce login wall
  const publicRoutes = ['/onboarding', '/games/cascade'];
  const softAuthPages = ['/learn', '/progress', '/practice', '/sign-in', '/sign-up'];
  
  const isPublic = publicRoutes.some((r) => currentPath.startsWith(r));
  const isSoft = softAuthPages.some((r) => currentPath.startsWith(r));

  // Direct unauthenticated users away from protected areas (e.g. /settings, /billing, /org)
  if (!userId && !isPublic && !isSoft && currentPath !== '/') {
    return new Response(null, {
      status: 302,
      headers: { location: `/sign-in?redirect_url=${encodeURIComponent(currentPath)}` }
    });
  }

  return resolve(event);
};

export const handle = sequence(
  withClerkHandler({
    publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY,
    secretKey: privateEnv.CLERK_SECRET_KEY,
  }),
  authGuard
);
