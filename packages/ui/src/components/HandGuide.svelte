<script lang="ts">
  let { activeFinger = '' } = $props();

  function isActive(finger: string) {
    if (!activeFinger) return false;
    return activeFinger.replace('_', '-') === finger;
  }
</script>

<div class="hands-container pointer-events-none">
  <div class="hand left-hand">
    <div class="finger left-pinky" class:active={isActive('left-pinky')}></div>
    <div class="finger left-ring" class:active={isActive('left-ring')}></div>
    <div class="finger left-middle" class:active={isActive('left-middle')}></div>
    <div class="finger left-index" class:active={isActive('left-index')}></div>
    <div class="thumb left-thumb" class:active={isActive('left-thumb')}></div>
    <div class="palm"></div>
  </div>
  
  <div class="hand right-hand">
    <div class="thumb right-thumb" class:active={isActive('right-thumb')}></div>
    <div class="finger right-index" class:active={isActive('right-index')}></div>
    <div class="finger right-middle" class:active={isActive('right-middle')}></div>
    <div class="finger right-ring" class:active={isActive('right-ring')}></div>
    <div class="finger right-pinky" class:active={isActive('right-pinky')}></div>
    <div class="palm"></div>
  </div>
</div>

<style>
  .hands-container {
    display: flex;
    justify-content: center;
    gap: 15rem;
    perspective: 800px;
  }
  
  .hand {
    position: relative;
    width: 140px;
    height: 180px;
    transform: rotateX(20deg);
  }

  .palm {
    position: absolute;
    bottom: 0;
    width: 140px;
    height: 75px;
    background: var(--surface-container-highest);
    border: 2px solid var(--outline-variant);
    border-radius: 20px 20px 40px 40px;
    z-index: 10;
  }

  .finger {
    position: absolute;
    bottom: 65px;
    width: 24px;
    background: var(--surface-container-highest);
    border: 2px solid var(--outline-variant);
    border-radius: 12px 12px 0 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: bottom center;
  }

  .thumb {
    position: absolute;
    bottom: 15px;
    width: 26px;
    height: 60px;
    background: var(--surface-container-highest);
    border: 2px solid var(--outline-variant);
    border-radius: 13px 13px 0 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 5;
  }

  /* Left Hand specific geometry */
  .left-pinky { height: 60px; left: 12px; }
  .left-ring { height: 80px; left: 42px; }
  .left-middle { height: 95px; left: 72px; }
  .left-index { height: 80px; left: 102px; }
  .left-thumb { 
    transform: rotate(50deg); 
    left: 125px; 
    transform-origin: bottom left;
  }

  /* Right Hand specific geometry */
  .right-index { height: 80px; left: 14px; }
  .right-middle { height: 95px; left: 44px; }
  .right-ring { height: 80px; left: 74px; }
  .right-pinky { height: 60px; left: 104px; }
  .right-thumb { 
    transform: rotate(-50deg); 
    left: -11px; 
    transform-origin: bottom right;
  }

  .active {
    background: var(--primary);
    border-color: var(--primary);
    box-shadow: 0 0 25px var(--primary);
    transform: scaleY(1.15) translateY(-5px);
    z-index: 20;
  }

  .left-thumb.active {
    transform: rotate(50deg) scale(1.15);
  }
  .right-thumb.active {
    transform: rotate(-50deg) scale(1.15);
  }
</style>
