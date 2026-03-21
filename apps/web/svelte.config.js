import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      },
      platformProxy: {
        configPath: '../../wrangler.toml',
        environment: undefined
      }
    }),
    alias: {
      '@': './src',
      '@typeforge/db': '../../packages/db',
      '@typeforge/metrics': '../../packages/metrics',
      '@typeforge/layouts': '../../packages/layouts',
      '@typeforge/curriculum': '../../packages/curriculum',
      '@typeforge/ui': '../../packages/ui'
    }
  }
};

export default config;
