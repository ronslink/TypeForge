<script lang="ts">
  import { browser } from '$app/environment';
  import { theme, type Theme } from '$lib/stores/theme';

  let visible = $state(false);
  let mounted = $state(false);

  $effect(() => {
    mounted = true;
    if (browser) {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored && ['light', 'dark'].includes(stored)) {
        theme.set(stored);
      }
      visible = true;
    }
  });

  $effect(() => {
    if (browser && mounted) {
      document.documentElement.setAttribute('data-theme', $theme);
      localStorage.setItem('theme', $theme);
    }
  });
</script>

<div data-theme-provider style="display: contents">
  <slot />
</div>
