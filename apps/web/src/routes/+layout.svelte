<script lang="ts">
  import '../app.css';
  import { ClerkProvider } from 'svelte-clerk';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
</script>

<ClerkProvider {...data}>
  <div class="min-h-screen bg-background text-on-background">
    {@render children()}
  </div>
</ClerkProvider>
