<script lang="ts">
  import { t } from '$lib/stores/locale';

  // Footer links grouped by section
  const links = $derived({
    [$t('footer_product') || 'Product']: [
      { href: '/learn',         label: $t('nav_learn') || 'Learn'      },
      { href: '/practice',      label: $t('nav_practice') || 'Practice'   },
      { href: '/games/cascade', label: $t('nav_play') || 'Games'    },
      { href: '/progress',      label: $t('nav_progress') || 'Progress'   },
      { href: '/languages',     label: $t('nav_languages') || 'Languages'  },
      { href: '/typing-guide',  label: $t('nav_typing_guide') || 'Typing Guide' },
    ],
    [$t('footer_company') || 'Company']: [
      { href: '/#features',     label: $t('company_features') || 'Features'   },
      { href: '/pricing',       label: $t('company_pricing') || 'Pricing'    },
      { href: '/billing',       label: $t('company_billing') || 'Billing'    },
      { href: '/contact',       label: $t('company_contact') || 'Contact'    },
    ],
    [$t('footer_account') || 'Account']: [
      { href: '/settings',      label: $t('nav_settings') || 'Settings'   },
      { href: '/sign-in',       label: $t('nav_sign_in') || 'Sign In'    },
      { href: '/sign-up',       label: $t('nav_sign_up') || 'Sign Up'    },
    ],
    [$t('footer_legal') || 'Legal']: [
      { href: '/privacy-policy',   label: $t('legal_privacy') || 'Privacy Policy'   },
      { href: '/terms-of-service', label: $t('legal_terms') || 'Terms of Service' },
    ],
  });

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-outline-variant/10 bg-surface-container-low/40 mt-auto">
  <div class="max-w-screen-2xl mx-auto px-8 py-16">

    <!-- Top row: brand + columns -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">

      <!-- Brand -->
      <div class="col-span-2 md:col-span-1">
        <a
          href="/"
          class="text-xl font-black tracking-tighter text-primary font-label block mb-4"
          aria-label="TypingScholar Home"
        >
          TypingScholar
        </a>
        <p class="text-on-surface-variant text-sm font-body leading-relaxed max-w-[220px]">
          {$t('footer_tagline') || 'Forge your keystrokes. Master your craft.'}
        </p>
      </div>

      <!-- Link columns -->
      {#each Object.entries(links) as [section, items]}
        <div>
          <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
            {section}
          </h3>
          <ul class="space-y-2.5">
            {#each items as item}
              <li>
                <a
                  href={item.href}
                  class="text-sm text-on-surface/60 hover:text-primary transition-colors font-body"
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <!-- Bottom row: copyright + scripts badge -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-outline-variant/10">
      <p class="text-xs text-on-surface-variant font-body">
        {$t('footer_copyright', { year }) || '© ' + year + ' TypingScholar. All rights reserved.'}
      </p>
      <div class="flex gap-2 flex-wrap">
        {#each ['Latin', 'Arabic', 'Cyrillic', 'Hebrew', 'CJK', 'Devanagari', 'Thai', 'Korean'] as script}
          <span class="font-label text-[10px] uppercase tracking-widest px-2 py-0.5 bg-surface-container text-on-surface-variant">
            {script}
          </span>
        {/each}
      </div>
    </div>

  </div>
</footer>
