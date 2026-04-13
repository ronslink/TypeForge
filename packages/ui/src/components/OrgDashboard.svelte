<script lang="ts">
  import type { Snippet } from 'svelte';
  import StatCard from './StatCard.svelte';
  import ProgressBar from './ProgressBar.svelte';

  interface OrgStats {
    totalMembers: number;
    activeMembers: number;
    totalLessonsCompleted: number;
    averageAccuracy: number;
  }

  interface Member {
    id: string;
    name: string;
    email: string;
    lessonsCompleted: number;
    accuracy: number;
    wpm: number;
    lastActive: Date | string | null;
  }

  interface Props {
    orgName: string;
    stats: OrgStats;
    members?: Member[];
    children?: Snippet;
  }

  let { orgName, stats, members = [], children }: Props = $props();

  const memberActivityRate = $derived(
    stats.totalMembers > 0
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0
  );
</script>

<div class="org-dashboard">
  <header class="dashboard-header mb-8">
    <h1 class="font-display text-3xl font-bold text-on-surface">
      {orgName}
    </h1>
    <p class="text-on-surface-variant mt-2">Organization Dashboard</p>
  </header>

  <section class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <StatCard label="Total Members" value={stats.totalMembers} variant="default" />
    <StatCard label="Active Members" value={stats.activeMembers} variant="primary" />
    <StatCard label="Lessons Completed" value={stats.totalLessonsCompleted} variant="secondary" />
    <StatCard label="Avg. Accuracy" value={stats.averageAccuracy} unit="%" variant="primary" />
  </section>

  <section class="activity-section bg-surface-container-low p-6 mb-8">
    <h2 class="font-label text-lg font-bold text-on-surface mb-4">
      Member Activity
    </h2>
    <div class="flex items-center gap-4 mb-4">
      <ProgressBar value={memberActivityRate} max={100} variant="primary" />
      <span class="font-label text-sm text-on-surface-variant">
        {memberActivityRate}% active
      </span>
    </div>
    <div class="flex gap-8 text-sm">
      <div>
        <span class="text-on-surface-variant">Avg. Accuracy:</span>
        <span class="font-bold text-secondary ml-2">{stats.averageAccuracy}%</span>
      </div>
    </div>
  </section>

  {#if members.length > 0}
    <section class="members-section">
      <h2 class="font-label text-lg font-bold text-on-surface mb-4">
        Top Performers
      </h2>
      <div class="members-list">
        {#each members.slice(0, 5) as member}
          <div class="member-row flex items-center justify-between py-3 border-b border-outline-variant/20">
            <div>
              <span class="font-label text-on-surface">{member.name}</span>
              <span class="text-xs text-on-surface-variant ml-2">{member.email}</span>
            </div>
            <div class="flex gap-6 text-sm">
              <span class="text-primary font-bold">{member.wpm} WPM</span>
              <span class="text-secondary font-bold">{member.accuracy}%</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if children}
    <div class="dashboard-children mt-8">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .org-dashboard {
    padding: 2rem;
  }

  .dashboard-header {
    border-left: 3px solid #f0a500;
    padding-left: 1rem;
  }

  .activity-section {
    border-left: 3px solid #00838f;
  }

  .member-row:hover {
    background: rgba(255, 255, 255, 0.02);
  }
</style>
