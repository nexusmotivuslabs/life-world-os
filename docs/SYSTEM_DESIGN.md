# Life World Operating System - System Design

## Overview

The Life World OS is a gamified life operating system that helps users allocate effort, energy, and resources sustainably across time. It treats life as a living world governed by Clouds, Seasons, Resources, Engines, and Capacity limits.

## Core Philosophy

- **Long-term resilience over short-term optimization**
- **Optionality and freedom over dependency**
- **Sustainable cycles over permanent grind**
- **Human well-being over productivity metrics**

## System Components

### 1. Clouds of Life (Background Systems)

Five persistent clouds that influence all outcomes:

1. **Capacity Cloud** - Health, energy, nervous system resilience
2. **Engines Cloud** - Income sources (salary, business, investments)
3. **Oxygen Cloud** - Cash flow and financial stability
4. **Meaning Cloud** - Values, direction, philosophy
5. **Optionality Cloud** - Assets, savings, skills, freedom

Each cloud has a strength (0-100) that affects system behavior.

### 2. Seasons of Life (Cyclical Modes)

Four repeating seasons with explicit rules:

- **Spring**: Planning & Preparation
- **Summer**: Peak Output
- **Autumn**: Harvest & Consolidation
- **Winter**: Rest & Recovery

Seasons rotate deliberately with minimum duration requirements and transition rules.

### 3. Resources and Currencies

Five primary resources:

- **Oxygen**: Monthly cash flow coverage (decimal)
- **Water**: Health and energy score (0-100)
- **Gold**: Assets and savings (currency)
- **Armor**: Buffers, systems, boundaries (0-100)
- **Keys**: Options unlocked, freedom milestones (integer)

### 4. XP System (Halo 3 + Destiny 2 Hybrid)

**Overall XP System:**
- Single unified XP pool from all activities
- Overall Rank progression (Recruit → Command Sergeant Major)
- Overall Level calculation

**Category XP System:**
- Separate XP pools for each Cloud
- Category levels (1-50+)
- Balance indicator for imbalanced development

### 5. Engines (Value Creation Mechanisms)

Four engine types:
- **Career Engine**: Salary, employment income
- **Business Engine**: Entrepreneurship, side projects
- **Investment Engine**: Passive income, assets
- **Learning Engine**: Skills, knowledge, network

Each engine has fragility score, output, and status.

### 6. System Rules and Safeguards

Hard system rules:
- One primary season at a time
- No major bets during winter
- No expansion without oxygen surplus (3+ months)
- Health degradation (Water < 30) blocks progression
- Automatic winter trigger if Water < 20
- Season transitions require minimum duration (4 weeks)

## Progression System

### Overall Progression
- Rank determined by total Overall XP
- Level = floor(Overall XP / 5000) + 1
- Rank-ups unlock new capabilities

### Category Progression
- Each Cloud has independent level
- Level = floor(Category XP / 1000) + 1
- Balance indicator warns of imbalance

### Milestones
- Major achievements award large XP bonuses
- Milestones unlock Keys (freedom currency)
- Tracked separately from XP

## XP Earning Mechanics

Activities earn both Overall XP and Category XP:

- **Work Project**: +500 overall, +300 engines, +100 capacity, +50 oxygen
- **Exercise**: +200 overall, +250 capacity, +50 optionality
- **Save Expenses**: +1000 overall, +500 oxygen, +300 optionality, +200 engines
- **Learning**: +400 overall, +200 optionality, +150 capacity, +100 engines

Season multipliers:
- Spring: +1.2x Learning/Planning
- Summer: +1.3x Work/Revenue
- Autumn: +1.2x Optimization/Teaching
- Winter: +1.1x Rest/Reflection

## Operating Loops

### Weekly Loop
- Review current season and resources
- Record activities and earn XP
- Check balance indicator
- Adjust cloud strengths if needed

### Quarterly Loop
- Review season history
- Check milestone progress
- Plan next season transition
- Assess engine performance

## Technical Architecture

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- RESTful API

### Frontend
- React 18 + TypeScript
- Vite build tool
- TailwindCSS styling
- Zustand state management
- Recharts visualization
- Framer Motion animations

## Data Flow

1. User records activity
2. System calculates XP (overall + categories)
3. Applies season multiplier
4. Updates XP, rank, and levels
5. Checks for milestones
6. Updates resources if provided
7. Logs activity for history

## Safety Mechanisms

- Season transition validation
- Water level checks
- Oxygen surplus requirements
- Balance warnings
- Automatic winter triggers





