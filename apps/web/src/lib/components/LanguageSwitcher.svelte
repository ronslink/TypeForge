<script lang="ts">
  import { uiLocale, setUiLocale, UI_LOCALES } from '$lib/stores/locale';
  import type { UiLocale } from '$lib/stores/locale';

  let selected = $state<UiLocale>($uiLocale);

  $effect(() => {
    selected = $uiLocale;
  });

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    setUiLocale(target.value as UiLocale);
  }
</script>

<div class="relative inline-block">
  <select
    bind:value={selected}
    onchange={handleChange}
    class="appearance-none bg-transparent text-on-surface-variant font-label text-sm uppercase tracking-wider py-1 pl-3 pr-8 rounded border border-transparent hover:border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
    aria-label="Change Language"
  >
    {#each UI_LOCALES as locale}
      <option value={locale.code} class="bg-surface-container text-on-surface normal-case tracking-normal">
        {locale.code.toUpperCase()} — {locale.nativeName}
      </option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
    </svg>
  </div>
</div>
