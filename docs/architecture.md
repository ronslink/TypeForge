# TypeForge Architecture

## Overview

TypeForge is a multilingual adaptive typing learning platform built with a modern, edge-first architecture. The system is designed for global scale with regional data residency compliance (GDPR, etc.).

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | SvelteKit 2.x | SSR/SSG web application |
| API | Hono 4.x | Edge runtime API on Cloudflare Workers |
| Database | PostgreSQL 17 | Regional data storage |
| ORM | Drizzle 0.30.x | Type-safe database access |
| Auth | Clerk 5.x | Authentication & user management |
| Cache | Upstash Redis | Session cache, rate limiting |
| Storage | Cloudflare R2 | Assets, backups |
| Queue | Cloudflare Queues | Background job processing |
| Build | Turbo 2.x | Monorepo build orchestration |
| Package Manager | pnpm 9.x | Fast, disk-efficient package management |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Pages      │    │   Workers    │    │   Hyperdrive     │  │
│  │  (Frontend)  │◄──►│   (API)      │◄──►│  (DB Proxy)      │  │
│  │  SvelteKit   │    │   Hono       │    │                  │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                     │             │
│         ▼                   ▼                     ▼             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   R2         │    │   Queues     │    │   KV             │  │
│  │  (Assets)    │    │  (Jobs)      │    │  (Cache)         │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Regional Databases                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Hetzner EU  │    │  Hetzner US  │    │  Vultr Africa    │  │
│  │  Frankfurt   │    │  Ashburn     │    │  Johannesburg    │  │
│  │  PostgreSQL  │    │  PostgreSQL  │    │  PostgreSQL      │  │
│  │  + PgBouncer │    │  + PgBouncer │    │  + PgBouncer     │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Regional Routing

Users are routed to their home region based on:

1. **Initial signup** - Region selected or auto-detected
2. **Data residency** - EU users → EU region, etc.
3. **Latency optimization** - Automatic failover for performance

### Hyperdrive Configuration

Each regional PostgreSQL instance is connected via Cloudflare Hyperdrive for optimized connection pooling:

```toml
# wrangler.toml
[[hyperdrive]]
binding = "HYPERDRIVE_EU"
id = "hyperdrive-eu-id"

[[hyperdrive]]
binding = "HYPERDRIVE_US"
id = "hyperdrive-us-id"

[[hyperdrive]]
binding = "HYPERDRIVE_AF"
id = "hyperdrive-af-id"
```

## Database Schema

The database is organized into 7 domains:

1. **Identity** - Users, profiles, preferences, devices
2. **Organisations** - Schools, companies, memberships
3. **Billing** - Plans, subscriptions, invoices
4. **Curriculum** - Languages, layouts, lessons, exercises
5. **Sessions** - Typing sessions, keystrokes, metrics
6. **Gamification** - Achievements, streaks, leaderboards
7. **Notifications** - Templates, notifications, audit logs

See [`packages/db/src/schema/`](../packages/db/src/schema/) for detailed schema definitions.

## Monorepo Structure

```
typeforge/
├── apps/
│   ├── web/                   # SvelteKit frontend
│   └── api/                   # Hono API (Cloudflare Worker)
├── packages/
│   ├── db/                    # Drizzle schema + migrations
│   ├── metrics/               # WPM/accuracy engine
│   ├── layouts/               # Keyboard layout JSON maps
│   ├── curriculum/            # Lesson content + adaptive scheduler
│   └── ui/                    # Shared Svelte component library
├── infra/
│   ├── hetzner-eu/            # Postgres setup scripts
│   ├── hetzner-us/            # Postgres setup scripts
│   ├── vultr-africa/          # Postgres setup scripts
│   └── backups/               # pg_dump cron + R2 upload
├── docs/
│   ├── architecture.md
│   ├── compliance.md
│   └── agent-assignments.md
└── .github/
    └── workflows/             # CI/CD pipelines
```

## Security

### Authentication Flow

1. User authenticates via Clerk
2. JWT token contains `homeRegion` claim
3. API validates JWT and routes to correct Hyperdrive binding
4. Database queries execute in user's home region

### Data Isolation

- Each region has isolated PostgreSQL instance
- No cross-region data sharing
- User data stays in selected region for compliance

### Secrets Management

- Environment variables via Cloudflare Workers secrets
- Database credentials via Hyperdrive (never exposed to code)
- API keys via `.dev.vars` for local development

## Performance

### Edge Caching

- Static assets cached at Cloudflare edge
- API responses cached via KV namespace
- Session data cached in Upstash Redis

### Database Optimization

- PgBouncer connection pooling (transaction mode)
- Indexed queries for common access patterns
- Read replicas for analytics (future)

## Monitoring

- Cloudflare Analytics for edge metrics
- Sentry for error tracking
- Custom metrics via Cloudflare Analytics Engine

## Deployment

### CI/CD Pipeline

1. **PR checks** - Lint, typecheck, unit tests
2. **Preview deploy** - Cloudflare Pages preview
3. **Production deploy** - After merge to main

### Rollback Strategy

- Cloudflare Pages instant rollback
- Database migrations are reversible
- Feature flags for gradual rollouts

## Compliance

- **GDPR** - EU data residency, right to erasure
- **COPPA** - Parental consent for minors
- **SOC 2** - (Planned) Security controls

## Future Considerations

- [ ] Read replicas for analytics
- [ ] WebSocket support for real-time typing races
- [ ] AI-powered lesson generation
- [ ] Mobile app (React Native / Flutter)
