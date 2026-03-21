<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Practice — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-4">Practice</h1>
  <p class="text-on-surface-variant mb-8">Free typing practice with custom text.</p>

  <!-- Practice Mode Selection -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <button class="bg-surface-container-low p-6 text-left hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Words</h3>
      <p class="text-on-surface-variant text-sm">Practice common words</p>
    </button>
    
    <button class="bg-surface-container-low p-6 text-left hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Sentences</h3>
      <p class="text-on-surface-variant text-sm">Type full sentences</p>
    </button>
    
    <button class="bg-surface-container-low p-6 text-left hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Custom</h3>
      <p class="text-on-surface-variant text-sm">Paste your own text</p>
    </button>
  </div>

  <!-- Practice Area -->
  <div class="bg-surface-container-lowest p-8">
    <p class="text-on-surface-variant text-center">Select a practice mode to begin</p>
  </div>
</div>
