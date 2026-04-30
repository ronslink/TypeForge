<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { t } from '$lib/stores/locale';

  const freeFeatures = [
    'pricing_feature_free_1',
    'pricing_feature_free_2',
    'pricing_feature_free_3',
    'pricing_feature_free_4',
    'pricing_feature_free_5',
    'pricing_feature_free_6'
  ];

  const powerFeatures = [
    'pricing_feature_power_1',
    'pricing_feature_power_2',
    'pricing_feature_power_3',
    'pricing_feature_power_4',
    'pricing_feature_power_5',
    'pricing_feature_power_6',
    'pricing_feature_power_7'
  ];

  const schoolFeatures = [
    'pricing_feature_school_1',
    'pricing_feature_school_2',
    'pricing_feature_school_3',
    'pricing_feature_school_4',
    'pricing_feature_school_5',
    'pricing_feature_school_6',
    'pricing_feature_school_7'
  ];

  const faqs = [
    { q: 'pricing_faq_switch_q', a: 'pricing_faq_switch_a' },
    { q: 'pricing_faq_free_limits_q', a: 'pricing_faq_free_limits_a' },
    { q: 'pricing_faq_annual_q', a: 'pricing_faq_annual_a' },
    { q: 'pricing_faq_school_licensing_q', a: 'pricing_faq_school_licensing_a' }
  ];
</script>

<svelte:head>
  <title>{$t('pricing_page_title')}</title>
  <meta name="description" content={$t('pricing_meta_description')} />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">{$t('pricing_hero_title')}</h1>
        <p class="font-body text-xl text-on-surface-variant max-w-2xl mx-auto">
          {$t('pricing_hero_subtitle')}
        </p>
      </div>

      <!-- Pricing cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Free -->
        <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex flex-col">
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-on-surface-variant mb-2">{$t('pricing_plan_individual')}</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-5xl">$0</span>
              <span class="text-on-surface-variant font-body">{$t('pricing_perforever')}</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">{$t('pricing_no_credit_card')}</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each freeFeatures as key}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {$t(key)}
              </li>
            {/each}
          </ul>
          <a href="/sign-up" class="notched-button bg-surface-container-high text-on-surface px-6 py-3 font-label font-bold text-center block hover:bg-surface-container transition-colors">
            {$t('pricing_cta_free')}
          </a>
        </div>

        <!-- Power User -->
        <div class="bg-surface-container-high border-2 border-primary rounded-2xl p-8 flex flex-col relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="bg-primary text-on-primary font-label text-xs font-bold px-3 py-1 rounded-full">{$t('pricing_badge_popular')}</span>
          </div>
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-primary mb-2">{$t('pricing_plan_power_user')}</h2>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-5xl">$9</span>
              <span class="text-on-surface-variant font-body">{$t('pricing_permonth')}</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">{$t('pricing_power_unlock')}</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each powerFeatures as key}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {$t(key)}
              </li>
            {/each}
          </ul>
          <a href="/sign-up?plan=power" class="notched-button bg-primary text-on-primary px-6 py-3 font-label font-bold text-center block hover:bg-primary-fixed-dim transition-colors">
            {$t('pricing_cta_power')}
          </a>
        </div>

        <!-- Schools -->
        <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex flex-col">
          <div class="mb-6">
            <h2 class="font-label text-lg uppercase tracking-wider text-on-surface-variant mb-2">{$t('pricing_plan_schools')}</h2>
            <div class="flex items-baseline gap-1">
              <span class="font-headline text-5xl">$6</span>
              <span class="text-on-surface-variant font-body">{$t('pricing_perseatmo')}</span>
            </div>
            <p class="text-sm text-on-surface-variant mt-2 font-body">{$t('pricing_schools_subtitle')}</p>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            {#each schoolFeatures as key}
              <li class="flex items-start gap-3 font-body text-sm">
                <svg class="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                {$t(key)}
              </li>
            {/each}
          </ul>
          <div class="flex flex-col gap-3">
            <a href="/onboarding/school?plan=90" class="notched-button bg-surface-container-high text-on-surface px-6 py-3 font-label font-bold text-center block hover:bg-surface-container transition-colors">
              {$t('pricing_cta_school_90')}
            </a>
            <a href="/onboarding/school?plan=180" class="border border-outline-variant/30 text-on-surface px-6 py-3 font-label font-bold text-center block hover:bg-surface-container-high transition-colors">
              {$t('pricing_cta_school_180')}
            </a>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mt-24 max-w-3xl mx-auto">
        <h2 class="font-headline text-3xl text-center mb-12">{$t('pricing_faq_heading')}</h2>
        <div class="space-y-6">
          {#each faqs as item}
            <div class="border-b border-outline-variant/20 pb-6">
              <h3 class="font-label text-lg mb-2">{$t(item.q)}</h3>
              <p class="font-body text-on-surface-variant">{$t(item.a)}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>
  <Footer />
</div>