import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';

import SeoHead from './components/SeoHead.svelte';

describe('SeoHead', () => {
  it('emits valid JSON-LD without allowing the payload to close its script element', () => {
    const { head } = render(SeoHead, {
      props: {
        title: 'Test page',
        description: 'SEO regression test',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Thing',
          name: '</script><div>unsafe</div>',
        },
      },
    });

    expect(head).toContain('\\u003c/script>\\u003cdiv>unsafe\\u003c/div>');
    expect(head).toMatch(/<script type="application\/ld\+json">.*<\/script>/);
    expect(head).not.toContain('<\\/script>');
  });
});
