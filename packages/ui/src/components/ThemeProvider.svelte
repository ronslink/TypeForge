<script lang="ts">
  let { children, defaultTheme = 'light' }: { children: any; defaultTheme?: 'light' | 'dark' | 'system' } = $props();

  let currentTheme = $state(defaultTheme);
  let mounted = $state(false);

  $effect(() => {
    mounted = true;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      if (stored && ['light', 'dark'].includes(stored)) {
        currentTheme = stored;
      }
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined' && mounted) {
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
    }
  });
</script>

<div data-theme-provider style="display: contents">
  {@render children()}
</div>
