<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Lesson — TypeForge</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
  <div class="mb-8">
    <a href="/learn" class="text-on-surface-variant hover:text-primary transition-colors">
      ← Back to lessons
    </a>
  </div>

  <h1 class="font-headline text-3xl mb-4">Lesson: Home Row</h1>
  
  <!-- Progress -->
  <div class="mb-8">
    <div class="h-1 bg-surface-container-highest">
      <div class="h-full bg-secondary w-0"></div>
    </div>
  </div>

  <!-- Typing Area -->
  <div class="bg-surface-container-lowest p-8 mb-8">
    <div class="font-label text-2xl leading-relaxed text-on-surface/40">
      <span class="text-on-surface">a</span>
      <span>s</span>
      <span>d</span>
      <span>f</span>
      <span> </span>
      <span>j</span>
      <span>k</span>
      <span>l</span>
      <span>;</span>
    </div>
  </div>

  <!-- Stats Bar -->
  <div class="grid grid-cols-4 gap-4 mb-8">
    <div class="bg-surface-container-low p-4 text-center">
      <span class="font-label text-xs text-on-surface-variant">WPM</span>
      <div class="font-label text-2xl text-secondary">0</div>
    </div>
    <div class="bg-surface-container-low p-4 text-center">
      <span class="font-label text-xs text-on-surface-variant">Accuracy</span>
      <div class="font-label text-2xl text-secondary">100%</div>
    </div>
    <div class="bg-surface-container-low p-4 text-center">
      <span class="font-label text-xs text-on-surface-variant">Time</span>
      <div class="font-label text-2xl text-on-surface">0:00</div>
    </div>
    <div class="bg-surface-container-low p-4 text-center">
      <span class="font-label text-xs text-on-surface-variant">Errors</span>
      <div class="font-label text-2xl text-error">0</div>
    </div>
  </div>

  <!-- Keyboard Visual -->
  <div class="bg-surface-container p-4">
    <p class="text-on-surface-variant text-center">Keyboard visualization placeholder</p>
  </div>
</div>
