import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    external: ['cloudflare:workers'],
  },
  resolve: {
    alias: {
      '@': './src',
      '@typeforge/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@typeforge/ui/components/MetricsBar.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/MetricsBar.svelte'
      ),
      '@typeforge/ui/components/Keyboard.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/Keyboard.svelte'
      ),
      '@typeforge/ui/components/Button.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/Button.svelte'
      ),
      '@typeforge/ui/components/StatCard.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/StatCard.svelte'
      ),
      '@typeforge/ui/components/TypingInput.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/TypingInput.svelte'
      ),
      '@typeforge/ui/components/ProgressBar.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ProgressBar.svelte'
      ),
      '@typeforge/ui/components/Badge.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/Badge.svelte'
      ),
      '@typeforge/ui/components/ProgressRing.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ProgressRing.svelte'
      ),
      '@typeforge/ui/components/LessonCard.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/LessonCard.svelte'
      ),
      '@typeforge/ui/components/LessonIntroModal.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/LessonIntroModal.svelte'
      ),
      '@typeforge/ui/components/EncouragementToast.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/EncouragementToast.svelte'
      ),
      '@typeforge/ui/components/ConfettiCelebration.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ConfettiCelebration.svelte'
      ),
      '@typeforge/ui/components/MilestoneToast.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/MilestoneToast.svelte'
      ),
      '@typeforge/ui/components/Celebration.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/Celebration.svelte'
      ),
      '@typeforge/ui/components/LevelUp.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/LevelUp.svelte'
      ),
      '@typeforge/ui/components/AchievementBadge.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/AchievementBadge.svelte'
      ),
      '@typeforge/ui/components/OrgDashboard.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/OrgDashboard.svelte'
      ),
      '@typeforge/ui/components/ClassOverview.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ClassOverview.svelte'
      ),
      '@typeforge/ui/components/StudentRow.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/StudentRow.svelte'
      ),
      '@typeforge/ui/components/StudentProgressReport.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/StudentProgressReport.svelte'
      ),
      '@typeforge/ui/components/ClassRoster.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ClassRoster.svelte'
      ),
      '@typeforge/ui/components/OrgStatsPanel.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/OrgStatsPanel.svelte'
      ),
      '@typeforge/ui/components/InviteStudentModal.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/InviteStudentModal.svelte'
      ),
      '@typeforge/ui/components/ThemeProvider.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/ThemeProvider.svelte'
      ),
      '@typeforge/ui/components/WeaknessHeatmap.svelte': path.resolve(
        __dirname,
        '../../packages/ui/src/components/WeaknessHeatmap.svelte'
      ),
      '@typeforge/metrics': path.resolve(__dirname, '../../packages/metrics/src'),
      '@typeforge/curriculum': path.resolve(__dirname, '../../packages/curriculum/src'),
      '@typeforge/layouts': path.resolve(__dirname, '../../packages/layouts/src'),
      '@typeforge/api': path.resolve(__dirname, '../../apps/api/src/index.ts'),
      '@typeforge/api/client': path.resolve(__dirname, '../../apps/api/src/client.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Svelte framework chunk
          svelte: ['svelte', 'svelte/transition', 'svelte/animate', 'svelte/store'],
          // UI components chunk
          ui: ['@typeforge/ui'],
          // Core app chunks
          core: ['@typeforge/metrics', '@typeforge/curriculum', '@typeforge/layouts'],
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['messages', '../../packages', '../..'],
    },
  },
  optimizeDeps: {
    include: [
      'drizzle-orm',
      '@typeforge/ui',
      '@typeforge/metrics',
      '@typeforge/curriculum',
      '@typeforge/layouts',
      '@typeforge/api',
    ],
  },
});
