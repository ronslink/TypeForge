# TypingScholar SEO Strategy

## Current Position

TypingScholar now has the technical foundation needed for organic acquisition:

- Shared SEO metadata through `SeoHead`.
- Canonical URLs, Open Graph, Twitter cards, and JSON-LD for public pages.
- A sitemap that prioritizes indexable acquisition pages.
- Robots rules that keep private app surfaces out of crawl paths while allowing `/learn`, `/practice`, and language pages.
- Optional Search Console verification and privacy-friendly analytics configuration through environment variables.

The remaining growth work is content depth, measurement, and search-intent coverage.

## Primary Search Audiences

1. Individual learners
   - Goal: improve typing speed, accuracy, and confidence.
   - Likely queries: `typing practice`, `free typing lessons`, `touch typing tutor`, `typing speed test`, `how to type faster`.

2. Multilingual learners
   - Goal: practice typing in a specific language, script, or keyboard layout.
   - Likely queries: `arabic typing practice`, `hebrew typing tutor`, `russian keyboard typing practice`, `azerty typing lessons`, `korean typing practice`.

3. Schools and teachers
   - Goal: find typing curriculum, dashboards, reporting, and student management.
   - Likely queries: `typing program for schools`, `typing curriculum for students`, `classroom typing practice`, `typing software for teachers`.

## Keyword Clusters

### Core Typing

- free typing practice
- typing lessons
- touch typing tutor
- typing speed practice
- improve typing accuracy
- home row typing lessons

Target pages:

- `/practice`
- `/learn`
- `/typing-guide`
- future `/typing-test`
- future `/typing-lessons`

### Language and Layout

- Arabic typing practice
- Hebrew typing practice
- Russian typing practice
- Japanese typing practice
- Korean typing practice
- Hindi typing practice
- AZERTY typing lessons
- QWERTZ typing practice
- Dvorak typing lessons

Target pages:

- `/languages`
- `/languages/[langCode]`
- future `/keyboard-layouts/[layoutId]`

### Schools

- typing program for schools
- typing curriculum for elementary students
- classroom typing software
- student typing progress dashboard
- multilingual typing curriculum

Target pages:

- `/pricing`
- `/contact`
- future `/schools`
- future `/schools/typing-curriculum`

## Page Roadmap

### Phase 1: Strengthen Existing Pages

- Expand `/typing-guide` into a richer article with sections for posture, home row, drills, practice schedule, and common mistakes.
- Add 300-600 words of unique, language-specific copy to every `/languages/[langCode]` page.
- Add visible internal links from `/typing-guide` to `/learn`, `/practice`, and language pages.
- Add a short FAQ section to `/pricing` and `/typing-guide`.

### Phase 2: Build Acquisition Pages

- `/typing-test`: quick WPM and accuracy test with shareable result.
- `/typing-lessons`: static overview of the structured curriculum.
- `/schools`: school-focused landing page for administrators and teachers.
- `/keyboard-layouts`: index page for supported layouts.
- `/keyboard-layouts/[layoutId]`: QWERTY, AZERTY, QWERTZ, Dvorak, Arabic, Hebrew, Cyrillic pages.

### Phase 3: Content Engine

Create a lightweight `/blog` or `/guides` route for evergreen articles:

- How to type faster without losing accuracy
- Best typing practice routine for beginners
- Home row typing explained
- How to learn AZERTY typing
- How to practice Arabic typing
- How teachers can measure typing progress

Publish cadence: 2 high-quality pages per week until the first 20 pages are live, then maintain monthly updates.

## Measurement Setup

Required launch steps:

1. Add `PUBLIC_GOOGLE_SITE_VERIFICATION` in production and verify the domain in Google Search Console.
2. Submit `https://typingscholar.com/sitemap.xml`.
3. Enable analytics only after choosing the analytics policy:
   - Set `PUBLIC_ENABLE_ANALYTICS=true`.
   - Set `PUBLIC_PLAUSIBLE_DOMAIN=typingscholar.com`.
4. Track these weekly:
   - Organic impressions.
   - Organic clicks.
   - Top queries by page.
   - Click-through rate for pages with impressions but low clicks.
   - Trial/signup conversion from organic sessions.

## Internal Linking Rules

- Every guide page should link to `/practice` and `/learn`.
- Every language page should link back to `/languages`, `/practice`, and the closest keyboard layout page once layout pages exist.
- Every school page should link to `/pricing` and `/contact`.
- Footer should continue linking to `/languages`, `/typing-guide`, `/pricing`, and `/contact`.

## Success Targets

First 30 days after indexing:

- Search Console configured.
- Sitemap submitted and crawled.
- 10+ indexable acquisition pages.
- 20+ non-branded organic clicks per week.

First 90 days:

- 30+ indexable acquisition pages.
- 500+ non-branded organic impressions per week.
- 100+ non-branded organic clicks per month.
- At least one school-intent page generating qualified contact visits.
