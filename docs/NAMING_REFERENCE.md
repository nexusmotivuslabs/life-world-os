# Naming Reference

## Project Names

### Package Names
- **Root Package**: `life-world-os`
- **Backend Package**: `life-world-os-backend`
- **Frontend Package**: `life-world-os-frontend`

### Display Names
- **Application Title**: `Life World OS`
- **Full Name**: `Life World Operating System`
- **Short Name**: `Life World OS`

## Database Configuration

### Database Credentials
- **Database Name**: `lifeworld`
- **Database User**: `lifeworld`
- **Database Password**: `lifeworld_dev`
- **Database Port**: `5433` (mapped from container port 5432)
- **Connection String**: `postgresql://lifeworld:lifeworld_dev@localhost:5433/lifeworld`

### Docker Configuration
- **Container Name**: `life-world-os-db`
- **Network Name**: `life-world-os-network`
- **Volume Name**: `life-world-os_postgres_data`

## API Configuration

### Backend
- **Port**: `3001`
- **Base URL**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`
- **API Prefix**: `/api`

### Frontend
- **Port**: `5173`
- **Base URL**: `http://localhost:5173`
- **Environment Variable**: `VITE_API_URL=http://localhost:3001`

## File and Directory Names

### Root Directory
- `life-world-os/`

### Backend Structure
- `apps/backend/`
- `apps/backend/src/`
- `apps/backend/prisma/`
- `apps/backend/src/routes/`
- `apps/backend/src/services/`
- `apps/backend/src/middleware/`
- `apps/backend/src/lib/`
- `apps/backend/src/types/`

### Frontend Structure
- `apps/frontend/`
- `apps/frontend/src/`
- `apps/frontend/src/pages/`
- `apps/frontend/src/components/`
- `apps/frontend/src/services/`
- `apps/frontend/src/store/`
- `apps/frontend/src/lib/`
- `apps/frontend/src/types/`

### Documentation
- `docs/`
- `docs/SYSTEM_DESIGN.md`
- `docs/LIFE_WORLD_MAP.md`
- `docs/SEASONS_GUIDE.md`
- `docs/XP_SYSTEM.md`
- `docs/OPERATING_LOOPS.md`

## Database Table Names (Prisma @map)

- `users` (User model)
- `clouds` (Cloud model)
- `resources` (Resources model)
- `xp` (XP model)
- `engines` (Engine model)
- `season_history` (SeasonHistory model)
- `milestones` (Milestone model)
- `activity_logs` (ActivityLog model)

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/user/profile`

### Clouds
- `GET /api/clouds`
- `PUT /api/clouds/:cloudType`

### Resources
- `GET /api/resources`
- `POST /api/resources/transaction`
- `GET /api/resources/history`

### Engines
- `GET /api/engines`
- `POST /api/engines`
- `PUT /api/engines/:id`
- `DELETE /api/engines/:id`

### Seasons
- `GET /api/seasons/current`
- `POST /api/seasons/transition`
- `GET /api/seasons/history`

### XP System
- `GET /api/xp`
- `POST /api/xp/calculate`
- `POST /api/xp/activity`
- `GET /api/xp/history`
- `GET /api/xp/categories`

### Progression
- `GET /api/progression/overall`
- `GET /api/progression/categories`
- `GET /api/progression/milestones`
- `POST /api/progression/check-milestones`
- `GET /api/progression/balance`

### Dashboard
- `GET /api/dashboard`

## Component Names

### Pages
- `Login.tsx`
- `Register.tsx`
- `Dashboard.tsx`

### Components
- `OverallRankBadge.tsx`
- `SeasonIndicator.tsx`
- `CloudGauge.tsx`
- `ResourceCard.tsx`
- `CategoryXPBar.tsx`
- `BalanceIndicator.tsx`
- `ActivityXPCalculator.tsx`
- `LogoutButton.tsx`

## Service Names

### Backend Services
- `rankService.ts` - Rank and level calculations
- `xpCalculator.ts` - XP earning formulas
- `balanceService.ts` - Balance indicator logic
- `seasonValidator.ts` - Season transition validation
- `milestoneService.ts` - Milestone detection

### Frontend Services
- `api.ts` - API client
- `xpCalculator.ts` - Frontend XP calculations
- `rankService.ts` - Frontend rank calculations
- `dateUtils.ts` - Date formatting utilities

## Store Names

### Zustand Stores
- `useGameStore.ts` - Main game state management

## Type Definitions

### Enums
- `OverallRank` - RECRUIT, PRIVATE, CORPORAL, etc.
- `Season` - SPRING, SUMMER, AUTUMN, WINTER
- `EngineType` - CAREER, BUSINESS, INVESTMENT, LEARNING
- `EngineStatus` - ACTIVE, INACTIVE, PLANNING
- `ActivityType` - WORK_PROJECT, EXERCISE, SAVE_EXPENSES, etc.
- `MilestoneType` - OXYGEN_MONTHS, FIRST_ASSET, etc.

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `OverallRankBadge.tsx`)
- **Services**: camelCase (e.g., `xpCalculator.ts`)
- **Types**: camelCase (e.g., `index.ts`)
- **Routes**: camelCase (e.g., `auth.ts`)

### Variables
- **Constants**: UPPER_SNAKE_CASE (e.g., `RANK_THRESHOLDS`)
- **Functions**: camelCase (e.g., `calculateXP`)
- **Types/Interfaces**: PascalCase (e.g., `CategoryXP`)

### Database
- **Models**: PascalCase (e.g., `User`, `Cloud`)
- **Tables**: snake_case (e.g., `users`, `clouds`)
- **Fields**: camelCase (e.g., `overallXP`, `capacityStrength`)





