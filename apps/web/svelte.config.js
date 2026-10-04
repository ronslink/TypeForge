import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ 
      // Must match vercel.json and the API route's `config.runtime`. nodejs20.x is
      // discontinued on Vercel and the deployment is rejected outright, so the
      // build succeeds and only the upload fails — which is a confusing way to
      // find out.
      runtime: 'nodejs22.x',
      external: ['cloudflare:workers'],
    }),
    alias: {
      '@': './src',
      '@typeforge/db': '../../packages/db',
      '@typeforge/metrics': '../../packages/metrics',
      '@typeforge/layouts': '../../packages/layouts',
      '@typeforge/curriculum': '../../packages/curriculum',
      '@typeforge/ui': '../../packages/ui',
      '@typeforge/api': '../../apps/api',
    },
  },
};

export default config;
