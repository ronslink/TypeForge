# TypeForge

**Multilingual Adaptive Typing Learning Platform**

A high-fidelity industrial foundry for digital precision. Engineer your typing speed with zero-latency feedback and adaptive multilingual mastery.

## Features

- 🌍 **Multilingual Support** - Full support for Latin, Arabic, Cyrillic, and CJK scripts with native layout emulation
- ⚡ **Zero Latency** - Input processing optimized at the edge for instant feedback
- 🧠 **AI Weakness Detection** - Neural engine identifies patterns and generates custom drills
- 🏢 **Institutional Access** - Schools, companies, and organizations with SSO support
- 📊 **Detailed Analytics** - WPM, accuracy, consistency, and keystroke analysis
- 🎮 **Gamification** - Achievements, streaks, leaderboards, and XP system

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | SvelteKit 2.x |
| API | Hono 4.x on Cloudflare Workers |
| Database | PostgreSQL 17 (Regional) |
| ORM | Drizzle 0.30.x |
| Auth | Clerk 5.x |
| Cache | Upstash Redis |
| Storage | Cloudflare R2 |
| Build | Turbo 2.x |

## Getting Started

### Prerequisites

- Node.js 20 LTS
- pnpm 9.x
- Wrangler CLI (for Cloudflare Workers)

### Installation

```bash
# Clone the repository
git clone https://github.com/typeforge/typeforge.git
cd typeforge

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env
cp apps/api/.dev.vars.example apps/api/.dev.vars

# Start development servers
pnpm dev
```

### Development

```bash
# Start all services
pnpm dev

# Start only frontend
pnpm dev:web

# Start only API
pnpm dev:api

# Run database migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

### Build

```bash
# Build all packages and apps
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Test
pnpm test
```

## Project Structure

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
│   ├── hetzner-eu/            # EU PostgreSQL setup
│   ├── hetzner-us/            # US PostgreSQL setup
│   ├── vultr-africa/          # Africa PostgreSQL setup
│   └── backups/               # Backup scripts
├── docs/
│   └── architecture.md        # System architecture
└── .github/
    └── workflows/             # CI/CD pipelines
```

## Design System

TypeForge uses the **Kinetic Foundry** design system:

- **Primary Color**: Amber (#ffc56c) - The "heat" of the forge
- **Secondary Color**: Teal (#41e4c0) - Precision and accuracy
- **Typography**: Newsreader (display), Manrope (body), Space Grotesk (technical)
- **No Border Radius**: Sharp, machined edges with notched corners
- **Tonal Depth**: Layered surfaces without explicit borders

See [`design/DESIGN.md`](design/DESIGN.md) for full design specifications.

## Regional Deployment

TypeForge maintains regional databases for data residency compliance:

| Region | Provider | Location |
|--------|----------|----------|
| EU | Hetzner | Frankfurt, Germany |
| US | Hetzner | Ashburn, Virginia |
| Africa | Vultr | Johannesburg, South Africa |

Users are automatically routed to their home region via Cloudflare Hyperdrive.

## Contributing

We welcome contributions! Please see our contributing guidelines for details.

## License

Proprietary - All rights reserved.

---

Built with ❤️ by the TypeForge team
