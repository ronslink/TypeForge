<script lang="ts">
  import { env as publicEnv } from '$env/dynamic/public';
  import {
    absoluteUrl,
    createOgImageUrl,
    formatSeoTitle,
    jsonLdScript,
    SITE,
    type JsonLdNode,
    type SeoAlternate,
  } from '$lib/seo';

  interface Props {
    title: string;
    description: string;
    path?: string;
    type?: 'website' | 'article' | 'profile';
    image?: string;
    noindex?: boolean;
    alternates?: SeoAlternate[];
    jsonLd?: JsonLdNode | JsonLdNode[];
  }

  let {
    title,
    description,
    path = '/',
    type = 'website',
    image,
    noindex = false,
    alternates = [],
    jsonLd = [],
  }: Props = $props();

  const fullTitle = $derived(formatSeoTitle(title));
  const canonicalUrl = $derived(absoluteUrl(path));
  const imageUrl = $derived(image ? absoluteUrl(image) : createOgImageUrl(title, description));
  const robots = $derived(noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
  const jsonLdItems = $derived(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []);
  const googleSiteVerification = $derived(publicEnv.PUBLIC_GOOGLE_SITE_VERIFICATION);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:site_name" content={SITE.name} />
  <meta property="og:locale" content={SITE.locale} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />

  {#if googleSiteVerification}
    <meta name="google-site-verification" content={googleSiteVerification} />
  {/if}

  {#each alternates as alternate}
    <link rel="alternate" hreflang={alternate.hreflang} href={absoluteUrl(alternate.href)} />
  {/each}

  {#each jsonLdItems as item}
    {@html `<script type="application/ld+json">${jsonLdScript(item)}<\\/script>`}
  {/each}
</svelte:head>
