# Energy System Architecture

## Overview

The Energy System follows the same clean architecture pattern as the Money System, implementing domain-driven design principles.

## Architecture Layers

### 1. Domain Layer (`domains/energy/domain/`)

**Entities:**
- `Sleep.ts` - Sleep log entity with business logic
- `EnergyBoost.ts` - Temporary energy boost entity

**Value Objects:**
- `BaseEnergy.ts` - Base energy value object (immutable, validates rules)
- `SleepQuality.ts` - Sleep quality (1-10 scale)
- `EnergyRestoration.ts` - Energy restoration calculation

**Domain Services:**
- `EnergyCalculationService.ts` - Pure business logic for energy calculations

### 2. Application Layer (`domains/energy/application/`)

**Ports (Interfaces):**
- `SleepRepositoryPort.ts` - Sleep data persistence contract
- `EnergyBoostRepositoryPort.ts` - Energy boost data persistence contract
- `UserEnergyContextPort.ts` - User energy context access contract

**Use Cases:**
- `SleepUseCases.ts`:
  - `LogSleepUseCase` - Log sleep and calculate restoration
  - `GetSleepHistoryUseCase` - Get sleep history
  - `GetMostRecentSleepUseCase` - Get most recent sleep
  - `CalculateEnergyRestorationUseCase` - Calculate restoration for a date

- `EnergyBoostUseCases.ts`:
  - `CreateEnergyBoostUseCase` - Create temporary boost
  - `GetActiveBoostsUseCase` - Get active boosts
  - `CleanupExpiredBoostsUseCase` - Clean up expired boosts

### 3. Infrastructure Layer (`domains/energy/infrastructure/`)

**Adapters:**
- `PrismaSleepRepositoryAdapter.ts` - Prisma implementation of SleepRepositoryPort
- `PrismaEnergyBoostRepositoryAdapter.ts` - Prisma implementation of EnergyBoostRepositoryPort
- `UserEnergyContextAdapter.ts` - Prisma implementation of UserEnergyContextPort

### 4. Presentation Layer (`domains/energy/presentation/`)

**Controllers:**
- `SleepController.ts` - REST API endpoints for sleep operations
- `EnergyController.ts` - REST API endpoints for energy status and boosts

## API Endpoints

### Sleep Endpoints

- `POST /api/sleep` - Log sleep for a specific date
- `GET /api/sleep` - Get sleep history (optional startDate/endDate query params)
- `GET /api/sleep/recent` - Get most recent sleep log
- `POST /api/sleep/calculate-restoration` - Calculate energy restoration for a date

### Energy Endpoints

- `GET /api/energy/status` - Get current energy status
- `POST /api/energy/boosts` - Create a temporary energy boost
- `GET /api/energy/boosts` - Get active energy boosts
- `POST /api/energy/boosts/cleanup` - Clean up expired boosts

## Frontend Structure

### Pages
- `MasterEnergy.tsx` - Main energy system page (similar to MasterMoney)

### Components
- `EnergyStatusCard.tsx` - Base energy visualization (Sun/Moon)
- `SleepLogForm.tsx` - Sleep logging interface
- `EnergyLawsView.tsx` - Display energy domain laws
- `MasterEnergyCard.tsx` - Dashboard card linking to Master Energy

### Services
- `energyApi.ts` - API client for energy system

## Database Schema

### SleepLog Model
```prisma
model SleepLog {
  id              String   @id @default(uuid())
  userId          String
  date            DateTime @db.Date
  hoursSlept      Decimal  @db.Decimal(3, 1)
  quality         Int      // 1-10
  bedTime         DateTime?
  wakeTime        DateTime?
  energyRestored  Int
  notes           String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}
```

### EnergyBoost Model
```prisma
model EnergyBoost {
  id              String    @id @default(uuid())
  userId          String
  type            BoostType
  amount          Int
  duration        Int       // minutes
  decayRate       Decimal   @db.Decimal(5, 2)
  expiresAt       DateTime
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([expiresAt])
}
```

## Key Features

### 1. Sleep-Based Energy Restoration
- Base energy only restores through sleep
- Restoration calculated from hours slept and quality
- Optimal sleep (7-9h, quality 8+) gets bonus restoration

### 2. Temporary Boosts
- Caffeine, food, supplements provide temporary energy
- Boosts decay over time
- Don't restore base energy - only add temporary amount

### 3. Base Energy Visualization
- Sun during daytime (sunrise to sunset)
- Moon during nighttime (sunset to sunrise)
- Moon phases based on base energy level
- Prominent display like moon on Earth

### 4. Energy Laws
- 48 Laws of Power applied to energy domain
- Bible Laws applied to energy domain
- Contextual guidance based on energy state

## Setup Instructions

### 1. Generate Prisma Client
```bash
cd apps/backend
npx prisma generate
```

### 2. Create Database Migration
```bash
cd apps/backend
npx prisma migrate dev --name add_energy_system
```

### 3. Seed Energy Laws
```bash
cd apps/backend
npx tsx src/scripts/seedPowerLaws.ts
npx tsx src/scripts/seedBibleLaws.ts
```

## Access Points

### Frontend
- **Dashboard:** `/dashboard` - MasterEnergyCard component
- **Master Energy Page:** `/master-energy` - Full energy system interface

### Backend API
- Sleep endpoints: `/api/sleep/*`
- Energy endpoints: `/api/energy/*`
- Energy laws: `/api/power-laws?domain=ENERGY` and `/api/bible-laws?domain=ENERGY`

## Design Principles

1. **Clean Architecture** - Same pattern as Money System
2. **Domain-Driven Design** - Business logic in domain layer
3. **Dependency Inversion** - Ports define contracts, adapters implement
4. **Separation of Concerns** - Each layer has clear responsibility
5. **Testability** - Pure domain logic, mockable ports

## Comparison with Money System

| Aspect | Money System | Energy System |
|--------|-------------|---------------|
| Domain | `domains/money` | `domains/energy` |
| Main Entity | Agent, Team, Product | Sleep, EnergyBoost |
| Value Objects | Money, EmergencyFundGoal | BaseEnergy, SleepQuality |
| Use Cases | ChatWithAgent, EmergencyFund | LogSleep, CreateBoost |
| Controllers | AgentController, ProductController | SleepController, EnergyController |
| Frontend Page | MasterMoney.tsx | MasterEnergy.tsx |
| API Service | moneyApi.ts | energyApi.ts |

## Next Steps

1. Integrate sleep logging with daily tick system
2. Add energy restoration to daily tick
3. Create energy planning tools
4. Add capacity management interface
5. Implement burnout prevention recommendations

