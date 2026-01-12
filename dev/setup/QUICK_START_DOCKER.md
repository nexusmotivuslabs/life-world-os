# Quick Start - Docker Environment

**Last Updated**: 2025-01-15

---

## 🚀 5-Minute Setup

### Step 1: Verify Prerequisites

```bash
npm run verify
```

**Required**:
- Node.js >= 20.0.0
- Docker >= 20.10.0
- Docker Compose >= 2.0.0

See [PREREQUISITES.md](./PREREQUISITES.md) for installation.

### Step 2: Setup Environment

```bash
# Copy environment template
cp config/environments/dev.env.example .env.dev
```

### Step 3: Install Dependencies

```bash
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

### Step 4: Start Development

**Recommended (Database Only)**:
```bash
npm run dev:db        # Start database
npm run dev           # Start backend + frontend locally
```

**Alternative (Full Docker)**:
```bash
npm run dev:full      # Everything in Docker
```

### Step 5: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5433

---

## Common Commands

```bash
# Database only
npm run dev:db              # Start database
npm run dev:db:down          # Stop database
npm run dev:db:logs          # View database logs

# Full development
npm run dev:local            # Database + local services
npm run dev:full             # Everything in Docker

# Database operations
npm run migrate              # Run migrations
npm run seed                 # Seed database
npm run studio               # Open Prisma Studio
```

---

## Development Patterns

### Pattern 1: Database Only (Recommended)
```bash
npm run dev:db && npm run dev
```
- Database in Docker
- Backend/Frontend locally
- Fastest iteration

### Pattern 2: Full Docker
```bash
npm run dev:full
```
- Everything in Docker
- Good for testing Docker setup

---

## Troubleshooting

### Docker not running
```bash
# Start Docker Desktop (macOS/Windows)
# Or on Linux:
sudo systemctl start docker
```

### Port conflicts
```bash
# Check what's using the port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

### Clean start
```bash
npm run dev:full:down
docker-compose --profile full -f docker-compose.dev.yml down -v
npm run dev:full
```

---

## Next Steps

- 📖 Read [DOCKER_ENVIRONMENT_SETUP.md](./DOCKER_ENVIRONMENT_SETUP.md) for detailed guide
- 📖 Read [PREREQUISITES.md](./PREREQUISITES.md) for requirements
- 📖 Read [Platform Decision Framework](./docs/confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)

---

**Need Help?** See [DOCKER_ENVIRONMENT_SETUP.md](./DOCKER_ENVIRONMENT_SETUP.md) for detailed troubleshooting.


