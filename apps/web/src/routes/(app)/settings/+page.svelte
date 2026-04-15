<script lang="ts">
  import { onMount } from 'svelte';
  import { UserProfile } from 'svelte-clerk';
  import { Keyboard } from '@typeforge/ui';
  import { layouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
  import type { Layout } from '@typeforge/layouts';
  import { ALL_LANGUAGES } from '$lib/i18n/languages';
  import type { PageProps } from './$types';
  import { t } from '$lib/stores/locale';

  let { data }: PageProps = $props();


  // -------------------------------------------------------------------------
  // Persisted preferences (localStorage)
  // -------------------------------------------------------------------------
  const LS_LAYOUT   = 'tf-keyboard-layout';
  const LS_LANGUAGE = 'tf-language';
  const LS_KEYBOARD = 'tf-show-keyboard';
  const LS_SOUND    = 'tf-sound-effects';
  const LS_STRICT   = 'tf-strict-mode';

  let selectedLayout   = $state('qwerty-us');
  let selectedLanguage = $state('en');
  let showKeyboard     = $state(true);
  let soundEffects     = $state(false);
  let strictMode       = $state(false);

  // Derived: the live Layout object for the keyboard preview
  const previewLayout = $derived(
    (layouts as Record<string, Layout>)[selectedLayout] ?? layouts['qwerty-us']
  );

  // Whenever the language changes, auto-select its canonical layout (user can override)
  $effect(() => {
    selectedLayout = getDefaultLayoutForLanguage(selectedLanguage);
  });

  // Persist changes to localStorage immediately
  $effect(() => { localStorage.setItem(LS_LAYOUT,   selectedLayout);             });
  $effect(() => { localStorage.setItem(LS_LANGUAGE, selectedLanguage);           });
  $effect(() => { localStorage.setItem(LS_KEYBOARD, String(showKeyboard));       });
  $effect(() => { localStorage.setItem(LS_SOUND,    String(soundEffects));       });
  $effect(() => { localStorage.setItem(LS_STRICT,   String(strictMode));         });

  onMount(() => {
    selectedLayout   = localStorage.getItem(LS_LAYOUT)   ?? 'qwerty-us';
    selectedLanguage = localStorage.getItem(LS_LANGUAGE) ?? 'en';
    showKeyboard     = localStorage.getItem(LS_KEYBOARD) !== 'false';
    soundEffects     = localStorage.getItem(LS_SOUND)    === 'true';
    strictMode       = localStorage.getItem(LS_STRICT)   === 'true';
  });
</script>

<svelte:head>
  <title>Settings — TypeForge</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-12">
  <header class="mb-10">
    <h1 class="font-headline text-4xl mb-2">{$t('nav_settings') || 'Settings'}</h1>
    <p class="text-on-surface-variant font-body">{$t('settings_subtitle') || 'Preferences are saved automatically to your browser.'}</p>
  </header>

  <!-- -----------------------------------------------------------------------
       Section: Typing Preferences
  ------------------------------------------------------------------------ -->
  <section class="mb-12" aria-labelledby="typing-prefs-heading">
    <h2 id="typing-prefs-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-6">
      {$t('settings_typing_prefs') || 'Typing Preferences'}
    </h2>

    <div class="space-y-4">

      <!-- Language -->
      <div class="settings-card">
        <div class="settings-card-label">
          <label for="setting-language" class="font-label text-sm">{$t('lang_ui_label') || 'Practice Language'}</label>
          <p class="text-on-surface-variant text-xs mt-0.5">{$t('settings_language_desc') || 'Sets the default wordlist and auto-selects the matching keyboard layout.'}</p>
        </div>
        <select
          id="setting-language"
          class="settings-select"
          bind:value={selectedLanguage}
        >
          {#each ALL_LANGUAGES as lang}
            <option value={lang.code}>{lang.nativeName} — {lang.englishName}</option>
          {/each}
        </select>
      </div>

      <!-- Keyboard Layout -->
      <div class="settings-card">
        <div class="settings-card-label">
          <label for="setting-layout" class="font-label text-sm">{$t('practice_layout') || 'Keyboard Layout'}</label>
          <p class="text-on-surface-variant text-xs mt-0.5">{$t('settings_layout_desc') || 'Drives the hand guide and key highlighting during lessons.'}</p>
        </div>
        <select
          id="setting-layout"
          class="settings-select"
          bind:value={selectedLayout}
        >
          {#each Object.entries(layouts) as [id, layout]}
            <option value={id}>{layout.name}</option>
          {/each}
        </select>
      </div>

      <!-- Show Keyboard Visual -->
      <div class="settings-card">
        <div class="settings-card-label">
          <span class="font-label text-sm" id="toggle-keyboard-label">{$t('settings_show_keyboard') || 'Show Keyboard Visual'}</span>
          <p class="text-on-surface-variant text-xs mt-0.5">{$t('settings_keyboard_desc') || 'Display the keyboard diagram while typing in lessons.'}</p>
        </div>
        <label class="kf-toggle" aria-labelledby="toggle-keyboard-label">
          <input
            type="checkbox"
            class="sr-only"
            bind:checked={showKeyboard}
            aria-checked={showKeyboard}
          />
          <span class="kf-toggle-track" class:active={showKeyboard}>
            <span class="kf-toggle-thumb"></span>
          </span>
        </label>
      </div>

      <!-- Sound Effects -->
      <div class="settings-card">
        <div class="settings-card-label">
          <span class="font-label text-sm" id="toggle-sound-label">{$t('settings_sound_effects') || 'Sound Effects'}</span>
          <p class="text-on-surface-variant text-xs mt-0.5">{$t('settings_sound_desc') || 'Play a click on each keystroke.'}</p>
        </div>
        <label class="kf-toggle" aria-labelledby="toggle-sound-label">
          <input
            type="checkbox"
            class="sr-only"
            bind:checked={soundEffects}
            aria-checked={soundEffects}
          />
          <span class="kf-toggle-track" class:active={soundEffects}>
            <span class="kf-toggle-thumb"></span>
          </span>
        </label>
      </div>

      <!-- Strict Mode -->
      <div class="settings-card">
        <div class="settings-card-label">
          <span class="font-label text-sm" id="toggle-strict-label">{$t('settings_strict_mode') || 'Strict Mode'}</span>
          <p class="text-on-surface-variant text-xs mt-0.5">{$t('settings_strict_desc') || 'Prevents advancing on errors — you must type the correct key to continue.'}</p>
        </div>
        <label class="kf-toggle" aria-labelledby="toggle-strict-label">
          <input
            type="checkbox"
            class="sr-only"
            bind:checked={strictMode}
            aria-checked={strictMode}
          />
          <span class="kf-toggle-track" class:active={strictMode}>
            <span class="kf-toggle-thumb"></span>
          </span>
        </label>
      </div>

    </div>
  </section>

  <!-- -----------------------------------------------------------------------
       Section: Keyboard Preview
  ------------------------------------------------------------------------ -->
  <section class="mb-12" aria-labelledby="keyboard-preview-heading">
    <h2 id="keyboard-preview-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-4">
      {$t('settings_preview') || 'Keyboard Preview'}
    </h2>
    <p class="text-on-surface-variant text-sm mb-6 font-body">
      {$t('settings_preview_desc') || 'This is how your selected layout will appear during lessons.'}
      {#if previewLayout.rtl}
        <span class="text-secondary font-label ml-1">{$t('settings_preview_rtl') || '↩ RTL Layout'}</span>
      {/if}
    </p>
    <div class="bg-surface-container-low p-6 overflow-x-auto">
      <Keyboard
        layout={previewLayout}
        highlightKeys={new Set()}
        activeKey={undefined}
        rtl={!!previewLayout.rtl}
      />
    </div>
    <p class="text-xs text-on-surface-variant mt-3 font-body">
      {$t('settings_preview_layout') || 'Layout:'} <strong class="text-on-surface font-label">{previewLayout.name}</strong>
      &nbsp;·&nbsp;
      {$t('settings_preview_script') || 'Script:'} <strong class="text-on-surface font-label">{previewLayout.script}</strong>
    </p>
  </section>

  <!-- -----------------------------------------------------------------------
       Section: Account
  ------------------------------------------------------------------------ -->
  <section aria-labelledby="account-heading">
    <h2 id="account-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-6">
      {$t('footer_account') || 'Account'}
    </h2>
    <div class="clerk-theme-override bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/30 flex justify-center">
      <UserProfile routing="hash" appearance={{ elements: { rootBox: "w-full shadow-none", card: "shadow-none border-0 rounded-none w-full bg-transparent" } }} />
    </div>
  </section>
</div>

<style>
  /* Settings card – horizontal label + control row */
  :global(.settings-card) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    background: var(--surface-container-low);
    padding: 1.25rem 1.5rem;
  }

  :global(.settings-card-label) {
    flex: 1;
    min-width: 0;
  }

  /* Select control */
  :global(.settings-select) {
    flex-shrink: 0;
    width: 220px;
    background: var(--surface-container);
    color: var(--on-surface);
    padding: 0.625rem 0.75rem;
    font-family: inherit;
    font-size: 0.875rem;
    border: none;
    border-bottom: 2px solid color-mix(in srgb, var(--primary) 40%, transparent);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease;
  }

  :global(.settings-select:focus) {
    border-bottom-color: var(--primary);
  }

  /* Kinetic Foundry toggle — no border-radius, uses clip-path for the notch feel */
  :global(.kf-toggle) {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  :global(.kf-toggle-track) {
    position: relative;
    display: block;
    width: 44px;
    height: 24px;
    background: var(--surface-container-highest);
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
    transition: background 0.2s ease;
  }

  :global(.kf-toggle-track.active) {
    background: var(--primary);
  }

  :global(.kf-toggle-thumb) {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 16px;
    height: 16px;
    background: var(--on-surface-variant);
    clip-path: polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%);
    transition: left 0.2s ease, background 0.2s ease;
  }

  :global(.kf-toggle-track.active .kf-toggle-thumb) {
    left: calc(100% - 20px);
    background: var(--on-primary);
  }

  /* Screen-reader only */
  :global(.sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
