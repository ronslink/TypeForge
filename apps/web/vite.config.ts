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
    sourcemap: true
  }
});
