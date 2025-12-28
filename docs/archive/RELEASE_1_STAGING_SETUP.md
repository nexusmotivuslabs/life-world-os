# Release 1 - Staging Environment Setup

**Release:** Release 1  
**Status:** ✅ Ready for Deployment  
**Purpose:** Sample environments for testing and QA

## Quick Start

### 1. One-Command Deployment

```bash
npm run staging:deploy
```

This will:
- ✅ Build Docker images
- ✅ Start all services (database, backend, frontend)
- ✅ Run database migrations
- ✅ Verify health checks
- ✅ Provide access URLs

### 2. Access Your Staging Environment

After deployment:

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health

## Setup Steps

### Step 1: Environment Configuration

```bash
# Copy example environment file
cp .env.staging.example .env.staging

# Edit with your values (optional - defaults work for local testing)
nano .env.staging
```

### Step 2: Deploy

```bash
# Option 1: Use npm script (recommended)
npm run staging:deploy

# Option 2: Use script directly
./scripts/deploy-staging.sh

# Option 3: Manual Docker Compose
docker-compose -f docker-compose.staging.yml up --build -d
```

### Step 3: Verify

```bash
# Check all services are running
docker-compose -f docker-compose.staging.yml ps

# Check logs
npm run staging:logs

# Test health endpoint
curl http://localhost:3002/health
```

## Environment Details

### Services & Ports

| Service | Container Name | Port | URL |
|---------|---------------|------|-----|
| Frontend | `life-world-os-frontend-staging` | 5174 | http://localhost:5174 |
| Backend | `life-world-os-backend-staging` | 3002 | http://localhost:3002 |
| Database | `life-world-os-db-staging` | 5434 | localhost:5434 |

### Database

- **Name:** `lifeworld_staging`
- **User:** `lifeworld_staging`
- **Password:** Set in `.env.staging` (default: `lifeworld_staging_secure`)

## Common Commands

### Start/Stop

```bash
# Start
npm run staging:up

# Stop
npm run staging:down

# Restart
npm run staging:restart

# Clean (removes data)
npm run staging:clean
```

### View Logs

```bash
# All services
npm run staging:logs

# Specific service
docker-compose -f docker-compose.staging.yml logs -f backend-staging
docker-compose -f docker-compose.staging.yml logs -f frontend-staging
```

### Database Operations

```bash
# Run migrations
docker exec life-world-os-backend-staging npx prisma migrate deploy

# Seed database
docker exec life-world-os-backend-staging npm run seed

# Prisma Studio (database GUI)
docker exec -it life-world-os-backend-staging npx prisma studio --host 0.0.0.0 --port 5555
# Access at: http://localhost:5555
```

## Testing Workflow

### 1. Deploy to Staging

```bash
npm run staging:deploy
```

### 2. Run QA Tests

- Access frontend: http://localhost:5174
- Run smoke tests
- Test new features
- Verify navigation (Release 1 focus)

### 3. Monitor

```bash
# Watch logs in real-time
npm run staging:logs

# Check specific service
docker-compose -f docker-compose.staging.yml logs backend-staging
```

### 4. Update & Redeploy

```bash
# After code changes
git pull
npm run staging:deploy
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check logs
npm run staging:logs

# Check port conflicts
lsof -i :5174
lsof -i :3002
lsof -i :5434
```

### Database Issues

```bash
# Check database is ready
docker exec life-world-os-db-staging pg_isready -U lifeworld_staging

# View database logs
docker-compose -f docker-compose.staging.yml logs postgres-staging

# Reset database (WARNING: deletes data)
npm run staging:clean
npm run staging:deploy
```

### Backend Issues

```bash
# Check backend health
curl http://localhost:3002/health

# View backend logs
docker-compose -f docker-compose.staging.yml logs backend-staging

# Restart backend
docker-compose -f docker-compose.staging.yml restart backend-staging
```

### Frontend Issues

```bash
# Check frontend logs
docker-compose -f docker-compose.staging.yml logs frontend-staging

# Verify API URL
docker exec life-world-os-frontend-staging env | grep VITE_API_URL

# Rebuild frontend
docker-compose -f docker-compose.staging.yml up --build -d frontend-staging
```

## Multiple Environments

To run multiple staging environments:

```bash
# Environment 1 (default)
npm run staging:deploy

# Environment 2 (custom ports)
docker-compose -f docker-compose.staging.yml -p staging2 up -d
# Then update ports in docker-compose.staging.yml
```

## Cleanup

### Remove Staging Environment

```bash
# Stop and remove (keeps data)
npm run staging:down

# Stop and remove with data cleanup
npm run staging:clean
```

## Security Notes

⚠️ **For Staging Environments:**

- Use test data only
- Don't use production credentials
- Change default passwords
- Don't expose to public internet
- Rotate secrets regularly

## Next Steps

1. ✅ Deploy to staging: `npm run staging:deploy`
2. ✅ Verify services: Check URLs above
3. ✅ Run QA tests: Follow QA_TESTING_PLAN.md
4. ✅ Monitor logs: `npm run staging:logs`
5. ✅ Test Release 1 features: Navigation refactor

## Documentation

- **Full Guide:** `STAGING_DEPLOYMENT_GUIDE.md`
- **QA Testing:** `QA_TESTING_PLAN.md`
- **Restart Guide:** `RESTART_GUIDE.md`

---

**Ready?** Run `npm run staging:deploy` to deploy your staging environment!

