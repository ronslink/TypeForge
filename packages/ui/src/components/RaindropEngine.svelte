<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    interface Props {
      words: string[];
      onGameOver: (score: number, accuracy: number) => void;
      class?: string;
    }
  
    let { 
      words = [],
      onGameOver,
      class: className = '' 
    }: Props = $props();
  
    // Canvas References
    let containerRef: HTMLDivElement;
    let canvasRef: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationFrameId: number;
    let isGameOver = false;
  
    // Game Mechanics Data
    let score = $state(0);
    let lives = $state(3);
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let globalSpeedMultiplier = 1;
    let spawnRateMs = 2000;
    let lastSpawnTime = 0;
  
    // Physics Structs
    interface Drop {
      id: number;
      word: string;
      typedCount: number;
      x: number;
      y: number;
      speed: number;
      isLocked: boolean;
      color: string;
    }
  
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }
  
    let drops: Drop[] = [];
    let particles: Particle[] = [];
    let dropIdCounter = 0;
    let activeLockIndex: number | null = null;
  
    // Theming Colors
    const COLORS = ['#ffc56c', '#41e4c0', '#ffb4ab', '#b9c3ff'];
  
    onMount(() => {
      ctx = canvasRef.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('keydown', handleKeyDown);
  
      // Start Game Loop
      lastSpawnTime = performance.now();
      animationFrameId = requestAnimationFrame(gameLoop);
    });
  
    onDestroy(() => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    });
  
    function resizeCanvas() {
      if (!canvasRef || !containerRef) return;
      canvasRef.width = containerRef.clientWidth;
      canvasRef.height = containerRef.clientHeight;
    }
  
    function spawnDrop(timestamp: number) {
      if (!ctx || words.length === 0) return;
      const word = words[Math.floor(Math.random() * words.length)];
      
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      const textWidth = ctx.measureText(word).width;
      
      const x = Math.max(20, Math.random() * (canvasRef.width - textWidth - 40));
      const speed = (0.5 + Math.random() * 0.5) * globalSpeedMultiplier;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
      drops.push({
        id: dropIdCounter++,
        word,
        typedCount: 0,
        x,
        y: -40,
        speed,
        isLocked: false,
        color
      });
    }
  
    function spawnExplosion(x: number, y: number, color: string) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1.0,
          maxLife: 1.0,
          color
        });
      }
    }
  
    function gameLoop(timestamp: number) {
      if (isGameOver) return;
  
      // Spawn Engine
      if (timestamp - lastSpawnTime > spawnRateMs) {
        spawnDrop(timestamp);
        lastSpawnTime = timestamp;
      }
  
      updatePhysics();
      render();
  
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  
    function updatePhysics() {
      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
      }
  
      // Update Drops
      let i = drops.length;
      while (i--) {
        const drop = drops[i];
        drop.y += drop.speed;
        
        // Floor Collision
        if (drop.y > canvasRef.height) {
          if (drop.isLocked) activeLockIndex = null;
          drops.splice(i, 1);
          lives--;
          
          if (lives <= 0) {
            handleGameOver();
            return;
          }
        }
      }
    }
  
    function render() {
      if (!ctx || !canvasRef) return;
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
  
      // Render Particles
      particles.forEach(p => {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
  
      // Render Drops
      drops.forEach(drop => {
        if (!ctx) return;
        ctx.font = 'bold 24px Inter, system-ui, sans-serif';
        const typedStr = drop.word.substring(0, drop.typedCount);
        const untypedStr = drop.word.substring(drop.typedCount);
  
        // Draw Typed
        ctx.fillStyle = '#ffffff';
        if (drop.isLocked) {
           ctx.shadowColor = '#ffffff';
           ctx.shadowBlur = 10;
        } else {
           ctx.shadowBlur = 0;
        }
        ctx.fillText(typedStr, drop.x, drop.y);
  
        // Draw Untyped
        const typedWidth = ctx.measureText(typedStr).width;
        ctx.fillStyle = drop.color;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = drop.isLocked ? 1.0 : 0.6;
        ctx.fillText(untypedStr, drop.x + typedWidth, drop.y);
        ctx.globalAlpha = 1.0;
        
        // Render Hitbox (Visual Debug or Effect)
        if (drop.isLocked) {
           ctx.beginPath();
           ctx.moveTo(drop.x - 5, drop.y + 5);
           ctx.lineTo(drop.x + ctx.measureText(drop.word).width + 5, drop.y + 5);
           ctx.strokeStyle = drop.color;
           ctx.stroke();
        }
      });
  
      // Render Lives
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ffb4ab';
      ctx.fillText(`LIVES: ${'❤'.repeat(lives)}`, 20, 30);
    }
  
    function handleKeyDown(e: KeyboardEvent) {
      if (isGameOver) return;
      // Ignore meta keys
      if (e.key.length > 1) return;
      e.preventDefault(); // Stop page scrolling on space
  
      const typedChar = e.key.toLowerCase();
      totalKeystrokes++;
  
      if (activeLockIndex !== null) {
        // Locked Mode (Strict Keystroke)
        const targetDrop = drops[activeLockIndex];
        // Defensive check if drop was deleted
        if (!targetDrop) {
          activeLockIndex = null;
          return;
        }
  
        const expectedChar = targetDrop.word[targetDrop.typedCount].toLowerCase();
        
        if (typedChar === expectedChar) {
          targetDrop.typedCount++;
          correctKeystrokes++;
          
          if (targetDrop.typedCount === targetDrop.word.length) {
            // Destroy Drop
            score += targetDrop.word.length * 10;
            spawnExplosion(targetDrop.x + (ctx?.measureText(targetDrop.word).width || 40) / 2, targetDrop.y, targetDrop.color);
            drops.splice(activeLockIndex, 1);
            activeLockIndex = null;
            
            // Level Up
            globalSpeedMultiplier += 0.05;
            spawnRateMs = Math.max(500, spawnRateMs - 50);
          }
        } else {
            // Strict mode penalty, do nothing but log error implicitly 
        }
      } else {
        // Search Phase (Look for new target)
        // Find highest drop that matches starting character
        let highestIndex = -1;
        let highestY = -999;
  
        for (let i = 0; i < drops.length; i++) {
          if (drops[i].word[0].toLowerCase() === typedChar && drops[i].y > highestY) {
            highestY = drops[i].y;
            highestIndex = i;
          }
        }
  
        if (highestIndex !== -1) {
          activeLockIndex = highestIndex;
          drops[highestIndex].isLocked = true;
          drops[highestIndex].typedCount = 1;
          correctKeystrokes++;
        }
      }
    }
  
    function handleGameOver() {
      isGameOver = true;
      const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;
      onGameOver(score, accuracy);
    }
  </script>
  
  <div bind:this={containerRef} class="relative w-full h-full min-h-[500px] bg-background border border-outline-variant/30 rounded-xl overflow-hidden {className}">
    <canvas 
      bind:this={canvasRef} 
      class="block w-full h-full cursor-none bg-surface-container-lowest"
    ></canvas>
    
    <div class="absolute top-4 right-6 text-2xl font-black font-headline text-primary tracking-widest drop-shadow-md">
      SCORE: {score}
    </div>
  </div>
  
  <style>
    /* Prevent text selection */
    canvas {
      user-select: none;
      -webkit-user-select: none;
    }
  </style>
