<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { IMEHandler } from '@typeforge/metrics';

  /**
   * Minimal display contract. The typing kernel's `TypingPromptUnit` satisfies
   * it structurally, so this package stays independent of the web app.
   */
  interface DisplayUnit {
    readonly grapheme: string;
  }

  /** Strict-input verdict supplied by the caller. Mirrors `getStrictInputDecision`. */
  interface InputPolicyDecision {
    readonly allow: boolean;
    readonly announcement?: string;
  }

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Grapheme prompt units. Each is one scorable position. */
    units: readonly DisplayUnit[];
    currentIndex: number;
    errors: ReadonlySet<number>;
    isRTL?: boolean;
    language?: string;
    onWordComplete?: (word: string, accuracy: number) => void;
    /**
     * Text an operating-system input method committed. The caller scores this;
     * pre-edit composition text is never emitted.
     */
    onCommittedText?: (text: string) => void;
    /**
     * Verdict for a native `beforeinput` type. Direct insertion is always
     * suppressed — scoring comes from physical keys and composition commits —
     * so this is consulted for the announcement that explains a blocked edit.
     */
    onInputPolicy?: (inputType: string) => InputPolicyDecision;
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }

  let {
    units,
    currentIndex,
    errors,
    isRTL = false,
    language = 'en',
    onWordComplete,
    onCommittedText,
    onInputPolicy,
    onEscape,
    onArrowLeft,
    onArrowRight,
    class: className = '',
    ...restProps
  }: Props = $props();

  // Track current word for screen reader announcements
  let currentWord = $state('');
  let isTypingMode = $state(false);
  let ariaLiveText = $state('');
  let lastAnnouncedIndex = $state(-1);

  /**
   * Off-screen capture field. It exists so an operating-system input method can
   * compose: composition events only fire on a focused editable element. It is
   * never a source of physical-key scoring, and it is kept empty.
   */
  let captureEl = $state<HTMLInputElement | null>(null);

  const ime = new IMEHandler();
  ime.onCommit(({ committed }) => {
    onCommittedText?.(committed);
  });

  function clearCapture() {
    if (captureEl) captureEl.value = '';
  }

  function focusCapture() {
    // preventScroll keeps the page from jumping when a drill area is clicked.
    captureEl?.focus({ preventScroll: true });
  }

  // Take focus once, as soon as there is a drill to type, so an input method can
  // compose without the learner having to click first. Re-focusing on every
  // prompt object change would steal focus from the layout selector.
  let captureFocusTaken = $state(false);
  $effect(() => {
    if (captureFocusTaken || units.length === 0) return;
    captureFocusTaken = true;
    focusCapture();
  });

  function handleCompositionStart() {
    ime.handleCompositionStart();
  }

  function handleCompositionUpdate(event: CompositionEvent) {
    ime.handleCompositionUpdate(event);
  }

  function handleCompositionEnd(event: CompositionEvent) {
    ime.handleCompositionEnd(event);
    clearCapture();
  }

  function handleCaptureInput(event: Event) {
    if (ime.isComposing) return;
    const value = (event.target as HTMLInputElement).value;
    ime.handleInput({ value, inputType: (event as InputEvent).inputType });
    clearCapture();
  }

  function handleBeforeInput(event: InputEvent) {
    const inputType = event.inputType ?? '';
    if (ime.isComposing || inputType.startsWith('insertComposition')) return;

    const decision = onInputPolicy?.(inputType) ?? { allow: true };
    if (!decision.allow && decision.announcement) {
      ariaLiveText = decision.announcement;
    }
    // Whether or not the policy allows it, the capture field must not collect
    // text: that would double-score against the physical keystroke path.
    event.preventDefault();
  }

  // Find word boundaries for screen reader
  $effect(() => {
    if (currentIndex !== lastAnnouncedIndex) {
      let start = currentIndex;
      while (start > 0 && !isBoundary(start - 1)) start--;

      let end = currentIndex;
      while (end < units.length && !isBoundary(end)) end++;

      currentWord = units
        .slice(start, end)
        .map((unit) => unit.grapheme)
        .join('');

      // Announce word completion
      if (currentIndex > 0 && (isBoundary(currentIndex - 1) || currentIndex === units.length)) {
        const completedUnitCount = currentIndex > 0 ? currentIndex - 1 : 0;
        const completedWord = units
          .slice(start, completedUnitCount + 1)
          .map((unit) => unit.grapheme)
          .join('')
          .trim();

        if (completedWord && onWordComplete) {
          let wordErrors = 0;
          for (let i = start; i <= completedUnitCount; i++) {
            if (errors.has(i)) wordErrors++;
          }
          const length = completedUnitCount - start + 1;
          const accuracy = Math.round(((length - wordErrors) / length) * 100);
          onWordComplete(completedWord, accuracy);
        }
      }

      lastAnnouncedIndex = currentIndex;
    }
  });

  function isBoundary(index: number): boolean {
    const grapheme = units[index]?.grapheme;
    return grapheme === undefined || grapheme === ' ' || grapheme === '\n';
  }

  // Handle keyboard navigation
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isTypingMode = false;
      onEscape?.();
      return;
    }

    // Arrow key navigation when not in typing mode
    if (!isTypingMode) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onArrowLeft?.();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onArrowRight?.();
        return;
      }
    }

    // Enter or Space to enter typing mode
    if ((event.key === 'Enter' || event.key === ' ') && !isTypingMode) {
      event.preventDefault();
      isTypingMode = true;
      focusCapture();
      return;
    }
  }

  function handleFocusIn() {
    isTypingMode = true;
  }

  function handleFocusOut() {
    isTypingMode = false;
  }

  // Get character status for ARIA
  function getCharStatus(index: number): string {
    if (index === currentIndex) return 'current';
    if (errors.has(index)) return 'error';
    if (index < currentIndex) return 'correct';
    return 'pending';
  }
</script>

<!-- 
  Accessibility Notes:
  - role="application" indicates this is an interactive widget requiring keyboard handling
  - aria-label describes the typing area purpose
  - aria-live region announces word completions and accuracy
  - tabindex="0" makes the element focusable
  - Escape key exits typing mode for navigation
  - Arrow keys navigate between words when not actively typing
  - RTL support: dir attribute and lang for Arabic/Hebrew text
-->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="typing-input font-label text-3xl md:text-4xl leading-relaxed tracking-tight {className}"
  class:is-rtl={isRTL}
  class:is-typing={isTypingMode}
  role="application"
  aria-label="Typing practice area. Press Enter to start typing, Escape to exit typing mode, Arrow keys to navigate between words."
  aria-describedby="typing-instructions"
  tabindex="0"
  dir={isRTL ? 'rtl' : 'ltr'}
  onkeydown={handleKeyDown}
  onfocusin={handleFocusIn}
  onfocusout={handleFocusOut}
  onpointerdown={focusCapture}
  {...restProps}
>
  <!-- Visually hidden instructions for screen readers -->
  <span id="typing-instructions" class="sr-only">
    Type the text shown. Your current position is tracked. Press Escape to pause and use arrow keys to review.
  </span>
  
  <!-- ARIA live region for announcements (word completions, accuracy) -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {ariaLiveText}
  </div>
  
  <!-- Current word announcement -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Current word: {currentWord}
  </div>

  <input
    bind:this={captureEl}
    class="capture-field"
    type="text"
    tabindex="-1"
    aria-label="Typing input capture. Compose with your input method here; physical key presses are scored directly."
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    oncompositionstart={handleCompositionStart}
    oncompositionupdate={handleCompositionUpdate}
    oncompositionend={handleCompositionEnd}
    onbeforeinput={handleBeforeInput}
    oninput={handleCaptureInput}
  />

  <!-- Text display with character-level status. Every unit is written as a
       single text expression with no surrounding whitespace, so the rendered
       text is exactly the prompt. The cursor is drawn with ::before rather than
       as a child element, which would otherwise introduce a stray space. -->
  {#each units as unit, i}<span class="char" class:is-space={unit.grapheme === ' '} class:correct={i < currentIndex && !errors.has(i)} class:error={errors.has(i)} class:current={i === currentIndex} aria-label={getCharStatus(i)} lang={isRTL && language === 'ar' ? 'ar' : undefined}>{unit.grapheme === ' ' ? '·' : unit.grapheme}</span>{/each}
</div>

<style>
  .typing-input {
    position: relative;
    color: var(--on-surface, #e1e2ea);
    opacity: 0.4;
    /* Focus indicator - amber outline */
    outline: none;
    border-radius: 2px;
    padding: 0.5rem;
    margin: -0.5rem;
    transition: outline-color 0.15s ease, opacity 0.15s ease;
  }

  /* Visible focus indicator - amber outline */
  .typing-input:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 4px;
  }

  /* Typing mode state — also carries the focus ring, because focus normally
     lands on the off-screen capture field rather than on this element. */
  .typing-input.is-typing {
    opacity: 0.8;
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 4px;
  }

  /* RTL support */
  .typing-input.is-rtl {
    text-align: right;
    direction: rtl;
    unicode-bidi: bidi-override;
  }

  /*
    The capture field must stay focusable and laid out (display:none and
    visibility:hidden both disable composition), so it is made a one-pixel
    transparent field instead.
  */
  .capture-field {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    opacity: 0;
    background: transparent;
    color: transparent;
    caret-color: transparent;
    pointer-events: none;
  }

  .char {
    position: relative;
    transition: color 0.1s ease;
  }

  .char.correct {
    opacity: 1;
    color: var(--on-surface, #e1e2ea);
  }

  .char.error {
    opacity: 1;
    color: var(--error, #ffb4ab);
  }

  .char.current {
    opacity: 1;
  }

  .char.current::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 2px;
    height: 1.2em;
    background-color: var(--primary, #ffc56c);
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .char.current::before {
      animation: none;
      opacity: 1;
    }
    
    .char {
      transition: none;
    }
    
    .typing-input {
      transition: none;
    }
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
