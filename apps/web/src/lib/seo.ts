export type JsonLdNode = Record<string, unknown>;

export interface SeoAlternate {
  hreflang: string;
  href: string;
}

export interface SitemapEntry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

export const SITE = {
  name: 'TypingScholar',
  url: 'https://typingscholar.com',
  defaultTitle: 'TypingScholar - Free Multilingual Typing Tutor',
  defaultDescription:
    'Learn touch typing with adaptive typing lessons, real-time WPM tracking, multilingual keyboard layouts, and classroom-ready progress tools.',
  language: 'en',
  locale: 'en_US',
  contactEmail: 'hello@typingscholar.com',
} as const;

export const SEO_PAGES = {
  home: {
    path: '/',
    title: 'Free Multilingual Typing Tutor',
    description:
      'Build typing speed and accuracy with adaptive lessons for QWERTY, AZERTY, QWERTZ, Arabic, Hebrew, Cyrillic, CJK, Korean, and Devanagari keyboards.',
  },
  learn: {
    path: '/learn',
    title: 'Typing Lessons for Every Keyboard Layout',
    description:
      'Follow structured typing lessons from home row basics to advanced speed drills, with adaptive practice across multiple languages and scripts.',
  },
  practice: {
    path: '/practice',
    title: 'Free Typing Practice',
    description:
      'Practice typing words, sentences, and literature passages in multiple languages while tracking WPM, accuracy, errors, and active typing time.',
  },
  cascade: {
    path: '/games/cascade',
    title: 'Typing Game - Raindrop Cascade',
    description:
      'Play a fast multilingual typing game that trains reflexes, accuracy, and keyboard confidence across supported language dictionaries.',
  },
  languages: {
    path: '/languages',
    title: 'Typing Practice by Language and Keyboard Layout',
    description:
      'Explore typing practice for 29 languages and scripts including English, Spanish, French, German, Arabic, Hebrew, Russian, Japanese, Korean, Chinese, Hindi, and more.',
  },
  pricing: {
    path: '/pricing',
    title: 'Pricing for Individuals and Schools',
    description:
      'Start TypingScholar for free, upgrade for adaptive practice tools, or bring multilingual typing instruction to your school with classroom dashboards.',
  },
  contact: {
    path: '/contact',
    title: 'Contact TypingScholar for Schools',
    description:
      'Talk with TypingScholar about school typing programs, institutional pricing, bulk licensing, SSO, classroom analytics, and custom deployments.',
  },
  typingGuide: {
    path: '/typing-guide',
    title: 'Complete Touch Typing Guide',
    description:
      'Learn touch typing fundamentals: home row position, finger-to-key mapping, wrist posture, accuracy practice, and script-specific typing tips.',
  },
  privacy: {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description:
      'Read how TypingScholar collects, protects, and uses account, typing performance, preference, and school account data.',
  },
  terms: {
    path: '/terms-of-service',
    title: 'Terms of Service',
    description:
      'Read the TypingScholar terms covering account eligibility, subscriptions, acceptable use, privacy, billing, and service responsibilities.',
  },
} as const;

export const PUBLIC_SITEMAP_ROUTES: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/learn', changefreq: 'weekly', priority: '0.9' },
  { path: '/practice', changefreq: 'weekly', priority: '0.9' },
  { path: '/games/cascade', changefreq: 'monthly', priority: '0.7' },
  { path: '/languages', changefreq: 'weekly', priority: '0.9' },
  { path: '/typing-guide', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
];

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('https://') || path.startsWith('http://')) return path;
  return new URL(path.startsWith('/') ? path : `/${path}`, SITE.url).toString();
}

export function formatSeoTitle(title?: string): string {
  if (!title) return SITE.defaultTitle;
  if (title.includes(SITE.name)) return title;
  return `${title} | ${SITE.name}`;
}

export function createOgImageUrl(
  title: string,
  subtitle: string = SITE.defaultDescription
): string {
  const url = new URL('/api/og', SITE.url);
  url.searchParams.set('title', title);
  url.searchParams.set('subtitle', subtitle);
  return url.toString();
}

export function jsonLdScript(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function organizationJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    email: SITE.contactEmail,
    logo: absoluteUrl('/favicon.png'),
  };
}

export function websiteJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function softwareApplicationJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: SITE.url,
    description: SITE.defaultDescription,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Power User',
        price: '9',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Schools',
        price: '6',
        priceCurrency: 'USD',
      },
    ],
  };
}

export function webPageJsonLd({
  title,
  description,
  path,
  type = 'WebPage',
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function courseJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: absoluteUrl(path),
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      sameAs: SITE.url,
    },
  };
}
