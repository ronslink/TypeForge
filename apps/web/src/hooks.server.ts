import { withClerkHandler, buildClerkProps } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// Clerk handler for app routes that require auth context
const clerkForApp: Handle = async ({ event, resolve }) => {
  return withClerkHandler({
    publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY,
    secretKey: privateEnv.CLERK_SECRET_KEY,
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
  })({ event, resolve });
};

// Lightweight Clerk handler for soft-auth pages - auth context only, never redirects
// This avoids the handshake redirect that causes 500s on soft-auth pages
const clerkForSoftAuth: Handle = async ({ event, resolve }) => {
  try {
    const { createClerkClient } = await import('@clerk/backend');
    const publishableKey = publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY;
    const secretKey = privateEnv.CLERK_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      event.locals.auth = { userId: null };
      return resolve(event);
    }

    const clerk = createClerkClient({ secretKey, publishableKey });
    const requestState = await clerk.authenticateRequest(event.request);

    // If handshake redirect is needed, skip it and continue without auth
    const locationHeader = requestState.headers.get('location');
    if (locationHeader) {
      console.warn('[Clerk soft-auth] skipping handshake redirect:', locationHeader);
      event.locals.auth = { userId: null };
    } else {
      event.locals.auth = { userId: requestState.toAuth().userId };
    }
    return resolve(event);
  } catch (err) {
    console.warn('[Clerk soft-auth error]', err);
    event.locals.auth = { userId: null };
    return resolve(event);
  }
};

// Route-specific handler selection
const clerkHandler: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const softAuthPages = ['/learn', '/progress', '/practice', '/sign-in', '/sign-up'];
  if (softAuthPages.some((r) => path.startsWith(r))) {
    return clerkForSoftAuth({ event, resolve });
  }
  return clerkForApp({ event, resolve });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { userId } = event.locals.auth ?? {};
  const currentPath = event.url.pathname;

  // Let SvelteKit handle 404s and other non-resolvable routes
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
