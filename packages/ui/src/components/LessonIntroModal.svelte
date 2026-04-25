<script lang="ts">
  import HandGuide from './HandGuide.svelte';

  interface IntroKey {
    char: string;
    expectedFinger: string;
  }

  interface Props {
    lessonId: string;
    introKeys: IntroKey[];
    highlightKeys: Set<string>;
    onStart: () => void;
  }

  let { lessonId, introKeys, onStart }: Props = $props();

  // Steps: 'explainer' | 'keys'
  let step = $state<'explainer' | 'keys'>('explainer');

  // Key walkthrough state
  let keyIndex = $state(0);
  let autoInterval: ReturnType<typeof setInterval> | null = null;

  const explainerCards = [
    { icon: '🔤', title: 'Type the highlighted character', desc: 'The next character glows — that\'s your target.' },
    { icon: '🚫', title: 'Wrong key? Nothing moves', desc: 'The cursor stays put until you type correctly.' },
    { icon: '✅', title: 'Correct key = cursor advances', desc: 'Only accurate input moves you forward.' },
    { icon: '⌨️', title: 'Follow the finger guide', desc: 'The hand diagram shows which finger to use.' },
    { icon: '🏁', title: 'Complete all characters to finish', desc: 'Your WPM and accuracy are tracked in real time.' },
  ];

  const currentIntroKey = $derived(
    step === 'keys' && keyIndex < introKeys.length ? introKeys[keyIndex] : null
  );


  function startKeyWalkthrough() {
    step = 'keys';
    keyIndex = 0;
    startAutoAdvance();
  }

  function startAutoAdvance() {
    stopAutoAdvance();
    autoInterval = setInterval(() => {
      if (keyIndex < introKeys.length - 1) {
        keyIndex++;
      } else {
        stopAutoAdvance();
      }
    }, 1500);
  }

  function stopAutoAdvance() {
    if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
  }

  function nextKey() {
    stopAutoAdvance();
    if (keyIndex < introKeys.length - 1) {
      keyIndex++;
      startAutoAdvance();
    }
  }

  function prevKey() {
    stopAutoAdvance();
    if (keyIndex > 0) {
      keyIndex--;
      startAutoAdvance();
    }
  }

  function handleStart() {
    stopAutoAdvance();
    // Mark as seen for this lesson
    try { sessionStorage.setItem(`tf_intro_seen_${lessonId}`, '1'); } catch {}
    onStart();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') { handleStart(); return; }
    if (step === 'explainer' && (e.key === 'Enter' || e.key === ' ')) { startKeyWalkthrough(); return; }
    if (step === 'keys') {
      if (e.key === 'ArrowRight' || e.key === ' ') { nextKey(); return; }
      if (e.key === 'ArrowLeft') { prevKey(); return; }
      if (e.key === 'Enter') { handleStart(); return; }
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Full-screen overlay -->
<div
  class="intro-overlay"
  role="dialog"
  aria-modal="true"
  aria-label="Lesson introduction"
>
  <div class="intro-panel">

    <!-- ESC hint -->
    <button class="skip-btn" onclick={handleStart} aria-label="Skip introduction and start lesson">
      Skip — Press ESC
    </button>

    <!-- ─── STEP 1: Explainer ─── -->
    {#if step === 'explainer'}
      <div class="explainer-step">
        <h2 class="intro-title">Before you begin</h2>
        <p class="intro-subtitle">TypeForge uses a <strong>strict mode</strong> — understand how it works:</p>

        <ul class="cards-list" role="list">
          {#each explainerCards as card, i}
            <li class="card" style="animation-delay: {i * 80}ms">
              <span class="card-icon" aria-hidden="true">{card.icon}</span>
              <div>
                <div class="card-title">{card.title}</div>
                <div class="card-desc">{card.desc}</div>
              </div>
            </li>
          {/each}
        </ul>

        <div class="step-actions">
          <button class="primary-btn" onclick={startKeyWalkthrough}>
            Show me the keys →
          </button>
          <button class="ghost-btn" onclick={handleStart}>
            Start directly
          </button>
        </div>
      </div>

    <!-- ─── STEP 2: Key walkthrough ─── -->
    {:else}
      <div class="keys-step">
        <h2 class="intro-title">Finger Placement Guide</h2>

        {#if currentIntroKey}
          <!-- Character + finger label -->
          <div class="key-spotlight">
            <span class="key-char" aria-label="Target character: {currentIntroKey.char === ' ' ? 'Space' : currentIntroKey.char}">
              {currentIntroKey.char === ' ' ? 'Space' : currentIntroKey.char}
            </span>
            <span class="key-sep" aria-hidden="true">→</span>
            <span class="key-finger">
              {currentIntroKey.expectedFinger.replace(/_/g, '-').replace('-', ' ')}
            </span>
          </div>

          <!-- Hand diagram -->
          <div class="hand-guide-wrap">
            <HandGuide activeFinger={currentIntroKey.expectedFinger} showLabels={false} />
          </div>

          <!-- Progress bar -->
          <div class="key-progress" role="progressbar" aria-valuenow={keyIndex + 1} aria-valuemax={introKeys.length} aria-label="Key {keyIndex + 1} of {introKeys.length}">
            <div class="key-progress-track">
              {#each introKeys as _, i}
                <div class="pip" class:done={i < keyIndex} class:current={i === keyIndex}></div>
              {/each}
            </div>
            <span class="key-progress-label">Key {keyIndex + 1} of {introKeys.length}</span>
          </div>

          <!-- Navigation -->
          <div class="key-nav">
            <button class="nav-btn" onclick={prevKey} disabled={keyIndex === 0} aria-label="Previous key">‹ Prev</button>
            {#if keyIndex < introKeys.length - 1}
              <button class="primary-btn" onclick={nextKey}>Next key ›</button>
            {:else}
              <button class="primary-btn pulse" onclick={handleStart}>Start Lesson ▶</button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

  </div>
</div>

<style>
  .intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(12, 13, 16, 0.92);
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .intro-panel {
    position: relative;
    background: var(--surface-container-low, #1d2025);
    border: 1px solid var(--outline-variant, #48464f);
    border-top: 3px solid var(--primary, #ffc56c);
    border-radius: 1rem;
    padding: 2.5rem 2rem 2rem;
    max-width: 540px;
    width: 100%;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,197,108,0.06);
    animation: panel-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes panel-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }

  .skip-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0.65rem;
    font-family: 'Space Grotesk', monospace;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--on-surface-variant, #cac4d0);
    background: transparent;
    border: 1px solid var(--outline-variant, #48464f);
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    border-radius: 4px;
  }
  .skip-btn:hover { color: var(--primary, #ffc56c); border-color: var(--primary, #ffc56c); }

  .intro-title {
    font-family: 'Newsreader', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--on-surface, #e3e2e6);
    margin: 0 0 0.25rem;
  }
  .intro-subtitle {
    font-size: 0.85rem;
    color: var(--on-surface-variant, #cac4d0);
    margin: 0 0 1.5rem;
  }
  .intro-subtitle strong { color: var(--primary, #ffc56c); font-weight: 700; }

  /* Explainer cards */
  .cards-list {
    list-style: none;
    margin: 0 0 1.75rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .card {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    background: var(--surface-container, #26282e);
    border: 1px solid var(--outline-variant, #48464f);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    animation: card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes card-in {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .card-icon  { font-size: 1.25rem; flex-shrink: 0; margin-top: 1px; }
  .card-title { font-size: 0.85rem; font-weight: 700; color: var(--on-surface, #e3e2e6); margin-bottom: 0.15rem; }
  .card-desc  { font-size: 0.75rem; color: var(--on-surface-variant, #cac4d0); line-height: 1.4; }

  /* Key walkthrough */
  .keys-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .key-spotlight {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    background: var(--surface-container, #26282e);
    border: 1px solid var(--primary, #ffc56c);
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    box-shadow: 0 0 20px rgba(255, 197, 108, 0.12);
    animation: spotlight-in 0.3s ease;
  }
  @keyframes spotlight-in {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  .key-char   { font-family: 'Space Grotesk', monospace; font-size: 2rem; font-weight: 800; color: var(--primary, #ffc56c); min-width: 2rem; text-align: center; }
  .key-sep    { font-size: 1.25rem; color: var(--outline-variant, #48464f); }
  .key-finger { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: capitalize; color: var(--on-surface-variant, #cac4d0); }

  .hand-guide-wrap { transform: scale(0.85); transform-origin: center; }

  /* Progress pips */
  .key-progress { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; width: 100%; }
  .key-progress-track { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; max-width: 320px; }
  .pip {
    width: 8px; height: 4px; border-radius: 2px;
    background: var(--surface-container-highest, #36343b);
    transition: background 0.2s, width 0.2s;
  }
  .pip.done    { background: var(--primary, #ffc56c); opacity: 0.5; }
  .pip.current { background: var(--primary, #ffc56c); width: 16px; }
  .key-progress-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--on-surface-variant, #cac4d0); }

  /* Nav */
  .key-nav { display: flex; gap: 0.75rem; align-items: center; }
  .nav-btn {
    font-size: 0.8rem; font-weight: 700; padding: 0.5rem 1rem;
    background: transparent; color: var(--on-surface-variant, #cac4d0);
    border: 1px solid var(--outline-variant, #48464f); cursor: pointer;
    border-radius: 4px; transition: color 0.15s, border-color 0.15s;
  }
  .nav-btn:hover:not(:disabled) { color: var(--on-surface, #e3e2e6); border-color: var(--on-surface-variant, #cac4d0); }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Shared buttons */
  .step-actions { display: flex; gap: 0.75rem; align-items: center; justify-content: center; }
  .primary-btn {
    font-family: 'Space Grotesk', monospace; font-size: 0.8rem; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    background: var(--primary, #ffc56c); color: var(--on-primary, #442c00);
    border: none; padding: 0.625rem 1.5rem; cursor: pointer; border-radius: 4px;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .primary-btn:hover { background: #ffb13e; box-shadow: 0 0 16px rgba(255,197,108,0.4); }
  .primary-btn.pulse { animation: cta-pulse 1.5s ease-in-out infinite; }
  @keyframes cta-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,197,108,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(255,197,108,0); }
  }
  .ghost-btn {
    font-size: 0.75rem; font-weight: 600; color: var(--on-surface-variant, #cac4d0);
    background: transparent; border: none; cursor: pointer; padding: 0.4rem;
    transition: color 0.15s; text-decoration: underline; text-underline-offset: 3px;
  }
  .ghost-btn:hover { color: var(--on-surface, #e3e2e6); }

  @media (max-width: 520px) {
    .intro-panel { padding: 2rem 1.25rem 1.5rem; }
    .hand-guide-wrap { transform: scale(0.7); }
  }
</style>
