import { withClerkHandler } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// Lightweight auth checker that never throws or redirects
// Used for soft-auth pages where we want auth context but not enforced redirects
const clerkAuthOnly: Handle = async ({ event, resolve }) => {
  try {
    // Use the server-side ClerkClient directly without the full middleware
    const { createClerkClient } = await import('@clerk/backend');
    const publishableKey = publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY;
    const secretKey = privateEnv.CLERK_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      event.locals.auth = { userId: null };
      return resolve(event);
    }

    const clerk = createClerkClient({ secretKey, publishableKey });
    const requestState = await clerk.authenticateRequest(event.request);

    // If there's a redirect header, we're in a handshake — skip it for soft-auth pages
    // The client-side ClerkProvider will handle this naturally
    const locationHeader = requestState.headers.get('location');
    if (locationHeader) {
      // Just set auth to null and let the page render without auth context
      event.locals.auth = { userId: null };
      return resolve(event);
    }

    event.locals.auth = { userId: requestState.toAuth().userId };
    return resolve(event);
  } catch (err) {
    console.warn('[Clerk auth check failed]', err);
    event.locals.auth = { userId: null };
    return resolve(event);
  }
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

export const handle = sequence(clerkAuthOnly, authGuard);
