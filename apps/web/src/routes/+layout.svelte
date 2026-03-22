<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data: _data }: Props = $props();
</script>

<div class="min-h-screen bg-background text-on-background">
  {@render children()}
</div>
