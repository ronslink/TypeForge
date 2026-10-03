# TypeForge — Completion & Gap Audit

Independent audit of `master` at `3756d97`, performed by running the gates and reading the
source rather than trusting the handoff. Every claim below has a reproduction command in
[§7](#7-evidence-commands).

Scope: what is finished, what is half-finished, and what is claimed but absent.

> **Read [§0.1](#01-resolved-since-this-audit) first if you want current state.** It records what
> was fixed immediately after this audit — the typing engine's CI verification, the database
> harness and the 42P10 bug it found, and Sentry. Sections 2–6 below are the audit as written and
> are now historical where §0.1 supersedes them.

---

## 0. TL;DR

The repo is in **better shape than the plan implies, but its self-description is unreliable.**
The core lesson→type→score→submit→progress loop is genuinely implemented and tested, and the
local gates are green. The gaps cluster in five places:

1. **The newest work has never been verified by CI and is not pushed.** CI's last green run is
   `d47345d`; `720b024` (the typing engine — the largest functional change in the repo) and
   `3756d97` are unpushed, so no CI run covers them.
2. **Three advertised scripts are broken**: `test:e2e` (no Playwright dependency, config, or
   tests), `deploy:api` (executes zero tasks), `db:seed:org` (target file does not exist).
3. **The database path has never touched a real database.** Migration `0003` is unapplied,
   there is no Postgres integration test, and `packages/db` has zero tests — but it reports
   green because every package runs `vitest run --passWithNoTests`.
4. **Several subsystems are schema-and-component-only**: 10 gamification/notification tables,
   the entire sound/keyboard asset package, ~11 UI components, the COPPA consent workflow, and
   the permissions module exist with no live consumer.
5. **The documentation contradicts the code.** `README.md` and `docs/architecture.md` describe
   Cloudflare Workers + Hyperdrive + R2 + Queues + 3-region residency; the implementation is
   Vercel + a single `DATABASE_URL`. Copy-paste setup instructions reference files that do not
   exist.

Verified-good baseline: **26/26 turbo tasks green, 272 unit tests passing, 0 type errors.**

---

## 0.1 Resolved since this audit

Three workstreams landed immediately after the audit and are pushed, CI-verified and green.
TL;DR items 1 and 3, and the missing monitoring in item 4, are closed.

### The typing engine is CI-verified

`720b024` and `3756d97` were pushed. CI run **#97 = success**, so the largest functional change
in the repository — the rewritten scoring kernel and all three scoring sites — is now covered by
the pipeline. Run **#98** covers the database work below.

### The database path is now exercised — and it was broken

Added `packages/db/src/testing`: a PGlite harness that applies the real migrations, in journal
order, to an in-process PostgreSQL. It is exported as `@typeforge/db/testing` and deliberately
*not* from the package root, so nothing in the application can depend on PGlite.

Added the repository's first integration test:
`apps/api/src/routes/sessions.integration.test.ts` — 7 cases over `POST /sessions`: migrations
apply, every derived row is written, idempotent replay, key reuse rejected, malformed key
rejected, validation rejected, and every `ON CONFLICT` target is backed by a unique constraint.

**On its first run it failed:**

```
error: there is no unique or exclusion constraint matching the ON CONFLICT specification
code: '42P10'
```

Every session submission returned **500** as soon as a real database was attached — the primary
write path of the product.

**Root cause, which was not what it first appeared to be.** The schema declared 14 constraints
using the legacy `(table) => ({ name: { unique: true, columns: [...] } })` form. drizzle-kit 0.31
silently ignores that shape, so the constraints never reached the emitted SQL. `db:generate`
reported *"No schema changes"* because the snapshot was generated from the same inert reading —
these were never merely un-migrated, they were **inert**. The fix was to convert all 14 to
`uniqueIndex(...)` / `primaryKey(...)` and generate migration `0004_certain_microbe.sql`.

Also inert, and fixed by the same migration:

| Table | Was missing | Consequence while missing |
| --- | --- | --- |
| `user_follows`, `class_members` | composite **primary key** | tables had no primary key at all |
| `streaks` | `(user_id, type)` | duplicate streaks; `updateUserStreak` reads `.limit(1)` |
| `org_members` | `(org_id, user_id)` | duplicate memberships; authz reads `.limit(1)` |
| `lessons`, `lesson_categories` | `(language_code, slug)` | ambiguous lesson lookup |
| `daily_stats`, `user_progress`, `key_mastery` | unique | **the 42P10 → 500 above** |
| `user_devices`, `user_achievements`, `leaderboards`, `subscription_seats`, `subscriptions` | unique | duplicates |

### Error tracking exists

`@sentry/sveltekit` **11** is wired on both sides: `Sentry.init` at module scope in
`hooks.server.ts`, `sentryHandle()` first in the request sequence, and `handleErrorWithSentry()`
for client and server.

`@typeforge/api` stays vendor-free — it is written to run on more than one host — so it exposes
an error-reporter seam and `apps/web/src/lib/server/api-error-reporting.ts` binds it to Sentry.
Because Hono's `onError` converts a throw into a JSON 500, the reporter is called explicitly;
without that, API failures would never reach error tracking.

Data collection is locked down (no user info, cookies, headers, request bodies, URL query
params, bound database parameters or stack-frame variables). This product holds learner
keystrokes and K-12 data; those must not leave the process. With no `SENTRY_DSN` /
`PUBLIC_SENTRY_DSN` the SDK stays inert, so CI and local development send nothing.

Delivery is verified, not assumed: a test drives the real SDK with a capture transport and
asserts that an API error produces an event containing the message, path and method.

### The declared audio assets now exist

§3.7 below is now half-resolved. `packages/assets/src/sounds/index.ts` declared 20
`/assets/sounds/...` URLs and **none** of the files existed; `SoundManager` had no consumer either.

`scripts/generate-sounds.mjs` now synthesises all 15 sounds (5 categories × 3 themes; `custom` is
a user-supplied slot and `silent` is the empty string, so neither is generated) and encodes them
with `ffmpeg`/libmp3lame. They land in `apps/web/static/assets/sounds/`, which is where SvelteKit
can actually serve them from — so the declared URLs are true rather than aspirational.

The generator enforces the spec in `packages/assets/static/sounds/README.md` (44.1kHz mono,
128/192kbps, −3dBFS peak, per-category durations) and fails if a file is out of spec. It also
cross-checks every path declared in `sounds/index.ts` against what is on disk, so "declared but
absent" cannot reopen quietly. Verified in real Chromium: all 15 decode through
`decodeAudioData`, served as `audio/mpeg`, none silent. The ambient beds' loop claim was measured
rather than assumed — the jump across the loop point is smaller than the steepest slope inside it.

Two honest caveats: these are **synthesised tones, not recordings**, and **nothing plays them
yet** — `SoundManager` still has no consumer and `user_preferences.sound_enabled` defaults to
false, so wiring playback is a separate product decision.

### P0 items 1–3 closed

The four items left open at the end of the previous round are resolved, except where noted.

**Lesson lookup is language-aware.** `sessions.ts` now resolves `payload.lessonId` by
`(slug, language)` first, falls back to a slug match only when exactly one lesson carries that
slug, and refuses (rather than guessing) when several languages share it and none matches. The
regression test seeds the same slug under `en` and `de`; with the previous slug-only lookup it
fails, which is how the test was shown to have teeth.

**Streak and XP writes are race-safe.** Both inserts now use `onConflictDoNothing().returning()`
and re-read on conflict, so losing the race adds to the winner's row instead of failing. The test
submits two first sessions for a brand-new user concurrently; with the guard removed it reproduces
`[201, 500]` from the unique violation, so the fix is verified rather than assumed.

**Three advertised-but-broken scripts removed** (the honest half of "fix or remove"):

| Removed | Why |
| --- | --- |
| `test:e2e` (root, `apps/web`, turbo task) | No `@playwright/test`, no config, no specs — and no way to run it in CI (see below) |
| `deploy:api`, `deploy:web`, turbo `deploy` task | Neither app defines a `deploy` script, so `deploy:api` executed **0 tasks and exited 0** |
| `packages/db` `seed:org` | `tsx create-org.ts` — the file does not exist and `tsx` is not a dependency |

All four now fail loudly instead of silently succeeding. Deployment is documented as what it
actually is: Vercel's Git integration, with one deployable (the API is a SvelteKit fallback inside
the web app, so it has no separate deployment). Note that `pnpm --filter <pkg> run <missing>`
still exits 0 with "None of the selected packages has a … script" — pnpm's behaviour, not ours.

### The curriculum now reaches the database

Finding 1 above is closed. `pnpm db:seed` writes the reference data the API needs.

The real catalogue is larger than the earlier estimate in this document: **298 lessons across 26
languages**, not 136 across 10. The difference is `lesson-registry.ts` generating a per-language
set at import time (lines ~700–745) on top of the ten hand-written language sets — every wordlist
language has lessons.

What was built:

| Piece | Purpose |
| --- | --- |
| `packages/db/src/seed/reference-data.ts` | `seedReferenceData(db, data)` — dependency-free, idempotent upserts keyed on natural identity |
| `packages/db/src/seed/from-catalog.ts` | Pure mapping: catalogue → rows, including the difficulty decision below |
| `packages/db/src/seed/languages.ts` | Language rows derived from the registry, plus `en-US` |
| `packages/db/src/seed/cli.ts` | `pnpm db:seed` |

**The difficulty decision.** Three vocabularies were in play: the curriculum uses numeric
`1`–`5` (documented "Difficulty level (1-5)"), the web app sends only three strings, and
`lesson_difficulty` in Postgres has four values. There is no injective mapping, so level 5
collapses into `expert`. That decision lives in exactly one exported table
(`DIFFICULTY_BY_LEVEL`), and an unmapped level **throws** rather than defaulting — so adding a
sixth level fails loudly instead of mislabelling new lessons as `beginner`. Revisit if difficulty
filtering ever moves server-side; nothing reads the column today.

**`en-US` is load-bearing.** `qwerty-us.json` is filed under `en-US` while every English lesson is
filed under `en`, and `keyboard_layouts.language_code` is a foreign key — so the layouts cannot be
seeded without an `en-US` row. This is exactly the kind of FK trap that a hand-written list would
have hit at runtime.

**The language registry moved into a package.** It now lives at
`packages/curriculum/src/languages.ts` and `apps/web/src/lib/i18n/languages.ts` re-exports it, so
the seed and the app cannot disagree about which languages exist. Two copies would have drifted.

### A second broken-script bug, found by running the command

`pnpm db:migrate`, `db:push`, `db:generate` and `db:studio` **could not see `DATABASE_URL`**.
Turbo 2 defaults to `envMode: "strict"` and passes only declared variables, and `turbo.json`
declared none — a turbo dry-run showed `"env": []`. Drizzle fell back to
`postgresql://localhost:5432/typeforge` and the command failed with an unhelpful exit 1. The
package-level script worked; the documented workspace-level one did not.

Fixed by declaring `"env": ["DATABASE_URL"]` on those tasks (and adding a `db:seed` task). This was
only visible by actually running the command — typecheck, lint and tests were all green throughout.

### Migrations have now been applied to a real database

First time, as far as the repository's history shows. Against a real PostgreSQL 16:

- `pnpm db:migrate` applied all five migrations; `drizzle.__drizzle_migrations` records 5 rows.
- Migration `0004`'s unique indexes exist, so the `ON CONFLICT` upserts in `POST /sessions` are
  valid on real Postgres and not just in PGlite.
- `pnpm db:seed` wrote **31 languages, 11 keyboard layouts, 298 lessons**; re-running left those
  counts unchanged with zero duplicate `(language_code, slug)` pairs and zero dangling FKs.

### One finding still needs a decision

1. ~~**No curriculum data ever reaches the database.**~~ **Closed** — see "The curriculum now
   reaches the database" above. The earlier text here also understated the catalogue: it is 298
   lessons across 26 languages, and the difficulty mapping is 1–5 onto a four-value enum, not 1–4.

2. **The app cannot serve a single request without Clerk credentials.**
   `hooks.server.ts` calls `requireEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', …)` inside the request
   handler, so every route — including `/` and static pages — throws without keys. That is why no
   e2e suite exists: there is no way to boot the app in CI, and any contributor without a Clerk
   tenant cannot run it locally either. Unblocking e2e means either supplying Clerk test
   credentials to CI or adding an explicitly-opted-in unauthenticated mode that is impossible to
   activate in production. Worth a decision either way.

### Two things to know about the migration work

1. **A latent ambiguity was enforced rather than hidden.** `lessons` is unique on
   `(language_code, slug)`, but `apps/api/src/routes/sessions.ts` resolved `payload.lessonId` by
   `slug` alone with `.limit(1)`. With more than one language seeded, a learner could be credited
   against the wrong language's lesson. **(Fixed — see "P0 items 1–3 closed" above.)**

2. **A concurrency race surfaced as a 500 instead of a duplicate row.** `updateUserStreak` and
   `updateUserXP` did select-then-insert with no upsert and no locking. Before migration `0004` a
   concurrent first submission silently created duplicate rows; afterwards the unique index
   rejected the second insert with `23505`. **(Fixed — see above.)**

---

## 1. Verified baseline

| Gate | Result | Evidence |
| --- | --- | --- |
| `turbo run typecheck lint test --force` | **26/26 successful** | run locally, uncached |
| Typecheck | 0 errors (`svelte-check`: 0 errors, 0 warnings) | same run |
| Lint | 0 errors, **116 warnings** | same run |
| Unit tests | **291 passing** across 24 files | per-package runs |
| Tests against a real Postgres engine | **15 cases** (PGlite): seeding, `POST /sessions`, lesson linking | §0.1 |
| `apps/web` production build | **succeeds** | `pnpm --filter @typeforge/web run build` |
| Migrations + seed on real PostgreSQL 16 | 5 migrations, 31 languages / 11 layouts / 298 lessons | §0.1 |
| Error tracking | Sentry wired both sides; delivery verified by test | §0.1 |
| `pnpm test:e2e` | **removed** — no longer advertised; see §0.1 | §0.1 |
| `pnpm deploy:api` | **removed** — deployment is Vercel Git integration | §0.1 |
| CI (GitHub) | green through run #103 | Actions API |

Test distribution:

| Workspace | Files | Tests |
| --- | --- | --- |
| `@typeforge/web` | 14 | 184 |
| `@typeforge/api` | 5 | 56 |
| `@typeforge/curriculum` | 1 | 26 |
| `@typeforge/metrics` | 3 | 18 |
| `@typeforge/layouts` | 1 | 6 |
| `@typeforge/auth` | 0 | 0 |
| `@typeforge/db` | 0 | 0 |
| `@typeforge/ui` | 0 | 0 |

The three zero-test packages are **not failures** because each runs
`vitest run --passWithNoTests`. That flag is why CI can be green while the auth, DB and
component layers are entirely untested.

---

## 2. P0 — correctness and delivery blockers

### 2.1 The typing engine is unverified by CI and unpushed

```
git log --oneline origin/master..master
  3756d97 docs: update the session handoff with the typing engine state
  720b024 feat(web,ui,layouts): score typing by physical key and wire the typing engine
```

CI's most recent run is #96 on `d47345d`, the commit *before* the engine landed. The handoff's
"CI is green and runs typecheck, lint and test on every push" is true for a tree that no longer
matches `master`. The engine rewrote the scoring kernel and all three scoring sites — exactly the
change that most needs a gate.

*Action:* push, and confirm run #97+ goes green. Cross-check the local green baseline in §1.

### 2.2 `pnpm test:e2e` cannot pass, anywhere

- `apps/web/package.json` declares `"test:e2e": "playwright test"`.
- `@playwright/test` is **not** in `apps/web` devDependencies and **not** in `pnpm-lock.yaml`.
- There is no `playwright.config.*` and no e2e spec file in the repo.
- Root `package.json` and `turbo.json` both advertise the task; CI does not run it, so the
  breakage is invisible.

On this machine it resolved from a global install and failed with `Error: No tests found`. In a
clean checkout CI would fail with a missing binary.

*Action:* either add `@playwright/test`, a config, and at least one smoke spec (login→lesson→
submit→progress), or delete the `test:e2e` script and turbo task so the repo stops advertising a
gate it does not have. The handoff already documents a working manual Playwright recipe; that
recipe should become the spec.

### 2.3 There is no deployment command

`turbo.json` defines a `deploy` task (`dependsOn: ["build"]`) and root `package.json` exposes
`deploy:api` / `deploy:web` — but **neither app defines a `deploy` script**. Consequences:

- `pnpm deploy:api` → `No tasks were executed as part of this run` (0 tasks). It silently
  does nothing and exits 0.
- `pnpm deploy:web` → one successful **no-op** task.
- No `vercel deploy`, `vercel build`, or `wrangler deploy` invocation exists anywhere in the
  repo; `vercel` is not a devDependency.
- `.github/workflows/` contains only `ci.yml` — there is no CD workflow, though Phase 0 of the
  plan lists "GitHub Actions deploy on push".

Deployment currently depends entirely on Vercel's Git integration, undocumented in-tree.

*Action:* make the scripts real (`vercel --prod --filter`, or an explicit CD workflow) or remove
them. Today a maintainer typing `pnpm deploy:api` gets a success message and no deployment.

### 2.4 The database path has never run against a database

- Journal is at `0003_session_summary_idempotency`; `db:migrate` has never been executed against
  any instance (handoff confirms; nothing in the repo contradicts it).
- Idempotency's 12 tests are pure unit tests on the library. The route path that actually calls
  the DB is covered by **typecheck only**.
- `packages/db` has **zero tests**.
- There is no test-database harness (`vitest` + Postgres/PGlite) anywhere, despite the plan's
  Part 7 calling for "Integration Tests (Vitest + test DB)".

Every `db.insert` / `db.update` in `sessions.ts`, `progress.ts`, `organisations.ts` and
`billing.ts` is unverified by execution. This is the largest hidden risk in the repo: the app's
most complex logic (streaks, XP, seat counts, idempotency) has never been run.

*Action:* stand up a PGlite or Dockerised Postgres harness, apply migrations `0000`–`0003` in a
test, and add one integration test per write-heavy route.

### 2.5 Rate limiting does not work in production

`apps/api/src/middleware/ratelimit.ts` implements a module-level `new Map()` counter. On Vercel
serverless each invocation may be a fresh isolate, and requests spread across isolates, so the
limit is neither global nor durable — it is effectively decorative. The plan specifies Upstash
Redis (`UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN`); neither variable is read anywhere, and
Upstash appears in the codebase only as a comment.

Launch checklist item "Rate limiting rules on all API routes" is therefore unsatisfied.

*Action:* back the limiter with a durable store (Upstash/Postgres), or move the limit to the
platform edge and document that.

### 2.6 The environment contract is incomplete and the documented setup is broken

`README.md` instructs `cp apps/api/.dev.vars.example apps/api/.dev.vars` — **that file does not
exist** (`apps/api/` contains only `client.ts`, `package.json`, `tsconfig.json`).

Variables read by code but declared in **no** `.env.example`:

`APP_URL`, `MINIMAX_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
`SMTP_FROM_EMAIL`, `DEMO_NOTIFICATION_EMAIL`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`,
`STRIPE_SEAT_PRICE_ID`, `STRIPE_SEAT_PRICE_ID_90`, `STRIPE_SEAT_PRICE_ID_180`.

Declared but never read: `API_URL`, `ENVIRONMENT`.

Also read but declared nowhere because the platform supplies it: `VERCEL_ENV`, `NODE_ENV`
(`apps/web/src/hooks.server.ts:35`).

Credit where due: `hooks.server.ts` validates `PUBLIC_CLERK_PUBLISHABLE_KEY` and
`CLERK_SECRET_KEY` at boot and refuses to start production with `pk_test_`/`sk_test_` keys. That
guard is exactly the pattern the rest of the config should follow — the newer variables
(`MINIMAX_API_KEY`, `SMTP_*`, `STRIPE_PRICE_*`) are read with no validation at all.

*Action:* add `apps/api/.env.example` (or `.dev.vars.example`), derive the server-side list from
the code, validate it at boot, and delete the two dead keys.

---

## 3. Functional gaps against the development plan

### 3.1 Adaptive engine: one live path, one dead duplicate

Live: `apps/api/src/routes/lessons.ts` imports `selectNextLesson` and `generateAdaptiveLesson`,
so "next lesson" and the adaptive drill **do** exist.

Dead duplicates, never imported by any app file:

| Symbol | File |
| --- | --- |
| `AdaptiveScheduler` | `packages/curriculum/src/scheduler.ts` |
| `LessonGenerator` | `packages/curriculum/src/generator.ts` |
| `ProgressTracker` | `packages/curriculum/src/progress.ts` |
| `sm2` | `packages/curriculum/src/sm2.ts` |
| `MetricsEngine` | `packages/metrics/src/engine.ts` |
| `ConsistencyAnalyzer` | `packages/metrics/src/consistency.ts` |
| `KeystrokeAnalyzer` | `packages/metrics/src/keystroke.ts` |
| `SessionRecorder` | `packages/metrics/src/session.ts` |
| `RTLHandler`, `CharComparator`, `HesitationDetector` | `packages/metrics/src/{rtl,comparator,hesitation}.ts` |

Two parallel adaptive implementations is a maintenance hazard: a future fix can land in the dead
one. `packages/curriculum` also has a single 26-test file for ~30 modules (lesson sets, SM-2,
scheduler, generator are untested).

### 3.2 `consistency` and `rawWpm` are fabricated

Both drill pages send derived values, not measurements:

- `apps/web/src/routes/(app)/practice/+page.svelte:459-460`
- `apps/web/src/routes/(app)/learn/[lessonId]/+page.svelte:515-516`

```
rawWpm: finalWPM,
consistency: finalAccuracy,
```

`ConsistencyAnalyzer` — the primitive that should compute real consistency — is unused (§3.1).
Every session row therefore stores numbers that misrepresent the learner's actual typing
rhythm, and `/progress` renders them as if real.

### 3.3 Ten schema tables have no code path

| Domain | Tables | API route | UI |
| --- | --- | --- | --- |
| Gamification | `achievements`, `user_achievements`, `leaderboards`, `user_follows`, `streaks`, `user_xp` | none | none |
| Notifications | `notification_templates`, `notifications`, `system_audit_logs`, `system_events` | none | none |

`streaks` and `user_xp` are written by `sessions.ts`, so those two are live. The remaining eight
— **achievements, leaderboards, user_follows, notification templates/deliveries, system audit
logs/events** — have no reader or writer. `apps/api/src/routes/index.ts` exports exactly eight
route modules (sessions, lessons, users, organisations, billing, admin, progress, contact); there
is no gamification or notifications route. Phase 4's achievements/leaderboard work is unstarted.

`MilestoneCertifications` and `AchievementBadge` exist in `packages/ui`, but with no API to feed
them — `AchievementBadge` is itself unused (§3.6).

### 3.4 Certificates are rendered, never recorded

`apps/web/src/routes/(app)/certificate/+page.svelte` fetches `/api/v1/progress` and draws an
image from live stats. There is **no `certificates` table** (grep over
`packages/db/src/schema/` returns nothing). Consequences: no stable certificate ID, no public
verification URL, no revocation, and a certificate that changes every time the learner improves.
`apps/web/src/routes/api/og/certificate/+server.ts` renders an OG image for it, so the surface
looks finished while the substance is absent.

### 3.5 COPPA consent is stored at the vendor and never invoked

`packages/auth/src/coppa.ts` keeps birth year and parental consent in Clerk `publicMetadata`
(lines 36, 60-73, 188-189). The module is re-exported from `packages/auth/src/index.ts` and
**imported by no app file** — so no sign-up flow, no consent gate, and no age check is enforced
at runtime.

The plan's launch checklist requires "COPPA parental consent workflow" and the architecture's
own compliance posture argues compliance data should not sit with the identity vendor. Both are
unsatisfied: the data lives at Clerk *and* the workflow that would use it is unwired.

### 3.6 Roughly a third of the UI library is dead

Unreferenced by any app file (11 of 29 components):

`AchievementBadge`, `Celebration`, `ClassOverview`, `EncouragementToast`, `LevelUp`,
`MilestoneToast`, `OrgDashboard`, `OrgStatsPanel`, `ProgressBar`, `StudentProgressReport`,
`StudentRow`, `ThemeProvider`.

Some are near-duplicates (`Celebration` vs `ConfettiCelebration`, `ProgressBar` vs
`ProgressRing`), which suggests superseded work rather than planned work. `packages/ui` has zero
tests, so nothing catches a broken component until a page imports it.

### 3.7 The asset package is orphaned and its files are missing

- `@typeforge/assets` is **not a dependency of any workspace** and is imported by nothing.
- `packages/assets/static/sounds/` contains only `README.md`, while
  `packages/assets/src/sounds/index.ts` declares **20** `/assets/sounds/...mp3` paths. Every
  keystroke/error/success sound would 404.
- `keyboardSVGs` declares 5 layouts; only `qwerty-us.svg` exists. All three
  `handPositionImages` are absent.
- `SoundManager`, `generateKeyboardSVG` and `generateHeatmapOverlay` have **no consumers**.

Yet a `SoundConfig` UI surface (`theme`, `volume`, `keystrokeSound`) exists in the settings
domain, implying a planned feature. Either implement or delete; do not ship a settings toggle
with no audio.

### 3.8 Onboarding placement test bypasses the engine's composition path

The placement test at `apps/web/src/routes/onboarding/+page.svelte` does not use `TypingInput`,
so it has no off-screen capture field: an OS IME cannot compose there, and `handleKeydown` bails
while `event.isComposing`. For the Devanagari/Korean/Japanese/Hebrew learners the placement test
is precisely where the engine is most likely to be wrong.

Related, still open from the handoff: **no real OS IME has ever been exercised** (only synthetic
composition events), and practice wordlists for non-Latin languages contain clusters no single
key produces. `TypingInput`'s `onWordComplete` is still used by only one of three scoring sites.

### 3.9 Authorization logic is duplicated instead of shared

`packages/auth/src/permissions.ts` exports `canViewStudentData`, `isOrgAdmin`, `isTeacher`,
`hasActiveSubscription`, `canAccessLesson` — **none are used by any app file.** Meanwhile
`apps/api/src/routes/organisations.ts` (1211 lines) hand-rolls ~12 separate membership/role
checks (`ORG_MANAGER_ROLES.includes(...)` plus 403s at lines 65, 186, 244, 331, 399, 402, 548,
948, 1078).

The inline checks look deliberate and mostly correct, but student-data access control now has two
implementations and only the unused one is centralised. For a product with K-12 and institutional
customers this is the wrong place to have drift.

*Action:* either route org authorization through `permissions.ts` and add tests, or delete the
module so there is one obvious place to reason about access.

### 3.10 Not started from Phases 4–5

| Plan item | Status |
| --- | --- |
| PWA manifest + offline lesson caching | absent (no manifest, no service worker) |
| `/blog` and content marketing | absent |
| Load tests (k6, 1000 concurrent) | absent |
| Performance audit (Lighthouse >95) | no artifact |
| Accessibility audit (WCAG 2.1 AA) | one `focus-trap.ts` + tests; no audit |
| Penetration test | no artifact |
| Cookie banner (EU) | absent — only policy prose; `cookie_consent` table exists, unused |
| `docs/compliance.md`, `docs/agent-assignments.md` | **referenced by `docs/architecture.md`, do not exist** |
| Institutional/beta programme | org flow exists; no beta gate |

---

## 4. Documentation drift

`README.md` and `docs/architecture.md` describe a system that was replaced by commit `9d97b3b`
("migrate to Vercel/Postgres architecture"). Specifically:

| Documented | Actual |
| --- | --- |
| API on Cloudflare Workers | Hono mounted as a SvelteKit Vercel fallback (`apps/web/src/routes/api/[...paths]/+server.ts`) |
| Hyperdrive bindings, 3 regions (EU/US/AF) | one `DATABASE_URL`; `dbMiddleware` builds one client per request |
| Upstash Redis cache + rate limiting | in-process `Map` (§2.5) |
| Cloudflare R2 storage, Cloudflare Queues | unused; `infra/contracts/bindings.ts` describes bindings that no `wrangler.toml` exists to define (there is **no wrangler.toml** anywhere) |
| "Data residency: EU users → EU region" | no routing by region at runtime; `homeRegion` is read in 5 files but never selects a database |
| Sentry error tracking | **entirely absent** — no SDK in `pnpm-lock.yaml`, no `SENTRY_DSN`, no reference anywhere; the plan's checklist item is unmet |
| Vercel Web Analytics | `Analytics.svelte` is wired to Plausible (`PUBLIC_PLAUSIBLE_DOMAIN`), not Vercel Analytics |
| `cp apps/api/.dev.vars.example ...` | target file missing (§2.6) |

The multi-region/GDPR story is currently **architectural aspiration, not implementation**. That
matters commercially as well as technically: the plan's EU/US/Africa residency claim is a
customer-facing commitment.

Also stale: `docs/architecture.md`'s monorepo tree lists `docs/compliance.md` and
`docs/agent-assignments.md`, neither of which exists.

---

## 5. Quality and delivery debt

| Item | Detail |
| --- | --- |
| Lint warnings | **116** — `prefer-const` 56, `no-explicit-any` 51, `svelte/no-at-html-tags` 7, `no-unused-vars` 2. Gate passes because they are warnings, so the count only grows. The 7 `no-at-html-tags` are worth a look on their own (XSS class) |
| Prettier | `.prettierrc` exists, `format:check` script exists, **no CI gate**; 21+ files unformatted at HEAD by design |
| `no-explicit-any` | concentrated in `(app)/progress`, `(app)/practice`, `onboarding/school`, `org/success` |
| Broken script | `packages/db`: `"seed:org": "tsx create-org.ts"` — **`create-org.ts` does not exist** and `tsx` is not a dependency |
| Build artifacts on disk | `apps/web/.vercel/output/` (~hundreds of MB, gitignored) and 4 `typecheck*.log` files; both slow repo-wide tooling and invite confusion |
| Test gaps | `auth`, `db`, `ui` at zero tests behind `--passWithNoTests` |
| CI coverage | typecheck + lint + test only: no build, no e2e, no format, no migration check, no deploy |
| Single test for whole curriculum | 26 tests cover lesson content, but `scheduler`, `generator`, `progress`, `sm2`, `adaptive`, `lesson-selector` are effectively untested |
| No Postgres tests | see §2.4 |

---

## 6. Prioritised completion plan

### P0 — do first (correctness / trust)

1. **Push `720b024` + `3756d97`; confirm CI run #97+ green.** The engine is currently
   unverified by the pipeline that exists to verify it.
2. **Fix or remove `test:e2e`.** Prefer: add `@playwright/test`, config, and one
   login→lesson→submit→progress smoke spec, then gate it in CI.
3. **Make `deploy:api` / `deploy:web` real or delete them.** Today `deploy:api` succeeds while
   doing nothing.
4. **Stand up a Postgres test harness** (PGlite or Docker), apply migrations `0000`–`0003`, and
   add integration tests for `POST /sessions` (including the idempotency route path), streak/XP
   updates, seat accounting, and billing webhooks.
5. **Replace the in-process rate limiter** with a durable store, or move the limit to the edge.
6. **Fix the environment contract**: add the missing API env example, declare every variable the
   code reads, delete dead keys, and fix the `README` setup snippet.

### P1 — finish what is half-built (product honesty)

7. **Compute `consistency` and `rawWpm` for real** from `ConsistencyAnalyzer` / `MetricsEngine`,
   or stop storing and rendering them.
8. **Delete the dead duplicate engine** (`AdaptiveScheduler`, `LessonGenerator`,
   `ProgressTracker`, `sm2`) or wire it, so there is one adaptive implementation.
9. **Wire the onboarding placement test to `TypingInput`** so IME composition is scored there.
10. **Decide the gamification/notifications surface**: implement achievements/leaderboards, or
    drop the eight unused tables so the schema stops promising features.
11. **Give certificates a table** with a stable ID and a public verify URL — or reframe the
    feature as a shareable stat card.
12. **Resolve `permissions.ts`**: adopt it in `organisations.ts` with tests, or delete it.
13. **Wire or delete COPPA**: move birth year/consent out of Clerk `publicMetadata` into
    `compliance.ts` tables and enforce it in the sign-up flow.
14. **Delete or implement the asset package** (20 missing audio files, 4 missing keyboard SVGs,
    3 missing hand images, zero consumers).
15. **Prune the 11 dead UI components**; add a minimal render test per surviving component.

### P2 — launch readiness (Phases 5 + checklist)

16. Rewrite `README.md` and `docs/architecture.md` to match the Vercel/Postgres reality; write
    the missing `docs/compliance.md` and `docs/agent-assignments.md` or remove the references.
17. PWA manifest + offline caching; `/blog`; cookie banner backed by `cookie_consent`.
18. k6 load test, Lighthouse budget, WCAG 2.1 AA pass, and record the artifacts in `docs/`.
19. Add CI gates: `build`, `format:check` (after a bulk format commit), `test:e2e`, and a
    migration dry-run against an ephemeral database.
20. Burn down the 116 lint warnings and flip `--passWithNoTests` to a real floor for `auth`,
    `db` and `ui`.

### Open product decisions (not technical)

- The Codex `dbde` governance worktree (billing canonical pipeline, privacy lifecycle, adult
  eligibility, 601 files) whose own manifest declares all 9 gates blocked. Mount or discard.
- Auth provider portability: the handoff's recommendation (generalise `users.clerkId`, move COPPA
  data in-house, add a `svelte-clerk` adapter) is sound and cheap now, expensive later. Same
  argument applies to the unwired `packages/auth/src/sso.ts`.

---

## 7. Evidence commands

```bash
# gates (uncached)
pnpm exec turbo run typecheck lint test --force        # → 26/26 successful

# unit totals
pnpm --filter @typeforge/web run test                  # → 182 passed
pnpm --filter @typeforge/api run test                  # → 40 passed
pnpm --filter @typeforge/curriculum run test           # → 26 passed
pnpm --filter @typeforge/metrics run test              # → 18 passed
pnpm --filter @typeforge/layouts run test              # → 6 passed
pnpm --filter @typeforge/auth run test                 # → no test files
pnpm --filter @typeforge/db run test                   # → no test files
pnpm --filter @typeforge/ui run test                   # → no test files

# broken scripts
pnpm test:e2e                                          # → exit 1: "No tests found"
pnpm run deploy:api                                    # → "No tasks were executed"

# unverified commits
git log --oneline origin/master..master                # → 720b024, 3756d97
curl -s https://api.github.com/repos/ronslink/TypeForge/actions/workflows/249489584/runs \
  | grep -m1 '"head_sha"'                              # → d47345d (pre-engine)

# absent artifacts
ls apps/api/.dev.vars.example docs/compliance.md docs/agent-assignments.md  # → not found
ls packages/assets/static/sounds/                      # → README.md only
ls packages/db/create-org.ts                           # → not found
find . -name 'playwright.config.*' -not -path '*/node_modules/*'  # → none
find . -name 'wrangler.toml' -not -path '*/node_modules/*'        # → none
```

---

*Audit produced by running the gates and reading the source. Where the handoff and the code
disagreed, the code is recorded above and the discrepancy is noted.*
