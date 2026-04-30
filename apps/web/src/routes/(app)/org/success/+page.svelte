<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { t } from '$lib/stores/locale';

  const ctx = useClerkContext();
  let orgData = $state<any>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const orgId = page.url.searchParams.get('orgId');
      if (!orgId) { loading = false; return; }

      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      };
      const api = createApiClient('/', authFetch);

      const res = await api.api.v1.organisations[':id'].$get({ param: { id: orgId } });
      if (res.ok) {
        const data = await res.json() as any;
        orgData = data.organisation;
      }
    } catch (e) {
      console.error('Failed to load org data:', e);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Welcome — TypeForge for Schools</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16 text-center">
  {#if loading}
    <div class="animate-pulse text-on-surface-variant font-label text-sm uppercase tracking-widest">Loading...</div>
  {:else}
    <!-- Success Icon -->
    <div class="flex justify-center mb-8">
      <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
    </div>

    <h1 class="font-headline text-4xl mb-3">Welcome to TypeForge for Schools!</h1>
    <p class="text-on-surface-variant font-body text-lg mb-2">Your school account has been set up successfully.</p>

    {#if orgData}
      <div class="bg-surface-container-low border border-outline-variant/20 p-6 mt-8 mb-8 text-left space-y-3">
        <div class="flex justify-between">
          <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Organization</span>
          <span class="font-body text-sm text-on-surface font-bold">{orgData.name}</span>
        </div>
        {#if orgData.billing}
          <div class="flex justify-between">
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Seats Purchased</span>
            <span class="font-body text-sm text-on-surface">{orgData.billing.purchasedSeats ?? orgData.billing.pendingSeatCount ?? '—'}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Billing Cycle</span>
            <span class="font-body text-sm text-on-surface">{orgData.billing.seatCooldownDays === 90 ? '90-day (Flexible)' : '180-day (Semester)'}</span>
          </div>
        {/if}
        <div class="flex justify-between">
          <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Your Role</span>
          <span class="font-body text-sm text-primary font-bold uppercase">Admin</span>
        </div>
      </div>
    {/if}

    <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <a
        href="/org"
        class="notched-button bg-primary text-on-primary px-8 py-3 font-label font-bold text-sm hover:bg-primary-fixed-dim transition-colors"
      >
        Go to Dashboard →
      </a>
      <a
        href="/org"
        class="notched-button bg-surface-container-high text-on-surface px-8 py-3 font-label font-bold text-sm hover:bg-surface-container transition-colors"
      >
        Invite Students
      </a>
    </div>

    <p class="text-on-surface-variant/60 text-xs font-body mt-8">
      You can manage seats, invite students, and view analytics from your dashboard at any time.
    </p>
  {/if}
</div>
