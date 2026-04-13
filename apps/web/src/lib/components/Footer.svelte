<script lang="ts">
  // Footer links grouped by section
  const links = {
    Product: [
      { href: '/learn',         label: 'Learn'      },
      { href: '/practice',      label: 'Practice'   },
      { href: '/games/cascade', label: 'Cascade'    },
      { href: '/progress',      label: 'Progress'   },
    ],
    Company: [
      { href: '/#features',     label: 'Features'   },
      { href: '/#pricing',      label: 'Pricing'    },
      { href: '/billing',       label: 'Billing'    },
    ],
    Account: [
      { href: '/settings',      label: 'Settings'   },
      { href: '/sign-in',       label: 'Sign In'    },
      { href: '/sign-up',       label: 'Sign Up'    },
    ],
  } as const;

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-outline-variant/10 bg-surface-container-low/40 mt-auto">
  <div class="max-w-screen-2xl mx-auto px-8 py-16">

    <!-- Top row: brand + columns -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

      <!-- Brand -->
      <div class="col-span-2 md:col-span-1">
        <a
          href="/"
          class="text-xl font-black tracking-tighter text-primary uppercase font-label block mb-4"
          aria-label="TypeForge Home"
        >
          TYPEFORGE
        </a>
        <p class="text-on-surface-variant text-sm font-body leading-relaxed max-w-[220px]">
          Multilingual adaptive typing — from home row to fluency, in any script.
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
        © {year} TypeForge. All rights reserved.
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
