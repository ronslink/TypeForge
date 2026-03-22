/**
 * Re-export from src/client.ts so @typeforge/api/client resolves
 * without requiring package.json exports field support in bundlers.
 */
export * from './src/client.js';
export { default } from './src/client.js';
