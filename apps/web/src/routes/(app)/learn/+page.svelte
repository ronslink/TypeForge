<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Learn — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-4">Learn</h1>
  <p class="text-on-surface-variant mb-8">Choose a lesson to practice your typing skills.</p>

  <!-- Lesson Categories -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Placeholder lesson cards -->
    <div class="bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Home Row</h3>
      <p class="text-on-surface-variant text-sm mb-4">Master the home row keys: A S D F J K L ;</p>
      <span class="font-label text-xs text-secondary">Beginner</span>
    </div>
    
    <div class="bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Top Row</h3>
      <p class="text-on-surface-variant text-sm mb-4">Learn the top row keys: Q W E R T Y U I O P</p>
      <span class="font-label text-xs text-secondary">Beginner</span>
    </div>
    
    <div class="bg-surface-container-low p-6 hover:bg-surface-container transition-colors">
      <h3 class="font-headline text-xl mb-2">Bottom Row</h3>
      <p class="text-on-surface-variant text-sm mb-4">Practice the bottom row: Z X C V B N M</p>
      <span class="font-label text-xs text-secondary">Beginner</span>
    </div>
  </div>
</div>
