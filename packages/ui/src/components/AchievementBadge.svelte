<script lang="ts">
  interface Props {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: Date;
  }

  let {
    id,
    name,
    description,
    icon,
    unlocked,
    unlockedAt,
  }: Props = $props();

  let isHovered = $state(false);

  // Format date for display
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
</script>

<div
  class="achievement-badge {unlocked ? 'unlocked' : 'locked'}"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  role="img"
  aria-label="{unlocked ? 'Unlocked' : 'Locked'} achievement: {name}"
>
  <div class="badge-icon-container">
    <div class="badge-icon">
      {#if unlocked}
        {@html icon}
      {:else}
        <!-- Lock icon for locked state -->
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      {/if}
    </div>
    {#if unlocked}
      <div class="badge-glow"></div>
    {/if}
  </div>

  <div class="badge-info">
    <div class="badge-name">{name}</div>
    <div class="badge-description">{description}</div>
    {#if unlocked && unlockedAt}
      <div class="badge-date">Unlocked {formatDate(unlockedAt)}</div>
    {/if}
  </div>

  <!-- Hover detail overlay -->
  <div class="badge-detail {isHovered ? 'visible' : ''}">
    <div class="detail-content">
      <div class="detail-name">{name}</div>
      <div class="detail-description">{description}</div>
      {#if unlocked && unlockedAt}
        <div class="detail-date">Achieved on {formatDate(unlockedAt)}</div>
      {:else}
        <div class="detail-locked">Complete the requirements to unlock</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .achievement-badge {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(30, 30, 35, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: visible;
  }

  .achievement-badge:hover {
    transform: translateY(-2px);
  }

  /* Locked state */
  .achievement-badge.locked {
    opacity: 0.6;
    background: rgba(20, 20, 25, 0.9);
  }

  .achievement-badge.locked .badge-icon {
    color: #6b7280;
    background: rgba(107, 114, 128, 0.15);
  }

  /* Unlocked state */
  .achievement-badge.unlocked {
    background: linear-gradient(
      135deg,
      rgba(255, 197, 108, 0.08) 0%,
      rgba(65, 228, 192, 0.05) 100%
    ),
    rgba(30, 30, 35, 0.95);
    border-color: rgba(255, 197, 108, 0.3);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(255, 197, 108, 0.1);
  }

  .achievement-badge.unlocked:hover {
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(255, 197, 108, 0.2);
    border-color: rgba(255, 197, 108, 0.5);
  }

  .badge-icon-container {
    position: relative;
    flex-shrink: 0;
  }

  .badge-icon {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .achievement-badge.unlocked .badge-icon {
    color: #ffc56c;
    background: linear-gradient(
      135deg,
      rgba(255, 197, 108, 0.2) 0%,
      rgba(65, 228, 192, 0.15) 100%
    );
    box-shadow: 
      0 4px 15px rgba(255, 197, 108, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .badge-icon :global(svg) {
    width: 28px;
    height: 28px;
  }

  /* Glow effect for unlocked badges */
  .badge-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(
      circle,
      rgba(255, 197, 108, 0.4) 0%,
      rgba(65, 228, 192, 0.2) 40%,
      transparent 70%
    );
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .achievement-badge.unlocked:hover .badge-glow {
    opacity: 1;
  }

  .badge-info {
    flex: 1;
    min-width: 0;
  }

  .badge-name {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #f5f5f5;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .achievement-badge.locked .badge-name {
    color: #9ca3af;
  }

  .badge-description {
    font-size: 0.8125rem;
    color: #a1a1aa;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .achievement-badge.locked .badge-description {
    color: #6b7280;
  }

  .badge-date {
    font-size: 0.75rem;
    color: #41e4c0;
    margin-top: 0.375rem;
    font-weight: 500;
  }

  /* Hover detail overlay */
  .badge-detail {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    padding: 1rem;
    background: rgba(25, 25, 30, 0.98);
    border: 1px solid rgba(255, 197, 108, 0.2);
    border-radius: 10px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.25s ease;
    z-index: 100;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 197, 108, 0.1);
  }

  .badge-detail.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-name {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #ffc56c;
  }

  .detail-description {
    font-size: 0.8125rem;
    color: #d4d4d8;
    line-height: 1.5;
  }

  .detail-date {
    font-size: 0.75rem;
    color: #41e4c0;
    font-weight: 500;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .detail-locked {
    font-size: 0.75rem;
    color: #6b7280;
    font-style: italic;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Position detail above if near bottom */
  .achievement-badge:nth-last-child(-n+2) .badge-detail {
    top: auto;
    bottom: calc(100% + 8px);
    transform: translateY(10px);
  }

  .achievement-badge:nth-last-child(-n+2) .badge-detail.visible {
    transform: translateY(0);
  }
</style>
