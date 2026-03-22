<script lang="ts">
  import type { KeyboardLayout } from '@typeforge/layouts';

  interface Props {
    layout: KeyboardLayout;
    highlightKeys?: Set<string>;
    pressedKey?: string;
    isRTL?: boolean;
  }

  let { layout, highlightKeys = new Set(), pressedKey, isRTL = false }: Props = $props();

  // Group keys by row
  $derived(rows = groupByRow(layout.keys));

  function groupByRow(keys: KeyboardLayout['keys']): Map<number, typeof keys> {
    const map = new Map<number, typeof keys>();
    for (const key of keys) {
      const row = map.get(key.row) || [];
      row.push(key);
      map.set(key.row, row);
    }
    return map;
  }

  function getKeyClass(key: (typeof layout.keys)[0]): string {
    const classes = ['key'];
    if (highlightKeys.has(key.char)) classes.push('highlight');
    if (pressedKey === key.char) classes.push('pressed');
    classes.push(`finger-${key.finger}`);
    return classes.join(' ');
  }

  // Get ARIA label for key
  function getKeyAriaLabel(key: (typeof layout.keys)[0]): string {
    const fingerNames: Record<string, string> = {
      'left-pinky': 'Left pinky',
      'left-ring': 'Left ring finger',
      'left-middle': 'Left middle finger',
      'left-index': 'Left index finger',
      'right-index': 'Right index finger',
      'right-middle': 'Right middle finger',
      'right-ring': 'Right ring finger',
      'right-pinky': 'Right pinky',
      'thumb': 'Thumb',
    };
    
    const fingerLabel = fingerNames[key.finger] || key.finger;
    const isHighlighted = highlightKeys.has(key.char);
    
    let label = `${key.char.toUpperCase()} key, use ${fingerLabel}`;
    if (key.shift && key.shift !== key.char) {
      label += `, shift produces ${key.shift}`;
    }
    if (isHighlighted) {
      label += ', current target key';
    }
    
    return label;
  }
</script>

<!-- 
  Accessibility Notes:
  - role="region" with aria-label identifies this as a keyboard visualization
  - Each key is a button with descriptive aria-label including finger assignment
  - Focus indicators are visible with amber outline
  - RTL support: logical properties for border positioning
  - Decorative only - keys are not interactive but provide visual guidance
-->
<div 
  class="keyboard bg-surface-container-lowest p-4" 
  role="region" 
  aria-label="Virtual keyboard showing finger placement guide"
>
  {#each [0, 1, 2, 3, 4] as rowIndex}
    {#if rows.has(rowIndex)}
      <div class="keyboard-row" role="group" aria-label="Row {rowIndex + 1}">
        {#each rows.get(rowIndex) || [] as key}
          <button 
            type="button"
            class={getKeyClass(key)} 
            data-code={key.code}
            aria-label={getKeyAriaLabel(key)}
            tabindex="-1"
            disabled
          >
            {#if key.shift && key.shift !== key.char}
              <span class="shift-char" aria-hidden="true">{key.shift}</span>
            {/if}
            <span class="main-char" aria-hidden="true">{key.char}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: var(--font-label, 'Space Grotesk', monospace);
  }

  .keyboard-row {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .key {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--surface-container, #1d2025);
    border: none;
    color: var(--on-surface, #e1e2ea);
    font-size: 0.75rem;
    transition: all 0.1s ease;
    /* Ensure visible focus indicator */
    outline: none;
    position: relative;
  }

  /* Visible focus indicator - amber outline */
  .key:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 2px;
    z-index: 1;
  }

  .key.highlight {
    background-color: var(--surface-container-high, #272a30);
    box-shadow: 0 0 10px rgba(240, 165, 0, 0.3);
  }

  .key.pressed {
    background-color: var(--primary-container, #f0a500);
    color: var(--on-primary-container, #5f3f00);
    transform: scale(0.95);
  }

  .shift-char {
    font-size: 0.625rem;
    opacity: 0.6;
  }

  .main-char {
    text-transform: lowercase;
  }

  /* Finger color coding using logical properties for RTL support */
  .finger-left-pinky {
    border-inline-start: 2px solid #ff6b6b;
  }

  .finger-left-ring {
    border-inline-start: 2px solid #ffa94d;
  }

  .finger-left-middle {
    border-inline-start: 2px solid #ffd43b;
  }

  .finger-left-index {
    border-inline-start: 2px solid #69db7c;
  }

  .finger-right-index {
    border-inline-end: 2px solid #4dabf7;
  }

  .finger-right-middle {
    border-inline-end: 2px solid #748ffc;
  }

  .finger-right-ring {
    border-inline-end: 2px solid #da77f2;
  }

  .finger-right-pinky {
    border-inline-end: 2px solid #f783ac;
  }

  /* Thumb keys - both sides */
  .finger-thumb {
    border-block-end: 2px solid #a9e34b;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .key {
      transition: none;
    }
    
    .key.pressed {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .key.highlight {
      outline: 2px solid var(--primary, #ffc56c);
      outline-offset: -2px;
    }
    
    .key.pressed {
      outline: 2px solid var(--on-primary-container, #5f3f00);
      outline-offset: -2px;
    }
  }
</style>
