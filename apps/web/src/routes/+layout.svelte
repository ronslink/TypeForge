<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { ClerkProvider } from 'svelte-clerk';

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();
</script>

<ClerkProvider>
  <div class="min-h-screen bg-background text-on-background">
    {@render children()}
  </div>
</ClerkProvider>
