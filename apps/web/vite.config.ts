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
        },
      },
    },
  },
  optimizeDeps: {
    exclude: [
      '@typeforge/api',
      '@typeforge/db',
      '@typeforge/curriculum',
    ],
  },
});
