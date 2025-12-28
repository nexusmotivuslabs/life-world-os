# Runbooks

**Last Updated**: 2025-01-15  
**Maintained By**: Atlas (DevOps Engineer) + Sentinel (QA Engineer)

---

## Overview

Runbooks provide step-by-step procedures for common operational tasks, troubleshooting, and incident response.

---

## Health & Troubleshooting

### Check System Health

```bash
# Development
curl http://localhost:3001/health

# Staging
curl http://localhost:3002/health

# Production
curl http://localhost:3000/health
```

### Health Check Response

```json
{
  "status": "healthy",
  "version": "staging-a1b2c3d",
  "database": {
    "status": "connected"
  },
  "uptime": 3600
}
```

### Common Issues

#### Database Connection Failed

**Symptoms**: Health check shows database status as "disconnected"

**Resolution**:
```bash
# Check database is running
docker-compose ps postgres-dev

# Restart database
docker-compose restart postgres-dev

# Check database logs
docker-compose logs postgres-dev

# Verify connection string
echo $DATABASE_URL
```

#### Backend Not Responding

**Symptoms**: API requests timeout or return 500 errors

**Resolution**:
```bash
# Check backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check environment variables
docker exec <backend-container> env | grep DATABASE
```

#### Frontend Build Errors

**Symptoms**: Frontend fails to build or serve

**Resolution**:
```bash
# Clear build cache
cd apps/frontend
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Check for TypeScript errors
npm run type-check
```

---

## Restart Procedures

### Restart All Services

```bash
# Development
docker-compose restart

# Staging
docker-compose -f docker-compose.staging.yml restart

# Production
docker-compose -f docker-compose.prod.yml restart
```

### Restart Specific Service

```bash
# Restart backend only
docker-compose restart backend

# Restart database only
docker-compose restart postgres-dev
```

### Full Restart (Clean)

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations
docker exec <backend-container> npx prisma migrate deploy
```

---

## Error Recovery

### API Errors

1. **Check Error Logs**
   ```bash
   docker-compose logs backend | grep ERROR
   ```

2. **Check Database**
   ```bash
   curl http://localhost:3001/health | jq .database
   ```

3. **Restart Service**
   ```bash
   docker-compose restart backend
   ```

### Database Errors

1. **Check Database Status**
   ```bash
   docker-compose ps postgres-dev
   ```

2. **Check Database Logs**
   ```bash
   docker-compose logs postgres-dev
   ```

3. **Restart Database**
   ```bash
   docker-compose restart postgres-dev
   ```

4. **Run Migrations**
   ```bash
   docker exec <backend-container> npx prisma migrate deploy
   ```

### Frontend Errors

1. **Check Browser Console**
   - Open DevTools
   - Check Console tab
   - Look for errors

2. **Check Network Tab**
   - Verify API calls
   - Check response status

3. **Clear Cache**
   ```bash
   # Clear browser cache
   # Or hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
   ```

---

## Monitoring

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Metrics

- Response times
- Error rates
- Database connection pool
- Memory usage
- CPU usage

### Alerts

Set up alerts for:
- High error rates
- Slow response times
- Database connection failures
- Service downtime

---

## Deployment Recovery

### Rollback Procedure

1. **Identify Version**
   ```bash
   curl http://localhost:3000/health | jq .version
   ```

2. **Check Available Versions**
   ```bash
   docker images | grep life-world-os-backend
   ```

3. **Rollback to Previous Version**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d \
     --image life-world-os-backend-prod:main-<previous-commit>
   ```

### Emergency Restart

```bash
# Stop all services
docker-compose down

# Start with previous configuration
docker-compose up -d

# Verify health
curl http://localhost:3000/health
```

---

## Database Operations

### Backup

```bash
# Create backup
docker exec postgres-dev pg_dump -U postgres life_world_os > backup.sql

# Restore backup
docker exec -i postgres-dev psql -U postgres life_world_os < backup.sql
```

### Migrations

```bash
# Run migrations
docker exec <backend-container> npx prisma migrate deploy

# Check migration status
docker exec <backend-container> npx prisma migrate status
```

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data
docker-compose down -v
docker-compose up -d postgres-dev
docker exec <backend-container> npx prisma migrate deploy
docker exec <backend-container> npm run seed
```

---

## Performance Tuning

### Database

- Check connection pool size
- Monitor query performance
- Add indexes if needed
- Optimize slow queries

### Backend

- Check memory usage
- Monitor CPU usage
- Review API response times
- Optimize slow endpoints

### Frontend

- Check bundle size
- Monitor load times
- Optimize images
- Enable caching

---

## Security

### Check for Exposed Secrets

```bash
# Search for potential secrets
grep -r "password\|secret\|key" --exclude-dir=node_modules .
```

### Update Dependencies

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Update specific package
npm update <package-name>
```

---

## Related Documents

- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Health Troubleshooting](../HEALTH_TROUBLESHOOTING.md) (if still exists)

---

**Maintained By**: Atlas (DevOps Engineer) + Sentinel (QA Engineer)  
**Review Cycle**: Quarterly


