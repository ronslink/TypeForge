<script lang="ts">
  import HandGuide from './HandGuide.svelte';

  interface IntroKey {
    char: string;
    expectedFinger: string;
  }

  type ScriptFamily =
    | 'Latin' | 'Arabic' | 'Hebrew' | 'Cyrillic'
    | 'CJK' | 'Thai' | 'Korean' | 'Devanagari'
    | string; // allow pass-through from language registry

  interface LanguageInfo {
    code: string;
    nativeName: string;
    englishName: string;
    script: ScriptFamily;
    keyboard: string;
    rtl: boolean;
    sampleText: string;
  }

  interface Props {
    lessonId: string;
    introKeys: IntroKey[];
    highlightKeys: Set<string>;
    onStart: () => void;
    language?: LanguageInfo | null;
  }

  let { lessonId, introKeys, onStart, language = null }: Props = $props();

  // ── Script detection helpers ────────────────────────────────────────────────
  const isRTL      = $derived(language?.rtl ?? false);
  const isCJK      = $derived(['CJK'].includes(language?.script ?? ''));
  const isCyrillic = $derived(language?.script === 'Cyrillic');
  const isArabic   = $derived(language?.script === 'Arabic');
  const isHebrew   = $derived(language?.script === 'Hebrew');
  const isThai     = $derived(language?.script === 'Thai');
  const isKorean   = $derived(language?.script === 'Korean');
  const isDevanagari = $derived(language?.script === 'Devanagari');
  const isNonLatin = $derived(isCyrillic || isArabic || isHebrew || isThai || isKorean || isDevanagari || isCJK);

  // Script-specific accent colour token (keeps the panel themed to the script family)
  const scriptAccent = $derived(
    isArabic || isHebrew ? '#41e4c0' :
    isCyrillic           ? '#ffb4ab' :
    isCJK                ? '#c8b8ff' :
    isThai               ? '#ffb4ab' :
    isKorean             ? '#ffc56c' :
    isDevanagari         ? '#41e4c0' :
                           '#ffc56c'   // Latin default
  );

  // ── Explainer cards (language-sensitive) ────────────────────────────────────
  const baseCards = $derived([
    {
      icon: '🔤',
      title: 'Type the highlighted character',
      desc: isCJK
        ? `Use ${language?.keyboard ?? 'your input method'} to input each character — the cursor advances only on a correct match.`
        : `The next character glows — that's your target. Type it using the ${language?.keyboard ?? 'keyboard'} layout.`,
    },
    {
      icon: '🚫',
      title: 'Wrong key? Nothing moves',
      desc: 'The cursor stays put until you type the correct character. Strict mode builds clean muscle memory.',
    },
    {
      icon: '✅',
      title: 'Correct key = cursor advances',
      desc: 'Only accurate input moves you forward — speed follows naturally.',
    },
    ...(isRTL ? [{
      icon: '↩️',
      title: 'Right-to-left reading direction',
      desc: `${language?.nativeName ?? 'This language'} is written right-to-left. The text flows from the right — your fingers still use the same positions.`,
    }] : []),
    ...(isCJK ? [{
      icon: '🈶',
      title: `${language?.keyboard ?? 'Input method'} typing`,
      desc: `Characters are built via phonetic input (${language?.keyboard}). Each lesson focuses on practising specific characters in context.`,
    }] : [
      {
        icon: '⌨️',
        title: 'Follow the finger guide',
        desc: 'The hand diagram shows which finger to use for each key — essential for building correct posture.',
      },
    ]),
    {
      icon: '⏱️',
      title: 'Your clock only runs when you type',
      desc: 'Pauses don\'t count against your WPM. Stop & Finish whenever you\'re ready.',
    },
  ]);

  // ── Script hero — sample glyphs shown in the panel header ──────────────────
  const sampleGlyphs = $derived(
    language?.sampleText?.slice(0, isCJK ? 8 : 20) ?? null
  );

  // ── Steps ───────────────────────────────────────────────────────────────────
  let step = $state<'explainer' | 'keys'>('explainer');
  let keyIndex = $state(0);
  let autoInterval: ReturnType<typeof setInterval> | null = null;

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
    }, 1600);
  }

  function stopAutoAdvance() {
    if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
  }

  function nextKey() {
    stopAutoAdvance();
    if (keyIndex < introKeys.length - 1) { keyIndex++; startAutoAdvance(); }
  }

  function prevKey() {
    stopAutoAdvance();
    if (keyIndex > 0) { keyIndex--; startAutoAdvance(); }
  }

  function handleStart() {
    stopAutoAdvance();
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
  <div class="intro-panel" style="--accent: {scriptAccent}">

    <!-- Skip -->
    <button class="skip-btn" onclick={handleStart} aria-label="Skip introduction and start lesson">
      Skip — ESC
    </button>

    <!-- ─── Script hero banner ─── -->
    {#if language}
      <div class="script-hero" dir={isRTL ? 'rtl' : 'ltr'}>
        <div class="script-meta">
          <span class="script-badge">{language.script}</span>
          <span class="script-keyboard">{language.keyboard}</span>
        </div>
        <div class="script-name">{language.nativeName}</div>
        {#if sampleGlyphs}
          <div class="script-sample" lang={language.code} dir={isRTL ? 'rtl' : 'ltr'}>
            {sampleGlyphs}
          </div>
        {/if}
      </div>
    {/if}

    <!-- ─── STEP 1: Explainer ─── -->
    {#if step === 'explainer'}
      <div class="explainer-step">
        <h2 class="intro-title">Before you begin</h2>
        <p class="intro-subtitle">
          TypeForge uses <strong>strict mode</strong>
          {#if isNonLatin}
            — here's what to expect for <strong>{language?.nativeName}</strong>:
          {:else}
            — understand how it works:
          {/if}
        </p>

        <ul class="cards-list" role="list">
          {#each baseCards as card, i}
            <li class="card" style="animation-delay: {i * 70}ms">
              <span class="card-icon" aria-hidden="true">{card.icon}</span>
              <div>
                <div class="card-title">{card.title}</div>
                <div class="card-desc">{card.desc}</div>
              </div>
            </li>
          {/each}
        </ul>

        <div class="step-actions">
          {#if !isCJK && introKeys.length > 0}
            <button class="primary-btn" onclick={startKeyWalkthrough}>
              Show me the keys →
            </button>
          {:else}
            <button class="primary-btn pulse" onclick={handleStart}>
              Start Lesson ▶
            </button>
          {/if}
          <button class="ghost-btn" onclick={handleStart}>Start directly</button>
        </div>
      </div>

    <!-- ─── STEP 2: Key walkthrough ─── -->
    {:else}
      <div class="keys-step">
        <h2 class="intro-title">
          {#if isRTL}
            مرشد وضع الأصابع
          {:else if isCyrillic}
            Расположение пальцев
          {:else if isDevanagari}
            उंगली की स्थिति
          {:else}
            Finger Placement Guide
          {/if}
        </h2>
        {#if language && isNonLatin}
          <p class="keys-subtitle">
            Characters shown in {language.nativeName} ({language.script} script)
          </p>
        {/if}

        {#if currentIntroKey}
          <!-- Character + finger label -->
          <div class="key-spotlight" dir={isRTL ? 'rtl' : 'ltr'}>
            <span
              class="key-char"
              lang={language?.code}
              aria-label="Target character: {currentIntroKey.char === ' ' ? 'Space' : currentIntroKey.char}"
            >
              {currentIntroKey.char === ' ' ? '␣' : currentIntroKey.char}
            </span>
            <span class="key-sep" aria-hidden="true">→</span>
            <span class="key-finger">
              {currentIntroKey.expectedFinger.replace(/_/g, ' ')}
            </span>
          </div>

          <!-- Hand diagram -->
          <div class="hand-guide-wrap">
            <HandGuide activeFinger={currentIntroKey.expectedFinger} showLabels={false} />
          </div>

          <!-- Progress pips -->
          <div
            class="key-progress"
            role="progressbar"
            aria-valuenow={keyIndex + 1}
            aria-valuemax={introKeys.length}
            aria-label="Key {keyIndex + 1} of {introKeys.length}"
          >
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
    background: rgba(8, 9, 12, 0.92);
    backdrop-filter: blur(20px) saturate(1.2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .intro-panel {
    --accent: #ffc56c;
    position: relative;
    background: var(--surface-container-low, #1d2025);
    border: 1px solid rgba(255,255,255,0.06);
    border-top: 3px solid var(--accent);
    border-radius: 1.25rem;
    padding: 0 0 2rem;
    max-width: 580px;
    width: 100%;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.6),
      0 0 0 1px rgba(255,255,255,0.04),
      0 0 60px color-mix(in srgb, var(--accent) 8%, transparent);
    animation: panel-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    overflow: hidden;
  }

  @keyframes panel-in {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }

  /* ── Skip button ── */
  .skip-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    font-size: 0.6rem;
    font-family: 'Space Grotesk', monospace;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--on-surface-variant, #cac4d0);
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.25rem 0.65rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    border-radius: 4px;
    backdrop-filter: blur(4px);
  }
  .skip-btn:hover { color: var(--accent); border-color: var(--accent); }

  /* ── Script hero banner ── */
  .script-hero {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 12%, transparent),
      transparent 70%
    );
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 1.75rem 2rem 1.25rem;
    margin-bottom: 0;
    position: relative;
    overflow: hidden;
  }
  .script-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 90% 50%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%);
    pointer-events: none;
  }

  .script-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }
  .script-badge {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
  }
  .script-keyboard {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--on-surface-variant, #cac4d0);
  }
  .script-name {
    font-family: 'Newsreader', serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--on-surface, #e3e2e6);
    line-height: 1.1;
    margin-bottom: 0.5rem;
  }
  .script-sample {
    font-size: 1rem;
    color: color-mix(in srgb, var(--accent) 70%, var(--on-surface-variant));
    letter-spacing: 0.06em;
    line-height: 1.5;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* ── Explainer step ── */
  .explainer-step {
    padding: 1.5rem 2rem 0;
  }

  .intro-title {
    font-family: 'Newsreader', serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--on-surface, #e3e2e6);
    margin: 0 0 0.2rem;
  }
  .intro-subtitle {
    font-size: 0.82rem;
    color: var(--on-surface-variant, #cac4d0);
    margin: 0 0 1.25rem;
    line-height: 1.5;
  }
  .intro-subtitle strong { color: var(--accent); font-weight: 700; }

  /* Cards */
  .cards-list {
    list-style: none;
    margin: 0 0 1.5rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .card {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0.625rem;
    padding: 0.7rem 0.9rem;
    animation: card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: background 0.2s;
  }
  .card:hover { background: rgba(255,255,255,0.05); }
  @keyframes card-in {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .card-icon  { font-size: 1.15rem; flex-shrink: 0; margin-top: 2px; }
  .card-title { font-size: 0.82rem; font-weight: 700; color: var(--on-surface, #e3e2e6); margin-bottom: 0.1rem; }
  .card-desc  { font-size: 0.73rem; color: var(--on-surface-variant, #cac4d0); line-height: 1.45; }

  /* Actions */
  .step-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    padding-top: 0.25rem;
  }

  /* ── Keys step ── */
  .keys-step {
    padding: 1.5rem 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
  }
  .keys-subtitle {
    font-size: 0.75rem;
    color: var(--on-surface-variant, #cac4d0);
    margin: -0.5rem 0 0;
    text-align: center;
  }

  .key-spotlight {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--accent);
    border-radius: 0.75rem;
    padding: 0.875rem 1.75rem;
    box-shadow: 0 0 28px color-mix(in srgb, var(--accent) 14%, transparent);
    animation: spotlight-in 0.28s ease;
    width: 100%;
    justify-content: center;
  }
  @keyframes spotlight-in {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  .key-char {
    font-family: 'Space Grotesk', monospace;
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--accent);
    min-width: 2.5rem;
    text-align: center;
    line-height: 1;
  }
  .key-sep    { font-size: 1.1rem; color: rgba(255,255,255,0.2); }
  .key-finger {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: capitalize;
    color: var(--on-surface-variant, #cac4d0);
    max-width: 140px;
  }

  .hand-guide-wrap { transform: scale(0.82); transform-origin: center; }

  /* Progress pips */
  .key-progress { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; width: 100%; }
  .key-progress-track { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; max-width: 340px; }
  .pip {
    width: 8px; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.08);
    transition: background 0.2s, width 0.2s;
  }
  .pip.done    { background: var(--accent); opacity: 0.45; }
  .pip.current { background: var(--accent); width: 18px; }
  .key-progress-label {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--on-surface-variant, #cac4d0);
  }

  /* Nav */
  .key-nav { display: flex; gap: 0.75rem; align-items: center; }
  .nav-btn {
    font-size: 0.78rem; font-weight: 700; padding: 0.5rem 1rem;
    background: transparent; color: var(--on-surface-variant, #cac4d0);
    border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
    border-radius: 4px; transition: color 0.15s, border-color 0.15s;
  }
  .nav-btn:hover:not(:disabled) { color: var(--on-surface, #e3e2e6); border-color: rgba(255,255,255,0.25); }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Shared buttons */
  .primary-btn {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.78rem; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    background: var(--accent); color: #1a1200;
    border: none; padding: 0.65rem 1.6rem; cursor: pointer; border-radius: 4px;
    transition: filter 0.15s, box-shadow 0.15s;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }
  .primary-btn:hover { filter: brightness(1.1); box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent); }
  .primary-btn.pulse { animation: cta-pulse 1.6s ease-in-out infinite; }
  @keyframes cta-pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent); }
    50%       { box-shadow: 0 0 0 10px transparent; }
  }
  .ghost-btn {
    font-size: 0.73rem; font-weight: 600; color: var(--on-surface-variant, #cac4d0);
    background: transparent; border: none; cursor: pointer; padding: 0.4rem;
    transition: color 0.15s; text-decoration: underline; text-underline-offset: 3px;
  }
  .ghost-btn:hover { color: var(--on-surface, #e3e2e6); }

  @media (max-width: 520px) {
    .intro-panel { border-radius: 1rem; }
    .script-hero { padding: 1.25rem 1.25rem 1rem; }
    .explainer-step, .keys-step { padding: 1.25rem 1.25rem 0; }
    .hand-guide-wrap { transform: scale(0.7); }
    .key-char { font-size: 1.75rem; }
  }
</style>
