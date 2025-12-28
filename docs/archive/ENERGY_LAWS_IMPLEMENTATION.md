# Energy Domain: Bible Laws & 48 Laws of Power Implementation

## Overview

This document describes the implementation of Bible Laws and 48 Laws of Power applied to the Energy domain (energy management, sleep, capacity, and vitality).

## Changes Made

### 1. Schema Updates

**File:** `apps/backend/prisma/schema.prisma`

- Added `ENERGY` to `PowerLawDomain` enum
- Added `ENERGY` to `BibleLawDomain` enum

### 2. Data Files Created

**File:** `apps/backend/src/scripts/energyPowerLawsData.ts`
- Contains 10 selected 48 Laws of Power applied to energy management
- Laws included: 1, 2, 3, 6, 10, 15, 22, 29, 38, 48
- Each law includes domain application, strategies, examples, warnings, and counter-strategies

**File:** `apps/backend/src/scripts/energyBibleLawsData.ts`
- Contains 5 Bible laws applied to energy management
- Laws included:
  1. Your Body is a Temple (1 Corinthians 6:19-20)
  2. Come to Me, All You Who Are Weary (Matthew 11:28)
  3. Six Days You Shall Labor (Exodus 20:9-10)
  4. Be Still and Know That I Am God (Psalm 46:10)
  5. Do Not Be Anxious (Matthew 6:25-27)
- Each law includes principles, practical applications, examples, warnings, and related verses

### 3. Seed Scripts Updated

**File:** `apps/backend/src/scripts/seedPowerLaws.ts`
- Updated to support multiple domains
- Added ENERGY domain seeding
- Now seeds both MONEY and ENERGY domains

**File:** `apps/backend/src/scripts/seedBibleLaws.ts`
- Updated to support multiple domains
- Added ENERGY domain seeding
- Now seeds MONEY, INVESTMENT, and ENERGY domains

## Setup Instructions

### 1. Generate Prisma Client

```bash
cd apps/backend
npx prisma generate
```

### 2. Create Database Migration

```bash
cd apps/backend
npx prisma migrate dev --name add_energy_domain_to_laws
```

### 3. Seed the Data

**Seed Power Laws:**
```bash
cd apps/backend
npx tsx src/scripts/seedPowerLaws.ts
```

**Seed Bible Laws:**
```bash
cd apps/backend
npx tsx src/scripts/seedBibleLaws.ts
```

## API Endpoints

The existing controllers already support domain filtering, so they work automatically with the ENERGY domain:

### Power Laws

- `GET /api/power-laws?domain=ENERGY` - Get all energy domain power laws
- `GET /api/power-laws/by-number/:lawNumber?domain=ENERGY` - Get specific law by number

### Bible Laws

- `GET /api/bible-laws?domain=ENERGY` - Get all energy domain Bible laws
- `GET /api/bible-laws/by-number/:lawNumber?domain=ENERGY` - Get specific law by number
- `GET /api/bible-laws/domains` - Lists all domains including ENERGY

## Key Concepts

### 48 Laws of Power - Energy Applications

1. **Never Outshine the Master** - Work with circadian rhythms, not against them
2. **Never Put Too Much Trust in Friends** - Don't rely on temporary boosts (caffeine) as foundation
3. **Conceal Your Intentions** - Protect your energy boundaries without explaining
6. **Court Attention at All Costs** - Use high energy strategically to stand out
10. **Infection: Avoid the Unhappy and Unlucky** - Energy is contagious - surround yourself with high-energy people
15. **Crush Your Enemy Totally** - Eliminate energy drains completely, not partially
22. **Use the Surrender Tactic** - When energy is low, rest strategically
29. **Plan All the Way to the End** - Plan energy allocation for sustainability
38. **Think as You Like But Behave Like Others** - Manage energy without making a show of it
48. **Assume Formlessness** - Adapt energy strategy to circumstances

### Bible Laws - Energy Applications

1. **Your Body is a Temple** - Honor God by stewarding your energy and rest
2. **Come to Me, All You Who Are Weary** - True rest is found in God, not just sleep
3. **Six Days You Shall Labor** - Follow God's rhythm of work and rest
4. **Be Still and Know That I Am God** - Stillness is an act of faith
5. **Do Not Be Anxious** - Worry drains energy - trust God with your needs

## Integration with Energy System

These laws can be integrated into the energy management system to provide:

1. **Contextual Guidance** - Show relevant laws based on energy state
2. **Educational Content** - Teach energy management principles through laws
3. **Motivation** - Provide wisdom-based motivation for good energy habits
4. **Strategic Planning** - Use laws to guide energy allocation decisions

## Next Steps

1. Create UI components to display energy domain laws
2. Integrate law recommendations into energy dashboard
3. Add contextual law suggestions based on user's energy state
4. Create learning paths that unlock laws as users demonstrate good habits

