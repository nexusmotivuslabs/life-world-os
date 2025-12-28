# Quick Start - MVP (In-Home WiFi Access)

**Target**: Local deployment for household use  
**Time**: 5 minutes  
**Cost**: $0/month

---

## One-Command Setup

```bash
./scripts/setup-mvp.sh
```

This script will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Show you next steps

---

## Manual Setup

### 1. Install Dependencies

```bash
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

### 2. Start Database

```bash
docker-compose -f docker-compose.dev.yml up -d postgres-dev
```

### 3. Configure Environment

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL=postgresql://lifeworld_dev:lifeworld_dev_local@localhost:5433/lifeworld_dev
JWT_SECRET=your-secret-key-min-32-chars
PORT=3001
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 4. Run Migrations

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
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

### 6. Access

- **Local**: http://localhost:5173
- **Network**: http://[your-local-ip]:5173

---

## What You Get

- ✅ Full Life World OS application
- ✅ All systems (Money, Travel, Energy)
- ✅ PostgreSQL database (local)
- ✅ Zero cloud costs
- ✅ Accessible on home WiFi

---

## Next Steps

- **Development**: Continue building features locally
- **Production**: When ready, see [Deployment Strategy](./dev-hub/domains/platform-engineering/implementation/deployment-strategy.md)

---

**For detailed guide**: See [MVP Deployment Guide](./docs/MVP_DEPLOYMENT_GUIDE.md)


