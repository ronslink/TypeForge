<script lang="ts">
  import type { Layout, Key } from '@typeforge/layouts';

  interface Props {
    layout: Layout;
    highlightKeys?: Set<string>;
    pressedKey?: string;
    isRTL?: boolean;
  }

  let { layout, highlightKeys = new Set(), pressedKey, isRTL = false }: Props = $props();

  function getKeyClass(key: Key): string {
    const classes = ['key'];
    if (key.char && highlightKeys.has(key.char.toLowerCase())) classes.push('highlight');
    if (key.char && pressedKey === key.char.toLowerCase()) classes.push('pressed');
    if ((key as any).finger) classes.push(`finger-${(key as any).finger}`);
    return classes.join(' ');
  }

  // Get ARIA label for key
  function getKeyAriaLabel(key: Key): string {
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
    
    const fingerLabel = fingerNames[(key as any).finger || 'thumb'] || (key as any).finger || 'thumb';
    const isHighlighted = key.char && highlightKeys.has(key.char.toLowerCase());
    
    let label = `${key.char ? key.char.toUpperCase() : key.code} key, use ${fingerLabel}`;
    if (key.charShift && key.charShift !== key.char) {
      label += `, shift produces ${key.charShift}`;
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
  dir={isRTL ? "rtl" : "ltr"}
>
  {#each layout.rows as row, rowIndex}
    <div class="keyboard-row" role="group" aria-label="Row {rowIndex + 1}">
      {#each row as key}
        <button 
          type="button"
          class={getKeyClass(key)} 
          data-code={key.code}
          aria-label={getKeyAriaLabel(key)}
          tabindex="-1"
          disabled
        >
          {#if key.charShift && key.charShift !== key.char}
            <span class="shift-char" aria-hidden="true">{key.charShift}</span>
          {/if}
          <span class="main-char" aria-hidden="true">{key.char || ''}</span>
        </button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-label, 'Space Grotesk', monospace);
    padding: 24px;
    border-radius: 16px;
    background: linear-gradient(145deg, var(--surface-container-low, #1e2126), var(--surface-container-lowest, #15171a));
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
  }

  .keyboard-row {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .key {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: clamp(38px, 4.5vw, 60px);
    height: clamp(40px, 4.8vw, 60px);
    background-color: var(--surface-container, #22262c);
    border: none;
    border-radius: 8px;
    color: var(--on-surface-variant, #99a2b0);
    font-size: clamp(0.8rem, 1vw, 1.1rem);
    font-weight: 500;
    transition: all 0.08s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.07),
      0 4px 0 rgba(0,0,0,0.6),
      0 5px 5px rgba(0,0,0,0.4);
    outline: none;
    position: relative;
    margin-bottom: 4px; /* for shadow translation padding */
    cursor: default;
  }

  .key[data-code="Space"] {
    width: clamp(200px, 35vw, 400px);
  }

  .key:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 4px;
    z-index: 10;
  }

  .key.highlight {
    background-color: var(--surface-variant, #393e46);
    color: var(--primary, #f0a500);
    text-shadow: 0 0 10px rgba(240, 165, 0, 0.5);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.1),
      0 4px 0 rgba(0,0,0,0.7),
      0 5px 15px rgba(240, 165, 0, 0.15);
  }

  .key.pressed {
    background-color: var(--primary-container, #f0a500);
    color: var(--on-primary-container, #5f3f00);
    transform: translateY(4px);
    text-shadow: none;
    box-shadow: 
      inset 0 2px 4px rgba(0,0,0,0.2),
      0 0 0 rgba(0,0,0,0.6),
      0 1px 2px rgba(0,0,0,0.4);
    opacity: 0.95;
  }

  .shift-char {
    font-size: 0.7em;
    opacity: 0.6;
    margin-bottom: 2px;
  }

  .main-char {
    text-transform: uppercase;
  }

  /* Finger color coding via top border highlight */
  .finger-left-pinky { border-top: 3px solid #ff6b6b; }
  .finger-left-ring { border-top: 3px solid #ffa94d; }
  .finger-left-middle { border-top: 3px solid #ffd43b; }
  .finger-left-index { border-top: 3px solid #69db7c; }
  .finger-right-index { border-top: 3px solid #4dabf7; }
  .finger-right-middle { border-top: 3px solid #748ffc; }
  .finger-right-ring { border-top: 3px solid #da77f2; }
  .finger-right-pinky { border-top: 3px solid #f783ac; }
  
  /* Thumb keys - both sides */
  .finger-thumb { border-top: 3px solid #a9e34b; }

  /* Pressed state finger overrides (to maintain visibility when transformed) */
  .key.pressed[class*="finger-"] {
    border-top-width: 1px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .key { transition: none; }
    .key.pressed { transform: translateY(4px); }
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
