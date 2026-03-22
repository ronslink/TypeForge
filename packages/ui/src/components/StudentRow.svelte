<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import Badge from './Badge.svelte';

  type StudentStatus = 'active' | 'inactive' | 'struggling';

  interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    lastActive: Date;
    wpm: number;
    accuracy: number;
    streak: number;
    status: StudentStatus;
  }

  interface Props {
    student: Student;
    onClick?: (student: Student) => void;
  }

  let { student, onClick }: Props = $props();

  // Get initials from name
  const initials = $derived(
    student.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );

  // Format last active
  const lastActiveText = $derived(() => {
    const now = new Date();
    const diff = now.getTime() - new Date(student.lastActive).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(student.lastActive).toLocaleDateString();
  });

  // Status configuration
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active', pulse: false },
    inactive: { variant: 'default' as const, label: 'Inactive', pulse: false },
    struggling: { variant: 'error' as const, label: 'Struggling', pulse: true },
  };

  const status = $derived(statusConfig[student.status]);

  // Tooltip state
  let showTooltip = $state(false);
</script>

<div
  class="student-row"
  class:struggling={student.status === 'struggling'}
  onclick={() => onClick?.(student)}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(student); }}
  onmouseenter={() => showTooltip = true}
  onmouseleave={() => showTooltip = false}
  role="button"
  tabindex="0"
>
  <!-- Avatar -->
  <div class="student-avatar">
    {#if student.avatar}
      <img src={student.avatar} alt={student.name} />
    {:else}
      <span class="initials">{initials}</span>
    {/if}
  </div>

  <!-- Info -->
  <div class="student-info">
    <div class="student-name">{student.name}</div>
    <div class="student-meta">
      <span class="last-active">{lastActiveText()}</span>
      {#if student.streak > 0}
        <span class="streak">🔥 {student.streak}</span>
      {/if}
    </div>
  </div>

  <!-- Progress -->
  <div class="student-progress">
    <div class="progress-label">
      <span>Accuracy</span>
      <span>{student.accuracy}%</span>
    </div>
    <ProgressBar value={student.accuracy} max={100} variant="secondary" />
  </div>

  <!-- Status Badge -->
  <div class="student-status">
    <Badge variant={status.variant}>
      <span class:status-pulse={status.pulse}>{status.label}</span>
    </Badge>
  </div>

  <!-- Tooltip -->
  {#if showTooltip}
    <div class="student-tooltip">
      <div class="tooltip-header">
        <span class="tooltip-name">{student.name}</span>
        <span class="tooltip-email">{student.email}</span>
      </div>
      <div class="tooltip-stats">
        <div class="tooltip-stat">
          <span class="stat-label">WPM</span>
          <span class="stat-value">{student.wpm}</span>
        </div>
        <div class="tooltip-stat">
          <span class="stat-label">Accuracy</span>
          <span class="stat-value">{student.accuracy}%</span>
        </div>
        <div class="tooltip-stat">
          <span class="stat-label">Streak</span>
          <span class="stat-value">{student.streak} days</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .student-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .student-row:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(240, 165, 0, 0.2);
  }

  .student-row.struggling {
    border-left: 3px solid #ef4444;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0a500 0%, #00838f 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }

  .student-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .student-avatar .initials {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  .student-info {
    flex: 1;
    min-width: 0;
  }

  .student-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #f5f5f5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .student-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }

  .last-active {
    color: rgba(255, 255, 255, 0.4);
  }

  .streak {
    color: #ff8c42;
  }

  .student-progress {
    width: 120px;
    flex-shrink: 0;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.25rem;
  }

  .student-status {
    flex-shrink: 0;
  }

  .status-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* Tooltip */
  .student-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    padding: 1rem;
    background: rgba(30, 30, 35, 0.98);
    border: 1px solid rgba(240, 165, 0, 0.3);
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 100;
    min-width: 240px;
    animation: tooltipIn 0.2s ease;
  }

  @keyframes tooltipIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .tooltip-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tooltip-name {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #f5f5f5;
  }

  .tooltip-email {
    display: block;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.25rem;
  }

  .tooltip-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .tooltip-stat {
    text-align: center;
  }

  .tooltip-stat .stat-label {
    display: block;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.25rem;
  }

  .tooltip-stat .stat-value {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #41e4c0;
  }
</style>
