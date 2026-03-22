import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@': './src'
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: Clerk auth
          vendor: [
            'clerk-sveltekit',
          ],
          // Svelte framework chunk
          svelte: ['svelte', 'svelte/transition', 'svelte/animate', 'svelte/store'],
          // Core app chunks
          core: [
            '@typeforge/metrics',
            '@typeforge/curriculum',
            '@typeforge/layouts',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'drizzle-orm',
      '@clerk/backend',
      'clerk-sveltekit',
      '@typeforge/ui',
      '@typeforge/metrics',
      '@typeforge/curriculum',
      '@typeforge/layouts',
      '@typeforge/api',
    ],
  },
});
