<script lang="ts">
  import type { Snippet } from 'svelte';

  type Theme = 'light' | 'dark' | 'system';

  let { children, defaultTheme = 'light' }: { children: Snippet; defaultTheme?: Theme } = $props();

  let currentTheme: Theme = $state('light');
  let mounted = $state(false);

  $effect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null;
      currentTheme = stored && ['light', 'dark', 'system'].includes(stored) ? stored : defaultTheme;
      mounted = true;
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = () => {
        const resolvedTheme =
          currentTheme === 'system' ? (media.matches ? 'dark' : 'light') : currentTheme;
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      };

      applyTheme();
      localStorage.setItem('theme', currentTheme);

      if (currentTheme === 'system') {
        media.addEventListener('change', applyTheme);
        return () => media.removeEventListener('change', applyTheme);
      }
    }
  });
</script>

<div data-theme-provider style="display: contents">
  {@render children()}
</div>
