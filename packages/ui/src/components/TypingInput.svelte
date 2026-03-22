<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    text: string;
    currentIndex: number;
    errors: Set<number>;
    isRTL?: boolean;
    language?: string;
    onWordComplete?: (word: string, accuracy: number) => void;
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }

  let { 
    text, 
    currentIndex, 
    errors, 
    isRTL = false,
    language = 'en',
    onWordComplete,
    onEscape,
    onArrowLeft,
    onArrowRight,
    class: className = '', 
    ...restProps 
  }: Props = $props();

  let chars = $derived(text.split(''));
  
  // Track current word for screen reader announcements
  let currentWord = $state('');
  let wordStartIndex = $state(0);
  let isTypingMode = $state(false);
  let ariaLiveText = $state('');
  let lastAnnouncedIndex = $state(-1);

  // Find word boundaries for screen reader
  $effect(() => {
    if (currentIndex !== lastAnnouncedIndex) {
      // Find word start (previous space or beginning)
      let start = currentIndex;
      while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
        start--;
      }
      
      // Find word end (next space or end)
      let end = currentIndex;
      while (end < text.length && text[end] !== ' ' && text[end] !== '\n') {
        end++;
      }
      
      currentWord = text.slice(start, end);
      wordStartIndex = start;
      
      // Announce word completion
      if (currentIndex > 0 && (text[currentIndex - 1] === ' ' || currentIndex === text.length)) {
        const completedWordStart = wordStartIndex;
        const completedWordEnd = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        const completedWord = text.slice(completedWordStart, completedWordEnd + 1).trim();
        
        if (completedWord && onWordComplete) {
          // Calculate accuracy for this word
          let wordErrors = 0;
          for (let i = completedWordStart; i <= completedWordEnd; i++) {
            if (errors.has(i)) wordErrors++;
          }
          const accuracy = Math.round(((completedWord.length - wordErrors) / completedWord.length) * 100);
          onWordComplete(completedWord, accuracy);
        }
      }
      
      lastAnnouncedIndex = currentIndex;
    }
  });

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
      return;
    }
  }

  function handleFocus() {
    isTypingMode = true;
  }

  function handleBlur() {
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
  onfocus={handleFocus}
  onblur={handleBlur}
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

  <!-- Text display with character-level status -->
  {#each chars as char, i}
    <span
      class="char"
      class:correct={i < currentIndex && !errors.has(i)}
      class:error={errors.has(i)}
      class:current={i === currentIndex}
      aria-label={getCharStatus(i)}
      lang={isRTL && language === 'ar' ? 'ar' : undefined}
    >
      {#if i === currentIndex}
        <span class="cursor" aria-hidden="true"></span>
      {/if}
      {char}
    </span>
  {/each}
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

  /* Typing mode state */
  .typing-input.is-typing {
    opacity: 0.8;
  }

  /* RTL support */
  .typing-input.is-rtl {
    text-align: right;
    direction: rtl;
    unicode-bidi: bidi-override;
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

  .cursor {
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
    .cursor {
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
