# Session handoff

State of `master` at the end of the session that produced commits `58c3361`..`a9e0220`.
Written so a fresh session can continue without re-deriving any of it.

## Where things stand

`master` is level with `origin/master`, working tree clean. CI (`.github/workflows/ci.yml`)
is green and runs typecheck, lint and test on every push to `master` and every PR.

Verified locally with `pnpm exec turbo run typecheck lint test --force` (26/26 tasks).
Run it before trusting any change; turbo's cache will otherwise hide regressions.

## What landed this session

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

## Highest-value work remaining

**1. Wire the typing engine — by a wide margin the most important thing on this list.**

The typing primitives ported in `58c3361` are **inert**: `strict-typing`, `activity-outcome`,
`grapheme`, `committed-text` and `IMEHandler` have no consumer in `apps/`. Nothing under
`apps/` uses `MetricsEngine`, `CharComparator`, `ConsistencyAnalyzer`, `KeystrokeAnalyzer`,
`HesitationDetector`, `SessionRecorder` or `RTLHandler` either. Only `WPMCalculator` and
`AccuracyTracker` are live.

The live scorer is inline in the pages:

```ts
const typedChar = event.key;
const isCorrect = typedChar === expectedChar.char;   // practice/+page.svelte:326
```

Meanwhile the curriculum is defined by **physical key code**:

```ts
char('र', 'KeyR', 'right_index')    // hindi-lessons.ts
```

Correctness compares the *produced character*; guidance and metrics use the *physical code*.
They agree only when the user's OS keyboard layout matches the target language. Related:
there is **no `compositionstart`/`compositionend`/`isComposing` handling anywhere** outside the
unused `IMEHandler`, so IME-composed input (Korean Dubeolsik) cannot be scored per keydown, and
`TypingInput` renders with `text.split('')` (UTF-16 code units, not graphemes).

Japanese is **not** affected: those lessons are deliberately romaji on QWERTY (`script: 'latin'`).

Not yet verified in a browser with a non-Latin OS layout. Confirm the exact failure mode before
filing it as a bug.

**2. `caf3`'s unique file.** `apps/api/src/routes/lessons.commerce.test.ts` in the Codex worktree
`C:/Users/ronon/.codex/worktrees/caf3/TypeForge` is the only artifact in that whole set referenced
by no git ref. `dbde`'s state is safe (it equals the Codex checkpoint tree `e5293c9`).

**3. Decide on the Codex `dbde` governance work.** Billing canonical pipeline, privacy lifecycle,
adult eligibility, 601 new files. Unmounted, large, and its own manifest declares all 9 gates
blocked. A product decision, not a technical one.

**4. Auth provider portability** (see below).

**5. Prettier is not enforced.** 21+ files were already unformatted at HEAD, so a format gate
would be red on arrival. Deliberately excluded from CI.

**6. No Postgres integration test for idempotency.** The 25 tests are pure unit tests on the
library; the route path is covered by typecheck only. Migration 0003 has never been applied.

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

- **BOMs.** The file-edit tools strip UTF-8 BOMs, and many files have one at HEAD. After edits,
  compare against `git show HEAD:<path>` and restore any BOM that was lost, or the diff fills
  with unrelated churn.
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
- **Migration journal is at `0003`.** `db:generate` works offline from the local snapshot, but
  `db:migrate` has not been run against any database.
- **CI status can be read from the public API** without auth:
  `https://api.github.com/repos/ronslink/TypeForge/actions/workflows/249489584/runs`. The
  workflow id is reused from the pre-migration CI that commit `91aa446` removed, so run numbers
  are continuous with the old history (runs #90–#91 are the old, failing ones).
