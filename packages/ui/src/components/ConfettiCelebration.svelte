<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    trigger: boolean;
    duration?: number;
    particleCount?: number;
    colors?: string[];
  }

  let {
    trigger,
    duration = 3000,
    particleCount = 100,
    colors = ['#F0A500', '#00838F', '#4CAF50', '#FF9800', '#E91E63'],
  }: Props = $props();

  interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocityX: number;
    velocityY: number;
    rotation: number;
    rotationSpeed: number;
  }

  let particles = $state<Particle[]>([]);
  let animationFrame: number;
  let reducedMotion = $state(false);

  // Check for reduced motion preference
  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches;
    
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  function createParticles() {
    // Skip animation if reduced motion is preferred
    if (reducedMotion) {
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: 50, // Start from center (percentage)
        y: 100, // Start from bottom
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocityX: (Math.random() - 0.5) * 20,
        velocityY: -Math.random() * 15 - 10,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    particles = newParticles;

    // Clear particles after duration
    setTimeout(() => {
      particles = [];
    }, duration);
  }

  $effect(() => {
    if (trigger) {
      createParticles();
    }
  });
</script>

<!-- 
  Accessibility Notes:
  - Respects prefers-reduced-motion: no animation if user prefers reduced motion
  - aria-hidden="true" because this is decorative only
  - role="img" with aria-label for screen readers to announce celebration
  - Static fallback: shows a simple success message when reduced motion is on
-->
{#if !reducedMotion}
  {#if particles.length > 0}
    <div 
      class="confetti-container" 
      aria-hidden="true"
      role="img"
      aria-label="Celebration animation"
    >
      {#each particles as particle (particle.id)}
        <div
          class="confetti-particle"
          style="
            left: {particle.x}%;
            top: {particle.y}%;
            width: {particle.size}px;
            height: {particle.size}px;
            background-color: {particle.color};
            transform: rotate({particle.rotation}deg);
            animation: confetti-fall {duration}ms ease-out forwards;
            animation-delay: {Math.random() * 200}ms;
          "
        />
      {/each}
    </div>
  {/if}
{:else}
  <!-- Reduced motion fallback: static success indicator -->
  {#if trigger}
    <div 
      class="reduced-motion-fallback" 
      role="status" 
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="success-icon">✓</span>
      <span class="sr-only">Success! Lesson completed.</span>
    </div>
  {/if}
{/if}

<style>
  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }

  .confetti-particle {
    position: absolute;
    transform-origin: center;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) rotate(720deg);
      opacity: 0;
    }
  }

  /* Reduced motion fallback styles */
  .reduced-motion-fallback {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--surface-container, #1d2025);
    border: 2px solid var(--primary, #ffc56c);
    border-radius: var(--radius-md, 0.25rem);
  }

  .success-icon {
    font-size: 3rem;
    color: var(--primary, #ffc56c);
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

  /* Reduced motion support - disable animations */
  @media (prefers-reduced-motion: reduce) {
    .confetti-container {
      display: none;
    }
    
    .confetti-particle {
      animation: none !important;
    }
  }

  /* Class-based reduced motion override */
  :global(.reduced-motion) .confetti-container {
    display: none;
  }
  
  :global(.reduced-motion) .confetti-particle {
    animation: none !important;
  }
</style>
