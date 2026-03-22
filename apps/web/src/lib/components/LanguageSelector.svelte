<script lang="ts">
  import { ALL_LANGUAGES, type Language } from '$lib/i18n/languages';

  interface Props {
    currentCode: string;
    onSelect: (code: string) => void;
  }

  let { currentCode, onSelect }: Props = $props();

  let isOpen = $state(false);
  let searchQuery = $state('');
  let searchInput: HTMLInputElement | null = $state(null);
  let dropdownElement: HTMLDivElement | null = $state(null);

  const currentLanguage = $derived(
    ALL_LANGUAGES.find((l) => l.code === currentCode) || ALL_LANGUAGES[0]
  );

  const filteredLanguages = $derived(
    ALL_LANGUAGES.filter(
      (lang) =>
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const groupedLanguages = $derived(() => {
    const groups = new Map<string, Language[]>();
    for (const lang of filteredLanguages) {
      const existing = groups.get(lang.region) || [];
      existing.push(lang);
      groups.set(lang.region, existing);
    }
    return groups;
  });

  function handleSelect(code: string) {
    onSelect(code);
    isOpen = false;
    searchQuery = '';
  }

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => searchInput?.focus(), 0);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  // Handle click outside
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  });
</script>

<div class="language-selector" bind:this={dropdownElement}>
  <!-- Dropdown Button -->
  <button
    type="button"
    class="selector-button"
    onclick={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span class="globe-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </span>
    <span class="language-name">{currentLanguage?.nativeName || 'English'}</span>
    <span class="chevron" class:open={isOpen}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div class="dropdown" role="listbox" onkeydown={handleKeydown}>
      <!-- Search Input -->
      <div class="search-container">
        <span class="search-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          bind:this={searchInput}
          type="text"
          class="search-input"
          placeholder="Search languages..."
          bind:value={searchQuery}
        />
      </div>

      <!-- Language List -->
      <div class="language-list">
        {#if filteredLanguages.length === 0}
          <div class="no-results">No languages found</div>
        {:else}
          {#each Array.from(groupedLanguages().entries()) as [region, languages]}
            <div class="region-group">
              <div class="region-header">{region}</div>
              {#each languages as language}
                <button
                  type="button"
                  class="language-option"
                  class:selected={language.code === currentCode}
                  class:rtl={language.rtl}
                  onclick={() => handleSelect(language.code)}
                  role="option"
                  aria-selected={language.code === currentCode}
                >
                  <span class="option-native" dir={language.rtl ? 'rtl' : 'ltr'}>
                    {language.nativeName}
                  </span>
                  <span class="option-english">{language.englishName}</span>
                  {#if language.rtl}
                    <span class="rtl-badge">RTL</span>
                  {/if}
                  {#if language.code === currentCode}
                    <span class="check-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .language-selector {
    position: relative;
    display: inline-block;
  }

  /* Selector Button */
  .selector-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--surface-container, #1d2025);
    border: 1px solid var(--outline-variant, #514533);
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-label, 'Space Grotesk', monospace);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    clip-path: polygon(
      0 0,
      calc(100% - 6px) 0,
      100% 6px,
      100% 100%,
      6px 100%,
      0 calc(100% - 6px)
    );
  }

  .selector-button:hover {
    background: var(--surface-container-high, #272a30);
    border-color: var(--outline, #9f8e79);
  }

  .selector-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-container, #f0a500);
  }

  .globe-icon {
    display: flex;
    align-items: center;
    color: var(--primary, #ffc56c);
  }

  .language-name {
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chevron {
    display: flex;
    align-items: center;
    color: var(--on-surface-variant, #d6c4ac);
    transition: transform 0.2s ease;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  /* Dropdown Menu */
  .dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 320px;
    max-height: 480px;
    background: var(--surface-container-low, #191c21);
    border: 1px solid var(--outline-variant, #514533);
    clip-path: polygon(
      0 0,
      calc(100% - 8px) 0,
      100% 8px,
      100% 100%,
      8px 100%,
      0 calc(100% - 8px)
    );
    z-index: 100;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 197, 108, 0.1);
  }

  /* Search Container */
  .search-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--outline-variant, #514533);
    background: var(--surface-container, #1d2025);
  }

  .search-icon {
    display: flex;
    align-items: center;
    color: var(--on-surface-variant, #d6c4ac);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-body, 'Manrope', sans-serif);
    font-size: 0.875rem;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--on-surface-variant, #d6c4ac);
  }

  /* Language List */
  .language-list {
    overflow-y: auto;
    max-height: 360px;
    padding: 0.5rem 0;
  }

  .language-list::-webkit-scrollbar {
    width: 6px;
  }

  .language-list::-webkit-scrollbar-track {
    background: var(--surface-container-lowest, #0b0e13);
  }

  .language-list::-webkit-scrollbar-thumb {
    background: var(--outline-variant, #514533);
    border-radius: 3px;
  }

  .language-list::-webkit-scrollbar-thumb:hover {
    background: var(--outline, #9f8e79);
  }

  /* Region Group */
  .region-group {
    margin-bottom: 0.5rem;
  }

  .region-header {
    padding: 0.5rem 1rem;
    font-family: var(--font-label, 'Space Grotesk', monospace);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--primary, #ffc56c);
    background: linear-gradient(90deg, rgba(240, 165, 0, 0.1) 0%, transparent 100%);
  }

  /* Language Option */
  .language-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 1rem;
    background: transparent;
    border: none;
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-body, 'Manrope', sans-serif);
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .language-option:hover {
    background: var(--surface-container-high, #272a30);
  }

  .language-option.selected {
    background: rgba(240, 165, 0, 0.1);
  }

  .option-native {
    font-weight: 500;
    min-width: 80px;
  }

  .option-english {
    color: var(--on-surface-variant, #d6c4ac);
    font-size: 0.8125rem;
    flex: 1;
  }

  .rtl-badge {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.125rem 0.375rem;
    background: var(--secondary-container, #00c7a5);
    color: var(--on-secondary-container, #004d3f);
    clip-path: polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 2px 100%, 0 calc(100% - 2px));
  }

  .check-icon {
    display: flex;
    align-items: center;
    color: var(--primary, #ffc56c);
  }

  /* No Results */
  .no-results {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--on-surface-variant, #d6c4ac);
    font-size: 0.875rem;
  }

  /* Animation */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown {
    animation: slideIn 0.2s ease;
  }
</style>
