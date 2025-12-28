/**
 * Seed Health/Capacity Knowledge Articles
 * 
 * Populates the database with knowledge articles for health and capacity systems.
 * These articles provide knowledge sources for agents and teams.
 */

import { PrismaClient, AgentType, TeamDomain } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding health/capacity knowledge articles...')

  // Get health agents and team
  const capacitySpecialist = await prisma.agent.findUnique({
    where: { type: AgentType.CAPACITY_SPECIALIST },
  })
  const recoveryCoach = await prisma.agent.findUnique({
    where: { type: AgentType.RECOVERY_COACH },
  })
  const burnoutSpecialist = await prisma.agent.findUnique({
    where: { type: AgentType.BURNOUT_PREVENTION_SPECIALIST },
  })
  const healthTeam = await prisma.team.findUnique({
    where: { domain: TeamDomain.HEALTH_CAPACITY },
  })

  if (!capacitySpecialist || !recoveryCoach || !burnoutSpecialist || !healthTeam) {
    console.log('⚠️  Health agents or team not found. Please run seedAgents.ts and seedTeams.ts first.')
    return
  }

  const knowledgeArticles = [
    // Capacity Specialist Knowledge
    {
      agentId: capacitySpecialist.id,
      teamId: null,
      title: 'Understanding Capacity: The Foundation of Human Operating Stability',
      content: `# Understanding Capacity: The Foundation of Human Operating Stability

## Overview

Capacity represents human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity. It is a state (0-100), not a resource, that modifies outcomes rather than being consumed.

## Key Principles

### Capacity is a State, Not a Resource

- Capacity ranges from 0-100 and represents your operating stability
- It modifies outcomes (energy cap, XP efficiency) but is not consumed by actions
- Capacity decays and recovers over time based on behavior patterns

### Capacity Bands

- **Critical (0-20)**: Maximum decay rate, high failure risk, no burnout protection
- **Low (21-30)**: Accelerated decay, reduced resilience, high burnout risk
- **Medium (31-60)**: Standard operation, normal decay rates, basic resilience
- **High (61-80)**: Decay protection, burnout resistance, optimal range
- **Optimal (81-100)**: Maximum decay protection, strong burnout resistance

### Capacity Modifies Energy

- High Capacity (80+) → Usable energy cap: 110
- Medium-High Capacity (60-79) → Usable energy cap: 100
- Medium Capacity (30-59) → Usable energy cap: 85
- Low Capacity (<30) → Usable energy cap: 70
- Burnout → Energy cap: 40 (regardless of capacity)

### Capacity Modifies XP Efficiency

- Optimal (81-100) → 115% XP efficiency
- High (61-80) → 110% XP efficiency
- Medium (31-60) → 100% XP efficiency
- Low (21-30) → 80% XP efficiency
- Critical (0-20) → 60% XP efficiency

## Sources

- Life World OS Capacity System Design
- Human Performance Research
- Recovery Science Literature`,
    },
    {
      agentId: capacitySpecialist.id,
      teamId: null,
      title: 'Capacity Decay Mechanisms: Understanding Effort and Imbalance',
      content: `# Capacity Decay Mechanisms: Understanding Effort and Imbalance

## Weekly Decay System

Capacity decays on weekly ticks based on three factors:

### 1. Effort-Based Decay

- **7 consecutive high effort days** → -1 capacity decay
- **14 consecutive high effort days** → -2 capacity decay
- **21+ consecutive high effort days** → -3 capacity decay

High effort is defined as using >80% of usable energy in a day.

### 2. Chronic Imbalance Decay

- **Work actions >70% of total actions** → -1 capacity decay
- This represents chronic overwork and lack of balance

### 3. Chronic Neglect Decay

- **No recovery actions for 7+ days** → -1 capacity decay
- Recovery actions: Exercise, Learning, Save Expenses, Rest

## Decay Floor

- Capacity cannot decay below 20 (floor value)
- This prevents complete capacity collapse

## Prevention Strategies

1. Monitor consecutive high effort days
2. Maintain work/recovery balance (avoid >70% work actions)
3. Perform 2-4 recovery actions per week
4. Take breaks before hitting effort thresholds

## Sources

- Life World OS Decay System Design
- Work-Life Balance Research
- Burnout Prevention Studies`,
    },
    // Recovery Coach Knowledge
    {
      agentId: recoveryCoach.id,
      teamId: null,
      title: 'Recovery Actions: Building Capacity Through Consistent Practice',
      content: `# Recovery Actions: Building Capacity Through Consistent Practice

## Recovery Action Types

### Exercise
- **Energy Cost**: 25
- **XP**: Grants XP (varies by activity)
- **Recovery**: Improves capacity over time
- **Best For**: Physical health and capacity building

### Learning
- **Energy Cost**: 20
- **XP**: Grants XP (varies by activity)
- **Recovery**: Improves capacity over time
- **Best For**: Cognitive health and skill development

### Save Expenses
- **Energy Cost**: 15
- **XP**: Grants XP (varies by activity)
- **Recovery**: Improves capacity over time
- **Best For**: Financial stability and capacity building

### Rest
- **Energy Cost**: 18
- **XP**: No XP granted
- **Recovery**: Pure capacity improvement
- **Best For**: When energy is low but recovery is needed

## Weekly Recovery System

### Recovery Requirements

- **Minimum**: 2 recovery actions per week for any recovery
- **Optimal**: 4+ recovery actions per week for maximum recovery

### Recovery Rates

- **2-3 actions per week** → +1 capacity per week
- **4+ actions per week** → +2 capacity per week (maximum)

### Recovery Timing

- Recovery occurs on **weekly ticks**, not daily
- Recovery is **gradual and capped** - cannot be rushed
- Recovery requires **consistency** - sporadic actions are less effective

## Energy Management

- Recovery actions **consume energy** - plan accordingly
- Rest has lower energy cost (18) than Exercise (25)
- Balance recovery actions with daily energy budget

## Sources

- Life World OS Recovery System Design
- Recovery Science Research
- Rest and Regeneration Studies`,
    },
    {
      agentId: recoveryCoach.id,
      teamId: null,
      title: 'Recovery Planning: Strategic Capacity Restoration',
      content: `# Recovery Planning: Strategic Capacity Restoration

## Recovery Planning Principles

### 1. Consistency Over Intensity

- Regular recovery (2-4 actions/week) beats sporadic intense recovery
- Recovery is gradual - expect +1 to +2 capacity per week with consistency

### 2. Energy Budget Planning

- Recovery actions consume energy (15-25 per action)
- Plan recovery around daily energy availability
- Use Rest action when energy is low but recovery is needed

### 3. Recovery Action Diversity

- Mix different recovery action types for balanced recovery
- Exercise for physical health
- Learning for cognitive health
- Save Expenses for financial stability
- Rest for pure recovery when energy is limited

### 4. Weekly Recovery Cycles

- Recovery occurs on weekly ticks
- Plan recovery actions across the week, not all at once
- Track recovery actions per week to ensure minimum (2) or optimal (4+)

## Recovery Effectiveness

### Factors Affecting Recovery

- **Action Count**: More actions = more recovery (up to +2 per week)
- **Consistency**: Regular recovery beats sporadic recovery
- **Current Capacity**: Lower capacity may require more recovery actions
- **Energy Availability**: Sufficient energy needed for recovery actions

### Recovery Limitations

- Recovery is **capped** at +2 capacity per week
- Recovery **cannot be rushed** - it's gradual
- Recovery requires **time and repetition**
- Recovery does **not grant XP** (except Exercise, Learning, Save Expenses)

## Sources

- Life World OS Recovery Mechanics
- Capacity Restoration Research
- Recovery Planning Best Practices`,
    },
    // Burnout Prevention Specialist Knowledge
    {
      agentId: burnoutSpecialist.id,
      teamId: null,
      title: 'Burnout Prevention: Understanding Risk and Protection',
      content: `# Burnout Prevention: Understanding Risk and Protection

## Burnout Trigger

Burnout is triggered when:
- **Capacity <30** for **7+ consecutive days**

## Burnout Effects

When in burnout:
- **Energy cap reduced to 40** (regardless of capacity)
- **XP efficiency reduced by 70%**
- **Work actions blocked**
- Recovery actions still allowed

## Burnout Risk Levels

### High Risk
- Capacity <30
- Consecutive low capacity days increasing
- No recovery actions in past week

### Medium Risk
- Capacity 30-50
- Some recovery actions but inconsistent
- Approaching low capacity threshold

### Low Risk
- Capacity >50
- Regular recovery actions (2-4 per week)
- Balanced work/recovery ratio

## Burnout Protection

### High Capacity Protection
- **Capacity 61-100** provides burnout resistance
- High capacity reduces burnout risk significantly
- Optimal capacity (81-100) provides maximum protection

### Recovery Actions
- Recovery actions help **prevent** burnout
- Recovery actions help **exit** burnout
- Consistent recovery (2-4 actions/week) is essential

## Prevention Strategies

1. **Maintain capacity above 30** - reduces risk from high to medium
2. **Regular recovery actions** - 2-4 per week minimum
3. **Monitor consecutive high effort days** - take breaks before 7 days
4. **Balance work/recovery** - avoid chronic imbalance (>70% work)
5. **Track capacity band** - identify risk early (critical/low/medium/high/optimal)

## Sources

- Life World OS Burnout System Design
- Burnout Prevention Research
- Occupational Health Studies`,
    },
    {
      agentId: burnoutSpecialist.id,
      teamId: null,
      title: 'Effort Management: Preventing Capacity Decay Through Balance',
      content: `# Effort Management: Preventing Capacity Decay Through Balance

## Effort Thresholds

### Consecutive High Effort Days

- **7 days** → -1 capacity decay (warning threshold)
- **14 days** → -2 capacity decay (high risk)
- **21+ days** → -3 capacity decay (critical risk)

### High Effort Definition

- Using **>80% of usable energy** in a single day
- Usable energy = capacity-modified energy cap
- High effort indicates pushing beyond sustainable limits

## Chronic Imbalance

### Work Action Threshold

- **Work actions >70% of total actions** → -1 capacity decay
- This represents chronic overwork and lack of recovery
- Balance is essential - work must be balanced with recovery

### Imbalance Detection

- Calculate work action percentage over past 7 days
- If >70%, chronic imbalance decay applies
- Recovery actions help balance the ratio

## Prevention Strategies

### 1. Monitor Effort Levels

- Track daily energy expenditure
- Calculate percentage of usable energy used
- Identify high effort days (>80% usage)

### 2. Take Strategic Breaks

- Take breaks before hitting 7-day threshold
- Plan recovery periods during high effort periods
- Balance work intensity with recovery

### 3. Maintain Work/Recovery Balance

- Keep work actions <70% of total actions
- Include recovery actions regularly
- Avoid chronic work imbalance

### 4. Plan Recovery During High Effort

- Recovery is most critical during high effort periods
- Schedule recovery actions even when busy
- Use Rest action if energy is limited

## Sources

- Life World OS Effort Tracking System
- Work Intensity Research
- Sustainable Performance Studies`,
    },
    // Team Knowledge Articles
    {
      agentId: null,
      teamId: healthTeam.id,
      title: 'Health & Capacity System: Complete Guide',
      content: `# Health & Capacity System: Complete Guide

## System Overview

The Health & Capacity System models human operating stability through capacity management, recovery planning, and burnout prevention.

## Core Components

### 1. Capacity State (0-100)

- Represents operating stability
- Modifies energy cap and XP efficiency
- Decays and recovers based on behavior

### 2. Recovery Actions

- Exercise, Learning, Save Expenses, Rest
- Consume energy but improve capacity
- Require 2-4 actions per week for recovery

### 3. Effort Tracking

- Monitors consecutive high effort days
- Tracks work/recovery balance
- Prevents capacity decay through awareness

### 4. Burnout Prevention

- Monitors capacity and effort patterns
- Provides risk assessment
- Enables proactive prevention

## System Interactions

### Energy System
- Capacity modifies usable energy cap
- High capacity = more energy
- Low capacity = less energy

### XP System
- Capacity modifies XP efficiency
- High capacity = XP bonus
- Low capacity = XP penalty

### Burnout System
- Low capacity increases burnout risk
- High capacity provides protection
- Recovery actions help prevent/exit burnout

## Best Practices

1. Maintain capacity above 30 (reduces burnout risk)
2. Perform 2-4 recovery actions per week
3. Monitor consecutive high effort days
4. Balance work and recovery actions
5. Track capacity band regularly

## Sources

- Life World OS Health System Design
- Capacity Management Research
- Human Performance Optimization`,
    },
    {
      agentId: null,
      teamId: healthTeam.id,
      title: 'Capacity and Energy: Understanding the Relationship',
      content: `# Capacity and Energy: Understanding the Relationship

## Capacity Modifies Energy Cap

Capacity directly affects your usable energy cap:

### Capacity-Based Energy Caps

- **Optimal (81-100)**: 110 usable energy
- **High (61-80)**: 100 usable energy
- **Medium (31-60)**: 85 usable energy
- **Low (21-30)**: 70 usable energy
- **Critical (0-20)**: 70 usable energy
- **Burnout**: 40 usable energy (regardless of capacity)

## Energy Expenditure Calculation

### High Effort Threshold

- High effort = using **>80% of usable energy** in a day
- Usable energy = capacity-modified energy cap
- Example: Capacity 50 → Usable cap 85 → High effort if using >68 energy

### Effort Tracking

- System tracks consecutive high effort days
- 7+ consecutive days triggers capacity decay
- Monitoring effort prevents decay

## Energy and Recovery

### Recovery Action Energy Costs

- Exercise: 25 energy
- Learning: 20 energy
- Save Expenses: 15 energy
- Rest: 18 energy

### Energy Planning

- Plan recovery actions considering daily energy budget
- Use Rest when energy is low but recovery is needed
- Balance recovery with other energy-consuming actions

## Sources

- Life World OS Energy System Design
- Capacity-Energy Interaction Research
- Energy Management Studies`,
    },
  ]

  for (const articleData of knowledgeArticles) {
    const article = await prisma.knowledgeArticle.upsert({
      where: {
        id: `${articleData.agentId || articleData.teamId}-${articleData.title.toLowerCase().replace(/\s+/g, '-')}`,
      },
      create: {
        id: `${articleData.agentId || articleData.teamId}-${articleData.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...articleData,
      },
      update: {
        title: articleData.title,
        content: articleData.content,
      },
    })

    console.log(`✅ Created knowledge article: ${article.title}`)
  }

  console.log('✨ Health knowledge seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


