# Session handoff

State of `master` at the end of the session that produced commits `58c3361`..`720b024`.
Written so a fresh session can continue without re-deriving any of it.

## Where things stand

`master` is level with `origin/master`, working tree clean. CI (`.github/workflows/ci.yml`)
is green and runs typecheck, lint and test on every push to `master` and every PR.

Verified locally with `pnpm exec turbo run typecheck lint test --force` (26/26 tasks).
Run it before trusting any change; turbo's cache will otherwise hide regressions.

## What landed

| Commit | Change |
| --- | --- |
| `58c3361` | Ported grapheme/committed-text/IME metrics, the `$lib/api` request layer, `bounded-json-body`, privacy-by-default schema + migration 0002 |
| `0482264` | Adopted `bounded-json-body` in all 17 body-parsing routes; added the 48 `recovery_*` keys |
| `fb27273` | Enabled `strict` type checking for `apps/web` |
| `217a6ee` | Fixed billing's missing bearer token; one shared `createAuthenticatedFetch` replaced 10 hand-rolled wrappers |
| `9d1cd5b`, `b640468`, `e42fb08`, `26305fa` | Silent-failure sweep: billing, practice and lesson session saves, certificate, org/success, progress, plus server-prose leaks |
| `0132b33` | Raised the session body cap from 256 KiB to 2 MiB (the lower value lost long drills) |
| `e7f9039` | Restored CI |
| `24da715` | Server-side idempotency for `POST /sessions` (migration 0003) |
| `a9e0220` | Translated the 48 `recovery_*` keys into all 15 locales |
| `720b024` | **Wired the typing engine.** Scoring is by physical key against grapheme prompt units, composition-aware, using the previously inert primitives |

## The typing engine (was item 1, now largely done)

`apps/web/src/lib/typing/typing-session.ts` is the single scoring kernel. All three
scoring sites go through it: `(app)/practice/+page.svelte`, `(app)/learn/[lessonId]/+page.svelte`
and `onboarding/+page.svelte` (the placement test). Nothing compares
`event.key === expectedChar.char` any more.

The model, in one paragraph: a prompt is a list of **NFC grapheme units**, one per
curriculum or generated character. Each unit's expected **physical key** is resolved from
the layout the learner is being shown (`findCodeByChar` in `@typeforge/layouts`), falling
back to the curriculum's own `code`. A keystroke is correct when it is that physical key,
or when the produced grapheme equals the expected one (for characters no layout key can
name). A miss never advances the cursor. Terminal states go through
`transitionActivityOutcome`, so `text-finished` requires exact grapheme exhaustion and
`user-stopped` requires the prompt not to be exhausted.

What is live now that was inert before: `grapheme` (`normalizeText`), `committed-text`,
`IMEHandler`, `strict-typing` (`getStrictInputDecision` is enforced on `beforeinput`),
`activity-outcome`, and the new layout lookups.

Fixes that fell out of it, each verified in a browser:

- Non-Latin drills are answerable on any OS layout. Verified: pressing `KeyA`/`KeyS`
  scores `अ`/`स` in `learn/hi-alphabet-1` on a US keyboard layout (6/6 correct); the old
  code scored all six as misses.
- Modifiers, arrows, Escape and IME-owned keys are ignored instead of counting as misses
  and resetting the streak.
- `TypingInput` rendered `text.split('')` (UTF-16 code units), so a Devanagari conjunct was
  three spans and the cursor index disagreed with the page's unit index. It now renders
  prompt units.
- **`TypingInput` was rendering a visible space between every letter.** Svelte 5 emits a
  whitespace text node from the template formatting inside each character span. Keep the
  prompt `{#each}` on one line and do not put an `{#if}` next to its text expression; the
  cursor is drawn with `.char.current::before` for exactly this reason.
- `TypingInput` now hosts an off-screen capture field, focused once per drill, so an OS
  input method can compose. Composition commits are scored; pre-edit text is not; the
  post-`compositionend` input echo is suppressed.

### What is still open in the engine

- **`consistency` and `rawWpm` are still fake.** Both drill pages send
  `consistency: finalAccuracy` and `rawWpm: finalWPM`. `MetricsEngine` and
  `ConsistencyAnalyzer` are the primitives that should compute these, and they are still
  unused.
- Still unused anywhere under `apps/`: `KeystrokeAnalyzer`, `HesitationDetector`,
  `SessionRecorder`, `RTLHandler`, `CharComparator` (the kernel uses `normalizeText`
  instead), and `applyStrictCommittedText` outside its own test.
- **The onboarding placement test has no capture field**, so composition is not scored
  there and `handleKeydown` bails out while `event.isComposing`. Wiring it means giving it
  a `TypingInput`, which it does not currently use.
- **Only synthetic composition events were tested.** No real OS IME (Korean Dubeolsik,
  Chinese pinyin, macOS Devanagari transliteration) has been exercised. `ime.test.ts` and
  the kernel tests cover the state machine; a real IME is still unverified.
- Practice wordlists for non-Latin languages contain clusters no single key produces
  (Hindi `क्या`), so those rely on the commit path. The curriculum lessons are defined at
  key granularity and are the better-tested surface.
- `TypingInput`'s `onWordComplete` is still only used by the lesson page.

## Other work remaining

**1. `caf3`'s unique file.** `apps/api/src/routes/lessons.commerce.test.ts` in the Codex
worktree `C:/Users/ronon/.codex/worktrees/caf3/TypeForge` is the only artifact in that
whole set referenced by no git ref. `dbde`'s state is safe (it equals the Codex checkpoint
tree `e5293c9`).

**2. Decide on the Codex `dbde` governance work.** Billing canonical pipeline, privacy
lifecycle, adult eligibility, 601 new files. Unmounted, large, and its own manifest
declares all 9 gates blocked. A product decision, not a technical one.

**3. Auth provider portability** (see below).

**4. Prettier is not enforced.** 21+ files were already unformatted at HEAD, so a format
gate would be red on arrival. Deliberately excluded from CI. Note that the one-line prompt
`{#each}` in `TypingInput.svelte` is long on purpose (see the whitespace gotcha above);
do not let `prettier --write` reflow it.

**5. No Postgres integration test for idempotency.** The 25 tests are pure unit tests on
the library; the route path is covered by typecheck only. Migration 0003 has never been
applied.

## Auth / Clerk — lock-in is a strategy concern

Measured coupling:

- **Server: tiny.** Verification is one `verifyToken` call in `packages/auth/src/clerk.ts`.
  `getAuthState`/`extractBearerToken` are consumed by exactly one file,
  `apps/api/src/middleware/auth.ts`.
- **Client: already centralized.** Token acquisition goes through
  `createAuthenticatedFetch({ getToken })`. `svelte-clerk` still appears in ~16 files, mostly
  `useClerkContext()` plus the prebuilt `SignIn`/`SignUp`/`UserButton`/`UserProfile`.
- **Data: already provider-agnostic.** Every internal FK and the Stripe linkage
  (`entityId`, `stripe_customer_id`) uses the internal UUID, **not** `clerkId`. Sessions,
  progress, XP and billing do not move in a provider swap.
- No Clerk webhooks, no Clerk Organizations, no `clerkClient`. Only `coppa.ts` reads Clerk
  `publicMetadata` (birth year, parental consent).

**Recommendation: do not migrate now.** For lock-in specifically, buy portability instead of
replacing the vendor — three bounded changes convert "we are locked in" into "a swap is a
planned project":

1. `users.clerkId` is `text UNIQUE NOT NULL` — a provider-specific column in the core identity
   table. Generalise it (`auth_provider` + `provider_subject`, or an `identities` table) while
   the data is small.
2. Move COPPA birth-year/consent out of Clerk `publicMetadata` into your own schema, so
   compliance data is not held by the vendor.
3. Put one adapter in front of `svelte-clerk` so pages stop importing it directly, leaving the
   hosted UI components as the only Clerk-specific surface.

Then migrate only when a concrete driver bites — per-MAU cost, data residency for K-12 or
institutional customers, or the enterprise-SSO tier that `packages/auth/src/sso.ts` implies.

## Gotchas that will bite a fresh session

- **BOMs.** The file-edit tools strip UTF-8 BOMs, and many files have one at HEAD. After
  edits, compare against `git show HEAD:<path>` and restore any BOM that was lost, or the
  diff fills with unrelated churn. `apps/web/src/routes/onboarding/+page.svelte` has one.
- **`packages/ui` changes need a dev-server restart with a cleared dep cache.** Vite
  pre-bundles the workspace package into `apps/web/node_modules/.vite/deps/@typeforge_ui.js`,
  and editing `packages/ui` does **not** invalidate it. Symptom: the old component keeps
  rendering and your markup changes appear to have no effect. Fix:
  `Remove-Item -Recurse -Force apps/web/node_modules/.vite` then restart `vite dev`.
- **Svelte 5 whitespace.** Template indentation inside an element becomes a real text node.
  A prompt rendered one unit per span will show a space between every letter if you let
  Prettier or habit put the expression on its own line, and an `{#if}` next to a text
  expression emits an extra space node. Keep both on one line.
- **`apps/web` type-checks `apps/api`.** `svelte-check` pulls api sources in through the
  `@typeforge/api` path mapping. Under `apps/web`'s config this used to be non-strict, where
  truthiness narrowing on a discriminant silently fails. Use `parsedBody.ok === false`, not
  `!parsedBody.ok`.
- **Don't run `prettier --write` broadly.** Most page files were unformatted before this work;
  formatting them buries real changes. Wrap only new lines to match Prettier's output.
- **Catalog invariants.** `apps/web/src/lib/i18n/catalogs.test.ts` requires identical key sets
  across all 16 catalogs, intact placeholders and template tokens, no HTML drift, no mojibake,
  and a value that differs from English unless the key is in `globallyInvariantKeys`. The
  `recovery_*` keys were removed from that list once translated — do not re-add them.
- **Body caps.** `BOUNDED_JSON_BODY_POLICIES.sessionSubmission` and `keystrokeBatch` are 2 MiB
  with a proportional node cap. The previous 256 KiB value silently rejected long drills with a
  413. A test asserts the headroom; do not tighten it.
- **Idempotency keys.** The client key is `session:<scope>:<uuid>` from
  `$lib/api/idempotency.ts`; the server stores only a versioned SHA-256 plus a payload
  fingerprint. Client requests pass it as `header: { 'Idempotency-Key': key }` because the Hono
  RPC client takes `header` in its args, not as a `RequestInit`.
- **Keystroke payloads now carry the layout's character, not the OS's.** `attempt.produced`
  is the character the *active layout* prints for the pressed physical key, so stored
  `character`/`expected` stay comparable for a learner on a different OS layout. One
  `POST /sessions` record is written per scored unit, so a multi-unit IME commit produces
  several records.
- **Migration journal is at `0003`.** `db:generate` works offline from the local snapshot, but
  `db:migrate` has not been run against any database.
- **CI status can be read from the public API** without auth:
  `https://api.github.com/repos/ronslink/TypeForge/actions/workflows/249489584/runs`. The
  workflow id is reused from the pre-migration CI that commit `91aa446` removed, so run numbers
  are continuous with the old history (runs #90–#91 are the old, failing ones).
- **Browser verification recipe that works here.** The `browser` tool session is read-only
  (no clicks/typing). Playwright is installed globally, not in this repo — import it from
  `file:///C:/Users/ronon/AppData/Roaming/npm/node_modules/@playwright/test/node_modules/playwright/index.mjs`,
  launch `chromium`, and drive `http://localhost:5173` from a throwaway script. `@typeforge/ui`
  components are pre-bundled (see above), so clear `.vite` first. Locators: use
  `page.locator("button").filter({ hasText: "..." })`; `getByRole` with an exact name does not
  match these cards, and `element.click()` from inside `page.evaluate` does not trigger
  Svelte's delegated handlers — use a real `locator.click()`.
