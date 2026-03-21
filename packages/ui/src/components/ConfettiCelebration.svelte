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

  function createParticles() {
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

  onMount(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
</script>

{#if particles.length > 0}
  <div class="confetti-container">
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
</style>
