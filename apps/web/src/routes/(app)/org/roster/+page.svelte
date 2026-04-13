<script lang="ts">
  import { ClassRoster } from '@typeforge/ui';
</script>

<svelte:head>
  <title>Class Roster — TypeForge</title>
</svelte:head>

<div class="px-4">
  <ClassRoster 
    students={[
      { id: '1', name: 'Alice Smith', email: 'alice@example.com', lastActive: new Date(), wpm: 75, accuracy: 98, streak: 5, status: 'active' },
      { id: '2', name: 'Bob Jones', email: 'bob@example.com', lastActive: new Date(), wpm: 60, accuracy: 95, streak: 3, status: 'active' },
      { id: '3', name: 'Carol White', email: 'carol@example.com', lastActive: new Date(Date.now() - 864000000), wpm: 45, accuracy: 92, streak: 0, status: 'inactive' },
      { id: '4', name: 'David Brown', email: 'david@example.com', lastActive: new Date(), wpm: 20, accuracy: 80, streak: 1, status: 'struggling' }
    ]}
  />
</div>
