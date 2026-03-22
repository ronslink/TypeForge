<script lang="ts">
  import type { Snippet } from 'svelte';

  interface KeyWeakness {
    key: string;
    accuracy: number; // 0-100
    frequency: number; // How often the key is pressed
    avgTime: number; // Average time to press (ms)
  }

  interface Props {
    weaknesses: KeyWeakness[];
    showLabels?: boolean;
    children?: Snippet;
  }

  const { weaknesses, showLabels = true, children }: Props = $props();

  // QWERTY layout rows
  const keyboardRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  // Create a map for quick lookup
  const weaknessMap = $derived(new Map(weaknesses.map((w) => [w.key.toLowerCase(), w])));

  function getKeyColor(accuracy: number): string {
    if (accuracy >= 95) return 'rgba(76, 175, 80, 0.3)'; // Green - good
    if (accuracy >= 85) return 'rgba(255, 193, 7, 0.3)'; // Yellow - okay
    if (accuracy >= 70) return 'rgba(255, 152, 0, 0.4)'; // Orange - needs work
    return 'rgba(244, 67, 54, 0.5)'; // Red - weak
  }

  function getKeyBorderColor(accuracy: number): string {
    if (accuracy >= 95) return '#4CAF50';
    if (accuracy >= 85) return '#FFC107';
    if (accuracy >= 70) return '#FF9800';
    return '#F44336';
  }
</script>

<div class="weakness-heatmap">
  <div class="heatmap-header mb-4">
    <h3 class="font-label text-lg font-bold text-on-surface">Key Weakness Map</h3>
    <p class="text-sm text-on-surface-variant">Keys highlighted in red need more practice</p>
  </div>

  <div class="keyboard-container">
    {#each keyboardRows as row, rowIndex}
      <div class="keyboard-row" style="margin-left: {rowIndex * 20}px">
        {#each row as key}
          {@const weakness = weaknessMap.get(key)}
          {@const accuracy = weakness?.accuracy ?? 100}
          <div
            class="key-cell"
            style="
              background-color: {getKeyColor(accuracy)};
              border-bottom: 2px solid {getKeyBorderColor(accuracy)};
            "
            title={weakness ? `${key.toUpperCase()}: ${accuracy}% accuracy` : key.toUpperCase()}
          >
            {#if showLabels}
              <span class="key-label">{key}</span>
            {/if}
            {#if weakness}
              <span class="accuracy-label">{accuracy}%</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="legend mt-4 flex gap-4 text-xs">
    <div class="legend-item flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-sm"
        style="background: rgba(76, 175, 80, 0.3); border-bottom: 2px solid #4CAF50;"
      ></div>
      <span class="text-on-surface-variant">95%+ (Good)</span>
    </div>
    <div class="legend-item flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-sm"
        style="background: rgba(255, 193, 7, 0.3); border-bottom: 2px solid #FFC107;"
      ></div>
      <span class="text-on-surface-variant">85-94%</span>
    </div>
    <div class="legend-item flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-sm"
        style="background: rgba(255, 152, 0, 0.4); border-bottom: 2px solid #FF9800;"
      ></div>
      <span class="text-on-surface-variant">70-84%</span>
    </div>
    <div class="legend-item flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-sm"
        style="background: rgba(244, 67, 54, 0.5); border-bottom: 2px solid #F44336;"
      ></div>
      <span class="text-on-surface-variant">&lt;70% (Needs work)</span>
    </div>
  </div>

  {#if children}
    <div class="heatmap-footer mt-6">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .weakness-heatmap {
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(240, 165, 0, 0.02) 0%, transparent 50%);
  }

  .keyboard-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .keyboard-row {
    display: flex;
    gap: 4px;
  }

  .key-cell {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  .key-cell:hover {
    transform: scale(1.1);
    z-index: 10;
  }

  .key-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--on-surface);
    text-transform: uppercase;
  }

  .accuracy-label {
    font-size: 0.625rem;
    color: var(--on-surface-variant);
  }
</style>
