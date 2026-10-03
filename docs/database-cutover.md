# Database cutover

How to stand TypeForge up on the managed DigitalOcean cluster, and why it is done
this way.

## Why a new **database**, not a new schema

The cluster already serves another application (`paykey`) in `defaultdb`. TypeForge
must not share that database:

- **The migrations hard-code `"public".`** — `CREATE TYPE "public"."account_type"`,
  `REFERENCES "public"."users"("id")` and so on throughout `0000`–`0004`. A custom
  schema namespace would mean rewriting every migration and setting `search_path`;
  `drizzle.config.ts` has no `schemaFilter` either.
- **The table names collide.** TypeForge creates `users`, `plans`, `subscriptions`,
  `invoices`, `notifications`, `languages`, `lessons` and more. Dropping those into
  `defaultdb`'s `public` schema alongside a live application is the one outcome to
  avoid.

A separate database gives full isolation with **no** changes to the migrations.
This was verified end to end on a simulated shared cluster: `defaultdb` holding a
stand-in table, `typeforge` created beside it, migrations applied, seed run. The
other database's rows were untouched and zero TypeForge tables were visible from it.

## Prerequisites

- The rotated `doadmin` credential. **Never commit it, never pass it as a command
  line argument** (it would land in shell history and `ps`), never write it to a
  file on the shared host. Environment variables only.
- The cluster's trusted sources include the Hetzner box `157.180.84.79` but not a
  typical workstation. Tunnel through it rather than opening the firewall.
- `psql` locally, or use Docker: `postgres:18-alpine`.

## Steps

### 1. Open the tunnel

```bash
ssh -o ExitOnForwardFailure=yes -N -L 15432:<cluster-host>:25060 hetzner
```

The connection then originates from a trusted source, so the workstation's IP does
not need to be listed. Verified: with a deliberately wrong password the cluster
answers `FATAL: password authentication failed` — proving TLS, the tunnel and the
cluster are all fine, with credentials the only gate.

### 2. Create the database — guarded

Refuse to run this against `defaultdb`, `postgres` or `template*`. Check first:

```bash
export ADMIN_URL='postgresql://doadmin:<password>@127.0.0.1:15432/defaultdb?sslmode=require'

psql "$ADMIN_URL" -tAc "select 1 from pg_database where datname='typeforge'"   # empty = does not exist
psql "$ADMIN_URL" -c   "create database typeforge"
```

`CREATE DATABASE` is additive; it touches nothing in `defaultdb`.

### 3. Migrate and seed the new database

This is a **fresh** database, so all five migrations apply cleanly — no journal
baselining is needed. (That complication belongs to the old Hetzner database, which
was built with `drizzle-kit push` and has no `drizzle.__drizzle_migrations` table.)

```bash
export DATABASE_URL='postgresql://doadmin:<password>@127.0.0.1:15432/typeforge?sslmode=require'

pnpm db:migrate     # 0000-0004
pnpm db:seed        # 31 languages, 11 keyboard layouts, 298 lessons
```

`pnpm db:seed` is idempotent, so re-running is how catalogue changes are pushed.

### 4. Verify

```bash
psql "$DATABASE_URL" -tAc "
  select 'languages='||(select count(*) from languages)
       ||' layouts='||(select count(*) from keyboard_layouts)
       ||' lessons='||(select count(*) from lessons)
       ||' migrations='||(select count(*) from drizzle.__drizzle_migrations)"

# no duplicate (language_code, slug) pairs
psql "$DATABASE_URL" -tAc "select count(*) from (select language_code,slug from lessons group by 1,2 having count(*)>1) d"

# no dangling language FKs
psql "$DATABASE_URL" -tAc "select count(*) from lessons l left join languages g on g.code=l.language_code where g.code is null"

# the other application is still intact
psql "$ADMIN_URL" -tAc "select count(*) from paykey_txns"
```

Expected: `languages=31 layouts=11 lessons=298 migrations=5`, then `0`, `0`.

### 5. Optional — import the pre-cutover data

The last recoverable dump is `typeforge_eu_20261001T021701Z.dump` (the 2 and 3 Oct
dumps are 0 bytes). It holds 9 users, 67 sessions, 7,363 keystrokes and 2
organisations. Restore **data only**, after the schema exists:

```bash
pg_restore --data-only --no-owner --no-acl -d "$DATABASE_URL" /path/to/last-good.dump
```

Confirm the column sets match before trusting it — the dump predates migration
`0004`, which only adds indexes, but verify rather than assume.

Be aware of what this does not restore: `user_progress`, `daily_stats`, `streaks`,
`user_xp` and `key_mastery` are all **empty** in the dump, because the old
`POST /sessions` failed its `ON CONFLICT` upserts (42P10). Importing the raw
sessions is honest; backfilling derived history would be inventing it.

### 6. Point the application at it

**TLS is not an alternative to a proxy.** They solve different problems, and both
are needed:

- **TLS** encrypts the connection. DigitalOcean requires it, so it is not optional
  either way.
- **A proxy, static egress IPs, or an open allowlist** solve *reachability*: DO
  restricts connections by source IP ("trusted sources"), and Vercel's serverless
  egress IPs are dynamic.

So the only open question is how the application gets past the IP allowlist.

**A detail that will otherwise bite at cutover:** postgres-js defaults to
`ssl: false` and only enables TLS when `sslmode` appears in the connection string.
Managed Postgres refuses an unencrypted connection, so a `DATABASE_URL` without
`sslmode` fails with an error about encryption rather than about the missing
parameter. `createDb` now logs a warning in that case; the value must still be set.

```
postgresql://<user>:<password>@<host>:25061/typeforge?sslmode=require
```

`sslmode=require` encrypts but does not verify the certificate. Verification
(`verify-full`) needs the provider's CA supplied to the client, which the current
`createDb(connectionString)` signature cannot express — that would be a small code
change. Encryption without verification still defeats passive interception; treat
`verify-full` as a worthwhile follow-up, not a blocker.

#### Reachability options

**Trusted sources are configured per cluster, not per database.** The cluster also
serves `paykey`, so whatever is chosen here changes `paykey`'s exposure too. That
rules out casually opening the cluster to the internet.

| Option | Mechanism | Trade-off |
| --- | --- | --- |
| **A. Separate DO cluster for TypeForge** | Its own cluster, so its own trusted sources and blast radius | ~$15/mo. Then the allowlist can be widened for this cluster alone, or static IPs used, without touching `paykey`. Cleanest isolation, and defensible given TypeForge will hold K-12 learner data while `paykey` handles payments |
| **B. Vercel Secure Compute** | Static egress IPs added to this cluster's trusted sources; connect directly, TLS only | No proxy, no extra hop, no extra point of failure. Costs money and depends on plan availability. **Preferred if available** |
| **C. Self-managed proxy** | PgBouncer on a small droplet with a static IP in trusted sources; Vercel connects to the proxy | Works without Secure Compute, and multiplexes serverless connections. Costs another host to run, patch and monitor, plus a hop and a single point of failure. Do **not** put it on the Hetzner box |
| **D. Open the cluster to `0.0.0.0/0`** | Connect directly with TLS | Zero infrastructure, but exposes `paykey`'s database to the internet too. Only reasonable on a dedicated cluster (option A) |

**Recommendation:** B if the plan allows it. Otherwise C on a dedicated droplet, or
A — which is worth costing anyway, because it also removes the shared-cluster
blast radius and gives TypeForge its own credentials and backup policy.

#### Whichever is chosen

- Keep the allowlist as narrow as it can be. "Open to the world" is a decision
  about `paykey` as much as about TypeForge.
- Use the **pooled** port (`25061`) or a pooler in front.
- Set `DATABASE_URL` in Vercel, redeploy, and confirm the application connects.
  `apps/web/src/routes/api/[...paths]/+server.ts` builds the client from
  `DATABASE_URL`, so no code change is required.

### 7. Close the tunnel

Kill the `ssh -L` process. Nothing persists.

## Do not

- Point anything at `157.180.84.79` again without first fixing that host's disk
  pressure (`/var/lib/evidence-trader` was 14G of the root filesystem). Its cluster
  PANIC'd mid-checkpoint on 2026-10-02 and cannot restart while the disk is full.
- Run `drizzle-kit push` against the new database. Use `db:migrate`, so the schema
  stays reproducible and reviewable.
- Put credentials on the shared Hetzner host.
