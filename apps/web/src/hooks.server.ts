import { withClerkHandler, buildClerkProps } from 'svelte-clerk/server';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const clerkHandler: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const softAuthPages = ['/learn', '/progress', '/practice', '/sign-in', '/sign-up'];
  const isSoft = softAuthPages.some((r) => path.startsWith(r));

  if (isSoft) {
    return clerkForSoftAuth({ event, resolve });
  }
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

const clerkForSoftAuth: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  try {
    const { createClerkClient } = await import('@clerk/backend');
    const publishableKey = publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY;
    const secretKey = privateEnv.CLERK_SECRET_KEY;

    console.log(`[soft-auth:${path}] keys present: pub=${!!publishableKey} secret=${!!secretKey}`);

    if (!publishableKey || !secretKey) {
      console.log(`[soft-auth:${path}] missing keys`);
      event.locals.auth = { userId: null };
      return resolve(event);
    }

    const clerk = createClerkClient({ secretKey, publishableKey });
    const requestState = await clerk.authenticateRequest(event.request);

    const locationHeader = requestState.headers.get('location');
    console.log(`[soft-auth:${path}] auth status=${requestState.status}, location=${locationHeader || 'none'}`);

    if (locationHeader) {
      console.log(`[soft-auth:${path}] skipping handshake redirect`);
      event.locals.auth = { userId: null };
    } else {
      event.locals.auth = { userId: requestState.toAuth().userId };
    }
    return resolve(event);
  } catch (err) {
    console.error(`[soft-auth:${path}] error:`, err?.message, err?.stack?.split('\n')[1]);
    event.locals.auth = { userId: null };
    return resolve(event);
  }
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
