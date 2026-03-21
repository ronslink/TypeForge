<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Settings — TypeForge</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Settings</h1>

  <!-- Typing Preferences -->
  <section class="mb-12">
    <h2 class="font-headline text-2xl mb-6">Typing Preferences</h2>
    
    <div class="space-y-6">
      <div class="bg-surface-container-low p-6">
        <label class="block font-label text-sm mb-2">Keyboard Layout</label>
        <select class="w-full bg-surface-container text-on-surface p-3">
          <option>QWERTY (US)</option>
          <option>AZERTY (French)</option>
          <option>QWERTZ (German)</option>
        </select>
      </div>

      <div class="bg-surface-container-low p-6">
        <label class="block font-label text-sm mb-2">Language</label>
        <select class="w-full bg-surface-container text-on-surface p-3">
          <option>English</option>
          <option>French</option>
          <option>German</option>
        </select>
      </div>

      <div class="bg-surface-container-low p-6 flex justify-between items-center">
        <div>
          <span class="font-label text-sm">Show Keyboard Visual</span>
          <p class="text-on-surface-variant text-sm">Display the keyboard while typing</p>
        </div>
        <button class="w-12 h-6 bg-primary-container rounded-full"></button>
      </div>

      <div class="bg-surface-container-low p-6 flex justify-between items-center">
        <div>
          <span class="font-label text-sm">Sound Effects</span>
          <p class="text-on-surface-variant text-sm">Play sounds on keystrokes</p>
        </div>
        <button class="w-12 h-6 bg-surface-container-highest rounded-full"></button>
      </div>
    </div>
  </section>

  <!-- Account -->
  <section>
    <h2 class="font-headline text-2xl mb-6">Account</h2>
    <div class="bg-surface-container-low p-6">
      <p class="text-on-surface-variant">Account settings placeholder</p>
    </div>
  </section>
</div>
