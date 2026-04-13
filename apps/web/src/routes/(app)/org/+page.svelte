<script lang="ts">
  import { OrgDashboard } from '@typeforge/ui';
</script>

<svelte:head>
  <title>Org Overview — TypeForge</title>
</svelte:head>

<!-- Stubbed data for initial presentation, to be wired to backend later -->
<OrgDashboard 
  orgName="Acme Academy"
  stats={{
    totalMembers: 42,
    activeMembers: 38,
    totalLessonsCompleted: 1543,
    averageAccuracy: 96.4,
    averageWpm: 54
  }}
  members={[
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', lessonsCompleted: 120, accuracy: 98, wpm: 75, lastActive: new Date() },
    { id: '2', name: 'Bob Jones', email: 'bob@example.com', lessonsCompleted: 85, accuracy: 95, wpm: 60, lastActive: new Date() },
    { id: '3', name: 'Carol White', email: 'carol@example.com', lessonsCompleted: 42, accuracy: 92, wpm: 45, lastActive: new Date(Date.now() - 86400000) }
  ]}
/>
