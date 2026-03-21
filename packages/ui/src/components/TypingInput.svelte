<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    text: string;
    currentIndex: number;
    errors: Set<number>;
  }

  let { text, currentIndex, errors, class: className = '', ...restProps }: Props = $props();

  $derived(chars = text.split(''));
</script>

<div
  class="typing-input font-label text-3xl md:text-4xl leading-relaxed tracking-tight {className}"
  {...restProps}
>
  {#each chars as char, i}
    <span
      class="char"
      class:correct={i < currentIndex && !errors.has(i)}
      class:error={errors.has(i)}
      class:current={i === currentIndex}
    >
      {#if i === currentIndex}
        <span class="cursor"></span>
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
</style>
