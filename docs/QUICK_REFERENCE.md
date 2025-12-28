# Quick Reference Card

## Project Information

**Project Name**: Life World OS  
**Package Name**: `life-world-os`  
**Database**: `lifeworld` (PostgreSQL on port 5433)  
**Backend**: http://localhost:3001  
**Frontend**: http://localhost:5173

## Database Connection

```
DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5433/lifeworld
```

## Common Commands

```bash
# Start database
npm run docker:up

# Start both servers
npm run dev

# Database migrations
npm run migrate

# Seed database
npm run seed

# Prisma Studio
npm run studio

# Stop database
npm run docker:down
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5433/lifeworld
JWT_SECRET=life-world-os-dev-secret-key-change-in-production-min-32-chars-required
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## API Base URL

```
http://localhost:3001/api
```

## Authentication

All API requests (except `/api/auth/*`) require:
```
Authorization: Bearer <token>
```

## Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/dashboard` - Get all dashboard data
- `POST /api/xp/activity` - Record activity and earn XP
- `GET /api/xp` - Get current XP and levels
- `GET /api/seasons/current` - Get current season
- `POST /api/seasons/transition` - Change season
- `GET /api/resources` - Get resources
- `GET /api/clouds` - Get cloud strengths

## Seasons

- **SPRING** - Planning and preparation
- **SUMMER** - Peak output and execution
- **AUTUMN** - Harvest and consolidation
- **WINTER** - Rest and recovery

## Resources

- **Oxygen** - Months of expenses covered (decimal)
- **Water** - Health and energy (0-100)
- **Gold** - Assets and savings (currency)
- **Armor** - Buffers and boundaries (0-100)
- **Keys** - Unlocked options (count)

## Clouds

- **Capacity** - Health, energy, nervous system
- **Engines** - Salary, business, investments
- **Oxygen** - Cash flow and stability
- **Meaning** - Values, direction, philosophy
- **Optionality** - Assets, savings, skills, freedom

## XP Categories

- Capacity XP
- Engines XP
- Oxygen XP
- Meaning XP
- Optionality XP

## Ranks (Overall)

1. RECRUIT
2. PRIVATE
3. CORPORAL
4. SERGEANT
5. STAFF_SERGEANT
6. SERGEANT_FIRST_CLASS
7. MASTER_SERGEANT
8. FIRST_SERGEANT
9. SERGEANT_MAJOR
10. COMMAND_SERGEANT_MAJOR

## Engine Types

- CAREER
- BUSINESS
- INVESTMENT
- LEARNING

## Activity Types

- WORK_PROJECT
- EXERCISE
- SAVE_EXPENSES
- LEARNING
- SEASON_COMPLETION
- MILESTONE
- CUSTOM

## File Structure

```
life-world-os/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── lib/
│   │   └── prisma/
│   └── frontend/
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── services/
│           └── store/
├── docs/
└── docker-compose.yml
```

## Troubleshooting

**Port 5432 already in use**: Database uses port 5433  
**Database connection error**: Check DATABASE_URL in backend/.env  
**CORS errors**: Verify VITE_API_URL in frontend/.env  
**Prisma errors**: Run `npm run generate` in apps/backend

## Documentation Files

- `SYSTEM_DESIGN.md` - Full system explanation
- `API_DOCUMENTATION.md` - Complete API reference
- `NAMING_REFERENCE.md` - All names and conventions
- `XP_SYSTEM.md` - XP formulas and progression
- `SEASONS_GUIDE.md` - Season rules
- `LIFE_WORLD_MAP.md` - Visual map
- `OPERATING_LOOPS.md` - Operating procedures


