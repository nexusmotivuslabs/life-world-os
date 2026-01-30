# Life World Operating System

A gamified life operating system that helps you allocate effort, energy, and resources sustainably across time using game mechanics (Clouds, Seasons, Resources, Engines, and Capacity limits).

**Repository**: [motivus_labs/life-world-os](https://github.com/motivus_labs/life-world-os)

## Features

- 🌥️ **Clouds of Life**: Five persistent background systems (Capacity, Engines, Oxygen, Meaning, Optionality)
- 🍂 **Seasons of Life**: Four cyclical modes (Spring, Summer, Autumn, Winter) with explicit rules
- 💎 **Resources**: Track Oxygen, Water, Gold, Armor, and Keys
- ⚙️ **Engines**: Manage Career, Business, Investment, and Learning engines
- 🎮 **XP System**: Halo 3-style overall rank + Destiny 2-style category XP
- 📊 **Progression**: Level up based on XP, milestones, and balance

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand
- **Visualization**: Recharts
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Quick Start

### Docker Environment (Recommended)

**Cost**: $0/month | **Time**: 5 minutes

```bash
# Verify prerequisites
npm run verify

# Setup environment
cp config/environments/dev.env.example .env.dev

# Install dependencies
npm install

# Start development (database only - recommended)
npm run dev:db && npm run dev
```

**Access**: 
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433

See [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) for detailed guide.

### Local full stack (with or without observability)

```bash
# Minimal: UI, backend, DB only
npm run local-lite

# Full: same + Prometheus & Grafana (logs and metrics)
npm run local
```

**When using `npm run local` (full stack):**

| Service    | URL                      | Login / notes        |
|-----------|---------------------------|----------------------|
| **Grafana**  | http://localhost:3000     | **admin** / **admin** (reset on every container start so login always works) |
| **Prometheus** | http://localhost:9090  | No login (read-only UI) |
| **Loki**     | http://localhost:3100   | Logs; view in Grafana → **Explore** → select **Loki** (backend/frontend logs when using `npm run local`) |

**Life World OS test users (after running `npm run seed` once in dev):**  
`test@example.com` or `demo@example.com` — password: **password123**. See **[docs/TEST_USERS.md](docs/TEST_USERS.md)** for the full list and usage.

### MVP: In-Home WiFi Access (Local Deployment)

**Cost**: $0/month | **Time**: 5 minutes

```bash
# One-command setup
./scripts/setup-mvp.sh

# Or see detailed guide
docs/MVP_DEPLOYMENT_GUIDE.md
```

**Access**: http://localhost:5173 (or http://[your-local-ip]:5173 on WiFi)

### Release 3: AWS Public Deployment

**Cost**: $7-26/month | **Setup**: See deployment guides

```bash
# See deployment strategy
dev-hub/domains/platform-engineering/implementation/deployment-strategy.md
```

---

## Setup Guides

- [Quick Start - Docker](./dev/setup/QUICK_START_DOCKER.md) - 5-minute Docker setup
- [Docker Environment Setup](./dev/setup/DOCKER_ENVIRONMENT_SETUP.md) - Comprehensive Docker guide
- [Prerequisites](./dev/setup/PREREQUISITES.md) - Required software and installation
- [Local Database Setup](./dev/setup/LOCAL_DB_SETUP.md) - Database connection guide
- [E2E Testing](./dev/testing/RUN_E2E_LOCAL.md) - End-to-end testing guide
- [Platform Decision Framework](./docs/confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md) - How decisions are made

**📚 [All Developer Documentation](./dev/README.md)** - Complete technical documentation index

## Documentation

📚 **[Documentation Index](./docs/INDEX.md)** - Complete documentation index

### V1 Release & Orchestration
- [V1 Release Notes](./dev/releases/V1.0.0_RELEASE.md) - V1.0.0 release documentation
- [Navigation Assessment](./dev/NAVIGATION_ASSESSMENT.md) - Navigation architecture review
- **[GitLab Flow Guide](./docs/confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md)** - Implementation guide
- **[GitLab Flow Guide](./docs/confluence/domains/platform-engineering/implementation/gitlab-flow-guide.md)** - Implementation guide ⭐
- **[GitLab Flow Best Practices](./docs/confluence/domains/platform-engineering/implementation/gitlab-flow-best-practices.md)** - Best practices ⭐

**Quick Commands**:
```bash
npm run v1:status      # View task status
npm run v1:decisions   # View pending decisions
npm run v1:orchestrate # Full orchestrator
```

## Manual Setup (Alternative)

### Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (for database)

See [PREREQUISITES.md](./dev/setup/PREREQUISITES.md) for detailed requirements.

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start database:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres-dev
   ```

3. **Backend setup:**
   ```bash
   cd apps/backend
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   npm run generate
   npm run migrate
   npm run seed
   ```

4. **Frontend setup:**
   ```bash
   cd apps/frontend
   cp .env.example .env
   # Edit .env with your API URL
   ```

5. **Start development:**
   ```bash
   # From root
   npm run dev
   ```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
life-world-os/
├── apps/
│   ├── backend/          # Express + Prisma backend
│   └── frontend/         # React + Vite frontend
├── docs/                 # Documentation
├── docker-compose.yml    # PostgreSQL service
└── package.json          # Workspace configuration
```

## Documentation

See `docs/` directory for:

### Core Documentation
- **[SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)** - Complete system design and philosophy
- **[LIFE_WORLD_MAP.md](docs/LIFE_WORLD_MAP.md)** - One-page visual reference map
- **[SEASONS_GUIDE.md](docs/SEASONS_GUIDE.md)** - Season rules and action mappings
- **[XP_SYSTEM.md](docs/XP_SYSTEM.md)** - XP earning formulas and progression
- **[OPERATING_LOOPS.md](docs/OPERATING_LOOPS.md)** - Weekly and quarterly loops

### Technical Documentation
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[NAMING_REFERENCE.md](docs/NAMING_REFERENCE.md)** - All names and conventions used
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide
- **[apps/backend/ENV_SETUP.md](apps/backend/ENV_SETUP.md)** - Backend environment setup
- **[apps/frontend/ENV_SETUP.md](apps/frontend/ENV_SETUP.md)** - Frontend environment setup

