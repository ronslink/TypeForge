<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/locale';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

  // Script diversity grid data
  const scripts = [
    { name: 'Latin', sample: 'Aa', layout: 'QWERTY', active: true },
    { name: 'Cyrillic', sample: 'Аа', layout: 'ЙЦУКЕН', active: false },
    { name: 'Arabic', sample: 'أب', layout: 'Arabic', active: false },
    { name: 'CJK', sample: '中文', layout: 'Pinyin', active: false },
    { name: 'Greek', sample: 'Αα', layout: 'Greek', active: false },
    { name: 'Hebrew', sample: 'אב', layout: 'Hebrew', active: false },
    { name: 'Korean', sample: '한글', layout: 'Dubeolsik', active: false },
    { name: 'Japanese', sample: 'ひら', layout: 'Romaji', active: false },
  ];

  // Typing demo state
  let demoText = "L'apprentissage de la dactylographie sur un clavier AZERTY nécessite une précision mécanique.";
  let typedText = "L'apprentissage de la dactylo";
  let currentWpm = 124;
  let currentAccuracy = 98.2;
  let streak = 412;
  let selectedScript = 'Latin';

  // Demo texts per script
  const demoTexts: Record<string, string> = {
    Latin: "L'apprentissage de la dactylographie sur un clavier AZERTY nécessite une précision mécanique.",
    Cyrillic: "Учитель печатает на клавиатуре быстро и без ошибок с первого раза.",
    Arabic: "تعلم الكتابة على لوحة المفاتيح العربية يحتاج إلى التدريب المستمر",
    CJK: "中文打字需要掌握拼音输入法才能做到速度与准确性兼备",
    Greek: "Η εκμάθηση της μηχανογράφησης είναι δεξιότητα που απαιτεί εξάσκηση",
    Hebrew: "לימוד הקלדה בעברית דורש תרגול מתמשך והקפדה על דיוק",
    Korean: "한글 타자 연습은 정확도와 속도를 동시에 향상시키는 과정입니다",
    Japanese: "日本語のタイピングはローマ字入力とかな入力を選ぶことができます"
  };

  function selectScript(script: { name: string; sample: string; layout: string; active: boolean }) {
    // Toggle active state
    scripts.forEach(s => s.active = s.name === script.name);
    selectedScript = script.name;
    // Reset demo to show new text (starting from a partial)
    const newText = demoTexts[script.name] || demoText;
    const sliceLen = Math.floor(newText.length * 0.35);
    typedText = newText.slice(0, sliceLen);
    demoText = newText;
  }

  // Features data
  const features = [
    {
      icon: 'psychology',
      title: 'AI Weakness Detection',
      description: 'Our neural engine identifies micro-stutters and recurring error patterns in your stroke sequence, generating custom drills to eliminate them.',
      span: 'large',
      hasChart: true
    },
    {
      icon: 'bolt',
      title: 'Zero Latency',
      description: 'Input processing optimized at the kernel level. Every stroke is rendered before your key returns to its neutral state.',
      span: 'small'
    },
    {
      icon: 'translate',
      title: 'Global Foundry',
      description: 'Full support for Latin, Arabic, Cyrillic, and CJK scripts with native layout emulation.',
      span: 'small'
    },
    {
      icon: 'school',
      title: 'School Grade Rigor',
      description: 'COPPA/GDPR compliant infrastructure with centralized teacher dashboards and automated grading curves.',
      span: 'large-institution',
      stats: [
        { value: '100%', label: 'Compliance' },
        { value: '500+', label: 'Schools' }
      ]
    }
  ];

  // Progression steps
  const steps = [
    { number: '01', title: 'Placement Test', description: 'Our 120-second kinetic analysis maps your current speed, posture, and error distribution.' },
    { number: '02', title: 'Weakness Model', description: 'Artificial intelligence generates a unique "heat map" of your physical typing limitations.' },
    { number: '03', title: 'Adaptive Lessons', description: 'Dynamic content that shifts difficulty in real-time based on your momentary accuracy.' },
    { number: '04', title: 'Compound Progress', description: 'Witness your evolution through high-density technical readouts and milestone certifications.' }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: 'Individual',
      price: 'Free',
      period: '',
      features: ['All Basic Layouts', 'Weekly Progress Stats'],
      cta: 'Select Plan',
      ctaHref: '/sign-up',
      popular: false
    },
    {
      name: 'Power User',
      price: '$9',
      period: '/mo',
      features: ['Full AI Weakness Modeling', 'Priority Multi-language Packs', 'Custom Practice Engines'],
      cta: 'Go Pro Now',
      ctaHref: '/billing?plan=pro',
      popular: true
    },
    {
      name: 'Schools',
      price: '$6',
      period: '/seat/mo',
      features: ['Teacher Dashboards', 'COPPA & GDPR Certification', 'SSO Integration'],
      cta: 'Contact Sales',
      ctaHref: '/contact',
      popular: false
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "TypeForge has transformed our digital literacy curriculum. The zero-latency feedback loop is addictive for students, driving engagement levels we've never seen with traditional software.",
      author: 'Julianne H.',
      role: 'Tech Coordinator, St. Jude Academy',
      initials: 'JH',
      featured: true
    },
    {
      quote: "The multi-language support allowed us to deploy the same platform across our international campuses in Tokyo and Paris seamlessly.",
      author: 'Global Education Partners',
      role: '',
      initials: 'GE',
      featured: false
    },
    {
      quote: "I went from 40wpm to 95wpm in three weeks. The AI weakness detection actually works—it stopped me from making the same 'S' and 'D' key mistakes.",
      author: 'Computer Science Student',
      role: '',
      initials: 'CS',
      featured: false
    }
  ];

  const footerLinks = {
    product: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Languages', href: '/languages' }
    ],
    resources: [
      { label: 'School Resources', href: '/languages' },
      { label: 'Typing Guide', href: '/typing-guide' },
      { label: 'Teacher Dashboard', href: '/learn' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Compliance', href: '/privacy-policy' }
    ]
  };

  let mounted = false;
  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>TypingScholar — Master typing in any language</title>
  <meta name="description" content="Adaptive AI. Every script. Every layout. The definitive typing platform for modern explorers." />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<!-- Navigation -->
<nav class="fixed inset-block-start-0 w-full z-50 glass-panel border-b border-outline-variant/10">
  <div class="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
    <div class="flex items-center gap-8">
      <span class="text-xl font-black tracking-tighter text-primary-container uppercase font-label">TYPINGSCHOLAR</span>
      <div class="hidden md:flex gap-6 items-center">
        <a href="#features" class="text-primary border-b-2 border-primary pb-1 font-body text-sm">{$t('mkt_features') || 'Features'}</a>
        <a href="#languages" class="text-on-surface/70 hover:text-on-surface transition-colors font-body text-sm">{$t('mkt_languages') || 'Languages'}</a>
        <a href="#pricing" class="text-on-surface/70 hover:text-on-surface transition-colors font-body text-sm">{$t('mkt_pricing') || 'Pricing'}</a>
        <div class="ml-4 pl-4 border-l border-outline-variant/30 hidden lg:block">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
      <a href="/sign-up" class="notched-button bg-primary-container text-on-primary-container px-6 py-2.5 font-label font-bold text-sm tracking-widest hover:bg-primary-fixed-dim transition-all active:scale-95 block">
        {$t('mkt_start_typing') || 'Start Typing'}
      </a>
  </div>
</nav>

<main class="pt-20">
  <!-- Hero Section -->
  <section class="relative min-h-[80vh] flex flex-col items-center justify-center px-6 overflow-hidden grid-texture" id="hero">
    <!-- Ambient glow orbs -->
    <div class="absolute inset-block-start-1/4 inset-inline-end-[-6rem] w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full"></div>
    <div class="absolute inset-block-end-1/4 inset-inline-start-[-6rem] w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full"></div>
    
    <div class="max-w-4xl text-center z-10">
      <!-- Script diversity grid -->
      <div class="flex flex-wrap justify-center gap-3 mb-10 max-w-2xl mx-auto">
        {#each scripts as script}
          <button 
            class="px-4 py-2 bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20 flex items-center gap-2"
            class:border-primary={script.active}
            class:text-primary={script.active}
            onclick={() => selectScript(script)}
          >
            <span class="font-label text-lg">{script.sample}</span>
            <span class="font-label text-xs uppercase tracking-wider text-on-surface-variant">{script.layout}</span>
          </button>
        {/each}
      </div>

      <h1 class="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight mb-6">
        {$t('mkt_hero_title_1') || 'Master typing in'} <span class="italic text-primary">{$t('mkt_hero_title_2') || 'any'}</span> {$t('mkt_hero_title_3') || 'language'}
      </h1>
      <p class="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        {$t('mkt_hero_subtitle') || 'Adaptive AI. Every script. Every layout.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="/sign-up" class="notched-button bg-primary-container text-on-primary-container px-10 py-4 font-label font-bold text-lg tracking-wider hover:amber-glow transition-all block">
          {$t('mkt_hero_cta') || 'Start free today'}
        </a>
        <a href="#pricing" class="font-label text-on-surface hover:text-primary transition-colors flex items-center gap-2 group">
          {$t('mkt_hero_secondary_cta') || 'Institutional Access'}
          <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Live Demo Section -->
  <section class="max-w-5xl mx-auto px-6 py-20" id="demo">
    <div class="bg-surface-container-high p-1 border-t border-s border-white/5 amber-glow">
      <div class="bg-surface-container-lowest p-8 md:p-12 relative overflow-hidden">
        <!-- Stats Header -->
        <div class="grid grid-cols-3 gap-4 mb-12 border-b border-outline-variant/20 pb-8">
          <div>
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">{$t('mkt_demo_wpm') || 'WPM Rate'}</span>
            <div class="font-label text-4xl text-secondary font-bold">{currentWpm}</div>
          </div>
          <div>
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">{$t('mkt_demo_accuracy') || 'Accuracy'}</span>
            <div class="font-label text-4xl text-secondary font-bold">{currentAccuracy}%</div>
          </div>
          <div>
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">{$t('mkt_demo_streak') || 'Streak'}</span>
            <div class="font-label text-4xl text-primary font-bold">{streak}</div>
          </div>
        </div>
        
        <!-- Typing Area -->
        <div class="font-label text-2xl md:text-3xl lg:text-4xl leading-relaxed tracking-tight text-on-surface/40 relative">
          <span class="text-on-surface">{typedText}</span>
          <span class="text-error relative">g</span>
          <span class="w-0.5 h-8 md:h-10 bg-primary absolute inline-block animate-pulse" style="bottom: 0.25rem;"></span>
          <span>{demoText.slice(typedText.length + 1)}</span>
        </div>
        
        <div class="mt-12 flex justify-between items-center text-xs font-label uppercase text-on-surface-variant/50">
          <span>{selectedScript} Layout — click script above to switch</span>
          <span>Sign up to start real lessons</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-24 px-6 md:px-8 max-w-screen-2xl mx-auto" id="features">
    <h2 class="font-headline text-4xl md:text-5xl mb-16 text-center md:text-start">Built different.</h2>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- AI Weakness Detection - Large -->
      <div class="md:col-span-8 bg-surface-container-low p-8 md:p-10 flex flex-col justify-between group hover:bg-surface-container transition-colors">
        <div>
          <span class="material-symbols-outlined text-primary text-4xl mb-6">psychology</span>
          <h3 class="font-headline text-2xl md:text-3xl mb-4">AI Weakness Detection</h3>
          <p class="font-body text-on-surface-variant max-w-md">Our neural engine identifies micro-stutters and recurring error patterns in your stroke sequence, generating custom drills to eliminate them.</p>
        </div>
        <div class="mt-12 flex items-end gap-4">
          <div class="h-24 w-1 bg-surface-container-highest"></div>
          <div class="h-16 w-1 bg-surface-container-highest"></div>
          <div class="h-32 w-1 bg-primary"></div>
          <div class="h-20 w-1 bg-surface-container-highest"></div>
          <span class="font-label text-xs text-primary ml-2">LATENCY PEAK DETECTED</span>
        </div>
      </div>

      <!-- Zero Latency - Small -->
      <div class="md:col-span-4 bg-surface-container-low p-8 md:p-10 group hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-secondary text-4xl mb-6">bolt</span>
        <h3 class="font-headline text-2xl md:text-3xl mb-4">Zero Latency</h3>
        <p class="font-body text-on-surface-variant">Input processing optimized at the kernel level. Every stroke is rendered before your key returns to its neutral state.</p>
      </div>

      <!-- Global Foundry - Small -->
      <div class="md:col-span-4 bg-surface-container-low p-8 md:p-10">
        <span class="material-symbols-outlined text-on-surface-variant text-4xl mb-6">translate</span>
        <h3 class="font-headline text-2xl mb-4">Global Foundry</h3>
        <p class="font-body text-on-surface-variant text-sm">Full support for Latin, Arabic, Cyrillic, and CJK scripts with native layout emulation.</p>
      </div>

      <!-- Institution - Large -->
      <div class="md:col-span-8 bg-surface-container-high p-8 md:p-10 flex flex-col md:flex-row gap-10 items-center">
        <div class="flex-1">
          <div class="flex items-center gap-2 text-primary mb-4">
            <span class="material-symbols-outlined">school</span>
            <span class="font-label text-xs uppercase tracking-widest">For Institutions</span>
          </div>
          <h3 class="font-headline text-2xl md:text-3xl mb-4">School Grade Rigor</h3>
          <p class="font-body text-on-surface-variant">COPPA/GDPR compliant infrastructure with centralized teacher dashboards and automated grading curves.</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-background p-4 flex flex-col">
            <span class="font-label text-secondary font-bold">100%</span>
            <span class="text-[10px] uppercase font-label text-on-surface-variant">Compliance</span>
          </div>
          <div class="bg-background p-4 flex flex-col">
            <span class="font-label text-secondary font-bold">500+</span>
            <span class="text-[10px] uppercase font-label text-on-surface-variant">Schools</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Languages Showcase Section -->
  <section class="py-24 px-6 md:px-8 max-w-screen-2xl mx-auto" id="languages">
    <div class="text-center mb-16">
      <h2 class="font-headline text-4xl md:text-5xl mb-4">Every language. Every script.</h2>
      <p class="font-body text-on-surface-variant max-w-xl mx-auto">29 languages across 6 regions, from Latin to Arabic to CJK. Type in your native script with adaptive AI guidance.</p>
    </div>

    <!-- Americas -->
    <div class="mb-10">
      <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span>🌎</span> Americas
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each [{code:'en',native:'English',text:'The quick brown fox jumps over the lazy dog.',rtl:false,flag:'us'},{code:'es',native:'Español',text:'El veloz murciélago hindú comía feliz cardillo y kiwi.',rtl:false,flag:'es'},{code:'pt',native:'Português',text:'À noite, vovô Kowalsky vê o ímã cair junto ao junco.',rtl:false,flag:'br'}] as lang}
          <div class="bg-surface-container-low p-4 flex items-start gap-4 group hover:bg-surface-container transition-colors" dir={lang.rtl ? 'rtl' : 'ltr'}>
            <img src="/flags/{lang.flag}.svg" class="w-8 h-6 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="{lang.native} flag" aria-hidden="true">
            <div>
              <div class="font-label text-sm text-primary mb-1">{lang.native}</div>
              <div class="font-label text-xs text-on-surface-variant/60 mb-2">{lang.code.toUpperCase()}</div>
              <div class="font-label text-xs text-on-surface-variant leading-relaxed">{lang.text}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Europe -->
    <div class="mb-10">
      <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span>🌍</span> Europe
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {#each [{n:'Deutsch',c:'de',s:'Falsches Üben von Xylophonmusik quält jeden größeren Zwerg.',f:'de'},{n:'Français',c:'fr',s:'Portez ce vieux whisky au juge blond qui fume.',f:'fr'},{n:'Italiano',c:'it',s:'Ma la volpe, con il suo balzo, raggiunse il quieto fiume.',f:'it'},{n:'Nederlands',c:'nl',s:"Pa's wijsje: fox lyophiliseert glad jodiumacetylide.",f:'nl'},{n:'Polski',c:'pl',s:'Pchnąć w tę łódź jeża lub ośm skrzyń fig.',f:'pl'},{n:'Ελληνικά',c:'el',s:'Το λαγός και η χελώνα έτρεξαν γρήγορα.',g:true,f:'gr'},{n:'Čeština',c:'cs',s:'Příliš žluťoučký kůň úpěl ďábelské kódy.',f:'cz'},{n:'Magyar',c:'hu',s:'Árvízi tölgyért bolygott sírkövet döngetett.',f:'hu'},{n:'Svenska',c:'sv',s:'Gädda prygelnäbba fyrskrift växer franskt.',f:'se'},{n:'Norsk',c:'no',s:'Kjevveisk mot tre, eg snur og vinker til hunden.',f:'no'},{n:'Dansk',c:'da',s:'Quizdeltagerne spiste jordbær med fløde mens cirkusklovnen.',f:'dk'},{n:'Suomi',c:'fi',s:'Fyrväskärjäyhtymän takaa löytyy vanha virolainen sauna.',f:'fi'}] as lang}
          <div class="bg-surface-container-low p-3 flex flex-col gap-2 group hover:bg-surface-container transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-label text-base flex items-center gap-2.5" class:text-primary={lang.g}><img src="/flags/{lang.f}.svg" class="w-5 h-[14px] rounded-[2px] shadow-[0_0_4px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="" aria-hidden="true"> {lang.n}</span>
              <span class="font-label text-[10px] text-on-surface-variant/40">{lang.c.toUpperCase()}</span>
            </div>
            <div class="font-label text-[10px] text-on-surface-variant leading-tight">{lang.s}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Middle East & Africa -->
    <div class="mb-10">
      <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span>🌏</span> Middle East & Africa
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each [{n:'العربية',c:'ar',s:'نص حكيم له سرعان تسري به',rtl:true,f:'sa'},{n:'עברית',c:'he',s:'איך בלשון הקודש, ספר צלחת פסיק',rtl:true,f:'il'}] as lang}
          <div class="bg-surface-container-low p-5 group hover:bg-surface-container transition-colors" dir={lang.rtl ? 'rtl' : 'ltr'}>
            <div class="flex items-center justify-between mb-3">
              <span class="font-label text-3xl text-primary flex items-center gap-3"><img src="/flags/{lang.f}.svg" class="w-8 h-6 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="" aria-hidden="true"> {lang.n}</span>
              <span class="font-label text-[10px] text-on-surface-variant/40">{lang.c.toUpperCase()}</span>
            </div>
            <div class="font-label text-sm text-on-surface-variant leading-relaxed" dir={lang.rtl ? 'rtl' : 'ltr'}>{lang.s}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- East Asia -->
    <div class="mb-10">
      <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span>🌏</span> East Asia
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {#each [{n:'日本語',c:'ja',s:'いろはにほへとちりぬるを わかよたれそつねならむ',f:'jp'},{n:'简体中文',c:'zh',s:'天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。',f:'cn'},{n:'한국어',c:'ko',s:'다람쥐 헌 쳇바퀴에 타고파.',f:'kr'}] as lang}
          <div class="bg-surface-container-low p-5 group hover:bg-surface-container transition-colors">
            <div class="flex items-center justify-between mb-3">
              <span class="font-label text-3xl text-primary flex items-center gap-3"><img src="/flags/{lang.f}.svg" class="w-8 h-6 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="" aria-hidden="true"> {lang.n}</span>
              <span class="font-label text-[10px] text-on-surface-variant/40">{lang.c.toUpperCase()}</span>
            </div>
            <div class="font-label text-xs text-on-surface-variant leading-relaxed">{lang.s}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- South & Southeast Asia + Central & Eastern Europe combined -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
          <span>🌏</span> South & Southeast Asia
        </h3>
        <div class="grid grid-cols-2 gap-3">
          {#each [{n:'हिन्दी',c:'hi',s:'क ख ग घ ङ च छ ज झ',f:'in'},{n:'ไทย',c:'th',s:'กีฬาวิ่งเร็วสุด',f:'th'},{n:'Tiếng Việt',c:'vi',s:'Con gà trốn đẹp trai bay qua vịnh.',f:'vn'},{n:'Indonesia',c:'id',s:'Muhammad fox bermimpi dengan wajar.',f:'id'},{n:'Bahasa Melayu',c:'ms',s:'Lebuh rayanya berliku-liku di antara.',f:'my'},{n:'Tagalog',c:'tl',s:'Ang magandang paruparo ay lumilipad sa hardin.',f:'ph'}] as lang}
            <div class="bg-surface-container-low p-3 group hover:bg-surface-container transition-colors">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label text-base text-primary flex items-center gap-2.5"><img src="/flags/{lang.f}.svg" class="w-5 h-[14px] rounded-[2px] shadow-[0_0_4px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="" aria-hidden="true"> {lang.n}</span>
                <span class="font-label text-[10px] text-on-surface-variant/40">{lang.c.toUpperCase()}</span>
              </div>
              <div class="font-label text-[10px] text-on-surface-variant leading-tight">{lang.s}</div>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <h3 class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
          <span>🌏</span> Central & Eastern Europe
        </h3>
        <div class="grid grid-cols-2 gap-3">
          {#each [{n:'Русский',c:'ru',s:'Эй, жлоб! Где туз? Прячь юных съёмных.',f:'ru'},{n:'Українська',c:'uk',s:'Ей, барсу! Блискавично ховай юних.',f:'ua'},{n:'Türkçe',c:'tr',s:'Vakif bank fırtınası, mahsur kaldıkları gemiyi yuttu.',f:'tr'}] as lang}
            <div class="bg-surface-container-low p-3 group hover:bg-surface-container transition-colors">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label text-base text-primary flex items-center gap-2.5"><img src="/flags/{lang.f}.svg" class="w-5 h-[14px] rounded-[2px] shadow-[0_0_4px_rgba(255,255,255,0.05)] object-cover bg-black/20" alt="" aria-hidden="true"> {lang.n}</span>
                <span class="font-label text-[10px] text-on-surface-variant/40">{lang.c.toUpperCase()}</span>
              </div>
              <div class="font-label text-[10px] text-on-surface-variant leading-tight">{lang.s}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="mt-12 text-center">
      <p class="font-label text-sm text-on-surface-variant/60">And more — 29 languages, 8 script families, 1 adaptive platform</p>
    </div>
  </section>

  <!-- Progression Steps Section -->
  <section class="py-24 bg-surface-container-lowest">
    <div class="max-w-screen-2xl mx-auto px-6 md:px-8">
      <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <h2 class="font-headline text-4xl md:text-5xl lg:text-6xl max-w-xl">From Placement to Mastery.</h2>
        <p class="font-body text-on-surface-variant max-w-xs pb-2">A structured evolution through the kinetic arts of typing.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20">
        {#each steps as step, i}
          <div class="bg-surface-container-lowest py-12 px-6 md:px-8 group" class:ps-0={i === 0} class:pe-0={i === 3}>
            <div class="font-label text-5xl text-on-surface-variant/20 mb-8 group-hover:text-primary transition-colors">{step.number}</div>
            <h4 class="font-headline text-xl md:text-2xl mb-4">{step.title}</h4>
            <p class="font-body text-on-surface-variant text-sm">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section class="py-24 px-6 md:px-8 max-w-screen-2xl mx-auto" id="pricing">
    <div class="text-center mb-16">
      <h2 class="font-headline text-4xl md:text-5xl mb-4">Forged for Everyone.</h2>
      <p class="font-body text-on-surface-variant">Scale your precision from solo typing to district-wide mastery.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each pricingPlans as plan}
        <div 
          class="p-8 md:p-10 flex flex-col justify-between"
          class:bg-surface-container-low={!plan.popular}
          class:bg-surface-container-highest={plan.popular}
          class:border-t-4={plan.popular}
          class:border-primary={plan.popular}
          class:shadow-2xl={plan.popular}
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <h4 class="font-label text-xs uppercase tracking-widest" class:text-primary={plan.popular} class:text-on-surface-variant={!plan.popular}>{plan.name}</h4>
              {#if plan.popular}
                <span class="bg-primary text-on-primary px-2 py-1 text-[10px] font-bold uppercase tracking-tighter">Most Popular</span>
              {/if}
            </div>
            <div class="font-headline text-4xl mb-6">{plan.price}<span class="text-lg text-on-surface-variant">{plan.period}</span></div>
            <ul class="space-y-4 mb-10">
              {#each plan.features as feature}
                <li class="flex items-center gap-3 text-sm" class:text-on-surface-variant={!plan.popular}>
                  <span class="material-symbols-outlined text-lg" class:text-primary={plan.popular} class:text-secondary={!plan.popular}>check</span>
                  {feature}
                </li>
              {/each}
            </ul>
          </div>
          {#if plan.popular}
            <a href={plan.ctaHref} class="notched-button w-full bg-primary text-on-primary py-4 font-label font-bold text-sm uppercase tracking-widest hover:amber-glow transition-all text-center block">
              {plan.cta}
            </a>
          {:else}
            <a href={plan.ctaHref} class="w-full border border-outline-variant/30 py-3 font-label text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors text-center block">
              {plan.cta}
            </a>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-24 px-6 md:px-8 max-w-screen-2xl mx-auto border-t border-outline-variant/10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
      <div>
        <span class="font-label text-xs uppercase tracking-widest text-primary mb-6 block">Testimonials</span>
        <h2 class="font-headline text-3xl md:text-4xl mb-8">What People Say</h2>
        <div class="bg-surface-container p-8 relative">
          <span class="material-symbols-outlined text-primary/20 text-6xl absolute inset-block-start-4 inset-inline-end-4">format_quote</span>
          <p class="font-body text-lg italic mb-6 leading-relaxed">"{testimonials[0].quote}"</p>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-container flex items-center justify-center font-label font-bold text-on-primary-container">{testimonials[0].initials}</div>
            <div>
              <div class="font-label text-sm font-bold">{testimonials[0].author}</div>
              <div class="font-label text-xs text-on-surface-variant">{testimonials[0].role}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        {#each testimonials.slice(1) as testimonial}
          <div class="bg-surface-container-low p-6">
            <p class="font-body text-sm mb-4">"{testimonial.quote}"</p>
            <div class="font-label text-xs font-bold text-secondary">{testimonial.author}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>
</main>

<!-- Footer -->
<footer class="bg-surface-container-lowest border-t border-outline-variant/10">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-8 py-12 max-w-screen-2xl mx-auto">
    <div>
      <span class="text-lg font-bold text-primary-container font-label">TYPINGSCHOLAR</span>
      <p class="mt-4 text-xs text-on-surface/50 leading-relaxed font-body">Engineered for accuracy. Built for the foundry. The definitive typing platform for modern explorers.</p>
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface mb-2">Product</span>
      {#each footerLinks.product as link}
        <a href={link.href} class="text-on-surface/50 hover:text-primary-container transition-colors text-sm font-body">{link.label}</a>
      {/each}
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface mb-2">Resources</span>
      {#each footerLinks.resources as link}
        <a href={link.href} class="text-on-surface/50 hover:text-primary-container transition-colors text-sm font-body">{link.label}</a>
      {/each}
    </div>
    <div class="flex flex-col gap-3">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface mb-2">Legal</span>
      {#each footerLinks.legal as link}
        <a href={link.href} class="text-on-surface/50 hover:text-primary-container transition-colors text-sm font-body">{link.label}</a>
      {/each}
    </div>
  </div>
  <div class="max-w-screen-2xl mx-auto px-6 md:px-8 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
    <span class="text-[10px] text-on-surface/30 font-label tracking-widest">© 2026 TYPINGSCHOLAR KINETIC FOUNDRY. ALL RIGHTS RESERVED.</span>
    <div class="flex gap-6">
      <span class="material-symbols-outlined text-on-surface/30 hover:text-primary transition-colors cursor-pointer">language</span>
      <span class="material-symbols-outlined text-on-surface/30 hover:text-primary transition-colors cursor-pointer">terminal</span>
    </div>
  </div>
</footer>

<style>
  /* Grid texture background */
  .grid-texture {
    background-image: radial-gradient(circle, rgba(240, 165, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* Glass panel effect */
  .glass-panel {
    backdrop-filter: blur(20px);
    background: rgba(29, 32, 37, 0.6);
  }

  /* Amber glow effect */
  .amber-glow {
    box-shadow: 0 0 15px rgba(240, 165, 0, 0.2);
  }

  /* Notched button shape */
  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }

  /* Font families */
  .font-headline {
    font-family: 'Newsreader', serif;
  }

  .font-body {
    font-family: 'Manrope', sans-serif;
  }

  .font-label {
    font-family: 'Space Grotesk', monospace;
  }

  /* Animation for pulse */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Material Symbols styling */
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
</style>
