<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Onboarding — TypeForge</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-20">
  <div class="text-center mb-12">
    <h1 class="font-headline text-4xl mb-4">Welcome to TypeForge</h1>
    <p class="text-on-surface-variant">Let's set up your typing experience</p>
  </div>

  <!-- Step 1: Language -->
  <div class="bg-surface-container-low p-8 mb-6">
    <h2 class="font-headline text-xl mb-4">Step 1: Choose your language</h2>
    <select class="w-full bg-surface-container text-on-surface p-3">
      <option>English</option>
      <option>French</option>
      <option>German</option>
      <option>Spanish</option>
    </select>
  </div>

  <!-- Step 2: Keyboard Layout -->
  <div class="bg-surface-container-low p-8 mb-6">
    <h2 class="font-headline text-xl mb-4">Step 2: Select your keyboard layout</h2>
    <select class="w-full bg-surface-container text-on-surface p-3">
      <option>QWERTY (US)</option>
      <option>AZERTY (French)</option>
      <option>QWERTZ (German)</option>
    </select>
  </div>

  <!-- Step 3: Goals -->
  <div class="bg-surface-container-low p-8 mb-8">
    <h2 class="font-headline text-xl mb-4">Step 3: Set your daily goal</h2>
    <div class="flex gap-4">
      <button class="flex-1 bg-surface-container p-4 text-center hover:bg-surface-container-high transition-colors">
        <div class="font-label text-2xl text-secondary">10</div>
        <div class="text-on-surface-variant text-sm">min/day</div>
      </button>
      <button class="flex-1 bg-primary-container p-4 text-center">
        <div class="font-label text-2xl text-on-primary-container">20</div>
        <div class="text-on-primary-container text-sm">min/day</div>
      </button>
      <button class="flex-1 bg-surface-container p-4 text-center hover:bg-surface-container-high transition-colors">
        <div class="font-label text-2xl text-secondary">30</div>
        <div class="text-on-surface-variant text-sm">min/day</div>
      </button>
    </div>
  </div>

  <button class="w-full bg-primary-container text-on-primary-container py-4 font-label font-bold text-lg">
    Start Typing
  </button>
</div>
