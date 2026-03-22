<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface Props {
    level: number;
    visible: boolean;
  }

  let {
    level,
    visible,
  }: Props = $props();

  let showOverlay = $state(false);
  let animateLevel = $state(false);
  let audioContext: AudioContext | null = null;

  // Success sound using Web Audio API
  function playSuccessSound() {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Arpeggio: C - E - G - C
      const now = audioContext.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25];
      
      notes.forEach((freq, i) => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext!.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.35);
      });
    } catch (e) {
      // Audio API not available, silently fail
      console.log('Audio not available');
    }
  }

  function triggerLevelUp() {
    if (!visible) return;
    
    showOverlay = true;
    
    // Play sound
    playSuccessSound();
    
    // Trigger level number animation after overlay appears
    setTimeout(() => {
      animateLevel = true;
    }, 200);
    
    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      animateLevel = false;
      setTimeout(() => {
        showOverlay = false;
      }, 300);
    }, 2000);
  }

  $effect(() => {
    if (visible) {
      tick().then(() => {
        triggerLevelUp();
      });
    } else {
      showOverlay = false;
      animateLevel = false;
    }
  });

  onMount(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  });
</script>

{#if showOverlay}
  <div class="level-up-overlay" aria-live="polite" role="alert">
    <div class="level-up-content">
      <div class="level-up-label">LEVEL UP</div>
      <div class="level-number {animateLevel ? 'animate' : ''}">
        {level}
      </div>
      <div class="level-up-glow"></div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,700&display=swap');

  .level-up-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 15, 0.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  }

  .level-up-content {
    position: relative;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .level-up-label {
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 700;
    letter-spacing: 0.3em;
    color: #ffc56c;
    text-shadow: 
      0 0 20px rgba(255, 197, 108, 0.6),
      0 0 40px rgba(255, 197, 108, 0.3);
    animation: slideDown 0.5s ease-out;
  }

  .level-number {
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(6rem, 15vw, 12rem);
    font-weight: 700;
    line-height: 1;
    color: #ffffff;
    text-shadow: 
      0 0 30px rgba(255, 197, 108, 0.8),
      0 0 60px rgba(65, 228, 192, 0.4);
    transform: scale(0);
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .level-number.animate {
    transform: scale(1);
    opacity: 1;
  }

  .level-up-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(255, 197, 108, 0.3) 0%,
      rgba(65, 228, 192, 0.1) 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
  }

  /* Exit animation */
  .level-up-overlay:not(:has(.animate)) {
    animation: fadeOut 0.3s ease-in forwards;
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
</style>
