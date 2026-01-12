# Docker Environment Setup Guide

**Last Updated**: 2025-01-15  
**Maintained By**: Atlas (DevOps Engineer)

---

## Overview

This guide explains how to set up and use Docker environments for Life World OS. The setup uses Docker Compose profiles to provide flexible service composition - run only what you need.

---

## Quick Start

### 1. Verify Prerequisites

```bash
npm run verify
```

Or manually check:
- Node.js >= 20.0.0
- npm >= 9.0.0
- Docker >= 20.10.0
- Docker Compose >= 2.0.0

See [PREREQUISITES.md](./PREREQUISITES.md) for detailed requirements.

### 2. Setup Environment

```bash
# Copy environment template
cp config/environments/dev.env.example .env.dev

# Edit if needed (defaults work for local)
# nano .env.dev
```

### 3. Start Development

**Option A: Database Only (Recommended)**
```bash
npm run dev:db        # Start database
npm run dev           # Start backend + frontend locally
```

**Option B: Full Docker Stack**
```bash
npm run dev:full      # Everything in Docker
```

---

## Docker Compose Profiles

### Available Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| `db` | PostgreSQL | Database only - run services locally |
| `backend` | Backend API | Backend in Docker (with db) |
| `frontend` | Frontend | Frontend in Docker (with backend) |
| `full` | All services | Complete Docker stack |

### Profile Usage

```bash
# Database only
docker-compose --profile db -f docker-compose.dev.yml up -d

# Database + Backend
docker-compose --profile db --profile backend -f docker-compose.dev.yml up -d

# Database + Frontend
docker-compose --profile db --profile frontend -f docker-compose.dev.yml up -d

# Everything
docker-compose --profile full -f docker-compose.dev.yml up -d
```

---

## Development Patterns

### Pattern 1: Database Only (Most Common)

**Best for**: Active development, fast iteration

```bash
# Start database
npm run dev:db

# Run backend locally (connects to Docker DB)
npm run dev:backend

# Run frontend locally (connects to local backend)
npm run dev:frontend
```

**Benefits**:
- Fast hot reload
- Direct access to logs
- Easy debugging
- Minimal resource usage

**Access**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433

---

### Pattern 2: Full Local Stack

**Best for**: Testing full integration locally

```bash
# Everything runs locally (no Docker)
# Start database in Docker
npm run dev:db

# Start backend and frontend locally
npm run dev
```

**Access**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433

---

### Pattern 3: Full Docker Stack

**Best for**: Testing Docker setup, CI/CD validation

```bash
# Everything in Docker
npm run dev:full
```

**Access**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5433

**Note**: Hot reload works via volume mounts

---

## Environment Configuration

### Environment Files

| File | Purpose | Location |
|------|---------|----------|
| `.env.dev` | Development environment | Project root |
| `apps/backend/.env` | Backend config | apps/backend/ |
| `apps/frontend/.env` | Frontend config | apps/frontend/ |

### Setup Environment Files

```bash
# 1. Create root .env.dev (for Docker Compose)
cp config/environments/dev.env.example .env.dev

# 2. Create backend .env
cd apps/backend
cp ../../config/environments/dev.env.example .env
# Edit .env with backend-specific values

# 3. Create frontend .env
cd ../frontend
cp ../../config/environments/dev.env.example .env
# Edit .env with frontend-specific values
```

### Key Environment Variables

**Database**:
```env
DEV_DB_HOST=localhost
DEV_DB_PORT=5433
DEV_DB_USER=lifeworld_dev
DEV_DB_PASSWORD=lifeworld_dev_local
DEV_DB_NAME=lifeworld_dev
DEV_DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
```

**Backend**:
```env
DEV_BACKEND_PORT=3001
DEV_API_URL=http://localhost:3001
```

**Frontend**:
```env
DEV_FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3001
```

**AI Services**:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
GROQ_API_KEY=your-key-here  # Optional
OPENAI_API_KEY=your-key-here  # Optional
```

---

## Common Commands

### Database Management

```bash
# Start database
npm run dev:db

# Stop database
npm run dev:db:down

# View database logs
npm run dev:db:logs

# Restart database
docker-compose --profile db -f docker-compose.dev.yml restart postgres-dev
```

### Full Stack Management

```bash
# Start everything
npm run dev:full

# Stop everything
npm run dev:full:down

# View all logs
npm run dev:full:logs

# Restart all services
docker-compose --profile full -f docker-compose.dev.yml restart
```

### Database Operations

```bash
# Run migrations
cd apps/backend
npm run migrate

# Seed database
npm run seed

# Open Prisma Studio
npm run studio
```

---

## Service Access

### Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:3001 | Express API |
| Health Check | http://localhost:3001/health | API health |
| Database | localhost:5433 | PostgreSQL |
| Prisma Studio | http://localhost:5555 | Database GUI (when running) |

### Connecting to Database

**From local machine**:
```bash
psql postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
```

**From Docker container**:
```bash
docker exec -it life-world-os-db-dev psql -U lifeworld_dev -d lifeworld_dev
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check logs
docker-compose --profile db -f docker-compose.dev.yml logs

# Check port conflicts
lsof -i :5433  # macOS/Linux
netstat -ano | findstr :5433  # Windows
```

### Database Connection Issues

```bash
# Check database is healthy
docker exec life-world-os-db-dev pg_isready -U lifeworld_dev

# Check database logs
docker-compose --profile db -f docker-compose.dev.yml logs postgres-dev

# Verify connection string
echo $DATABASE_URL
```

### Hot Reload Not Working

```bash
# Check volume mounts
docker-compose --profile full -f docker-compose.dev.yml config

# Restart service
docker-compose --profile full -f docker-compose.dev.yml restart backend-dev
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in .env.dev
```

### Clean Start

```bash
# Stop all services
npm run dev:full:down

# Remove volumes (WARNING: deletes data)
docker-compose --profile full -f docker-compose.dev.yml down -v

# Rebuild and start
docker-compose --profile full -f docker-compose.dev.yml up --build -d
```

---

## Cloud Migration Path

### Local → Cloud

The environment configuration is designed to work both locally and in cloud. Just change environment variables:

**Local**:
```env
DEV_DATABASE_URL=postgresql://user:pass@localhost:5433/db
```

**Cloud (AWS RDS)**:
```env
DEV_DATABASE_URL=postgresql://user:pass@rds-instance.region.rds.amazonaws.com:5432/db
```

**Cloud (GCP Cloud SQL)**:
```env
DEV_DATABASE_URL=postgresql://user:pass@cloud-sql-instance:5432/db
```

No code changes needed!

---

## Best Practices

### 1. Use Database Profile for Development
- Run database in Docker
- Run backend/frontend locally
- Faster iteration, better debugging

### 2. Use Full Profile for Testing
- Test Docker setup
- Validate containerization
- CI/CD validation

### 3. Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Document all required variables

### 4. Resource Management
- Stop unused services
- Clean up unused volumes periodically
- Monitor Docker resource usage

---

## Next Steps

1. ✅ Verify prerequisites: `npm run verify`
2. ✅ Setup environment: `cp config/environments/dev.env.example .env.dev`
3. ✅ Start development: `npm run dev:db && npm run dev`
4. ✅ Read [Platform Decision Framework](./docs/confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)

---

**Maintained By**: Atlas (DevOps Engineer)  
**Related Docs**: 
- [PREREQUISITES.md](./PREREQUISITES.md)
- [Platform Decision Framework](./docs/confluence/domains/platform-engineering/PLATFORM_DECISION_FRAMEWORK.md)


