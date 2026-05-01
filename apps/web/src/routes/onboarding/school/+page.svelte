<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { useClerkContext, SignIn } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { t } from '$lib/stores/locale';

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  let user = $derived(ctx?.user);

  // Read plan from URL
  const planDays = $derived(page.url.searchParams.get('plan') === '180' ? 180 : 90);
  const pricePerSeat = $derived(planDays === 90 ? 6 : 8);

  // Wizard state
  let currentStep = $state(1);
  let schoolName = $state('');
  let countryCode = $state('');
  let website = $state('');
  let seatCount = $state(5);
  let isSubmitting = $state(false);
  let errorMsg = $state<string | null>(null);

  // Auto-advance past step 1 if already signed in
  $effect(() => {
    if (isSignedIn && currentStep === 1) {
      currentStep = 2;
    }
  });

  const monthlyCost = $derived(seatCount * pricePerSeat);

  async function handleCreateAndPay() {
    if (!schoolName.trim()) {
      errorMsg = $t('school_name_required');
      return;
    }
    if (seatCount < 5) {
      errorMsg = $t('school_min_seats');
      return;
    }

    isSubmitting = true;
    errorMsg = null;

    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      };
      const api = createApiClient('/', authFetch);

      const existingOrgsRes = await api.api.v1.organisations.$get();
      const existingOrgsBody = existingOrgsRes.ok ? await existingOrgsRes.json() as any : { organisations: [] };
      let orgId = existingOrgsBody.organisations?.[0]?.org?.id;

      if (!orgId) {
        const orgRes = await api.api.v1.organisations.$post({
          json: {
            name: schoolName.trim(),
            slug: schoolName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            orgType: 'school',
            countryCode: countryCode.trim().slice(0, 2).toUpperCase() || undefined,
            website: website || undefined,
          }
        });

        if (!orgRes.ok) {
          const body = await orgRes.json() as any;
          throw new Error(body?.error || 'Failed to create organization');
        }

        const { organisation } = await orgRes.json() as any;
        orgId = organisation.id;
      }

      // Step 2: Create Stripe checkout for seats
      const billingRes = await api.api.v1.organisations[':id'].billing.seats.$post({
        param: { id: orgId },
        json: {
          seatCount,
          cooldownDays: planDays,
          successUrl: `${window.location.origin}/org/success?orgId=${orgId}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/onboarding/school?plan=${planDays}`,
        }
      });

      if (!billingRes.ok) {
        const body = await billingRes.json() as any;
        throw new Error(body?.error || 'Failed to initialize payment');
      }

      const { checkoutUrl } = await billingRes.json() as any;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        // Fallback: go directly to dashboard
        goto(`/org/success?orgId=${orgId}`);
      }
    } catch (e: any) {
      errorMsg = e.message || 'Something went wrong. Please try again.';
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>School Setup — TypeForge</title>
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-xl">

      <!-- Progress indicator -->
      <div class="flex items-center justify-center gap-3 mb-10">
        {#each [1, 2, 3] as step}
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-label text-sm font-bold transition-all duration-300
              {currentStep >= step ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}">
              {#if currentStep > step}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}
                {step}
              {/if}
            </div>
            {#if step < 3}
              <div class="w-16 h-0.5 {currentStep > step ? 'bg-primary' : 'bg-surface-container-high'} transition-colors duration-300"></div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Step 1: Sign In -->
      {#if currentStep === 1}
        <div class="text-center mb-8">
          <h1 class="font-headline text-3xl mb-2">{$t('school_create_account')}</h1>
          <p class="text-on-surface-variant font-body">{$t('school_create_account_desc')}</p>
        </div>
        <div class="bg-surface-container-low border border-outline-variant/20 p-8 flex justify-center">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-none',
              }
            }}
          />
        </div>

      <!-- Step 2: School Details -->
      {:else if currentStep === 2}
        <div class="text-center mb-8">
          <h1 class="font-headline text-3xl mb-2">{$t('school_setup_title')}</h1>
          <p class="text-on-surface-variant font-body">{$t('school_setup_desc')}</p>
        </div>
        <div class="bg-surface-container-low border border-outline-variant/20 p-8 space-y-6">
          <div>
            <label for="school-name" class="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">{$t('school_name_label')} *</label>
            <input
              id="school-name"
              type="text"
              bind:value={schoolName}
              placeholder="e.g. Lincoln High School"
              class="w-full bg-surface-container px-4 py-3 text-sm font-body text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label for="country" class="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">{$t('school_country_label')}</label>
            <input
              id="country"
              type="text"
              bind:value={countryCode}
              placeholder="e.g. US, GB, DE"
              class="w-full bg-surface-container px-4 py-3 text-sm font-body text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label for="website" class="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">{$t('school_website_label')}</label>
            <input
              id="website"
              type="url"
              bind:value={website}
              placeholder="https://school.edu"
              class="w-full bg-surface-container px-4 py-3 text-sm font-body text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div class="flex justify-end pt-2">
            <button
              onclick={() => { if (schoolName.trim()) currentStep = 3; else errorMsg = 'Please enter your school name.'; }}
              class="notched-button bg-primary text-on-primary px-8 py-3 font-label font-bold text-sm hover:bg-primary-fixed-dim transition-colors"
            >
              {$t('school_continue')}
            </button>
          </div>

          {#if errorMsg}
            <p class="text-error text-sm font-body">{errorMsg}</p>
          {/if}
        </div>

      <!-- Step 3: Plan & Payment -->
      {:else if currentStep === 3}
        <div class="text-center mb-8">
          <h1 class="font-headline text-3xl mb-2">{$t('school_choose_seats')}</h1>
          <p class="text-on-surface-variant font-body">{planDays}-day plan · ${pricePerSeat}/seat/month</p>
        </div>
        <div class="bg-surface-container-low border border-outline-variant/20 p-8 space-y-6">
          <!-- Seat selector -->
          <div>
            <label for="seat-count" class="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">{$t('school_seat_count_label')}</label>
            <div class="flex items-center gap-4">
              <button
                onclick={() => { if (seatCount > 5) seatCount--; }}
                disabled={seatCount <= 5}
                class="w-10 h-10 rounded-full bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-30"
              >−</button>
              <input
                id="seat-count"
                type="number"
                min="5"
                max="500"
                bind:value={seatCount}
                class="w-24 text-center bg-surface-container px-4 py-3 text-2xl font-headline text-primary border border-outline-variant/30 focus:border-primary focus:outline-none"
              />
              <button
                onclick={() => seatCount++}
                class="w-10 h-10 rounded-full bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center hover:bg-surface-container transition-colors"
              >+</button>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              bind:value={seatCount}
              class="w-full mt-4 accent-primary"
            />
          </div>

          <!-- Cost breakdown -->
          <div class="bg-surface-container border border-outline-variant/20 p-6 space-y-3">
            <div class="flex justify-between font-body text-sm text-on-surface-variant">
              <span>{seatCount} seats × ${pricePerSeat}/mo</span>
              <span class="text-on-surface font-bold">${monthlyCost}/mo</span>
            </div>
            <div class="flex justify-between font-body text-sm text-on-surface-variant">
              <span>{planDays}-day billing cycle</span>
              <span class="text-on-surface">{planDays === 90 ? $t('school_plan_flexible') : $t('school_plan_semester')}</span>
            </div>
            <div class="border-t border-outline-variant/20 pt-3 flex justify-between">
              <span class="font-label text-sm uppercase tracking-widest text-on-surface-variant">{$t('school_total_label')}</span>
              <span class="font-headline text-2xl text-primary">${monthlyCost}<span class="text-sm text-on-surface-variant font-body">/mo</span></span>
            </div>
          </div>

          <!-- Plan summary -->
          <div class="bg-primary/5 border border-primary/20 p-4 text-sm font-body text-on-surface-variant space-y-1">
            <p>✓ <strong>{schoolName}</strong> — {seatCount} student seats</p>
            <p>{$t('school_summary_dashboard')}</p>
            <p>{$t('school_summary_roster')}</p>
            <p>{$t('school_summary_compliance')}</p>
            <p>{$t('school_summary_sso')}</p>
          </div>

          {#if errorMsg}
            <p class="text-error text-sm font-body">{errorMsg}</p>
          {/if}

          <div class="flex justify-between pt-2">
            <button
              onclick={() => { currentStep = 2; errorMsg = null; }}
              class="text-on-surface-variant hover:text-on-surface font-label text-sm transition-colors"
            >{$t('school_back')}</button>
            <button
              onclick={handleCreateAndPay}
              disabled={isSubmitting}
              class="notched-button bg-primary text-on-primary px-8 py-3 font-label font-bold text-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
            >
              {#if isSubmitting}
                <span class="inline-block w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                {$t('school_processing')}
              {:else}
                {$t('school_proceed_payment')}
              {/if}
            </button>
          </div>
        </div>
      {/if}

    </div>
  </main>
  <Footer />
</div>
