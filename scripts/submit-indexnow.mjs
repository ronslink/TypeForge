const SITE_ORIGIN = 'https://www.typingscholar.com';
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY = 'c8c8e37c66cf4c94bb365a63bbf0d1a1';
const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

function parseArguments(argv) {
  const dryRun = argv.includes('--dry-run');
  const urls = argv.filter((argument) => argument !== '--dry-run');
  return { dryRun, urls };
}

function normalizeUrls(values) {
  const normalized = values.map((value) => new URL(value, SITE_ORIGIN).toString());
  const unique = [...new Set(normalized)];

  for (const value of unique) {
    const url = new URL(value);
    if (url.origin !== SITE_ORIGIN) {
      throw new Error(`Refusing to submit a URL outside ${SITE_ORIGIN}: ${value}`);
    }
  }

  if (unique.length > 10_000) {
    throw new Error(`IndexNow accepts at most 10,000 URLs per request; received ${unique.length}.`);
  }

  return unique;
}

async function urlsFromSitemap() {
  const response = await fetch(SITEMAP_URL, {
    headers: { 'user-agent': 'TypingScholar-IndexNow/1.0' },
  });
  if (!response.ok) {
    throw new Error(`Unable to read ${SITEMAP_URL}: ${response.status} ${response.statusText}`);
  }

  const urls = sitemapUrls(await response.text());
  if (urls.length === 0) {
    throw new Error(`No URLs were found in ${SITEMAP_URL}.`);
  }
  return urls;
}

async function main() {
  const { dryRun, urls: argumentsUrls } = parseArguments(process.argv.slice(2));
  const urls = normalizeUrls(argumentsUrls.length > 0 ? argumentsUrls : await urlsFromSitemap());
  const payload = {
    host: new URL(SITE_ORIGIN).host,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200 && response.status !== 202) {
    const details = await response.text();
    throw new Error(
      `IndexNow rejected ${urls.length} URLs: ${response.status} ${response.statusText}${details ? ` — ${details}` : ''}`
    );
  }

  console.log(`IndexNow accepted ${urls.length} TypingScholar URLs (${response.status}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
