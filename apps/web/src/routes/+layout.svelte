<script lang="ts">
  import '../app.css';
  import { ClerkProvider } from 'svelte-clerk';
  import type { LayoutProps } from './$types';
  import LocaleInit from '$lib/components/LocaleInit.svelte';

  let { children, data }: LayoutProps = $props();
</script>

<ClerkProvider {...data}>
  <div class="min-h-screen bg-background text-on-background">
    <LocaleInit />
    {@render children()}
  </div>
</ClerkProvider>
