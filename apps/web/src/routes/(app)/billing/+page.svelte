<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Billing — TypingScholar</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Billing</h1>

  <!-- Current Plan -->
  <div class="bg-surface-container-low p-8 mb-8">
    <h2 class="font-headline text-2xl mb-4">Current Plan</h2>
    <p class="text-on-surface-variant mb-4">Free Plan</p>
    <button class="bg-primary-container text-on-primary-container px-6 py-3 font-label font-bold">
      Upgrade to Pro
    </button>
  </div>

  <!-- Plans -->
  <h2 class="font-headline text-2xl mb-6">Available Plans</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-surface-container p-6">
      <h3 class="font-headline text-xl mb-2">Free</h3>
      <div class="font-label text-3xl text-secondary mb-4">$0<span class="text-sm">/mo</span></div>
      <ul class="text-on-surface-variant text-sm space-y-2">
        <li>✓ Basic lessons</li>
        <li>✓ Progress tracking</li>
        <li>✗ Advanced analytics</li>
      </ul>
    </div>
    
    <div class="bg-surface-container-high p-6 border border-primary">
      <h3 class="font-headline text-xl mb-2">Pro</h3>
      <div class="font-label text-3xl text-primary mb-4">$9<span class="text-sm">/mo</span></div>
      <ul class="text-on-surface-variant text-sm space-y-2">
        <li>✓ All lessons</li>
        <li>✓ Advanced analytics</li>
        <li>✓ Custom practice</li>
      </ul>
    </div>
    
    <div class="bg-surface-container p-6">
      <h3 class="font-headline text-xl mb-2">Team</h3>
      <div class="font-label text-3xl text-secondary mb-4">$29<span class="text-sm">/mo</span></div>
      <ul class="text-on-surface-variant text-sm space-y-2">
        <li>✓ Everything in Pro</li>
        <li>✓ Team management</li>
        <li>✓ Priority support</li>
      </ul>
    </div>
  </div>
</div>
