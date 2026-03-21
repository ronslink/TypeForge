<script lang="ts">
  import type { KeyboardLayout } from '@typeforge/layouts';

  interface Props {
    layout: KeyboardLayout;
    highlightKeys?: Set<string>;
    pressedKey?: string;
  }

  let { layout, highlightKeys = new Set(), pressedKey }: Props = $props();

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
</script>

<div class="keyboard bg-surface-container-lowest p-4">
  {#each [0, 1, 2, 3, 4] as rowIndex}
    {#if rows.has(rowIndex)}
      <div class="keyboard-row">
        {#each rows.get(rowIndex) || [] as key}
          <button class={getKeyClass(key)} data-code={key.code}>
            {#if key.shift && key.shift !== key.char}
              <span class="shift-char">{key.shift}</span>
            {/if}
            <span class="main-char">{key.char}</span>
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

  /* Finger color coding */
  .finger-left-pinky {
    border-left: 2px solid #ff6b6b;
  }

  .finger-left-ring {
    border-left: 2px solid #ffa94d;
  }

  .finger-left-middle {
    border-left: 2px solid #ffd43b;
  }

  .finger-left-index {
    border-left: 2px solid #69db7c;
  }

  .finger-right-index {
    border-right: 2px solid #4dabf7;
  }

  .finger-right-middle {
    border-right: 2px solid #748ffc;
  }

  .finger-right-ring {
    border-right: 2px solid #da77f2;
  }

  .finger-right-pinky {
    border-right: 2px solid #f783ac;
  }
</style>
