# Life World OS - Local Database Setup Guide

Complete guide for setting up and running the Life World OS project with local database connections.

## Quick Start

```bash
# Automated setup (recommended)
./scripts/setup-local-db.sh

# Then start development
npm run dev:local
```

---

## Architecture Overview

- **Database**: PostgreSQL (Docker, port 5433)
- **Backend**: Express.js (port 5001)
- **Frontend**: Vite/React (port 5173)

---

## Prerequisites

1. **Node.js** 20+ and npm
2. **Docker** and Docker Compose
3. **Git**

---

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Root level
npm install

# Backend
cd apps/backend
npm install
cd ../..

# Frontend
cd apps/frontend
npm install
cd ../..
```

### 2. Configure Environment Variables

#### Root `.env.dev` (for Docker Compose)

```bash
# Copy template
cp config/environments/dev.env.example .env.dev
```

Or create manually:

```env
# Database Configuration
DEV_DB_HOST=localhost
DEV_DB_PORT=5433
DEV_DB_USER=lifeworld_dev
DEV_DB_PASSWORD=lifeworld_dev_local
DEV_DB_NAME=lifeworld_dev
DEV_DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@postgres-dev:5432/lifeworld_dev

# Backend Configuration
DEV_BACKEND_PORT=3001
DEV_API_URL=http://localhost:3001

# Frontend Configuration
DEV_FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3001
```

#### Backend `.env.local` (`apps/backend/.env.local`)

```env
# Environment
NODE_ENV=development
ENVIRONMENT=local

# Database (connects to Docker database)
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev

# Backend
PORT=5001
API_URL=http://localhost:5001

# Authentication
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# AI Services (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
GROQ_API_KEY=
OPENAI_API_KEY=
```

#### Frontend `.env.local` (`apps/frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5001
```

### 3. Start Database

```bash
# Start PostgreSQL in Docker
npm run dev:db

# Verify it's running
docker-compose -f docker-compose.dev.yml ps postgres-dev
```

**Database Connection Details:**
- Host: `localhost`
- Port: `5433` (mapped from container port 5432)
- Database: `lifeworld_dev`
- User: `lifeworld_dev`
- Password: `lifeworld_dev_local`

### 4. Generate Prisma Client

```bash
cd apps/backend
npm run generate
cd ../..
```

### 5. Run Migrations

```bash
cd apps/backend
npm run migrate
cd ../..
```

### 6. Seed Database

```bash
# Seed dev database with all required data
npm run seed:dev
```

This seeds:
- ✅ Reality hierarchy (REALITY root + all nodes)
- ✅ Laws, Principles, Frameworks
- ✅ Power Laws, Bible Laws
- ✅ Loadout Items
- ✅ Money System (Agents, Teams)
- ✅ Training and Knowledge
- ✅ Development test users

### 7. Start Development Servers

```bash
# Option 1: Start everything together
npm run dev:local

# Option 2: Start separately (3 terminals)
# Terminal 1: Database (if not already running)
npm run dev:db

# Terminal 2: Backend
npm run dev:backend

# Terminal 3: Frontend
npm run dev:frontend
```

---

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health
- **Database Health**: http://localhost:5001/api/health/database
- **Prisma Studio**: `npm run studio` (opens in browser)

---

## Database Management

### Start/Stop Database

```bash
# Start
npm run dev:db

# Stop
npm run dev:db:down

# Restart
npm run dev:db:down && npm run dev:db

# View logs
npm run dev:db:logs
```

### Database Operations

```bash
# Run migrations
cd apps/backend
npm run migrate

# Seed database
npm run seed:dev

# Open Prisma Studio (database GUI)
npm run studio

# Generate Prisma client (after schema changes)
npm run generate
```

### Reset Database

```bash
# Stop database
npm run dev:db:down

# Remove volume (⚠️ deletes all data)
docker volume rm life-world-os_postgres_dev_data

# Start fresh
npm run dev:db
cd apps/backend
npm run migrate
npm run seed:dev
```

---

## Connection Improvements

### Connection Pooling

The Prisma client automatically handles connection pooling. For production, you can optimize the connection string:

```env
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20
```

### Health Checks

The backend includes comprehensive health check endpoints:

- **General Health**: `GET /api/health`
- **Database Health**: `GET /api/health/database`
- **User Health Status**: `GET /api/health/status` (requires auth)

### Connection Validation

The backend validates database connection on startup:

1. ✅ Environment variables
2. ✅ Database connection
3. ✅ Database schema
4. ✅ Required seed data (Power Laws, Agents, Bible Laws, etc.)

If validation fails, the app won't start. Check the console output for specific issues.

---

## Troubleshooting

### Database Connection Issues

**Problem**: "Failed to connect to database"

**Solutions**:
1. Check if Docker is running:
   ```bash
   docker ps
   ```

2. Check if database container is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps postgres-dev
   ```

3. Check database logs:
   ```bash
   npm run dev:db:logs
   ```

4. Verify connection string in `apps/backend/.env.local`:
   ```env
   DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
   ```

5. Test connection manually:
   ```bash
   docker-compose -f docker-compose.dev.yml exec postgres-dev pg_isready -U lifeworld_dev
   ```

### Port Conflicts

**Problem**: Port 5433, 5001, or 5173 already in use

**Solutions**:

1. **Change database port** in `.env.dev`:
   ```env
   DEV_DB_PORT=5434  # Change from 5433
   ```
   Update `apps/backend/.env.local`:
   ```env
   DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5434/lifeworld_dev
   ```

2. **Change backend port** in `apps/backend/.env.local`:
   ```env
   PORT=5002  # Change from 5001
   ```
   Update `apps/frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:5002
   ```

3. **Kill process on port**:
   ```bash
   # macOS/Linux
   lsof -ti:5001 | xargs kill -9
   ```

### Prisma Client Issues

**Problem**: "Prisma client models not available"

**Solution**:
```bash
cd apps/backend
npm run generate
cd ../..
```

### Migration Issues

**Problem**: "Migration failed" or "Schema out of sync"

**Solutions**:
1. Reset and re-run migrations:
   ```bash
   cd apps/backend
   npm run migrate
   ```

2. If that fails, reset database:
   ```bash
   npm run dev:db:down
   docker volume rm life-world-os_postgres_dev_data
   npm run dev:db
   cd apps/backend
   npm run migrate
   npm run seed:dev
   ```

### Seed Data Missing

**Problem**: Startup validation fails for seed data

**Solution**:
```bash
npm run seed:dev
```

This seeds all required data. If specific data is missing, check the seed scripts in `apps/backend/src/scripts/`.

---

## Development Workflow

### Daily Development

1. **Start database**:
   ```bash
   npm run dev:db
   ```

2. **Start backend and frontend**:
   ```bash
   npm run dev:local
   ```

3. **Make changes** - Hot reload is enabled

4. **Test changes** - Access frontend at http://localhost:5173

5. **Stop services** when done:
   ```bash
   # Stop backend/frontend: Ctrl+C
   # Stop database
   npm run dev:db:down
   ```

### Schema Changes

1. **Edit schema**: `apps/backend/prisma/schema.prisma`

2. **Create migration**:
   ```bash
   cd apps/backend
   npm run migrate
   ```

3. **Generate Prisma client** (auto-run by migrate):
   ```bash
   npm run generate
   ```

4. **Restart backend** to pick up changes

### Database Queries

**Prisma Studio** (visual database browser):
```bash
cd apps/backend
npm run studio
```

**Direct SQL** (via Docker):
```bash
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U lifeworld_dev -d lifeworld_dev
```

---

## Production Considerations

### Connection String Format

For production, use connection pooling:

```env
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20&connect_timeout=10
```

### Environment Variables

Never commit `.env.local` files. Use environment-specific configuration:
- Development: `.env.dev`
- Staging: `.env.staging`
- Production: Set via deployment platform

### Database Backups

For production, implement regular backups:
- Automated daily backups
- Point-in-time recovery
- Backup verification

---

## Additional Resources

- **Backend Documentation**: `apps/backend/README.md`
- **Frontend Documentation**: `apps/frontend/README.md`
- **Local Development Guide**: `docs/LOCAL_DEVELOPMENT.md`
- **Database Setup**: `docs/LOCAL_DATABASE_SETUP.md`
- **Docker Setup**: `DOCKER_ENVIRONMENT_SETUP.md`

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review database logs: `npm run dev:db:logs`
3. Check backend logs in terminal
4. Verify environment variables are set correctly
5. Ensure Docker is running and has sufficient resources

---

## Quick Reference

```bash
# Setup
./scripts/setup-local-db.sh

# Start everything
npm run dev:local

# Database only
npm run dev:db

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Database operations
npm run migrate          # Run migrations
npm run seed:dev         # Seed database
npm run studio           # Open Prisma Studio
npm run dev:db:logs      # View database logs
npm run dev:db:down      # Stop database

# E2E Testing
npm run test:e2e:local   # Setup and run E2E tests
npm run test:e2e         # Run E2E tests (services must be running)
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:report  # View test report
```

---

## E2E Testing

For complete E2E testing setup and usage, see [RUN_E2E_LOCAL.md](./RUN_E2E_LOCAL.md).

**Quick start for E2E tests:**
```bash
# Automated setup and test run
npm run test:e2e:local
```

This will:
1. Set up database and environment
2. Start all required services
3. Verify services are healthy
4. Run all E2E tests
5. Show test results

---

✅ **You're all set!** The database connection is configured and optimized for local development.

