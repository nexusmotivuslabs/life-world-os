# Training System Documentation

## Overview

The Training System is a quest-like progression system that teaches users financial wellness concepts through actionable tasks. Each task completion rewards XP and improves game stats, similar to Call of Duty's ranking system.

## Features

- **7 Training Modules** covering key financial concepts
- **Progressive Unlocking** - modules unlock as you complete prerequisites
- **XP Rewards** - each task awards XP mapped to relevant game stats
- **Resource Rewards** - some tasks also grant resources (oxygen, keys, etc.)
- **Quest-like UI** - visual progress tracking and completion states

## Training Modules

### 1. Build Emergency Fund
**Goal:** Start with 1 month, aim for 6+ months of expenses saved

**Tasks:**
- Calculate Your Monthly Expenses (10 XP, mainly Oxygen)
- Open a High-Yield Savings Account (15 XP)
- Save Your First Month of Expenses (25 XP + 1 month Oxygen)
- Reach 3 Months of Expenses (40 XP + 2 months Oxygen)
- Reach 6 Months of Expenses (60 XP + 3 months Oxygen + 1 Key)

**Unlock:** Available from RECRUIT rank

### 2. Increase Income Through Engines
**Goal:** Build engines (salary, business, investments) to generate more income

**Tasks:**
- Identify Your Current Income Sources (10 XP, mainly Engines)
- Research Salary Benchmarks (15 XP)
- Create a Career Development Plan (25 XP)
- Start a Side Income Stream (40 XP + 1 Key)

**Unlock:** Complete 2 tasks from Emergency Fund module

### 3. Reduce Unnecessary Expenses
**Goal:** Cut costs without reducing quality of life

**Tasks:**
- Audit Your Subscriptions (15 XP)
- Negotiate Bills (20 XP)
- Implement the 24-Hour Rule (15 XP)

**Unlock:** Complete 1 previous task

### 4. Automate Savings from Each Paycheck
**Goal:** Set up automatic transfers to make saving effortless

**Tasks:**
- Set Up Automatic Transfer (20 XP)
- Implement Pay Yourself First (25 XP)

**Unlock:** Complete 2 previous tasks

### 5. Create Multiple Income Streams
**Goal:** Diversify your income sources for financial security

**Tasks:**
- Learn About Income Stream Types (15 XP)
- Start Your Second Income Stream (30 XP + 1 Key)
- Build to 3+ Income Streams (50 XP + 1 Key)

**Unlock:** PRIVATE rank + 5 completed tasks

### 6. Track Expenses and Identify Waste
**Goal:** Monitor spending to find opportunities to save

**Tasks:**
- Track Expenses for One Week (15 XP)
- Identify Your Top 3 Spending Categories (20 XP)
- Find One Wasteful Expense to Eliminate (25 XP)

**Unlock:** Complete 1 previous task

### 7. Avoid Lifestyle Inflation
**Goal:** Resist the urge to increase spending as income grows

**Tasks:**
- Understand Lifestyle Inflation (15 XP)
- Create a Spending Cap (25 XP)
- Bank Your Raises (30 XP + 0.5 months Oxygen)

**Unlock:** PRIVATE rank + 8 completed tasks

## XP Distribution

Each task type has a specific XP distribution pattern:

- **Emergency Fund tasks** → 60% Oxygen, 10% each other category
- **Increase Income tasks** → 70% Engines, 10% each other
- **Reduce Expenses tasks** → 50% Oxygen, 20% Capacity
- **Automate Savings tasks** → 50% Oxygen, 20% Engines, 15% Capacity
- **Multiple Income Streams** → 60% Engines, 15% Optionality
- **Track Expenses** → 40% Oxygen, 20% Capacity, 15% each Meaning/Optionality
- **Avoid Lifestyle Inflation** → 40% Oxygen, 20% Capacity, 20% Meaning

## Database Schema

### TrainingModule
- `type`: TrainingModuleType enum
- `title`: Module name
- `description`: Module description
- `order`: Display order
- `requiredRank`: Minimum rank to unlock (optional)
- `requiredTasks`: Number of previous tasks to complete (optional)

### TrainingTask
- `moduleId`: Parent module
- `title`: Task name
- `description`: Task description
- `instructions`: Step-by-step instructions
- `order`: Task order within module
- `xpReward`: Base XP reward
- `categoryXP`: JSON object with category XP distribution
- `resourceReward`: JSON object with resource rewards (optional)
- `requiresVerification`: Whether user must mark as complete

### TrainingProgress
- `userId`: User who owns the progress
- `taskId`: Task being tracked
- `status`: LOCKED, AVAILABLE, IN_PROGRESS, or COMPLETED
- `completedAt`: When task was completed
- `notes`: User notes about completion

## API Endpoints

### GET /api/training
Get all training modules with tasks and user progress.

**Response:**
```json
{
  "modules": [
    {
      "id": "uuid",
      "type": "EMERGENCY_FUND",
      "title": "Build Emergency Fund",
      "description": "...",
      "isUnlocked": true,
      "completedTasks": 2,
      "totalTasks": 5,
      "progress": 40,
      "tasks": [...]
    }
  ]
}
```

### POST /api/training/tasks/:taskId/complete
Complete a training task.

**Request Body:**
```json
{
  "notes": "Optional notes about completion"
}
```

**Response:**
```json
{
  "success": true,
  "xpGained": {
    "overall": 25,
    "category": {
      "capacity": 3,
      "engines": 3,
      "oxygen": 15,
      "meaning": 2,
      "optionality": 2
    }
  },
  "resourceReward": {
    "oxygen": 1
  },
  "milestones": {...}
}
```

### GET /api/training/progress
Get user's training progress summary.

## Setup Instructions

### 1. Run Database Migration
```bash
cd apps/backend
npx prisma migrate dev --name add_training_system
```

### 2. Seed Training Data
```bash
npx tsx src/scripts/seedTraining.ts
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Start Frontend
```bash
cd apps/frontend
npm run dev
```

## Usage

1. **Access Training Center**: The Training Center appears on the Dashboard for logged-in users
2. **View Modules**: All modules are visible, but locked modules show a lock icon
3. **Expand Module**: Click on an unlocked module to see its tasks
4. **View Task Details**: Click "View Instructions" on an available task
5. **Complete Task**: Follow the instructions, then click "Mark Complete"
6. **Earn Rewards**: XP and resources are automatically awarded
7. **Unlock Next**: Complete tasks to unlock new modules

## Progression Flow

1. Start with **Emergency Fund** module (always unlocked)
2. Complete first 2 tasks → Unlocks **Increase Income**
3. Complete 1 task → Unlocks **Reduce Expenses** and **Track Expenses**
4. Complete 2 tasks → Unlocks **Automate Savings**
5. Reach PRIVATE rank + 5 tasks → Unlocks **Multiple Income Streams**
6. Reach PRIVATE rank + 8 tasks → Unlocks **Avoid Lifestyle Inflation**

## Customization

To add new training modules or tasks:

1. Add new `TrainingModuleType` enum value
2. Create module in seed script
3. Add tasks with appropriate XP distribution
4. Set unlock requirements (rank, task count)

## XP Calculation

XP is calculated based on:
- Task order (later tasks = more XP)
- Module type (determines category distribution)
- Base formula: `10 + (taskOrder * 5)` base XP

Category XP is then distributed based on module type percentages.

