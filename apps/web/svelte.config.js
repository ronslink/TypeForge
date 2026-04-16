import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ runtime: 'nodejs20.x' }),
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
