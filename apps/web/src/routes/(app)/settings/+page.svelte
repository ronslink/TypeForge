<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Settings — TypingScholar</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Settings</h1>

  <!-- Typing Preferences -->
  <section class="mb-12">
    <h2 class="font-headline text-2xl mb-6">Typing Preferences</h2>
    
    <div class="space-y-6">
      <div class="bg-surface-container-low p-6">
        <label for="keyboard-layout" class="block font-label text-sm mb-2">Keyboard Layout</label>
        <select id="keyboard-layout" class="w-full bg-surface-container text-on-surface p-3 cursor-pointer">
          <option value="qwerty-us">QWERTY (US)</option>
          <option value="dvorak">Dvorak</option>
          <option value="azerty-fr">AZERTY (FR)</option>
          <option value="qwertz-de">QWERTZ (DE)</option>
          <option value="cyrillic-ru">Cyrillic (RU)</option>
          <option value="arabic">Arabic</option>
          <option value="hebrew">Hebrew</option>
        </select>
      </div>

      <div class="bg-surface-container-low p-6">
        <label for="display-language" class="block font-label text-sm mb-2">Language</label>
        <select id="display-language" class="w-full bg-surface-container text-on-surface p-3 cursor-pointer">
          <option>English</option>
          <option>French</option>
          <option>German</option>
          <option>Spanish</option>
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
