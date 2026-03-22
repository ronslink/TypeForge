<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface Props {
    active: boolean;
    onComplete?: () => void;
  }

  let {
    active,
    onComplete,
  }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;
  let animationId: number | null = null;
  let particles: Particle[] = [];

  // Kinetic Foundry colors
  const COLORS = ['#ffc56c', '#41e4c0', '#ffffff'];
  const PARTICLE_COUNT = 200;
  const GRAVITY = 0.15;
  const AIR_RESISTANCE = 0.99;
  const FADE_RATE = 0.008;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    alpha: number;
    shape: 'circle' | 'square' | 'triangle';
  }

  function createParticle(centerX: number, centerY: number): Particle {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 12 + 4;
    const shapeRandom = Math.random();
    let shape: 'circle' | 'square' | 'triangle';
    if (shapeRandom < 0.5) shape = 'circle';
    else if (shapeRandom < 0.8) shape = 'square';
    else shape = 'triangle';

    return {
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
      shape,
    };
  }

  function drawParticle(p: Particle) {
    if (!ctx) return;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    switch (p.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(-p.size, p.size);
        ctx.lineTo(p.size, p.size);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  function updateParticle(p: Particle): boolean {
    // Apply physics
    p.vy += GRAVITY;
    p.vx *= AIR_RESISTANCE;
    p.vy *= AIR_RESISTANCE;
    
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.alpha -= FADE_RATE;

    // Bounce off bottom
    if (p.y > canvas!.height + p.size) {
      p.alpha = 0;
    }

    return p.alpha > 0;
  }

  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles = particles.filter(p => {
      const alive = updateParticle(p);
      if (alive) drawParticle(p);
      return alive;
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      cleanup();
      onComplete?.();
    }
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particles = [];
  }

  function triggerConfetti() {
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get context
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create particles from center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(centerX, centerY));
    }

    // Start animation
    if (animationId) cancelAnimationFrame(animationId);
    animate();
  }

  // Handle resize
  function handleResize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  $effect(() => {
    if (active && canvas) {
      tick().then(() => {
        triggerConfetti();
      });
    }
  });

  onMount(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  });
</script>

{#if active}
  <canvas
    bind:this={canvas}
    class="celebration-canvas"
    aria-hidden="true"
  ></canvas>
{/if}

<style>
  .celebration-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  }
</style>
