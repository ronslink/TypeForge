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

**Chosen approach: front the cluster with a proxy.**

DO's trusted sources are IP-based, and Vercel's serverless egress IPs are dynamic,
so the application cannot reach the cluster directly. Instead, traffic goes through
a proxy on a static IP that *is* in the trusted sources:

```
Vercel function ──TLS──▶ proxy (static IP, trusted) ──TLS──▶ DO managed Postgres
                          PgBouncer, transaction mode
```

The proxy does double duty: it gives a stable source IP, and it multiplexes the
many short-lived serverless connections onto a small number of server connections.
That second job matters as much as the first — each function instance opens its own
pool, and without a pooler a traffic spike exhausts the cluster's connection limit.

Requirements:

- **A dedicated proxy host**, not the Hetzner box. That machine just filled its root
  filesystem and hosts unrelated production workloads; a database hop should not
  depend on it. A small droplet with a static IP added to the cluster's trusted
  sources is enough.
- **TLS on both legs.** `client_tls_sslmode=require` on the proxy, and
  `sslmode=require` on the proxy's connection to DO.
- **`prepare: false` on the application client.** This is not optional and is now
  the default in `packages/db/src/client.ts`. PgBouncer in transaction mode binds a
  client connection to a server connection only for the duration of a transaction,
  so a named prepared statement can be executed against a connection that never
  prepared it. That fails at query time, not connect time — it looks fine until
  production traffic arrives.
- **A small per-instance pool.** `createDb` defaults to `max: 5`; raise it with
  `DB_POOL_MAX` only if a workload needs it.
- **Monitoring and a failure plan.** The proxy is a single point of failure and
  adds a hop. Either make it redundant or accept that a proxy outage takes the
  application down, and alert on it.

Then set `DATABASE_URL` in Vercel to the **proxy's** pooled port, redeploy, and
confirm the application connects:
`apps/web/src/routes/api/[...paths]/+server.ts` builds the client from
`DATABASE_URL`, so no code change is required.

**Alternative worth costing before building the proxy:** Vercel Secure Compute
provides static egress IPs. If that is available on the current plan, adding those
IPs to the cluster's trusted sources removes the proxy, the extra hop and the extra
single point of failure entirely. It is usually the cheaper option once the proxy
host, its monitoring and its redundancy are counted.

### 7. Close the tunnel

Kill the `ssh -L` process. Nothing persists.

## Do not

- Point anything at `157.180.84.79` again without first fixing that host's disk
  pressure (`/var/lib/evidence-trader` was 14G of the root filesystem). Its cluster
  PANIC'd mid-checkpoint on 2026-10-02 and cannot restart while the disk is full.
- Run `drizzle-kit push` against the new database. Use `db:migrate`, so the schema
  stays reproducible and reviewable.
- Put credentials on the shared Hetzner host.
