# TypeForge — Comprehensive Development & Implementation Plan

**Product:** TypeForge — Multilingual Adaptive Typing Learning Platform  
**Stack:** SvelteKit · Hono on Cloudflare Workers · PostgreSQL (Hetzner EU / Hetzner US / Vultr Africa) · Clerk · Cloudflare Pages/R2/Queues · Upstash Redis  
**Agent Strategy:** Kimi Code multi-agent parallel execution  
**Estimated Duration:** 22 weeks to production-ready v1.0

---

## Part 1 — Repository & Infrastructure Baseline

### 1.1 Monorepo Structure

```
typeforge/
├── apps/
│   ├── web/                   # SvelteKit frontend
│   └── api/                   # Hono API (Cloudflare Worker)
├── packages/
│   ├── db/                    # Drizzle schema + migrations (shared)
│   ├── metrics/               # WPM/accuracy engine (browser + server)
│   ├── layouts/               # Keyboard layout JSON maps
│   ├── curriculum/            # Lesson content + adaptive scheduler
│   └── ui/                    # Shared Svelte component library
├── infra/
│   ├── hetzner-eu/            # Postgres setup scripts + PgBouncer config
│   ├── hetzner-us/            # Postgres setup scripts + PgBouncer config
│   ├── vultr-africa/          # Postgres setup scripts + PgBouncer config
│   └── backups/               # pg_dump cron + R2 upload scripts
├── docs/
│   ├── architecture.md
│   ├── compliance.md
│   └── agent-assignments.md
├── .github/
│   └── workflows/             # CI/CD pipelines
├── turbo.json
├── pnpm-workspace.yaml
└── wrangler.toml
```

### 1.2 Technology Versions (pin these)

| Package | Version | Notes |
|---|---|---|
| SvelteKit | 2.x | App Router, SSR |
| Svelte | 5.x | Runes syntax |
| Hono | 4.x | Workers runtime |
| Drizzle ORM | 0.30.x | Postgres dialect |
| Clerk | 5.x | SvelteKit SDK |
| Turbo | 2.x | Monorepo build |
| pnpm | 9.x | Package manager |
| Node | 20 LTS | Local dev |
| Wrangler | 3.x | Cloudflare CLI |
| Vitest | 1.x | Unit tests |
| Playwright | 1.x | E2E tests |

---

## Part 2 — Infrastructure Setup (Before Any Code)

### 2.1 Hetzner EU — Frankfurt (GDPR)

```bash
# Server spec: CX32 (4 vCPU, 8GB RAM, 80GB NVMe) — €8.49/mo
# OS: Ubuntu 24.04 LTS

# Step 1: Provision via Hetzner Cloud Console or hcloud CLI
hcloud server create \
  --name typeforge-db-eu \
  --type cx32 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key your-key

# Step 2: Harden SSH, configure UFW firewall
# Allow only: 22 (SSH from your IPs), 5432 (Postgres — Cloudflare IPs only), 6432 (PgBouncer)

# Step 3: Install Postgres 16
sudo apt install -y postgresql-16

# Step 4: Install PgBouncer
sudo apt install -y pgbouncer

# Step 5: Create database and roles
createdb typeforge_eu
createuser typeforge_api  # application user (no superuser)
createuser typeforge_admin # migrations only

# Step 6: Configure PgBouncer (transaction pooling, max 100 connections)
# /etc/pgbouncer/pgbouncer.ini
[databases]
typeforge_eu = host=127.0.0.1 port=5432 dbname=typeforge_eu

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = scram-sha-256
pool_mode = transaction
max_client_conn = 500
default_pool_size = 25
```

Repeat identically for:
- **Hetzner Ashburn US** — `typeforge-db-us` (CX32, €9.19/mo)
- **Vultr Johannesburg** — `typeforge-db-af` (VHF-2C-4GB, $12/mo)

### 2.2 Cloudflare Hyperdrive Setup (per region)

```bash
# Create one Hyperdrive config per regional Postgres
wrangler hyperdrive create typeforge-eu \
  --connection-string="postgresql://typeforge_api:PASSWORD@HETZNER_EU_IP:6432/typeforge_eu"

wrangler hyperdrive create typeforge-us \
  --connection-string="postgresql://typeforge_api:PASSWORD@HETZNER_US_IP:6432/typeforge_us"

wrangler hyperdrive create typeforge-af \
  --connection-string="postgresql://typeforge_api:PASSWORD@VULTR_AF_IP:6432/typeforge_af"
```

These IDs go into `wrangler.toml` as named bindings.

### 2.3 Backup Automation

```bash
# Cron on each VPS: daily pg_dump → compress → upload to R2
# /opt/typeforge/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
REGION="eu"  # change per server
DB="typeforge_${REGION}"
BACKUP_FILE="/tmp/${DB}_${DATE}.sql.gz"

pg_dump -U typeforge_admin $DB | gzip > $BACKUP_FILE

# Upload to R2 via rclone (configured with R2 credentials)
rclone copy $BACKUP_FILE r2:typeforge-backups/${REGION}/
rm $BACKUP_FILE
```

### 2.4 Cloudflare Services

```bash
# Pages project (frontend)
wrangler pages project create typeforge-web

# R2 buckets
wrangler r2 bucket create typeforge-assets    # lesson media, keyboard SVGs
wrangler r2 bucket create typeforge-backups   # database backups

# Queue
wrangler queues create typeforge-jobs         # background jobs
```

### 2.5 Third-Party Accounts to Create First

- [ ] Cloudflare account — paid Workers plan ($5/mo)
- [ ] Hetzner Cloud account — 2 VPS
- [ ] Vultr account — 1 VPS
- [ ] Clerk account — free tier to start
- [ ] Upstash account — free Redis
- [ ] Resend account — transactional email (free 3K/mo)
- [ ] Stripe account — payment processing
- [ ] GitHub repo — private, with Actions enabled
- [ ] Sentry account — error tracking (free tier)

---

## Part 3 — Database Schema (packages/db)

-- =============================================================================
-- TypeForge — Comprehensive Database Schema
-- Version: 2.0
-- Applies to: PostgreSQL 16 on Hetzner EU / Hetzner US / Vultr Africa
-- Each regional instance runs this schema independently.
-- home_region column values: 'EU' | 'US' | 'AF'
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";       -- case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram search on lesson content

-- =============================================================================
-- DOMAIN 1: IDENTITY
-- Core user record, extended profile, preferences, and device registry.
-- A user does NOT require an organisation — fully standalone.
-- =============================================================================

CREATE TYPE user_status    AS ENUM ('active','suspended','pending_verification','deleted');
CREATE TYPE user_role      AS ENUM ('learner','teacher','org_admin','platform_admin');
CREATE TYPE account_type   AS ENUM ('individual','institutional');  -- set at signup
CREATE TYPE home_region    AS ENUM ('EU','US','AF');

CREATE TABLE users (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id            TEXT          UNIQUE NOT NULL,
  email               CITEXT        UNIQUE NOT NULL,
  email_verified      BOOLEAN       NOT NULL DEFAULT false,
  display_name        TEXT,
  first_name          TEXT,
  last_name           TEXT,
  avatar_url          TEXT,
  account_type        account_type  NOT NULL DEFAULT 'individual',
  role                user_role     NOT NULL DEFAULT 'learner',
  status              user_status   NOT NULL DEFAULT 'pending_verification',
  home_region         home_region   NOT NULL,
  locale              TEXT          NOT NULL DEFAULT 'en',     -- BCP-47 locale code
  timezone            TEXT          NOT NULL DEFAULT 'UTC',
  date_of_birth       DATE,                                    -- needed for COPPA check
  is_minor            BOOLEAN       GENERATED ALWAYS AS (
                        date_of_birth IS NOT NULL AND
                        date_of_birth > CURRENT_DATE - INTERVAL '18 years'
                      ) STORED,
  parental_consent_at TIMESTAMPTZ,                             -- COPPA: required if is_minor
  parental_email      CITEXT,                                  -- COPPA: parent contact
  referred_by         UUID          REFERENCES users(id) ON DELETE SET NULL,
  last_active_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ                              -- soft delete
);

-- Extended profile (optional fields, separated to keep users table lean)
CREATE TABLE user_profiles (
  user_id             UUID          PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio                 TEXT,
  country_code        CHAR(2),                                 -- ISO 3166-1 alpha-2
  city                TEXT,
  occupation          TEXT,
  typing_goal         TEXT,                                    -- "I want to type faster for work"
  wpm_target          SMALLINT      CHECK (wpm_target BETWEEN 10 AND 300),
  public_profile      BOOLEAN       NOT NULL DEFAULT false,
  show_on_leaderboard BOOLEAN       NOT NULL DEFAULT true,
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Per-user application preferences
CREATE TABLE user_preferences (
  user_id                 UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Typing interface
  default_language_code   TEXT    NOT NULL DEFAULT 'en',
  default_layout_id       TEXT    NOT NULL DEFAULT 'qwerty-us',
  show_keyboard_visual    BOOLEAN NOT NULL DEFAULT true,
  show_finger_hints       BOOLEAN NOT NULL DEFAULT true,
  show_wpm_live           BOOLEAN NOT NULL DEFAULT true,
  cursor_style            TEXT    NOT NULL DEFAULT 'block'    -- 'block'|'underline'|'bar'
    CHECK (cursor_style IN ('block','underline','bar')),
  sound_enabled           BOOLEAN NOT NULL DEFAULT false,
  sound_volume            SMALLINT NOT NULL DEFAULT 50
    CHECK (sound_volume BETWEEN 0 AND 100),
  -- Appearance
  theme                   TEXT    NOT NULL DEFAULT 'dark'
    CHECK (theme IN ('dark','light','midnight','forest','sunset','ocean')),
  font_size               TEXT    NOT NULL DEFAULT 'md'
    CHECK (font_size IN ('sm','md','lg','xl')),
  high_contrast           BOOLEAN NOT NULL DEFAULT false,
  reduce_motion           BOOLEAN NOT NULL DEFAULT false,
  -- Session behaviour
  lesson_end_action       TEXT    NOT NULL DEFAULT 'show_results'
    CHECK (lesson_end_action IN ('show_results','auto_next','show_celebration')),
  daily_goal_minutes      SMALLINT NOT NULL DEFAULT 10
    CHECK (daily_goal_minutes BETWEEN 1 AND 120),
  -- Notifications
  email_streak_reminder   BOOLEAN NOT NULL DEFAULT true,
  email_weekly_report     BOOLEAN NOT NULL DEFAULT true,
  email_product_updates   BOOLEAN NOT NULL DEFAULT false,
  push_enabled            BOOLEAN NOT NULL DEFAULT false,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registered PWA devices (for push notifications, device-specific settings)
CREATE TABLE user_devices (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name     TEXT,
  device_type     TEXT    CHECK (device_type IN ('desktop','tablet','mobile','unknown')),
  os              TEXT,
  browser         TEXT,
  push_token      TEXT,                                        -- web push subscription JSON
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, push_token)
);

-- =============================================================================
-- DOMAIN 2: ORGANISATIONS
-- Schools, companies, or any institutional account.
-- Users can belong to zero or many orgs.
-- An org's subscription covers its members (seat-based or unlimited).
-- =============================================================================

CREATE TYPE org_type    AS ENUM ('school','university','company','nonprofit','government','other');
CREATE TYPE org_status  AS ENUM ('active','suspended','trial','cancelled');
CREATE TYPE member_role AS ENUM ('admin','teacher','student','viewer');
CREATE TYPE member_status AS ENUM ('active','invited','suspended','removed');

CREATE TABLE organisations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_org_id    TEXT        UNIQUE,                          -- Clerk organisation ID
  name            TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,                 -- URL-safe identifier
  org_type        org_type    NOT NULL DEFAULT 'school',
  status          org_status  NOT NULL DEFAULT 'trial',
  home_region     home_region NOT NULL,
  country_code    CHAR(2),
  website         TEXT,
  logo_url        TEXT,
  contact_name    TEXT,
  contact_email   CITEXT,
  contact_phone   TEXT,
  billing_email   CITEXT,
  tax_id          TEXT,                                        -- VAT / EIN for invoicing
  max_seats       INTEGER,                                     -- NULL = unlimited
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Membership: a user belongs to an org with a specific role
CREATE TABLE org_members (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id         UUID          REFERENCES users(id) ON DELETE SET NULL,  -- NULL if not yet accepted
  role            member_role   NOT NULL DEFAULT 'student',
  status          member_status NOT NULL DEFAULT 'invited',
  invited_email   CITEXT,                                      -- pre-signup invite target
  invited_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

-- Classes/groups within an org (e.g. "Year 7A", "Onboarding Cohort Q3")
CREATE TABLE org_classes (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID    NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name            TEXT    NOT NULL,
  description     TEXT,
  teacher_id      UUID    REFERENCES users(id) ON DELETE SET NULL,
  language_code   TEXT,                                        -- default language for class
  layout_id       TEXT,                                        -- default layout for class
  archived        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE class_members (
  class_id        UUID NOT NULL REFERENCES org_classes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);

-- Pending invitations not yet accepted (includes magic-link token)
CREATE TABLE org_invitations (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id        UUID          REFERENCES org_classes(id) ON DELETE SET NULL,
  email           CITEXT        NOT NULL,
  role            member_role   NOT NULL DEFAULT 'student',
  token           TEXT          UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32),'hex'),
  invited_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ   NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Org-level configuration overrides
CREATE TABLE org_settings (
  org_id                    UUID    PRIMARY KEY REFERENCES organisations(id) ON DELETE CASCADE,
  sso_enabled               BOOLEAN NOT NULL DEFAULT false,
  sso_provider              TEXT,                              -- 'google','saml','oidc'
  sso_domain                TEXT,                              -- enforced email domain
  enforce_layout            TEXT,                              -- force all members to a layout
  enforce_language          TEXT,                              -- force all members to a language
  allow_self_enrol          BOOLEAN NOT NULL DEFAULT false,
  require_parental_consent  BOOLEAN NOT NULL DEFAULT false,   -- auto-on if org_type='school'
  custom_lesson_enabled     BOOLEAN NOT NULL DEFAULT false,
  branding_logo_url         TEXT,
  branding_primary_color    TEXT,
  data_export_enabled       BOOLEAN NOT NULL DEFAULT true,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- DOMAIN 3: SUBSCRIPTIONS & BILLING
-- Plans belong to a catalog.
-- A subscription is owned by a subscribable entity: user OR organisation.
-- Seats track individual access grants within an org plan.
-- =============================================================================

CREATE TYPE plan_type      AS ENUM ('free','individual','org_seat','org_flat','custom');
CREATE TYPE plan_interval  AS ENUM ('monthly','annual','lifetime','one_time');
CREATE TYPE sub_status     AS ENUM ('trialing','active','past_due','cancelled','paused','expired');
CREATE TYPE entity_type    AS ENUM ('user','organisation');
CREATE TYPE invoice_status AS ENUM ('draft','open','paid','void','uncollectible');

-- Product/plan catalog (seeded, not user-generated)
CREATE TABLE plans (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id   TEXT          UNIQUE,
  name                TEXT          NOT NULL,
  slug                TEXT          UNIQUE NOT NULL,           -- 'free','pro','school'
  plan_type           plan_type     NOT NULL,
  interval            plan_interval,
  price_usd_cents     INTEGER       NOT NULL DEFAULT 0,        -- 0 for free
  price_eur_cents     INTEGER       NOT NULL DEFAULT 0,
  included_seats      INTEGER,                                 -- NULL = unlimited, 1 for individual
  max_seats           INTEGER,                                 -- cap for seat plans
  features            JSONB         NOT NULL DEFAULT '{}',     -- feature flags as JSON
  is_public           BOOLEAN       NOT NULL DEFAULT true,     -- visible on pricing page
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  display_order       SMALLINT      NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- The core subscription record — belongs to a user OR an org (not both)
CREATE TABLE subscriptions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Subscribable entity
  entity_type           entity_type NOT NULL,
  entity_id             UUID        NOT NULL,                  -- user_id OR org_id
  -- Plan
  plan_id               UUID        NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT       UNIQUE,
  stripe_customer_id    TEXT,
  -- Status
  status                sub_status  NOT NULL DEFAULT 'trialing',
  -- Dates
  trial_start           TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at             TIMESTAMPTZ,                           -- scheduled cancellation
  cancelled_at          TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  -- Overrides (custom deals)
  custom_price_cents    INTEGER,                               -- NULL = use plan default
  custom_seat_limit     INTEGER,                               -- NULL = use plan default
  notes                 TEXT,                                  -- internal notes for custom deals
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ensure an entity only has one active subscription at a time
  CONSTRAINT one_active_sub UNIQUE (entity_type, entity_id)
);

-- For org seat plans: tracks which users consume a seat
CREATE TABLE subscription_seats (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID    NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allocated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at      TIMESTAMPTZ,
  UNIQUE (subscription_id, user_id)
);

-- Stripe price IDs mapped to plan+interval (a plan can have multiple prices)
CREATE TABLE plan_prices (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id           UUID          NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  stripe_price_id   TEXT          UNIQUE NOT NULL,
  interval          plan_interval NOT NULL,
  currency          CHAR(3)       NOT NULL DEFAULT 'USD',
  unit_amount_cents INTEGER       NOT NULL,
  is_default        BOOLEAN       NOT NULL DEFAULT false,
  active            BOOLEAN       NOT NULL DEFAULT true
);

-- Billing invoices (synced from Stripe webhooks)
CREATE TABLE invoices (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id       UUID           REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id     TEXT           UNIQUE,
  entity_type           entity_type    NOT NULL,
  entity_id             UUID           NOT NULL,
  status                invoice_status NOT NULL DEFAULT 'draft',
  currency              CHAR(3)        NOT NULL DEFAULT 'USD',
  subtotal_cents        INTEGER        NOT NULL DEFAULT 0,
  tax_cents             INTEGER        NOT NULL DEFAULT 0,
  total_cents           INTEGER        NOT NULL DEFAULT 0,
  amount_paid_cents     INTEGER        NOT NULL DEFAULT 0,
  amount_due_cents      INTEGER        NOT NULL DEFAULT 0,
  invoice_pdf_url       TEXT,
  invoice_number        TEXT,
  period_start          TIMESTAMPTZ,
  period_end            TIMESTAMPTZ,
  due_date              TIMESTAMPTZ,
  paid_at               TIMESTAMPTZ,
  voided_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TABLE invoice_line_items (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID    NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description     TEXT    NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_amount     INTEGER NOT NULL,
  amount          INTEGER NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD'
);

-- Stored payment methods (tokenised — no raw card data ever stored)
CREATE TABLE payment_methods (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type         entity_type NOT NULL,
  entity_id           UUID    NOT NULL,
  stripe_pm_id        TEXT    UNIQUE NOT NULL,
  type                TEXT    NOT NULL,                        -- 'card','sepa_debit','bacs'
  brand               TEXT,                                    -- 'visa','mastercard'
  last_four           CHAR(4),
  exp_month           SMALLINT,
  exp_year            SMALLINT,
  is_default          BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discount coupons
CREATE TABLE coupons (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_coupon_id    TEXT    UNIQUE,
  code                TEXT    UNIQUE NOT NULL,
  name                TEXT    NOT NULL,
  discount_type       TEXT    NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value      INTEGER NOT NULL,                        -- percent (0-100) or cents
  currency            CHAR(3),                                 -- required for fixed
  max_redemptions     INTEGER,
  times_redeemed      INTEGER NOT NULL DEFAULT 0,
  applies_to_plans    TEXT[],                                  -- NULL = all plans
  expires_at          TIMESTAMPTZ,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupon_redemptions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id       UUID    NOT NULL REFERENCES coupons(id),
  entity_type     entity_type NOT NULL,
  entity_id       UUID    NOT NULL,
  subscription_id UUID    REFERENCES subscriptions(id),
  redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- DOMAIN 4: CONTENT
-- Languages, keyboard layouts, lesson taxonomy, and lesson records.
-- Lessons are shared across all users — not per-user.
-- =============================================================================

CREATE TYPE script_direction AS ENUM ('ltr','rtl');
CREATE TYPE input_method     AS ENUM ('standard','ime','phonetic');
CREATE TYPE lesson_type      AS ENUM ('structured','drill','generated','test','free_text');
CREATE TYPE difficulty_band  AS ENUM ('beginner','elementary','intermediate','advanced','expert');

-- Supported languages
CREATE TABLE languages (
  code            TEXT          PRIMARY KEY,                   -- BCP-47: 'en', 'fr', 'sw', 'ar'
  name_en         TEXT          NOT NULL,
  name_native     TEXT          NOT NULL,
  script          TEXT          NOT NULL,                      -- 'latin','arabic','cyrillic','cjk'
  direction       script_direction NOT NULL DEFAULT 'ltr',
  input_method    input_method  NOT NULL DEFAULT 'standard',
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  flag_emoji      TEXT,
  display_order   SMALLINT      NOT NULL DEFAULT 0
);

-- Keyboard layout definitions
CREATE TABLE keyboard_layouts (
  id              TEXT          PRIMARY KEY,                   -- 'qwerty-us','azerty-fr','dvorak'
  name            TEXT          NOT NULL,
  language_code   TEXT          REFERENCES languages(code),    -- primary language (nullable)
  standard        TEXT          NOT NULL,                      -- 'ansi','iso','jis'
  direction       script_direction NOT NULL DEFAULT 'ltr',
  layout_map      JSONB         NOT NULL,                      -- { "KeyA": "a", "KeyQ": "q", ... }
  finger_map      JSONB         NOT NULL,                      -- { "KeyA": "left_pinky", ... }
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  display_order   SMALLINT      NOT NULL DEFAULT 0
);

-- Curriculum structure: top-level categories (e.g. "Home Row", "Numbers", "Punctuation")
CREATE TABLE lesson_categories (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT    UNIQUE NOT NULL,
  name_en         TEXT    NOT NULL,
  description_en  TEXT,
  icon            TEXT,                                        -- SVG icon name or emoji
  display_order   SMALLINT NOT NULL DEFAULT 0,
  parent_id       UUID    REFERENCES lesson_categories(id)    -- supports sub-categories
);

-- Individual lessons
CREATE TABLE lessons (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID          REFERENCES lesson_categories(id) ON DELETE SET NULL,
  language_code   TEXT          NOT NULL REFERENCES languages(code),
  layout_id       TEXT          REFERENCES keyboard_layouts(id),  -- NULL = any layout
  lesson_type     lesson_type   NOT NULL DEFAULT 'structured',
  difficulty      difficulty_band NOT NULL DEFAULT 'beginner',
  difficulty_score SMALLINT     NOT NULL DEFAULT 1
    CHECK (difficulty_score BETWEEN 1 AND 100),
  title           TEXT          NOT NULL,
  description     TEXT,
  content         TEXT          NOT NULL,                      -- the text to type
  content_word_count INTEGER    GENERATED ALWAYS AS (
                    array_length(string_to_array(trim(content), ' '), 1)
                  ) STORED,
  target_keys     TEXT[]        NOT NULL DEFAULT '{}',         -- keys this lesson drills
  target_bigrams  TEXT[]        NOT NULL DEFAULT '{}',         -- bigrams this lesson drills
  min_wpm         SMALLINT,                                    -- minimum WPM to pass (NULL = no gate)
  min_accuracy    NUMERIC(4,1), -- minimum accuracy % to pass
  estimated_minutes SMALLINT    NOT NULL DEFAULT 5,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  is_system       BOOLEAN       NOT NULL DEFAULT true,         -- false = org-generated
  org_id          UUID          REFERENCES organisations(id) ON DELETE CASCADE,  -- if org-generated
  created_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Prerequisite graph (lesson A must be completed before lesson B)
CREATE TABLE lesson_prerequisites (
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  requires_id     UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, requires_id)
);

-- Localised lesson metadata (title/description in non-English languages)
CREATE TABLE lesson_translations (
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  locale          TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  PRIMARY KEY (lesson_id, locale)
);

-- =============================================================================
-- DOMAIN 5: LEARNING
-- Typing sessions, the adaptive weakness model, progress tracking, and streaks.
-- This is the highest-volume domain by write operations.
-- =============================================================================

CREATE TYPE session_status AS ENUM ('in_progress','completed','abandoned','paused');

-- One row per typing session
CREATE TABLE typing_sessions (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID          REFERENCES lessons(id) ON DELETE SET NULL,
  language_code   TEXT          NOT NULL,
  layout_id       TEXT          NOT NULL,
  status          session_status NOT NULL DEFAULT 'in_progress',
  -- Performance metrics (NULL until completed)
  wpm_gross       NUMERIC(6,2),                                -- total keystrokes / 5 / minutes
  wpm_net         NUMERIC(6,2),                                -- minus errors
  accuracy        NUMERIC(5,2),                                -- correct / total * 100
  correct_chars   INTEGER,
  error_chars     INTEGER,
  total_chars     INTEGER,
  duration_ms     INTEGER,
  -- Lesson completion gate
  passed          BOOLEAN,                                     -- met min_wpm and min_accuracy
  xp_earned       SMALLINT      NOT NULL DEFAULT 0,
  -- Context
  is_practice     BOOLEAN       NOT NULL DEFAULT false,        -- true = not a structured lesson
  is_test         BOOLEAN       NOT NULL DEFAULT false,        -- true = counted for placement
  device_type     TEXT,
  started_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Per-key events within a session (optional high-resolution capture)
-- High volume — consider partitioning by month in production
CREATE TABLE session_key_events (
  id              BIGSERIAL     PRIMARY KEY,
  session_id      UUID          NOT NULL REFERENCES typing_sessions(id) ON DELETE CASCADE,
  seq             INTEGER       NOT NULL,                      -- keystroke sequence number
  physical_code   TEXT          NOT NULL,                      -- KeyboardEvent.code
  expected_char   TEXT          NOT NULL,
  typed_char      TEXT          NOT NULL,
  is_correct      BOOLEAN       NOT NULL,
  time_since_prev_ms INTEGER,                                  -- inter-keystroke interval
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Create initial partitions (add monthly in migration scripts)
CREATE TABLE session_key_events_2025
  PARTITION OF session_key_events
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE session_key_events_2026
  PARTITION OF session_key_events
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Current weakness model per user (upserted after every session)
CREATE TABLE user_weakness_models (
  user_id             UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language_code       TEXT    NOT NULL,
  layout_id           TEXT    NOT NULL,
  key_scores          JSONB   NOT NULL DEFAULT '{}',
  -- key_scores shape: { "KeyF": { score: 72, sessions_seen: 14, last_error_at: "..." }, ... }
  bigram_scores       JSONB   NOT NULL DEFAULT '{}',
  -- bigram_scores shape: { "th": { score: 45, avg_delay_ms: 180 }, ... }
  hesitation_scores   JSONB   NOT NULL DEFAULT '{}',
  -- hesitation_scores: keys where time_since_prev > 1.5× user median
  model_version       SMALLINT NOT NULL DEFAULT 1,
  sessions_since_update INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historical snapshots of weakness model (weekly cron job writes one row)
CREATE TABLE weakness_model_history (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language_code   TEXT    NOT NULL,
  layout_id       TEXT    NOT NULL,
  key_scores      JSONB   NOT NULL,
  bigram_scores   JSONB   NOT NULL,
  snapshot_date   DATE    NOT NULL,
  UNIQUE (user_id, language_code, layout_id, snapshot_date)
);

-- Per-lesson completion record (best scores, attempts)
CREATE TABLE user_lesson_progress (
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  attempts        SMALLINT      NOT NULL DEFAULT 0,
  best_wpm        NUMERIC(6,2),
  best_accuracy   NUMERIC(5,2),
  last_wpm        NUMERIC(6,2),
  last_accuracy   NUMERIC(5,2),
  passed          BOOLEAN       NOT NULL DEFAULT false,
  first_passed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- Aggregate progress summary (denormalised for fast dashboard queries)
CREATE TABLE user_progress (
  user_id               UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_sessions        INTEGER NOT NULL DEFAULT 0,
  total_time_ms         BIGINT  NOT NULL DEFAULT 0,
  lessons_completed     INTEGER NOT NULL DEFAULT 0,
  lessons_passed        INTEGER NOT NULL DEFAULT 0,
  total_xp              INTEGER NOT NULL DEFAULT 0,
  current_level         SMALLINT NOT NULL DEFAULT 1,
  -- Rolling averages (last 30 days)
  avg_wpm_30d           NUMERIC(6,2),
  avg_accuracy_30d      NUMERIC(5,2),
  -- All-time peaks
  peak_wpm              NUMERIC(6,2),
  peak_accuracy         NUMERIC(5,2),
  peak_wpm_at           TIMESTAMPTZ,
  -- Current language / layout focus
  primary_language      TEXT,
  primary_layout        TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Streak tracking (per user per language — you can have parallel streaks)
CREATE TABLE user_streaks (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language_code       TEXT    NOT NULL,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_session_date   DATE,
  streak_started_at   DATE,
  freeze_credits      SMALLINT NOT NULL DEFAULT 0,             -- "streak freeze" tokens
  freeze_used_at      DATE,
  UNIQUE (user_id, language_code)
);

-- Daily practice goals (configurable per user)
CREATE TABLE daily_goals (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_date       DATE    NOT NULL,
  target_minutes  SMALLINT NOT NULL DEFAULT 10,
  target_sessions SMALLINT NOT NULL DEFAULT 1,
  target_wpm      NUMERIC(6,2),
  minutes_done    SMALLINT NOT NULL DEFAULT 0,
  sessions_done   SMALLINT NOT NULL DEFAULT 0,
  achieved        BOOLEAN NOT NULL DEFAULT false,
  achieved_at     TIMESTAMPTZ,
  UNIQUE (user_id, goal_date)
);

-- SM-2 Spaced Repetition scheduler state per user per lesson
CREATE TABLE lesson_repetitions (
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  easiness        NUMERIC(4,2)  NOT NULL DEFAULT 2.5,          -- SM-2 E-factor
  interval_days   SMALLINT      NOT NULL DEFAULT 1,
  repetitions     SMALLINT      NOT NULL DEFAULT 0,
  next_review_at  DATE          NOT NULL DEFAULT CURRENT_DATE,
  last_quality    SMALLINT,                                    -- SM-2 quality 0-5
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- =============================================================================
-- DOMAIN 6: GAMIFICATION
-- XP ledger, achievements, and leaderboards.
-- =============================================================================

-- Append-only XP transaction log (source of truth for total XP)
CREATE TABLE xp_transactions (
  id              BIGSERIAL   PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          SMALLINT    NOT NULL,                        -- positive = earned, negative = penalty
  reason          TEXT        NOT NULL,                        -- 'lesson_complete','streak_bonus',...
  session_id      UUID        REFERENCES typing_sessions(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievement definitions (seeded)
CREATE TABLE achievements (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT    UNIQUE NOT NULL,
  name_en         TEXT    NOT NULL,
  description_en  TEXT    NOT NULL,
  icon            TEXT    NOT NULL,
  category        TEXT    NOT NULL,                            -- 'speed','accuracy','streak',...
  xp_reward       SMALLINT NOT NULL DEFAULT 0,
  condition_type  TEXT    NOT NULL,                            -- 'wpm_reached','streak_days',...
  condition_value INTEGER NOT NULL,
  is_hidden       BOOLEAN NOT NULL DEFAULT false,              -- hidden until unlocked
  display_order   SMALLINT NOT NULL DEFAULT 0
);

-- Earned achievements per user
CREATE TABLE user_achievements (
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id  UUID    NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id      UUID    REFERENCES typing_sessions(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, achievement_id)
);

-- Leaderboard entries (materialised/cached, refreshed by scheduled job)
CREATE TABLE leaderboard_entries (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  scope           TEXT    NOT NULL,           -- 'global','org','class','country'
  scope_id        TEXT,                       -- org_id/class_id/country_code, NULL for global
  period          TEXT    NOT NULL,           -- 'daily','weekly','monthly','all_time'
  period_key      TEXT    NOT NULL,           -- e.g. '2025-W22', '2025-06'
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank            INTEGER NOT NULL,
  wpm             NUMERIC(6,2),
  accuracy        NUMERIC(5,2),
  xp              INTEGER,
  sessions        INTEGER,
  display_name    TEXT    NOT NULL,           -- denormalised to avoid join
  avatar_url      TEXT,
  refreshed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_id, period, period_key, user_id)
);

-- =============================================================================
-- DOMAIN 7: COMPLIANCE, AUDIT & NOTIFICATIONS
-- GDPR, FERPA, COPPA requirements.
-- Full audit trail and data subject request management.
-- =============================================================================

CREATE TYPE consent_type   AS ENUM ('terms_of_service','privacy_policy','marketing','cookies','coppa_parental');
CREATE TYPE dsr_type       AS ENUM ('access','deletion','rectification','portability','restriction');
CREATE TYPE dsr_status     AS ENUM ('received','in_progress','completed','rejected');
CREATE TYPE audit_action   AS ENUM (
  'user_created','user_updated','user_deleted',
  'org_created','org_updated',
  'member_added','member_removed',
  'subscription_created','subscription_cancelled',
  'login','logout','password_changed',
  'data_export_requested','data_deleted'
);

-- Explicit consent records (immutable — new row per consent version)
CREATE TABLE consent_records (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          REFERENCES users(id) ON DELETE SET NULL,
  consent_type    consent_type  NOT NULL,
  version         TEXT          NOT NULL,                      -- policy version string
  consented       BOOLEAN       NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  granted_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- GDPR / FERPA Data Subject Requests
CREATE TABLE data_subject_requests (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          REFERENCES users(id) ON DELETE SET NULL,
  email           CITEXT        NOT NULL,                      -- in case user is deleted
  request_type    dsr_type      NOT NULL,
  status          dsr_status    NOT NULL DEFAULT 'received',
  notes           TEXT,
  assigned_to     UUID          REFERENCES users(id) ON DELETE SET NULL,
  due_by          TIMESTAMPTZ   NOT NULL DEFAULT now() + INTERVAL '30 days',
  completed_at    TIMESTAMPTZ,
  export_url      TEXT,                                        -- signed R2 URL for data export
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Immutable audit log (append only — no updates or deletes)
CREATE TABLE audit_logs (
  id              BIGSERIAL     PRIMARY KEY,
  action          audit_action  NOT NULL,
  actor_id        UUID,                                        -- user who performed action
  actor_type      TEXT,                                        -- 'user','system','webhook'
  target_type     TEXT,                                        -- 'user','org','subscription'...
  target_id       UUID,
  org_id          UUID,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB         NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2025
  PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026
  PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Notification queue (processed by Cloudflare Queue consumer)
CREATE TYPE notif_channel  AS ENUM ('email','push','in_app');
CREATE TYPE notif_status   AS ENUM ('pending','sent','failed','skipped');

CREATE TABLE notification_queue (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel         notif_channel NOT NULL,
  template_slug   TEXT          NOT NULL,                      -- 'streak_reminder','week_report'
  payload         JSONB         NOT NULL DEFAULT '{}',
  status          notif_status  NOT NULL DEFAULT 'pending',
  attempts        SMALLINT      NOT NULL DEFAULT 0,
  last_error      TEXT,
  scheduled_for   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Email send log (for deduplication and compliance)
CREATE TABLE email_log (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    REFERENCES users(id) ON DELETE SET NULL,
  to_email        CITEXT  NOT NULL,
  template_slug   TEXT    NOT NULL,
  resend_id       TEXT    UNIQUE,                              -- Resend message ID
  status          TEXT,
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- Performance-critical queries identified and pre-indexed.
-- =============================================================================

-- Users
CREATE INDEX idx_users_clerk_id       ON users(clerk_id);
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_home_region    ON users(home_region);
CREATE INDEX idx_users_status         ON users(status) WHERE status != 'deleted';
CREATE INDEX idx_users_is_minor       ON users(is_minor) WHERE is_minor = true;

-- Org members — fast lookup of all orgs a user belongs to
CREATE INDEX idx_org_members_user_id  ON org_members(user_id);
CREATE INDEX idx_org_members_org_id   ON org_members(org_id);
CREATE INDEX idx_org_members_status   ON org_members(status);

-- Class members
CREATE INDEX idx_class_members_user_id ON class_members(user_id);

-- Subscriptions — frequent lookup by entity
CREATE INDEX idx_subscriptions_entity ON subscriptions(entity_type, entity_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe  ON subscriptions(stripe_subscription_id);

-- Subscription seats — check if user has seat
CREATE INDEX idx_seats_user_id        ON subscription_seats(user_id) WHERE revoked_at IS NULL;

-- Invoices
CREATE INDEX idx_invoices_entity      ON invoices(entity_type, entity_id);
CREATE INDEX idx_invoices_stripe      ON invoices(stripe_invoice_id);

-- Lessons
CREATE INDEX idx_lessons_language     ON lessons(language_code);
CREATE INDEX idx_lessons_layout       ON lessons(layout_id);
CREATE INDEX idx_lessons_difficulty   ON lessons(difficulty_score);
CREATE INDEX idx_lessons_active       ON lessons(is_active) WHERE is_active = true;
CREATE INDEX idx_lessons_org          ON lessons(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX idx_lessons_target_keys  ON lessons USING GIN(target_keys);
CREATE INDEX idx_lessons_content_trgm ON lessons USING GIN(content gin_trgm_ops);

-- Typing sessions — most frequent write target
CREATE INDEX idx_sessions_user_id     ON typing_sessions(user_id);
CREATE INDEX idx_sessions_lesson_id   ON typing_sessions(lesson_id);
CREATE INDEX idx_sessions_started_at  ON typing_sessions(started_at DESC);
CREATE INDEX idx_sessions_user_date   ON typing_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_completed   ON typing_sessions(status) WHERE status = 'completed';

-- Weakness model
CREATE INDEX idx_weakness_updated     ON user_weakness_models(updated_at DESC);

-- Lesson progress
CREATE INDEX idx_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_passed ON user_lesson_progress(user_id, passed);

-- Leaderboards
CREATE INDEX idx_leaderboard_scope    ON leaderboard_entries(scope, scope_id, period, period_key);
CREATE INDEX idx_leaderboard_user     ON leaderboard_entries(user_id);

-- Streaks
CREATE INDEX idx_streaks_user         ON user_streaks(user_id);

-- XP transactions
CREATE INDEX idx_xp_user_id           ON xp_transactions(user_id);
CREATE INDEX idx_xp_created_at        ON xp_transactions(created_at DESC);

-- Audit log
CREATE INDEX idx_audit_actor          ON audit_logs(actor_id);
CREATE INDEX idx_audit_target         ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_org            ON audit_logs(org_id);

-- Notifications
CREATE INDEX idx_notif_user_pending   ON notification_queue(user_id, status)
  WHERE status = 'pending';
CREATE INDEX idx_notif_scheduled      ON notification_queue(scheduled_for)
  WHERE status = 'pending';

-- Key events (already partitioned, but index within partition)
CREATE INDEX idx_key_events_session   ON session_key_events(session_id);

-- Consent
CREATE INDEX idx_consent_user         ON consent_records(user_id);

-- DSR
CREATE INDEX idx_dsr_user             ON data_subject_requests(user_id);
CREATE INDEX idx_dsr_status           ON data_subject_requests(status)
  WHERE status NOT IN ('completed','rejected');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at on any table that has it
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Apply trigger to all relevant tables
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN VALUES
    ('users'),('user_profiles'),('user_preferences'),
    ('organisations'),('org_members'),('org_classes'),('org_settings'),
    ('plans'),('subscriptions'),('user_progress'),('user_weakness_models'),
    ('data_subject_requests'),('notification_queue')
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
  END LOOP;
END;
$$;

-- Helper: resolve whether a user currently has an active subscription
-- (either direct individual subscription, or via org seat)
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    -- Direct individual subscription
    SELECT 1 FROM subscriptions
    WHERE entity_type = 'user'
      AND entity_id = p_user_id
      AND status IN ('trialing','active')
    UNION ALL
    -- Via org seat
    SELECT 1 FROM subscription_seats ss
    JOIN subscriptions s ON s.id = ss.subscription_id
    WHERE ss.user_id = p_user_id
      AND ss.revoked_at IS NULL
      AND s.status IN ('trialing','active')
  );
$$;

-- Helper: get a user's effective plan slug
CREATE OR REPLACE FUNCTION user_effective_plan(p_user_id UUID)
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT p.slug FROM plans p
  JOIN subscriptions s ON s.plan_id = p.id
  WHERE s.entity_type = 'user'
    AND s.entity_id = p_user_id
    AND s.status IN ('trialing','active')
  UNION ALL
  SELECT p.slug FROM plans p
  JOIN subscriptions s ON s.plan_id = p.id
  JOIN subscription_seats ss ON ss.subscription_id = s.id
  WHERE ss.user_id = p_user_id
    AND ss.revoked_at IS NULL
    AND s.status IN ('trialing','active')
  ORDER BY 1 DESC
  LIMIT 1;
$$;

-- =============================================================================
-- SEED: PLANS
-- =============================================================================

INSERT INTO plans (id, name, slug, plan_type, interval, price_usd_cents, price_eur_cents, included_seats, features, display_order)
VALUES
  (gen_random_uuid(), 'Free',         'free',         'free',         NULL,       0,    0,    1,
    '{"languages":3,"layouts":5,"history_days":14,"leaderboard":true,"adaptive":true}', 1),

  (gen_random_uuid(), 'Pro Monthly',  'pro-monthly',  'individual',   'monthly',  999,  899,  1,
    '{"languages":-1,"layouts":-1,"history_days":-1,"leaderboard":true,"adaptive":true,"offline":true,"analytics":"full"}', 2),

  (gen_random_uuid(), 'Pro Annual',   'pro-annual',   'individual',   'annual',   8900, 7900, 1,
    '{"languages":-1,"layouts":-1,"history_days":-1,"leaderboard":true,"adaptive":true,"offline":true,"analytics":"full","badge":"annual"}', 3),

  (gen_random_uuid(), 'Institution',  'institution',  'org_seat',     'annual',   400,  360,  NULL,
    '{"languages":-1,"layouts":-1,"history_days":-1,"leaderboard":true,"adaptive":true,"teacher_dashboard":true,"csv_reports":true,"sso":true,"coppa":true,"min_seats":10}', 4);

-- =============================================================================
-- SEED: LANGUAGES
-- =============================================================================

INSERT INTO languages (code, name_en, name_native, script, direction, input_method, flag_emoji, display_order)
VALUES
  ('en',    'English',   'English',    'latin',    'ltr', 'standard', '🇬🇧', 1),
  ('fr',    'French',    'Français',   'latin',    'ltr', 'standard', '🇫🇷', 2),
  ('de',    'German',    'Deutsch',    'latin',    'ltr', 'standard', '🇩🇪', 3),
  ('es',    'Spanish',   'Español',    'latin',    'ltr', 'standard', '🇪🇸', 4),
  ('pt',    'Portuguese','Português',  'latin',    'ltr', 'standard', '🇵🇹', 5),
  ('it',    'Italian',   'Italiano',   'latin',    'ltr', 'standard', '🇮🇹', 6),
  ('nl',    'Dutch',     'Nederlands', 'latin',    'ltr', 'standard', '🇳🇱', 7),
  ('pl',    'Polish',    'Polski',     'latin',    'ltr', 'standard', '🇵🇱', 8),
  ('sw',    'Swahili',   'Kiswahili',  'latin',    'ltr', 'standard', '🇰🇪', 9),
  ('ar',    'Arabic',    'العربية',    'arabic',   'rtl', 'standard', '🇸🇦', 10),
  ('ru',    'Russian',   'Русский',    'cyrillic', 'ltr', 'standard', '🇷🇺', 11),
  ('ja',    'Japanese',  '日本語',      'cjk',      'ltr', 'ime',      '🇯🇵', 12),
  ('zh',    'Chinese',   '中文',        'cjk',      'ltr', 'ime',      '🇨🇳', 13),
  ('hi',    'Hindi',     'हिन्दी',       'devanagari','ltr','phonetic', '🇮🇳', 14),
  ('tr',    'Turkish',   'Türkçe',     'latin',    'ltr', 'standard', '🇹🇷', 15);

-- =============================================================================
-- SEED: KEYBOARD LAYOUTS (abbreviated — full layout_map loaded from JSON files)
-- =============================================================================

INSERT INTO keyboard_layouts (id, name, language_code, standard, direction, layout_map, finger_map)
VALUES
  ('qwerty-us', 'QWERTY US',    'en', 'ansi', 'ltr', '{}', '{}'),
  ('qwerty-uk', 'QWERTY UK',    'en', 'iso',  'ltr', '{}', '{}'),
  ('azerty-fr', 'AZERTY FR',    'fr', 'iso',  'ltr', '{}', '{}'),
  ('qwertz-de', 'QWERTZ DE',    'de', 'iso',  'ltr', '{}', '{}'),
  ('qwerty-es', 'QWERTY ES',    'es', 'iso',  'ltr', '{}', '{}'),
  ('dvorak',    'Dvorak',       NULL, 'ansi', 'ltr', '{}', '{}'),
  ('colemak',   'Colemak',      NULL, 'ansi', 'ltr', '{}', '{}'),
  ('colemak-dh','Colemak-DH',   NULL, 'ansi', 'ltr', '{}', '{}'),
  ('workman',   'Workman',      NULL, 'ansi', 'ltr', '{}', '{}'),
  ('qwerty-ru', 'Russian QWERTY','ru','iso',  'ltr', '{}', '{}'),
  ('arabic-std','Arabic Standard','ar','iso', 'rtl', '{}', '{}'),
  ('jis',       'JIS Japanese', 'ja', 'jis',  'ltr', '{}', '{}');

-- Note: layout_map and finger_map JSON loaded from packages/layouts/*.json at migration time
-- via: UPDATE keyboard_layouts SET layout_map = $file::jsonb WHERE id = $id;

---

## Part 4 — Kimi Code Multi-Agent Strategy

The application is decomposed into 8 independent agents running in parallel tracks. Each agent owns a bounded domain with a clear interface contract. Agents communicate only through the shared `packages/` layer — never directly.

### Agent Assignment Map

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT 1           AGENT 2           AGENT 3                │
│  Infrastructure    Auth + Billing    Database Schema         │
│  & DevOps          (Clerk + Stripe)  (Drizzle + Migrations)  │
│                                                              │
│  AGENT 4           AGENT 5           AGENT 6                │
│  Typing Engine     Curriculum +      UI Component            │
│  (browser-local)   Adaptive AI       Library (Svelte)        │
│                                                              │
│  AGENT 7           AGENT 8                                   │
│  API Layer         Frontend App                              │
│  (Hono Workers)    (SvelteKit)                               │
└─────────────────────────────────────────────────────────────┘
```

### Agent 1 — Infrastructure & DevOps

**Owns:** `infra/`, `.github/workflows/`, `wrangler.toml`, CI/CD  
**Deliverables:**
- VPS provisioning scripts (Hetzner EU/US, Vultr AF)
- PgBouncer configuration per region
- Cloudflare Hyperdrive bindings
- GitHub Actions: lint → test → build → deploy to Pages/Workers
- Backup cron scripts
- Environment variable management (Cloudflare secrets)
- Sentry DSN wiring

**Prompt template for Kimi:**
```
You are Agent 1 - Infrastructure. Your scope is strictly:
- /infra/** directories
- wrangler.toml configuration
- .github/workflows/** CI/CD pipelines
- Shell scripts for VPS setup

Do NOT touch application code. Export only:
- Named Hyperdrive bindings (HYPERDRIVE_EU, HYPERDRIVE_US, HYPERDRIVE_AF)
- Named Queue binding (JOBS)
- Named R2 binding (ASSETS)

Reference: infra/contracts/bindings.ts for the binding interface.
```

---

### Agent 2 — Auth & Billing

**Owns:** `packages/auth/`, Clerk configuration, Stripe integration  
**Deliverables:**
- Clerk SvelteKit middleware setup
- Custom session claims (region, role, org_id)
- COPPA parental consent flow (under-13 accounts)
- Google Workspace SSO configuration guide
- Stripe: individual plans (monthly/annual), org seat licensing
- Webhook handler: Stripe events → subscription table updates
- Billing portal redirect

**Prompt template:**
```
You are Agent 2 - Auth & Billing. Your scope:
- packages/auth/ — Clerk helpers, session utilities
- apps/api/src/routes/billing.ts — Stripe webhooks
- apps/api/src/middleware/auth.ts — Clerk JWT validation middleware
- apps/web/src/routes/+layout.server.ts — Clerk SvelteKit server layout

Output the user's home_region in the JWT as a custom claim.
Region logic: EU = European country codes, AF = African country codes, US = default.
Expose a typed getCurrentUser(event) helper that all other routes use.
Do NOT touch database schema or UI components.
```

---

### Agent 3 — Database Schema & Migrations

**Owns:** `packages/db/`  
**Deliverables:**
- Full Drizzle schema (all tables per Part 3 above)
- Migration files for each region
- Typed query helpers (select user, upsert session, update weakness model)
- Seed data: starter lessons in EN, FR, ES, SW, AR
- DB health check endpoint

**Prompt template:**
```
You are Agent 3 - Database. Your scope is strictly packages/db/.
Use Drizzle ORM with the postgres-js driver.
Schema must exactly match the tables in DEVELOPMENT_PLAN.md Part 3.
Export:
- db(hyperdrive: Hyperdrive) factory function
- All table schemas with Zod inference types
- Query helpers: getUser, upsertSession, updateWeaknessModel, getUserProgress
Do NOT write API routes or UI. Other agents import from @typeforge/db.
```

---

### Agent 4 — Typing Engine (Browser-Local)

**Owns:** `packages/metrics/`  
**Deliverables:**
- `KeyboardLayoutRegistry` — loads layout JSON, maps `code` → `char`
- `IMEHandler` — compositionstart/end event manager for CJK input
- `RTLHandler` — right-to-left text direction manager
- `CharComparator` — Unicode-normalised comparison (NFC)
- `WPMCalculator` — real-time WPM (net and gross), updated on each keystroke
- `AccuracyTracker` — per-key error rates, bigram error detection
- `HesitationDetector` — flags keys where time-before-press > 1.5× median
- `SessionRecorder` — assembles final session payload for API submission
- Layout JSON files: QWERTY-US, QWERTY-UK, AZERTY-FR, QWERTZ-DE, Dvorak, Colemak, Russian, Arabic, Swahili-extended

**Prompt template:**
```
You are Agent 4 - Typing Engine. Your scope is packages/metrics/.
This code runs ENTIRELY in the browser — no server calls.
Critical rules:
1. Never call fetch() — this is a pure computation package
2. Use KeyboardEvent.code (physical key), NOT .key (OS layout output)
3. Handle compositionstart/compositionend for IME (CJK)
4. Unicode normalise all comparisons with String.prototype.normalize('NFC')
5. Export a typed SessionPayload interface that Agent 7 (API) will consume
6. All functions must be pure and unit-testable with Vitest
Output types are consumed by @typeforge/curriculum and apps/web.
```

---

### Agent 5 — Curriculum & Adaptive Engine

**Owns:** `packages/curriculum/`  
**Deliverables:**
- `WeaknessModel` — scores per key + bigram with exponential recency decay
- `SM2Scheduler` — spaced repetition scheduler (SM-2 variant)
- `LessonSelector` — picks next lesson from corpus based on weakness scores
- `DrillGenerator` — procedurally generates key-targeted drill text from wordlist
- `ProgressionEngine` — XP awards, streak logic, difficulty advancement
- Language wordlists: EN, FR, ES, SW, AR (min 5000 words each, filtered by key frequency)
- Lesson corpus: 20 structured lessons per language (beginner → advanced)

**Prompt template:**
```
You are Agent 5 - Curriculum & Adaptive Learning. Scope: packages/curriculum/.
Core algorithm: SM-2 spaced repetition adapted for key-level weakness tracking.
WeaknessModel stores a score 0-100 per key (100 = very weak).
Score update formula: new_score = (old_score * 0.8) + (session_error_rate * 0.2)
(recency-weighted exponential decay — recent sessions count more)
SM2Scheduler outputs: next_review_session_count for each key.
LessonSelector: selects lesson from corpus maximising coverage of top-5 weak keys.
DrillGenerator: given weak_keys[], returns a 60-word text with ≥40% occurrence of those keys.
Expose: getNextLesson(userId, weaknessModel, completedLessonIds) → Lesson
Do NOT write API routes. Agent 7 calls these functions server-side.
```

---

### Agent 6 — UI Component Library

**Owns:** `packages/ui/`  
**Deliverables:**
- `Keyboard.svelte` — interactive SVG keyboard, parameterised by layout, highlights active/error keys, finger zone colour coding
- `TypingInput.svelte` — lesson text display with cursor, character state colouring (correct/error/pending), RTL support
- `MetricsBar.svelte` — real-time WPM, accuracy, streak counter
- `ProgressRing.svelte` — animated SVG ring for streaks and daily goals
- `LessonCard.svelte` — curriculum card with difficulty badge and completion state
- `EncouragementToast.svelte` — milestone notification (10-streak, PB WPM)
- `ConfettiCelebration.svelte` — lesson completion celebration
- `OrgDashboard.svelte` — teacher view: class table, per-student WPM trends
- `ThemeProvider.svelte` — CSS custom property injection, 5 themes
- Design tokens: typography scale, spacing, colour palette, animation presets

**Prompt template:**
```
You are Agent 6 - UI Components. Scope: packages/ui/.
Use Svelte 5 runes syntax ($state, $derived, $effect).
All components must:
- Be fully typed with TypeScript props interfaces
- Support dark and light themes via CSS custom properties
- Be accessible (ARIA labels, keyboard navigation)
- Emit typed CustomEvents for parent communication (never call fetch)
Keyboard.svelte must accept: layout (LayoutMap), activeKey (string|null), errorKey (string|null)
TypingInput.svelte must accept: lesson (Lesson), onKeystroke (callback), direction ('ltr'|'rtl')
Do NOT fetch data. Components receive data via props and emit events upward.
```

---

### Agent 7 — API Layer (Hono Workers)

**Owns:** `apps/api/`  
**Deliverables:**
- Regional routing middleware (reads JWT region claim → selects Hyperdrive binding)
- `POST /sessions` — validates and stores completed session payload
- `GET /users/:id/next-lesson` — calls curriculum engine, returns next lesson
- `GET /users/:id/progress` — returns progress, streak, XP
- `GET /users/:id/weakness` — returns weakness model
- `GET /lessons` — paginated lesson list with filters
- `POST /organisations` — create school org
- `GET /organisations/:id/report` — class-level aggregate stats
- `POST /billing/webhook` — Stripe webhook handler
- Input validation: Zod on all routes
- Rate limiting: Cloudflare rate limiting rules

**Prompt template:**
```
You are Agent 7 - API. Scope: apps/api/.
Framework: Hono 4 on Cloudflare Workers runtime.
Regional routing: middleware reads c.get('user').home_region → binds correct Hyperdrive.
Import from: @typeforge/db (database), @typeforge/curriculum (lesson logic).
Auth: all routes protected via Clerk JWT middleware EXCEPT /billing/webhook.
Pattern:
  const user = await getCurrentUser(c)                    // from packages/auth
  const db = getDb(env[`HYPERDRIVE_${user.region}`])      // regional Hyperdrive
  const result = await queryHelper(db, ...)
Return typed JSON. Use Hono's typed RPC for client generation.
Do NOT write UI. apps/web imports the generated RPC client.
```

---

### Agent 8 — Frontend Application (SvelteKit)

**Owns:** `apps/web/`  
**Deliverables:**
- Route structure (see Part 5 below)
- Typing session page — wires packages/metrics engine to packages/ui components
- Curriculum browser — lesson cards, difficulty filter, language selector
- Dashboard — streak widget, XP progress, WPM history chart
- Teacher portal — class overview, student drill-down
- Settings — layout selector, language preference, theme
- Onboarding flow — placement test → initial weakness model
- PWA manifest — offline support for in-progress lessons

**Prompt template:**
```
You are Agent 8 - Frontend. Scope: apps/web/.
Framework: SvelteKit 2 with Svelte 5 runes.
Import UI from @typeforge/ui, typing engine from @typeforge/metrics.
API calls: use the typed Hono RPC client from apps/api/src/client.ts.
Auth: use Clerk SvelteKit hooks from packages/auth.
Typing session page rules:
- All keystroke processing is synchronous, in-browser (no fetch on keydown)
- Only call API on lesson completion (POST /sessions with final SessionPayload)
- IME mode detected from user language preference — conditionally mount IMEHandler
- RTL mode activated when language.script === 'arabic' or 'hebrew'
Routing: /learn, /practice, /progress, /org/:id, /settings, /onboarding
```

---

## Part 5 — Route Structure (apps/web)

Routes marked ✅ are implemented. Routes marked ⬜ are planned but not yet created.

```
✅ /                          Landing/marketing page (apps/web/src/routes/(app)/+page.svelte)
⬜ /auth/sign-in              Clerk hosted UI
⬜ /auth/sign-up              Clerk hosted UI + region detection
✅ /onboarding                Placement test (first login)

✅ /learn                     Curriculum browser
✅ /learn/[lessonId]          Active typing session
⬜ /learn/[lessonId]/complete  Completion screen + next lesson

✅ /practice                  Free practice mode (no lesson)
⬜ /drills                    Targeted weak-key drills

✅ /progress                  Personal dashboard
⬜ /progress/history          Session history + WPM chart

⬜ /org/[orgId]               Teacher dashboard (role-gated)
⬜ /org/[orgId]/students      Student roster + progress
⬜ /org/[orgId]/student/[uid] Individual student drill-down
⬜ /org/[orgId]/reports       Exportable CSV reports

✅ /settings                  Layout, language, theme, account
✅ /billing                   Plan selection, Stripe portal

⬜ /blog                      SEO content (SSR) — Phase 6+
⬜ /[lang]                    i18n prefix for non-EN routes — Phase 6+
```

---

## Part 6 — Development Phases & Timeline

### Phase 0 — Foundation (Weeks 1–2)
**Agents running:** 1, 2, 3 (parallel)

| Task | Agent | Output |
|---|---|---|
| Monorepo scaffold | 1 | turbo.json, pnpm workspace |
| VPS provisioning | 1 | 3 Postgres instances live |
| PgBouncer config | 1 | Connection pooling on all 3 |
| Hyperdrive bindings | 1 | wrangler.toml bindings |
| CI/CD pipeline | 1 | GitHub Actions deploy on push |
| Clerk project setup | 2 | Auth working locally |
| Custom JWT claims | 2 | Region + role in token |
| Drizzle schema | 3 | All tables, typed exports |
| Migration scripts | 3 | Run against all 3 DBs |
| Seed data | 3 | EN starter lessons |

**Phase 0 exit criteria:** `pnpm dev` starts, auth works, DB queries return data.

---

### Phase 1 — Core Engine (Weeks 3–6)
**Agents running:** 4, 5, 6 (parallel)

| Task | Agent | Output |
|---|---|---|
| KeyboardLayoutRegistry | 4 | 10 layout JSON maps |
| WPMCalculator | 4 | Real-time WPM, unit tested |
| AccuracyTracker | 4 | Per-key error rates |
| HesitationDetector | 4 | Bigram timing analysis |
| IMEHandler | 4 | CJK composition events |
| WeaknessModel | 5 | Score computation + decay |
| SM2Scheduler | 5 | Per-key review intervals |
| LessonSelector | 5 | Weakness-driven lesson pick |
| DrillGenerator | 5 | Procedural drill text |
| EN wordlist (5K) | 5 | Frequency-sorted corpus |
| TypingArea.svelte | 6 | RTL + cursor + char states |
| KeyboardVisual.svelte | 6 | SVG keyboard, finger zones |
| MetricsBar.svelte | 6 | Real-time stats display |

**Phase 1 exit criteria:** Typing session works end-to-end in isolation, WPM is accurate, keyboard highlights correctly.

---

### Phase 2 — API + Connected App (Weeks 7–10)
**Agents running:** 7, 8 (parallel, consuming Phase 1 outputs)

| Task | Agent | Output |
|---|---|---|
| Regional routing middleware | 7 | DB routing by region |
| Session POST endpoint | 7 | Stores completed session |
| Next lesson endpoint | 7 | Curriculum-driven response |
| Progress endpoints | 7 | XP, streak, history |
| Hono RPC client generation | 7 | Typed client for frontend |
| Onboarding flow | 8 | Placement test → weakness seed |
| /learn/[lessonId] page | 8 | Full session wired to engine |
| /progress dashboard | 8 | WPM history, streak ring |
| /learn curriculum page | 8 | Lesson browser |
| Layout + language settings | 8 | Persisted to DB |

**Phase 2 exit criteria:** Full lesson flow works — login, pick lesson, type, submit, see progress update.

---

### Phase 3 — Multilingual + Adaptive (Weeks 11–14)

| Task | Agent | Output |
|---|---|---|
| FR, ES, SW, AR wordlists | 5 | 5K words each |
| AR lesson corpus | 5 | RTL lessons |
| AZERTY, QWERTZ, Russian layouts | 4 | Layout JSON |
| Arabic layout + IME | 4 | RTL + Arabic keyboard |
| RTL UI wiring | 8 | dir="rtl" on TypingArea |
| Language selector | 8 | Persisted preference |
| Adaptive drill page | 8 | /drills with weakness display |
| Encouragement system | 6 | Milestone toasts |
| Confetti on completion | 6 | Celebration component |

**Phase 3 exit criteria:** French lesson on AZERTY keyboard works. Arabic RTL lesson works. Weakness model drives drill selection.

---

### Phase 4 — Institutional Features (Weeks 15–18)

| Task | Agent | Output |
|---|---|---|
| Org creation flow | 8 | School signup |
| Teacher dashboard | 6, 8 | Class view, student list |
| Student progress reports | 7 | Aggregate endpoint |
| CSV export | 7 | `/org/:id/reports` |
| Stripe individual plans | 2 | Monthly/annual billing |
| Stripe org seat licensing | 2 | Per-seat school plans |
| Billing portal | 8 | Stripe customer portal |
| Google Workspace SSO | 2 | SAML/OIDC for schools |
| COPPA under-13 flow | 2 | Parental consent |

**Phase 4 exit criteria:** A school admin can create an org, invite students, see class progress, and pay for a seat licence.

---

### Phase 5 — Polish & Launch (Weeks 19–22)

| Task | Notes |
|---|---|
| SEO-optimised marketing pages | /blog, language landing pages |
| PWA manifest | Offline lesson caching |
| Performance audit | Lighthouse >95 on all routes |
| Accessibility audit | WCAG 2.1 AA |
| Penetration test | Auth, API, data residency |
| Load test | 1000 concurrent sessions |
| GDPR privacy policy | Per-region (EU, US, AF) |
| Terms of service | Consumer + institutional versions |
| App Store listing | PWA → iOS/Android if desired |
| Beta programme | 3 schools, 50 individual testers |
| Soft launch | Invite-only, monitor errors |
| Public launch | Remove invite gate |

---

## Part 7 — Testing Strategy

### Unit Tests (Vitest — per package)
- `packages/metrics`: WPM calculation accuracy, bigram detection, IME handling
- `packages/curriculum`: SM-2 interval correctness, weakness score decay
- `packages/db`: Query helpers return correct types

### Integration Tests (Vitest + test DB)
- Full session flow: POST /sessions → weakness model update
- Regional routing: EU JWT → EU DB, US JWT → US DB
- Lesson selection: weakness model → correct lesson chosen

### E2E Tests (Playwright)
- Onboarding → first lesson → completion → progress shown
- Teacher creates org → invites student → student completes lesson → teacher sees progress
- Billing: individual subscribes → plan activates → student gets access

### Load Tests (k6)
```javascript
// Simulate 1000 concurrent typing sessions
// Each session: 1 GET /next-lesson + 1 POST /sessions every 5 minutes
// Target: p95 latency < 200ms on POST /sessions
```

---

## Part 8 — Environment Variables

```bash
# Cloudflare Workers (wrangler secret put)
CLERK_SECRET_KEY=sk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...

# SvelteKit (public — .env)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
PUBLIC_APP_URL=https://typeforge.app
```

---

## Part 9 — Cost Projection

| Stage | Monthly Infrastructure Cost |
|---|---|
| Development (1 region, shared) | ~€9 (1 Hetzner VPS) |
| Beta (all 3 regions, no scale) | ~€35 |
| Launch (<1K MAU) | ~€40 (add Clerk $25 if >10K) |
| Growth (10K MAU) | ~€110 (VPS upgrades + Clerk) |
| Scale (100K MAU) | ~€580 (larger VPS + Redis paid) |

---

## Part 10 — Launch Checklist

### Technical
- [ ] All 3 Postgres instances live with daily backups to R2
- [ ] Hyperdrive bindings verified in Workers dashboard
- [ ] Clerk production instance (not dev)
- [ ] Stripe live keys (not test)
- [ ] Sentry error tracking receiving events
- [ ] Cloudflare Analytics configured
- [ ] DNS pointed to Cloudflare Pages
- [ ] Custom domain SSL verified
- [ ] Rate limiting rules on all API routes
- [ ] All environment variables in production

### Legal
- [ ] Privacy Policy (GDPR, FERPA, POPIA, Kenya DPA)
- [ ] Terms of Service
- [ ] Cookie banner (EU users)
- [ ] Data Processing Agreement template (for schools)
- [ ] COPPA parental consent workflow

### Content
- [ ] 20 structured lessons per language (EN, FR, ES)
- [ ] Keyboard layouts: QWERTY-US, AZERTY-FR, QWERTZ-DE, Dvorak, Russian
- [ ] Onboarding placement test
- [ ] Help documentation
- [ ] Marketing landing page live

---

*Document version: 1.0 — generated for TypeForge pre-development planning*
