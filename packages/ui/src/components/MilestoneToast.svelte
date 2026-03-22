<script lang="ts">
  import { onMount } from 'svelte';

  export type MilestoneType = 'info' | 'achievement' | 'streak' | 'perfect';

  interface Props {
    message: string;
    type?: MilestoneType;
    duration?: number;
    onclose?: () => void;
  }

  let {
    message,
    type = 'info',
    duration = 4000,
    onclose,
  }: Props = $props();

  let visible = $state(false);
  let progress = $state(100);

  const typeConfig = {
    info: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      borderColor: '#41e4c0',
      glowColor: 'rgba(65, 228, 192, 0.4)',
      bgGradient: 'linear-gradient(135deg, rgba(65, 228, 192, 0.15) 0%, rgba(65, 228, 192, 0.05) 100%)',
    },
    achievement: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      borderColor: '#ffc56c',
      glowColor: 'rgba(255, 197, 108, 0.5)',
      bgGradient: 'linear-gradient(135deg, rgba(255, 197, 108, 0.2) 0%, rgba(255, 197, 108, 0.05) 100%)',
    },
    streak: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-2.072-2.143-1.072 2.143-.928 4.286-.928 4.286C6.5 12.5 6 14 6 15.5c0 2.5 2.5 4 5 4s5-1.5 5-4c0-1.5-.5-3-1.5-4.214 0 0 .144-2.143-.928-4.286 0 0-1 0-2.072 2.143-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5"/></svg>`,
      borderColor: '#ff8c42',
      glowColor: 'rgba(255, 140, 66, 0.5)',
      bgGradient: 'linear-gradient(135deg, rgba(255, 140, 66, 0.2) 0%, rgba(255, 140, 66, 0.05) 100%)',
    },
    perfect: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      borderColor: '#4ade80',
      glowColor: 'rgba(74, 222, 128, 0.5)',
      bgGradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0.05) 100%)',
    },
  };

  const config = $derived(typeConfig[type]);

  onMount(() => {
    // Animate in
    requestAnimationFrame(() => {
      visible = true;
    });

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
      setTimeout(() => onclose?.(), 350);
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  });
</script>

<div
  class="milestone-toast {visible ? 'visible' : ''}"
  style="
    --border-color: {config.borderColor};
    --glow-color: {config.glowColor};
    --bg-gradient: {config.bgGradient};
  "
  role="alert"
  aria-live="polite"
>
  <div class="toast-icon">
    {@html config.icon}
  </div>
  <span class="toast-message">{message}</span>
  <div class="toast-progress" style="width: {progress}%"></div>
</div>

<style>
  .milestone-toast {
    position: relative;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 280px;
    max-width: 400px;
    
    /* Dark glassmorphism background */
    background: var(--bg-gradient),
                rgba(30, 30, 35, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    
    /* Border styling */
    border: 1px solid var(--border-color);
    border-left: 4px solid var(--border-color);
    border-radius: 8px;
    
    /* Typography */
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 500;
    color: #f5f5f5;
    
    /* Animation & positioning */
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    /* Shadow effects */
    box-shadow: 
      0 4px 24px rgba(0, 0, 0, 0.4),
      0 0 20px var(--glow-color),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    z-index: 1000;
    overflow: hidden;
  }

  .milestone-toast.visible {
    transform: translateX(0);
    opacity: 1;
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--border-color);
    filter: drop-shadow(0 0 4px var(--glow-color));
  }

  .toast-message {
    flex: 1;
    line-height: 1.4;
  }

  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--border-color);
    opacity: 0.6;
    transition: width 0.016s linear;
  }

  /* Hover effect */
  .milestone-toast:hover {
    transform: translateX(0) scale(1.02);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 30px var(--glow-color),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
</style>
