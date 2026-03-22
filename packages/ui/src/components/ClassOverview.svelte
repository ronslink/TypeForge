<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import Badge from './Badge.svelte';

  interface Props {
    className: string;
    studentCount: number;
    avgWpm: number;
    avgAccuracy: number;
    activeToday: number;
    onClick?: () => void;
  }

  let {
    className,
    studentCount,
    avgWpm,
    avgAccuracy,
    activeToday,
    onClick,
  }: Props = $props();

  // Health indicator based on accuracy
  const healthStatus = $derived(() => {
    if (avgAccuracy > 85) return { color: 'success', label: 'Excellent' };
    if (avgAccuracy >= 70) return { color: 'warning', label: 'Good' };
    return { color: 'error', label: 'Needs Attention' };
  });

  const activityRate = $derived(
    studentCount > 0 ? Math.round((activeToday / studentCount) * 100) : 0
  );

  const health = $derived(healthStatus());
</script>

<button
  class="class-overview"
  onclick={onClick}
  type="button"
>
  <div class="overview-header">
    <h3 class="class-name">{className}</h3>
    <Badge variant={health.color === 'success' ? 'success' : health.color === 'warning' ? 'default' : 'error'}>
      {health.label}
    </Badge>
  </div>

  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-value">{studentCount}</span>
      <span class="stat-label">Students</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{avgWpm}</span>
      <span class="stat-label">Avg WPM</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{avgAccuracy}%</span>
      <span class="stat-label">Accuracy</span>
    </div>
  </div>

  <div class="activity-section">
    <div class="activity-header">
      <span class="activity-label">Today's Activity</span>
      <span class="activity-value">{activeToday}/{studentCount}</span>
    </div>
    <ProgressBar value={activityRate} max={100} variant="primary" />
  </div>

  <div class="expand-hint">
    <span>Click to view full class</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  </div>
</button>

<style>
  .class-overview {
    width: 100%;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(240, 165, 0, 0.05) 0%, rgba(0, 131, 143, 0.02) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid #f0a500;
    border-radius: 4px;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .class-overview:hover {
    background: linear-gradient(135deg, rgba(240, 165, 0, 0.08) 0%, rgba(0, 131, 143, 0.04) 100%);
    border-color: rgba(240, 165, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .class-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f5f5f5;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #41e4c0;
  }

  .stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  .activity-section {
    margin-bottom: 1rem;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .activity-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  .activity-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    color: #f0a500;
  }

  .expand-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.2s ease;
  }

  .class-overview:hover .expand-hint {
    color: #f0a500;
  }

  .expand-hint svg {
    transition: transform 0.2s ease;
  }

  .class-overview:hover .expand-hint svg {
    transform: translateX(4px);
  }
</style>
