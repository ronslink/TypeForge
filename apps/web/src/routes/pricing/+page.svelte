<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const freeFeatures = [
    '15 languages (Latin, CJK starter, Cyrillic)',
    'Adaptive lessons with weakness detection',
    'Practice mode with WPM/accuracy tracking',
    'Cascade typing game',
    'Progress dashboard',
    'Basic statistics'
  ];

  const powerFeatures = [
    'All 17+ languages (full CJK, Arabic, Hebrew, Devanagari, Thai...)',
    'Priority processing & no rate limits',
    'Advanced analytics & session history',
    'Unlimited practice sessions',
    'All typing games & achievements',
    'Export progress reports (CSV)',
    'Priority support'
  ];

  const schoolFeatures = [
    'Everything in Power User',
    'Teacher dashboard with class analytics',
    'Student roster management',
    'Group assignments & progress tracking',
    'SCIM/Google Workspace SSO',
    'COPPA-compliant (under 13 support)',
    'Dedicated onboarding support'
  ];

  const faqs = [
    { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle.' },
    { q: 'What happens when I hit the free limits?', a: 'Nothing — you just continue with the free tier. We never lock your data or stop you from using what you have.' },
    { q: 'Is there a discount for annual billing?', a: 'Power User annual billing is available at $79/year (save ~27%). Contact us for school annual pricing.' },
    { q: 'How does school licensing work?', a: 'School seats are licensed per active student per month. You can add/remove seats at any time and billing adjusts automatically.' }
  ];
</script>

<svelte:head>
  <title>Pricing — TypingScholar</title>
  <meta name="description" content="Simple, transparent pricing for TypingScholar. Free forever, or unlock advanced features with Power User or School plans." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">Simple, transparent pricing</h1>
        <p class="font-body text-xl text-on-surface-variant max-w-2xl mx-auto">
          Start free. Upgrade when you're ready. No hidden fees, no contracts.
        </p>
      </div>

      <!-- Pricing cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Free -->
        <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex flex-col">
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-on-surface-variant mb-2">Individual</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-5xl">$0</span>
              <span class="text-on-surface-variant font-body">/forever</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">No credit card required</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each freeFeatures as feature}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {feature}
              </li>
            {/each}
          </ul>
          <a href="/sign-up" class="notched-button bg-surface-container-high text-on-surface px-6 py-3 font-label font-bold text-center block hover:bg-surface-container transition-colors">
            Get started free
          </a>
        </div>

        <!-- Power User -->
        <div class="bg-surface-container-high border-2 border-primary rounded-2xl p-8 flex flex-col relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="bg-primary text-on-primary font-label text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
          </div>
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-primary mb-2">Power User</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-5xl">$9</span>
              <span class="text-on-surface-variant font-body">/month</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">Unlock the full experience</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each powerFeatures as feature}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {feature}
              </li>
            {/each}
          </ul>
          <a href="/sign-up?plan=power" class="notched-button bg-primary text-on-primary px-6 py-3 font-label font-bold text-center block hover:bg-primary-fixed-dim transition-colors">
            Upgrade to Power User
          </a>
        </div>

        <!-- School -->
        <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex flex-col">
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-on-surface-variant mb-2">School</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-5xl">$6</span>
              <span class="text-on-surface-variant font-body">/seat/month</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">For classrooms & districts</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each schoolFeatures as feature}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {feature}
              </li>
            {/each}
          </ul>
          <a href="/contact" class="notched-button bg-surface-container-high text-on-surface px-6 py-3 font-label font-bold text-center block hover:bg-surface-container transition-colors">
            Contact sales
          </a>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-24 max-w-3xl mx-auto">
        <h2 class="font-headline text-3xl text-center mb-12">Frequently asked questions</h2>
        <div class="space-y-6">
          {#each faqs as item}
            <div class="border-b border-outline-variant/20 pb-6">
              <h3 class="font-label text-lg mb-2">{item.q}</h3>
              <p class="font-body text-on-surface-variant">{item.a}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>
  <Footer />
</div>