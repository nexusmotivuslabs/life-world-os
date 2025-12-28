# MVP Deployment Guide - In-Home WiFi Access

**Target**: Local deployment for household use  
**Infrastructure**: None (local machine)  
**Cost**: $0/month

---

## Overview

MVP deployment runs Life World OS entirely on a local machine accessible via home WiFi network. No cloud infrastructure required.

---

## Prerequisites

1. **Local Machine** (Mac, Windows, or Linux)
2. **Docker** (for PostgreSQL) or native PostgreSQL
3. **Node.js** 18+ and npm
4. **Home WiFi Network**

---

## Quick Start

### 1. Clone and Install

```bash
cd life-world-os

# Install dependencies
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

### 2. Start Database

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Or install PostgreSQL locally and configure
```

### 3. Configure Environment

**Backend** (`apps/backend/.env`):
```env
# Database
DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5433/lifeworld

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3001

# Optional: LLM for Travel System
GROQ_API_KEY=your-groq-api-key-here
USE_LLM_FOR_LOCATIONS=true
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 4. Run Database Migrations

```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

### 5. Start Services

**Terminal 1 - Backend**:
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd apps/frontend
npm run dev
```

### 6. Access Application

- **Local**: http://localhost:5173
- **Network**: http://[your-local-ip]:5173 (accessible from other devices on WiFi)

---

## Architecture

```
Home WiFi Network
│
├── Local Machine
│   ├── PostgreSQL (Docker/local)
│   │   └── Port: 5433
│   │
│   ├── Backend (Node.js/Express)
│   │   └── Port: 3001
│   │
│   └── Frontend (React/Vite)
│       └── Port: 5173
│
└── Access Points
    ├── http://localhost:5173 (same machine)
    └── http://[local-ip]:5173 (other devices on WiFi)
```

---

## Caching Strategy

**PostgreSQL Cache Only** (no ElastiCache needed)

- Location queries cached in PostgreSQL `location_cache` table
- Cache expiration handled automatically
- Sufficient for single user or small household
- No performance bottlenecks expected

**Cache Configuration**:
- TTL: 24 hours (configurable)
- Storage: PostgreSQL database
- Performance: 10-50ms latency (local)

---

## Performance Characteristics

- **Users**: 1-5 (household)
- **Queries/Day**: < 100
- **Latency**: 10-50ms (local database)
- **Throughput**: ~100 queries/second
- **Cache Hit Rate**: 60-80% expected

---

## Network Access

### Same Machine
```
http://localhost:5173
```

### Other Devices on WiFi

1. **Find your local IP**:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Access from other devices**:
   ```
   http://[your-local-ip]:5173
   ```
   Example: `http://192.168.1.100:5173`

3. **Firewall**: Ensure port 5173 is open on your machine

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connection
psql -h localhost -p 5433 -U lifeworld -d lifeworld
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Kill process if needed
kill -9 [PID]
```

### Network Access Issues

1. **Check firewall settings**
2. **Verify WiFi network** (same network for all devices)
3. **Check local IP address** (may change on router restart)

---

## Development Workflow

### Daily Development

```bash
# Start database (if not running)
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Start backend
cd apps/backend && npm run dev

# Start frontend (new terminal)
cd apps/frontend && npm run dev
```

### Database Changes

```bash
cd apps/backend

# Create migration
npx prisma migrate dev --name your-migration-name

# Reset database (development only)
npx prisma migrate reset
```

---

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Infrastructure | $0 | Local deployment |
| Database | $0 | Local PostgreSQL |
| Caching | $0 | PostgreSQL cache |
| Development Tools | $0 | Open source |
| **Total** | **$0/month** | ✅ |

---

## Limitations (MVP)

- **Single Location**: Only accessible on home network
- **No Remote Access**: Cannot access from outside home
- **Manual Updates**: Must manually update code
- **No Auto-Scaling**: Fixed resources
- **Backup**: Manual backup required

---

## Next Steps: Release 3

When ready to deploy publicly:

1. **Review**: [Deployment Strategy](./dev-hub/domains/platform-engineering/implementation/deployment-strategy.md)
2. **Setup**: AWS Tier 2 infrastructure
3. **Deploy**: Follow Release 3 deployment guide
4. **Monitor**: Performance and costs

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review logs in backend/frontend terminals
3. Check database connection
4. Verify environment variables

---

**Last Updated**: [Current Date]  
**Maintained By**: Atlas (DevOps Engineer)


