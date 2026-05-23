<script lang="ts">
  import '../app.css';
  import { ClerkProvider } from 'svelte-clerk';
  import type { LayoutProps } from './$types';
  import LocaleInit from '$lib/components/LocaleInit.svelte';
  import Analytics from '$lib/components/Analytics.svelte';

  let { children, data }: LayoutProps = $props();
</script>

<ClerkProvider {...data}>
  <Analytics />
  <div class="min-h-screen bg-background text-on-background">
    <LocaleInit />
    {@render children()}
  </div>
</ClerkProvider>
