import type { LayoutServerLoad } from './$types';
import { buildClerkProps } from 'svelte-clerk/server';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Preload critical fonts for better performance
  const fontPreloads = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/inter-var-latin.woff2',
      crossorigin: 'anonymous'
    }
  ];

  const auth = locals.auth ?? {};
  const userId = typeof auth === 'object' && auth !== null ? auth.userId : null;

  return {
    fontPreloads,
    isSignedIn: !!userId,
    ...buildClerkProps(auth)
  };
};
