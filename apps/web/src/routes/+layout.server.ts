import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  // Preload critical fonts for better performance
  const fontPreloads = [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous'
    },
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/inter-var-latin.woff2',
      crossorigin: 'anonymous'
    }
  ];

  return {
    fontPreloads
  };
};
