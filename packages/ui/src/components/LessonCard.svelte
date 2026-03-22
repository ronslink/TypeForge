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
    children?: Snippet;
    onclick?: () => void;
  }

  let { lesson, selected = false, children, onclick }: Props = $props();

  const difficultyColors = {
    beginner: 'bg-success-container text-on-success-container',
    intermediate: 'bg-warning-container text-on-warning-container',
    advanced: 'bg-error-container text-on-error-container',
  };
</script>

<button
  type="button"
  class="lesson-card bg-surface-container-low p-6 text-left transition-all hover:bg-surface-container {selected
    ? 'ring-2 ring-primary'
    : ''}"
  onclick={onclick}
>
  <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
      <h3 class="font-label text-lg font-bold text-on-surface mb-1">
        {lesson.title}
      </h3>
      {#if lesson.description}
        <p class="text-sm text-on-surface-variant line-clamp-2">
          {lesson.description}
        </p>
      {/if}
    </div>
    <Badge variant="primary">
      {lesson.language}
    </Badge>
  </div>

  <div class="flex items-center gap-4 mb-4">
    <span class="text-xs font-label uppercase text-on-surface-variant">
      {lesson.duration} min
    </span>
    <span
      class="text-xs font-label uppercase px-2 py-0.5 {difficultyColors[
        lesson.difficulty
      ]}"
    >
      {lesson.difficulty}
    </span>
  </div>

  {#if lesson.progress !== undefined && lesson.progress > 0}
    <ProgressBar value={lesson.progress} max={100} variant="primary" />
  {/if}

  {#if children}
    <div class="mt-4">
      {@render children()}
    </div>
  {/if}
</button>

<style>
  .lesson-card {
    border-left: 3px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .lesson-card:hover {
    border-left-color: #f0a500;
  }

  .lesson-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(
      135deg,
      transparent 50%,
      rgba(240, 165, 0, 0.05) 50%
    );
  }
</style>
