<script lang="ts">
  import StudentRow from './StudentRow.svelte';
  import Button from './Button.svelte';

  type StudentStatus = 'active' | 'inactive' | 'struggling';
  type SortBy = 'name' | 'wpm' | 'accuracy' | 'lastActive';
  type FilterBy = 'all' | 'active' | 'struggling';

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
    students: Student[];
    sortBy?: SortBy;
    filter?: FilterBy;
    onSendReminder?: () => void;
    onExportCSV?: () => void;
    onStudentClick?: (student: Student) => void;
  }

  let {
    students,
    sortBy = 'name',
    filter = 'all',
    onSendReminder,
    onExportCSV,
    onStudentClick,
  }: Props = $props();

  // Local state
  let searchQuery = $state('');
  let currentSort = $state<SortBy>(sortBy);
  let currentFilter = $state<FilterBy>(filter);
  let currentPage = $state(1);
  const itemsPerPage = 20;

  // Filter tabs
  const filterTabs: { value: FilterBy; label: string }[] = [
    { value: 'all', label: 'All Students' },
    { value: 'active', label: 'Active Today' },
    { value: 'struggling', label: 'Struggling' },
  ];

  // Sort options
  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'wpm', label: 'WPM' },
    { value: 'accuracy', label: 'Accuracy' },
    { value: 'lastActive', label: 'Last Active' },
  ];

  // Filtered and sorted students
  const filteredStudents = $derived(() => {
    let result = [...students];

    // Apply filter
    if (currentFilter === 'active') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(s => new Date(s.lastActive) >= today);
    } else if (currentFilter === 'struggling') {
      result = result.filter(s => s.status === 'struggling');
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      switch (currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'wpm':
          return b.wpm - a.wpm;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return 0;
      }
    });

    return result;
  });

  // Pagination
  const totalPages = $derived(Math.ceil(filteredStudents().length / itemsPerPage));
  const paginatedStudents = $derived(
    filteredStudents().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  );

  // Reset page when filter/search changes
  $effect(() => {
    currentPage = 1;
  });

  function handleSort(sort: SortBy) {
    currentSort = sort;
  }

  function handleFilter(filter: FilterBy) {
    currentFilter = filter;
  }

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function handleExportCSV() {
    const headers = ['Name', 'Email', 'WPM', 'Accuracy', 'Streak', 'Status', 'Last Active'];
    const rows = filteredStudents().map(s => [
      s.name,
      s.email,
      s.wpm.toString(),
      `${s.accuracy}%`,
      s.streak.toString(),
      s.status,
      new Date(s.lastActive).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-roster-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onExportCSV?.();
  }
</script>

<div class="class-roster">
  <!-- Header -->
  <header class="roster-header">
    <div class="header-title">
      <h2 class="roster-title">Class Roster</h2>
      <span class="student-count">{filteredStudents().length} students</span>
    </div>
    <div class="header-actions">
      <Button variant="secondary" size="sm" onclick={onSendReminder}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Send Reminder
      </Button>
      <Button variant="ghost" size="sm" onclick={handleExportCSV}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
        Export CSV
      </Button>
    </div>
  </header>

  <!-- Filter Tabs -->
  <div class="filter-tabs">
    {#each filterTabs as tab}
      <button
        class="filter-tab"
        class:active={currentFilter === tab.value}
        onclick={() => handleFilter(tab.value)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Search and Sort -->
  <div class="controls-bar">
    <div class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        type="text"
        placeholder="Search students..."
        bind:value={searchQuery}
      />
    </div>
    <div class="sort-control">
      <span>Sort by:</span>
      <select bind:value={currentSort} onchange={() => handleSort(currentSort)}>
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Student List -->
  <div class="students-list">
    {#if paginatedStudents.length > 0}
      {#each paginatedStudents as student (student.id)}
        <StudentRow {student} onClick={onStudentClick} />
      {/each}
    {:else}
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>No students found</p>
        <span>Try adjusting your filters or search query</span>
      </div>
    {/if}
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="pagination">
      <button
        class="page-btn"
        disabled={currentPage === 1}
        onclick={() => handlePageChange(currentPage - 1)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {#each Array(totalPages) as _, i}
        {@const page = i + 1}
        {#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
          <button
            class="page-btn"
            class:active={currentPage === page}
            onclick={() => handlePageChange(page)}
          >
            {page}
          </button>
        {:else if page === currentPage - 2 || page === currentPage + 2}
          <span class="page-ellipsis">...</span>
        {/if}
      {/each}

      <button
        class="page-btn"
        disabled={currentPage === totalPages}
        onclick={() => handlePageChange(currentPage + 1)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .class-roster {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .roster-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .roster-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f5f5f5;
    margin: 0;
  }

  .student-count {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;
  }

  .filter-tab {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-tab:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f5f5f5;
  }

  .filter-tab.active {
    background: rgba(240, 165, 0, 0.15);
    border-color: rgba(240, 165, 0, 0.4);
    color: #f0a500;
  }

  .controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    max-width: 300px;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .search-box svg {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: #f5f5f5;
    font-size: 0.875rem;
    outline: none;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .sort-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .sort-control select {
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #f5f5f5;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .students-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
  }

  .empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 0.5rem 0;
  }

  .empty-state span {
    font-size: 0.875rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
  }

  .page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
  }

  .page-btn.active {
    background: rgba(240, 165, 0, 0.2);
    border-color: rgba(240, 165, 0, 0.4);
    color: #f0a500;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-ellipsis {
    color: rgba(255, 255, 255, 0.4);
    padding: 0 0.5rem;
  }
</style>
