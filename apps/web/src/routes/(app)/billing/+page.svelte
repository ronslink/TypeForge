<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();


  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  type PlanTier = 'free' | 'pro' | 'team';
  interface Subscription {
    status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
    plan: { name: string; tier: string };
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  }
  interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt?: string;
    pdfUrl?: string;
  }

  let subscription  = $state<Subscription | null>(null);
  let invoices      = $state<Invoice[]>([]);
  let isLoading     = $state(true);
  let isCheckingOut = $state(false);
  let isOpeningPortal = $state(false);
  let error         = $state<string | null>(null);
  let billingInterval = $state<'monthly' | 'annual'>('monthly');

  // -------------------------------------------------------------------------
  // Plans definition (mirrors backend INDIVIDUAL_PRICES)
  // -------------------------------------------------------------------------
  const plans = [
    {
      id: 'free' as PlanTier,
      name: 'Free',
      price: { monthly: '$0', annual: '$0' },
      period: '',
      features: [
        'All core keyboard layouts (7 total)',
        'Full lesson curriculum — beginner to advanced',
        'Cascade typing game',
        'Basic weekly progress stats',
      ],
      missingFeatures: [
        'Advanced performance analytics',
        'Certificate generation',
        'Priority language packs',
      ],
      cta: 'Current plan',
      ctaDisabled: true,
    },
    {
      id: 'pro' as PlanTier,
      name: 'Pro',
      price: { monthly: '$9', annual: '$79' },
      period: '/mo',
      popular: true,
      features: [
        'Everything in Free',
        'Full analytics — keystroke heat maps, WPM trends',
        'Printable certificates',
        'Priority access to all language packs',
        'Custom practice engines',
      ],
      cta: 'Upgrade to Pro',
    },
    {
      id: 'team' as PlanTier,
      name: 'Team',
      price: { monthly: '$29', annual: '$249' },
      period: '/mo',
      features: [
        'Everything in Pro',
        'Up to 50 seats',
        'Teacher / org dashboard',
        'Automated grading & progress reports',
        'Priority support with SLA',
      ],
      cta: 'Contact Sales',
      externalHref: 'mailto:sales@typeforge.com',
    },
  ];

  // -------------------------------------------------------------------------
  // API calls
  // -------------------------------------------------------------------------
  async function fetchBillingData() {
    if (!isSignedIn) { isLoading = false; return; }
    try {
      const api = createApiClient();
      const [subRes, invRes] = await Promise.all([
        api.get('/billing/subscription'),
        api.get('/billing/invoices'),
      ]);
      subscription = subRes.subscription ?? null;
      invoices     = invRes.invoices ?? [];
    } catch (err) {
      console.error('Failed to fetch billing data', err);
      // Non-fatal: user may be on free plan with no subscription record
    } finally {
      isLoading = false;
    }
  }

  async function handleUpgrade(planId: PlanTier) {
    if (planId === 'free') return;
    if (planId === 'team') {
      window.location.href = 'mailto:sales@typeforge.com';
      return;
    }
    isCheckingOut = true;
    error = null;
    try {
      const api = createApiClient();
      const { checkoutUrl } = await api.post('/billing/checkout', {
        interval: billingInterval,
        successUrl: `${window.location.origin}/billing?success=1`,
        cancelUrl:  `${window.location.origin}/billing?cancelled=1`,
      });
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (err: any) {
      error = err?.message ?? 'Failed to start checkout. Please try again.';
    } finally {
      isCheckingOut = false;
    }
  }

  async function handleManageBilling() {
    isOpeningPortal = true;
    error = null;
    try {
      const api = createApiClient();
      const { portalUrl } = await api.post('/billing/portal', {});
      if (portalUrl) window.location.href = portalUrl;
    } catch (err: any) {
      error = err?.message ?? 'Failed to open billing portal.';
    } finally {
      isOpeningPortal = false;
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  function formatAmount(cents: number, currency: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
  }

  function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
  }

  function currentPlanId(): PlanTier {
    if (!subscription || subscription.status === 'cancelled' || subscription.status === 'expired') return 'free';
    const tier = subscription.plan?.tier?.toLowerCase();
    if (tier === 'team') return 'team';
    if (tier === 'pro' || tier === 'individual') return 'pro';
    return 'free';
  }

  onMount(fetchBillingData);

  // Handle URL return params
  onMount(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('success')) {
      fetchBillingData();
      window.history.replaceState({}, '', '/billing');
    }
  });
</script>

<svelte:head>
  <title>Billing — TypeForge</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">

  <!-- Header -->
  <header class="mb-10">
    <h1 class="font-headline text-4xl mb-2">Billing</h1>
    <p class="text-on-surface-variant font-body">Manage your subscription and payment history.</p>
  </header>

  <!-- Error banner -->
  {#if error}
    <div class="bg-error/10 border border-error/30 text-error px-6 py-4 mb-8 font-body text-sm">
      {error}
    </div>
  {/if}

  <!-- Current Subscription Status -->
  {#if isSignedIn}
    <section class="mb-12" aria-labelledby="sub-status-heading">
      <h2 id="sub-status-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-4">
        Your Plan
      </h2>

      {#if isLoading}
        <div class="bg-surface-container-low p-8 animate-pulse h-28"></div>
      {:else}
        <div class="bg-surface-container-low p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="font-headline text-2xl">
                {subscription?.plan?.name ?? 'Free'}
              </span>
              {#if subscription?.status === 'active'}
                <span class="font-label text-xs uppercase tracking-widest px-2 py-0.5 bg-secondary/20 text-secondary">Active</span>
              {:else if subscription?.status === 'trialing'}
                <span class="font-label text-xs uppercase tracking-widest px-2 py-0.5 bg-primary/20 text-primary">Trial</span>
              {:else if subscription?.status === 'past_due'}
                <span class="font-label text-xs uppercase tracking-widest px-2 py-0.5 bg-error/20 text-error">Past Due</span>
              {:else}
                <span class="font-label text-xs uppercase tracking-widest px-2 py-0.5 bg-surface-container-highest text-on-surface-variant">Free</span>
              {/if}
            </div>
            {#if subscription?.currentPeriodEnd}
              <p class="text-on-surface-variant text-sm font-body">
                {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on {formatDate(subscription.currentPeriodEnd)}
              </p>
            {/if}
          </div>

          {#if subscription && subscription.status !== 'cancelled'}
            <button
              onclick={handleManageBilling}
              disabled={isOpeningPortal}
              class="notched-button bg-surface-container text-on-surface px-6 py-3 font-label text-sm font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              {isOpeningPortal ? 'Opening…' : 'Manage Billing →'}
            </button>
          {/if}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Billing Interval Toggle -->
  <div class="flex items-center gap-4 mb-8">
    <button
      onclick={() => (billingInterval = 'monthly')}
      class="font-label text-sm px-4 py-2 transition-colors {billingInterval === 'monthly'
        ? 'bg-primary text-on-primary'
        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
    >Monthly</button>
    <button
      onclick={() => (billingInterval = 'annual')}
      class="font-label text-sm px-4 py-2 transition-colors {billingInterval === 'annual'
        ? 'bg-primary text-on-primary'
        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
    >Annual <span class="text-secondary font-bold ml-1">−27%</span></button>
  </div>

  <!-- Plans Grid -->
  <section class="mb-16" aria-labelledby="plans-heading">
    <h2 id="plans-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-6">
      Available Plans
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each plans as plan}
        {@const isCurrentPlan = isSignedIn && currentPlanId() === plan.id}
        <div class="plan-card {plan.popular ? 'plan-card--featured' : ''} {isCurrentPlan ? 'plan-card--current' : ''}">

          {#if plan.popular}
            <div class="font-label text-[10px] uppercase tracking-widest text-on-primary bg-primary px-3 py-1 mb-4 self-start">
              Most Popular
            </div>
          {/if}

          <h3 class="font-headline text-2xl mb-1">{plan.name}</h3>
          <div class="font-label text-4xl mb-1 {plan.popular ? 'text-primary' : 'text-on-surface'}">
            {plan.price[billingInterval]}<span class="text-sm text-on-surface-variant">{plan.period}
              {#if billingInterval === 'annual' && plan.id !== 'free'}/yr{/if}
            </span>
          </div>
          {#if billingInterval === 'annual' && plan.id !== 'free'}
            <p class="text-xs text-secondary font-label mb-4">Billed annually</p>
          {:else}
            <div class="mb-4"></div>
          {/if}

          <ul class="space-y-2 mb-6 flex-1">
            {#each plan.features as feat}
              <li class="flex gap-2 text-sm font-body text-on-surface">
                <span class="text-secondary mt-0.5 shrink-0">✓</span>{feat}
              </li>
            {/each}
            {#each (plan.missingFeatures ?? []) as feat}
              <li class="flex gap-2 text-sm font-body text-on-surface-variant line-through">
                <span class="mt-0.5 shrink-0">✗</span>{feat}
              </li>
            {/each}
          </ul>

          {#if plan.externalHref}
            <a
              href={plan.externalHref}
              class="notched-button bg-surface-container text-on-surface w-full py-3 font-label text-sm font-bold text-center block hover:bg-surface-container-high transition-colors"
            >
              {plan.cta}
            </a>
          {:else if isCurrentPlan}
            <div class="font-label text-sm text-on-surface-variant text-center py-3 border border-outline-variant">
              Current Plan
            </div>
          {:else if plan.ctaDisabled}
            <a
              href="/sign-up"
              class="notched-button bg-surface-container text-on-surface-variant w-full py-3 font-label text-sm text-center block"
            >
              {plan.cta}
            </a>
          {:else}
            <button
              onclick={() => handleUpgrade(plan.id)}
              disabled={isCheckingOut}
              class="notched-button bg-primary text-on-primary w-full py-3 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
            >
              {isCheckingOut ? 'Redirecting…' : plan.cta}
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- Invoice History -->
  {#if isSignedIn && invoices.length > 0}
    <section aria-labelledby="invoices-heading">
      <h2 id="invoices-heading" class="font-headline text-xl uppercase tracking-widest text-primary mb-6">
        Invoice History
      </h2>
      <div class="bg-surface-container-low">
        <table class="w-full text-sm font-body">
          <thead>
            <tr class="border-b border-outline-variant text-on-surface-variant">
              <th class="text-left px-6 py-3 font-label uppercase tracking-widest text-xs">Date</th>
              <th class="text-left px-6 py-3 font-label uppercase tracking-widest text-xs">Amount</th>
              <th class="text-left px-6 py-3 font-label uppercase tracking-widest text-xs">Status</th>
              <th class="text-right px-6 py-3 font-label uppercase tracking-widest text-xs">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {#each invoices as inv}
              <tr class="border-b border-outline-variant/30 hover:bg-surface-container transition-colors">
                <td class="px-6 py-4 text-on-surface">{formatDate(inv.paidAt)}</td>
                <td class="px-6 py-4 text-on-surface font-label">{formatAmount(inv.amount, inv.currency)}</td>
                <td class="px-6 py-4">
                  <span class="font-label text-xs uppercase tracking-widest px-2 py-0.5
                    {inv.status === 'paid' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}">
                    {inv.status}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  {#if inv.pdfUrl}
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary hover:underline font-label text-xs"
                    >
                      PDF ↗
                    </a>
                  {:else}
                    <span class="text-on-surface-variant">—</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}

</div>

<style>
  .plan-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-container);
    padding: 2rem;
  }

  .plan-card--featured {
    background: var(--surface-container-high);
    outline: 1px solid var(--primary);
    outline-offset: -1px;
  }

  .plan-card--current {
    outline: 1px solid var(--secondary);
    outline-offset: -1px;
  }
</style>
