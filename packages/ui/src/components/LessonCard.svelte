<script lang="ts">
  import type { Snippet } from 'svelte';
  import Badge from './Badge.svelte';
  import ProgressBar from './ProgressBar.svelte';

  interface Lesson {
    id: string;
    title: string;
    description?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    duration: number; // in minutes
    progress?: number; // 0-100
  }

  interface Props {
    lesson: Lesson;
    selected?: boolean;
    locked?: boolean;
    children?: Snippet;
    onclick?: () => void;
    href?: string;
  }

  let { lesson, selected = false, locked = false, children, onclick, href }: Props = $props();

  const difficultyColors = {
    beginner: 'bg-success-container text-on-success-container',
    intermediate: 'bg-warning-container text-on-warning-container',
    advanced: 'bg-error-container text-on-error-container',
  };
</script>

<svelte:element
  this={href && !locked ? 'a' : 'button'}
  href={locked ? undefined : href}
  type={href && !locked ? undefined : 'button'}
  class="lesson-card block w-full bg-surface-container-low p-6 rounded-2xl text-left transition-all focus-indicator {selected
    ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
    : ''} {locked ? 'opacity-50 grayscale cursor-not-allowed locked-card' : ''}"
  onclick={locked ? undefined : onclick}
>
  <div class="flex items-start justify-between mb-4 relative z-10">
    <div class="flex-1">
      <h3 class="font-headline text-xl font-bold text-on-surface mb-1 drop-shadow-sm flex items-center gap-2">
        {lesson.title}
        {#if locked}
          <span class="text-on-surface-variant text-base">🔒</span>
        {/if}
      </h3>
      {#if lesson.description}
        <p class="text-sm font-body text-on-surface-variant line-clamp-2">
          {lesson.description}
        </p>
      {/if}
    </div>
    {#if lesson.language && !locked}
      <Badge variant="primary">
        {lesson.language}
      </Badge>
    {/if}
  </div>

  <div class="flex flex-wrap items-center gap-3 mb-4 relative z-10">
    <span class="text-[0.65rem] tracking-wider font-label uppercase text-on-surface-variant bg-surface-container px-2 py-1 rounded">
      ⏱️ {lesson.duration} min
    </span>
    <span
      class="text-[0.65rem] tracking-wider font-label uppercase px-2 py-1 rounded {difficultyColors[
        lesson.difficulty
      ]}"
    >
      {lesson.difficulty === 'beginner' ? '🟢 ' : lesson.difficulty === 'intermediate' ? '🟡 ' : '🔴 '}
      {lesson.difficulty}
    </span>
  </div>

  {#if lesson.progress !== undefined && lesson.progress > 0}
    <div class="relative z-10 mt-2">
      <ProgressBar value={lesson.progress} max={100} variant="primary" />
    </div>
  {/if}

  {#if children}
    <div class="mt-4 relative z-10 border-t border-surface-container pt-3">
      {@render children()}
    </div>
  {/if}
</svelte:element>

<style>
  .lesson-card {
    border: 1px solid var(--surface-container-high, #3c4043);
    position: relative;
    overflow: hidden;
    transform: translateZ(0); /* Force hardware accel for smooth scale */
  }

  .lesson-card:hover:not(.locked-card) {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.6);
    border-color: var(--surface-variant, #f0a500);
    background-color: var(--surface-container, #22262c);
  }

  .lesson-card:active:not(.locked-card) {
    transform: translateY(-1px) scale(0.99);
    transition: all 0.05s ease;
  }

  /* Soft glowing top-right orb */
  .lesson-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle at 100% 0%,
      rgba(240, 165, 0, 0.08),
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
    pointer-events: none;
  }

  .lesson-card:hover:not(.locked-card)::before {
    opacity: 1;
  }

  /* Animated accent border line at the bottom */
  .lesson-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background-color: var(--primary, #f0a500);
    transition: width 0.4s cubic-bezier(0.2, 0, 0, 1);
    z-index: 1;
  }

  .lesson-card:hover:not(.locked-card)::after {
    width: 100%;
  }
</style>
