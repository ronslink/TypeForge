<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext, getContext } from 'svelte';
  import { browser } from '$app/environment';

  type Theme = 'light' | 'dark' | 'system';

  interface ThemeContext {
    theme: typeof $state;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: typeof $derived;
  }

  interface Props {
    defaultTheme?: Theme;
    children: Snippet;
  }

  let { defaultTheme = 'system', children }: Props = $props();

  let theme = $state<Theme>(defaultTheme);
  let isDark = $derived(() => {
    if (theme === 'system') {
      if (browser) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return true; // Default to dark
    }
    return theme === 'dark';
  });

  function setTheme(newTheme: Theme) {
    theme = newTheme;
    if (browser) {
      localStorage.setItem('typeforge-theme', newTheme);
      updateDocumentTheme();
    }
  }

  function toggleTheme() {
    setTheme(isDark() ? 'light' : 'dark');
  }

  function updateDocumentTheme() {
    if (browser) {
      document.documentElement.classList.toggle('dark', isDark());
      document.documentElement.setAttribute('data-theme', isDark() ? 'dark' : 'light');
    }
  }

  // Initialize from localStorage
  $effect(() => {
    if (browser) {
      const stored = localStorage.getItem('typeforge-theme') as Theme | null;
      if (stored) {
        theme = stored;
      }
      updateDocumentTheme();

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (theme === 'system') {
          updateDocumentTheme();
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  });

  // Provide context for child components
  const context: ThemeContext = {
    get theme() { return theme; },
    setTheme,
    toggleTheme,
    get isDark() { return isDark(); },
  };
  setContext('theme', context);
</script>

{@render children()}

<style>
  /* Theme variables are defined in app.css */
</style>
