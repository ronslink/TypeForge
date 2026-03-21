<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Progress — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Your Progress</h1>

  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Total Time</span>
      <div class="font-label text-3xl text-secondary font-bold mt-2">0h</div>
    </div>
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Lessons Done</span>
      <div class="font-label text-3xl text-secondary font-bold mt-2">0</div>
    </div>
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Best WPM</span>
      <div class="font-label text-3xl text-primary font-bold mt-2">--</div>
    </div>
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Avg Accuracy</span>
      <div class="font-label text-3xl text-secondary font-bold mt-2">--</div>
    </div>
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
    <div class="bg-surface-container p-6">
      <h2 class="font-headline text-xl mb-4">WPM Over Time</h2>
      <div class="h-64 flex items-center justify-center text-on-surface-variant">
        Chart placeholder
      </div>
    </div>
    <div class="bg-surface-container p-6">
      <h2 class="font-headline text-xl mb-4">Accuracy Over Time</h2>
      <div class="h-64 flex items-center justify-center text-on-surface-variant">
        Chart placeholder
      </div>
    </div>
  </div>

  <!-- Weak Keys -->
  <div class="bg-surface-container p-6">
    <h2 class="font-headline text-xl mb-4">Keys to Practice</h2>
    <p class="text-on-surface-variant">Complete more lessons to see your weak keys.</p>
  </div>
</div>
