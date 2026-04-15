<script lang="ts">
  interface Props {
    activeFinger?: string;
    showLabels?: boolean;
  }

  let { activeFinger = '', showLabels = true }: Props = $props();

  function isActive(finger: string) {
    if (!activeFinger) return false;
    return activeFinger.replace(/_/g, '-') === finger;
  }

  // Home row key labels per finger
  const homeKeys: Record<string, string> = {
    'left-pinky':  'A',
    'left-ring':   'S',
    'left-middle': 'D',
    'left-index':  'F',
    'left-thumb':  'Space',
    'right-thumb': 'Space',
    'right-index': 'J',
    'right-middle':'K',
    'right-ring':  'L',
    'right-pinky': ';',
  };

  const fingerLabels: Record<string, string> = {
    'left-pinky':  'Pinky',
    'left-ring':   'Ring',
    'left-middle': 'Middle',
    'left-index':  'Index',
    'left-thumb':  'Thumb',
    'right-thumb': 'Thumb',
    'right-index': 'Index',
    'right-middle':'Middle',
    'right-ring':  'Ring',
    'right-pinky': 'Pinky',
  };

  const activeLabel = $derived(
    activeFinger
      ? `${activeFinger.startsWith('left') ? 'Left' : 'Right'} ${fingerLabels[activeFinger.replace(/_/g, '-')] ?? ''} — ${homeKeys[activeFinger.replace(/_/g, '-')] ?? ''}`
      : ''
  );
</script>

<div class="hands-wrapper">
  {#if showLabels && activeLabel}
    <div class="finger-label" aria-live="polite">{activeLabel}</div>
  {/if}

  <div class="hands-container" aria-hidden="true">
    <!-- Left Hand -->
    <div class="hand left-hand">
      <div class="finger left-pinky"  class:active={isActive('left-pinky')}>
        {#if isActive('left-pinky')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger left-ring"   class:active={isActive('left-ring')}>
        {#if isActive('left-ring')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger left-middle" class:active={isActive('left-middle')}>
        {#if isActive('left-middle')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger left-index"  class:active={isActive('left-index')}>
        {#if isActive('left-index')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="thumb left-thumb"   class:active={isActive('left-thumb')}>
        {#if isActive('left-thumb')}<span class="glow-ring thumb-glow"></span>{/if}
      </div>
      <div class="palm"></div>
    </div>

    <!-- Right Hand -->
    <div class="hand right-hand">
      <div class="thumb right-thumb"  class:active={isActive('right-thumb')}>
        {#if isActive('right-thumb')}<span class="glow-ring thumb-glow"></span>{/if}
      </div>
      <div class="finger right-index" class:active={isActive('right-index')}>
        {#if isActive('right-index')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger right-middle" class:active={isActive('right-middle')}>
        {#if isActive('right-middle')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger right-ring"  class:active={isActive('right-ring')}>
        {#if isActive('right-ring')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="finger right-pinky" class:active={isActive('right-pinky')}>
        {#if isActive('right-pinky')}<span class="glow-ring"></span>{/if}
      </div>
      <div class="palm"></div>
    </div>
  </div>
</div>

<style>
  .hands-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none;
    user-select: none;
  }

  .finger-label {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary, #ffc56c);
    background: rgba(255, 197, 108, 0.1);
    border: 1px solid rgba(255, 197, 108, 0.25);
    padding: 0.2rem 0.75rem;
    border-radius: 100px;
    min-height: 1.4rem;
    transition: opacity 0.2s ease;
  }

  .hands-container {
    display: flex;
    justify-content: center;
    gap: 6rem;
    perspective: 800px;
  }

  .hand {
    position: relative;
    width: 140px;
    height: 190px;
    transform: rotateX(18deg);
  }

  .palm {
    position: absolute;
    bottom: 0;
    width: 140px;
    height: 75px;
    background: var(--surface-container-high, #2a2d35);
    border: 2px solid var(--outline-variant, #48464f);
    border-radius: 20px 20px 40px 40px;
    z-index: 10;
  }

  .finger {
    position: absolute;
    bottom: 65px;
    width: 24px;
    background: var(--surface-container-high, #2a2d35);
    border: 2px solid var(--outline-variant, #48464f);
    border-radius: 12px 12px 0 0;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
    transform-origin: bottom center;
    z-index: 15;
  }

  .thumb {
    position: absolute;
    bottom: 15px;
    width: 26px;
    height: 60px;
    background: var(--surface-container-high, #2a2d35);
    border: 2px solid var(--outline-variant, #48464f);
    border-radius: 13px 13px 0 0;
    transition: background 0.25s ease, border-color 0.25s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
    z-index: 5;
  }

  /* Left Hand geometry */
  .left-pinky  { height: 60px; left: 12px; }
  .left-ring   { height: 80px; left: 42px; }
  .left-middle { height: 95px; left: 72px; }
  .left-index  { height: 80px; left: 102px; }
  .left-thumb  { transform: rotate(50deg); left: 125px; transform-origin: bottom left; }

  /* Right Hand geometry */
  .right-index  { height: 80px;  left: 14px; }
  .right-middle { height: 95px;  left: 44px; }
  .right-ring   { height: 80px;  left: 74px; }
  .right-pinky  { height: 60px;  left: 104px; }
  .right-thumb  { transform: rotate(-50deg); left: -11px; transform-origin: bottom right; }

  /* Active state */
  .finger.active,
  .thumb.active {
    background: var(--primary, #ffc56c);
    border-color: var(--primary, #ffc56c);
    box-shadow: 0 0 20px rgba(255, 197, 108, 0.5), 0 0 40px rgba(255, 197, 108, 0.2);
    animation: bounce-tap 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate;
    z-index: 25;
  }

  .left-thumb.active  { animation: bounce-tap-left  0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate; }
  .right-thumb.active { animation: bounce-tap-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate; }

  @keyframes bounce-tap {
    0%   { transform: scaleY(1)    translateY(0); }
    100% { transform: scaleY(1.18) translateY(-7px); }
  }
  @keyframes bounce-tap-left {
    0%   { transform: rotate(50deg)  scale(1); }
    100% { transform: rotate(50deg)  scale(1.18); }
  }
  @keyframes bounce-tap-right {
    0%   { transform: rotate(-50deg) scale(1); }
    100% { transform: rotate(-50deg) scale(1.18); }
  }

  /* Glow ring */
  .glow-ring {
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    border: 2px solid var(--primary, #ffc56c);
    animation: pulse-ring 1.2s ease-out infinite;
    pointer-events: none;
  }
  .thumb-glow {
    inset: -5px;
  }

  @keyframes pulse-ring {
    0%   { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0;   transform: scale(1.5); }
  }

  @media (prefers-reduced-motion: reduce) {
    .finger.active, .thumb.active { animation: none; transform: scaleY(1.12) translateY(-4px); }
    .left-thumb.active  { animation: none; transform: rotate(50deg)  scale(1.12); }
    .right-thumb.active { animation: none; transform: rotate(-50deg) scale(1.12); }
    .glow-ring          { animation: none; opacity: 0.6; }
  }
</style>
