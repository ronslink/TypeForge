<script lang="ts">
  import { layouts, type LayoutId } from '@typeforge/layouts';

  interface LayoutInfo {
    id: LayoutId;
    name: string;
    description: string;
    preview: string[];
  }

  const AVAILABLE_LAYOUTS: LayoutInfo[] = [
    {
      id: 'qwerty-us',
      name: 'QWERTY',
      description: 'US Standard',
      preview: ['Q', 'W', 'E', 'R', 'T', 'Y'],
    },
    {
      id: 'azerty-fr',
      name: 'AZERTY',
      description: 'French',
      preview: ['A', 'Z', 'E', 'R', 'T', 'Y'],
    },
    {
      id: 'qwertz-de',
      name: 'QWERTZ',
      description: 'German',
      preview: ['Q', 'W', 'E', 'R', 'T', 'Z'],
    },
    {
      id: 'dvorak',
      name: 'Dvorak',
      description: 'Programmer',
      preview: ['\'', ',', '.', 'P', 'Y', 'F'],
    },
    {
      id: 'arabic',
      name: 'Arabic',
      description: 'Standard',
      preview: ['ض', 'ص', 'ث', 'ق', 'ف', 'غ'],
    },
    {
      id: 'cyrillic-ru',
      name: 'Cyrillic',
      description: 'Russian',
      preview: ['Й', 'Ц', 'У', 'К', 'Е', 'Н'],
    },
    {
      id: 'hebrew',
      name: 'Hebrew',
      description: 'Standard',
      preview: ['/', "'", 'ק', 'ר', 'א', 'ט'],
    },
  ];

  interface Props {
    currentLayout: string;
    onSelect: (layoutId: string) => void;
  }

  let { currentLayout, onSelect }: Props = $props();

  let isOpen = $state(false);
  let dropdownElement: HTMLDivElement | null = $state(null);

  const currentLayoutInfo = $derived(
    AVAILABLE_LAYOUTS.find((l) => l.id === currentLayout) || AVAILABLE_LAYOUTS[0]
  );

  function handleSelect(layoutId: string) {
    onSelect(layoutId);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
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

<div class="layout-switcher" bind:this={dropdownElement}>
  <!-- Dropdown Button -->
  <button
    type="button"
    class="selector-button"
    onclick={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <div class="keyboard-preview-mini">
      {#each currentLayoutInfo.preview.slice(0, 4) as key}
        <span class="mini-key">{key}</span>
      {/each}
    </div>
    <span class="layout-name">{currentLayoutInfo.name}</span>
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
      <div class="dropdown-header">
        <span>Select Layout</span>
      </div>

      <!-- Layout List -->
      <div class="layout-list">
        {#each AVAILABLE_LAYOUTS as layout}
          <button
            type="button"
            class="layout-option"
            class:selected={layout.id === currentLayout}
            onclick={() => handleSelect(layout.id)}
            role="option"
            aria-selected={layout.id === currentLayout}
          >
            <div class="layout-preview">
              <div class="keyboard-row">
                {#each layout.preview as key}
                  <span class="preview-key">{key}</span>
                {/each}
              </div>
            </div>
            <div class="layout-info">
              <span class="layout-name-main">{layout.name}</span>
              <span class="layout-description">{layout.description}</span>
            </div>
            {#if layout.id === currentLayout}
              <span class="check-icon">
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .layout-switcher {
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

  .keyboard-preview-mini {
    display: flex;
    gap: 2px;
  }

  .mini-key {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 18px;
    background: var(--surface-container-high, #272a30);
    border: 1px solid var(--outline-variant, #514533);
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--on-surface-variant, #d6c4ac);
    border-radius: 2px;
  }

  .layout-name {
    white-space: nowrap;
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
    min-width: 280px;
    max-height: 400px;
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

  .dropdown-header {
    padding: 0.75rem 1rem;
    font-family: var(--font-label, 'Space Grotesk', monospace);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--primary, #ffc56c);
    background: var(--surface-container, #1d2025);
    border-bottom: 1px solid var(--outline-variant, #514533);
  }

  /* Layout List */
  .layout-list {
    overflow-y: auto;
    max-height: 320px;
    padding: 0.5rem;
  }

  .layout-list::-webkit-scrollbar {
    width: 6px;
  }

  .layout-list::-webkit-scrollbar-track {
    background: var(--surface-container-lowest, #0b0e13);
  }

  .layout-list::-webkit-scrollbar-thumb {
    background: var(--outline-variant, #514533);
    border-radius: 3px;
  }

  /* Layout Option */
  .layout-option {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: 1px solid transparent;
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-body, 'Manrope', sans-serif);
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 0.25rem;
    clip-path: polygon(
      0 0,
      calc(100% - 4px) 0,
      100% 4px,
      100% 100%,
      4px 100%,
      0 calc(100% - 4px)
    );
  }

  .layout-option:hover {
    background: var(--surface-container-high, #272a30);
    border-color: var(--outline-variant, #514533);
  }

  .layout-option.selected {
    background: rgba(240, 165, 0, 0.1);
    border-color: var(--primary-container, #f0a500);
  }

  .layout-preview {
    flex-shrink: 0;
  }

  .keyboard-row {
    display: flex;
    gap: 3px;
  }

  .preview-key {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 26px;
    background: var(--surface-container, #1d2025);
    border: 1px solid var(--outline-variant, #514533);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--on-surface, #e1e2ea);
    border-radius: 2px;
    font-family: var(--font-label, 'Space Grotesk', monospace);
  }

  .layout-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .layout-name-main {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .layout-description {
    font-size: 0.75rem;
    color: var(--on-surface-variant, #d6c4ac);
  }

  .check-icon {
    display: flex;
    align-items: center;
    color: var(--primary, #ffc56c);
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
