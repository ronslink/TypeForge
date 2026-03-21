<script lang="ts">
  import { onMount } from 'svelte';

  type ToastType = 'success' | 'encouragement' | 'milestone' | 'streak';

  interface Props {
    message: string;
    type?: ToastType;
    duration?: number;
    onclose?: () => void;
  }

  let {
    message,
    type = 'encouragement',
    duration = 3000,
    onclose,
  }: Props = $props();

  let visible = $state(false);
  let progress = $state(100);

  const typeConfig = {
    success: {
      icon: '✓',
      color: 'bg-success-container text-on-success-container',
      glow: 'rgba(76, 175, 80, 0.3)',
    },
    encouragement: {
      icon: '💪',
      color: 'bg-primary-container text-on-primary-container',
      glow: 'rgba(240, 165, 0, 0.3)',
    },
    milestone: {
      icon: '🏆',
      color: 'bg-secondary-container text-on-secondary-container',
      glow: 'rgba(0, 131, 143, 0.3)',
    },
    streak: {
      icon: '🔥',
      color: 'bg-warning-container text-on-warning-container',
      glow: 'rgba(255, 152, 0, 0.3)',
    },
  };

  const config = $derived(typeConfig[type]);

  onMount(() => {
    // Animate in
    setTimeout(() => {
      visible = true;
    }, 50);

    // Progress bar countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress = Math.max(0, 100 - (elapsed / duration) * 100);
      if (progress <= 0) {
        clearInterval(interval);
      }
    }, 16);

    // Auto close
    const timeout = setTimeout(() => {
      visible = false;
      setTimeout(() => onclose?.(), 300);
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  });
</script>

<div
  class="toast {config.color} {visible ? 'visible' : ''}"
  style="--glow-color: {config.glow}"
>
  <span class="toast-icon">{config.icon}</span>
  <span class="toast-message">{message}</span>
  <div class="toast-progress" style="width: {progress}%"></div>
</div>

<style>
  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-label: 'Label';
    font-weight: 600;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease-out;
    z-index: 1000;
    box-shadow: 0 4px 20px var(--glow-color);
  }

  .toast.visible {
    transform: translateY(0);
    opacity: 1;
  }

  .toast-icon {
    font-size: 1.25rem;
  }

  .toast-message {
    font-size: 0.875rem;
  }

  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: currentColor;
    opacity: 0.5;
    transition: width 0.016s linear;
  }
</style>
