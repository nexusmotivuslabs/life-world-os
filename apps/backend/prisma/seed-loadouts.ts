/**
 * Seed Loadout Items
 * 
 * Creates initial loadout items for the system
 */

import { PrismaClient, LoadoutSlotType } from '@prisma/client'

const prisma = new PrismaClient()

const loadoutItems = [
  // Primary Weapons
  {
    name: 'Resilience',
    slotType: LoadoutSlotType.PRIMARY_WEAPON,
    description: 'Your ability to bounce back from setbacks and maintain stability under pressure. Increases Capacity and reduces energy cost for recovery actions.',
    powerLevel: 300,
    benefits: {
      capacity: 15,
      energyCostReduction: 0.1,
    },
    metadata: {
      xpMapping: {
        capacity: 15,
        emotionalStability: 20, // → meaningXP
        decisionQuality: 10, // → enginesXP
      },
      counters: ['Anger', 'Stress', 'Burnout'],
      synergies: ['Discipline', 'Patience'],
    },
    isDefault: true,
  },
  {
    name: 'Discipline',
    slotType: LoadoutSlotType.PRIMARY_WEAPON,
    description: 'Consistent execution and follow-through. Improves XP gain and reduces the impact of missed actions.',
    powerLevel: 280,
    benefits: {
      xpGain: 0.1,
      engines: 10,
    },
    metadata: {
      xpMapping: {
        engines: 10,
        decisionQuality: 25, // → enginesXP
        consistency: 20, // → enginesXP
      },
      counters: ['Procrastination', 'Distraction'],
      synergies: ['Focus', 'Resilience'],
    },
    isDefault: true,
  },
  {
    name: 'Focus',
    slotType: LoadoutSlotType.PRIMARY_WEAPON,
    description: 'Deep concentration and single-minded execution. Increases XP efficiency and reduces energy waste.',
    powerLevel: 290,
    benefits: {
      xpGain: 0.15,
      energyEfficiency: 0.1,
    },
    metadata: {
      xpMapping: {
        productiveOutput: 30, // → enginesXP
        qualityBonus: 25, // → enginesXP
        strategicClarity: 15, // → optionalityXP
      },
      counters: ['Distraction', 'Fragmentation'],
      synergies: ['Discipline', 'Calm'],
    },
    isDefault: true,
  },
  {
    name: 'Determination',
    slotType: LoadoutSlotType.PRIMARY_WEAPON,
    description: 'Unwavering commitment to goals. Provides bonuses to all stats and increases overall effectiveness.',
    powerLevel: 320,
    benefits: {
      capacity: 10,
      engines: 10,
      oxygen: 5,
      meaning: 5,
      optionality: 5,
    },
    metadata: {
      xpMapping: {
        capacity: 10,
        engines: 10,
        oxygen: 5,
        meaning: 5,
        optionality: 5,
      },
      counters: ['Doubt', 'Hesitation'],
      synergies: ['All'],
    },
    isDefault: true,
  },
  {
    name: 'Strategic Thinking',
    slotType: LoadoutSlotType.PRIMARY_WEAPON,
    description: 'Long-term planning and pattern recognition. Enhances decision quality and opens new possibilities.',
    powerLevel: 310,
    benefits: {
      optionality: 20,
      meaning: 10,
    },
    metadata: {
      xpMapping: {
        strategicClarity: 40, // → optionalityXP
        decisionQuality: 30, // → enginesXP
        patternRecognition: 25, // → enginesXP
      },
      counters: ['Short-term Thinking', 'Impulsiveness'],
      synergies: ['Patience', 'Clarity'],
    },
    isDefault: true,
  },

  // Secondary Weapons
  {
    name: 'Courage',
    slotType: LoadoutSlotType.SECONDARY_WEAPON,
    description: 'The ability to take calculated risks and face challenges head-on. Increases Optionality and unlocks new opportunities.',
    powerLevel: 250,
    benefits: {
      optionality: 15,
      xpGain: 0.05,
    },
    metadata: {
      xpMapping: {
        optionality: 15,
        riskTolerance: 20, // → optionalityXP
        actionBias: 15, // → enginesXP
      },
      counters: ['Fear', 'Hesitation'],
      synergies: ['Determination', 'Strategic Thinking'],
    },
    isDefault: true,
  },
  {
    name: 'Adaptability',
    slotType: LoadoutSlotType.SECONDARY_WEAPON,
    description: 'Quick adjustment to changing circumstances. Reduces penalties from unexpected events and improves resource management.',
    powerLevel: 240,
    benefits: {
      oxygen: 10,
      energyEfficiency: 0.15,
    },
    metadata: {
      xpMapping: {
        oxygen: 10,
        flexibility: 20, // → optionalityXP
        resilience: 15, // → capacityXP
      },
      counters: ['Rigidity', 'Overwhelm'],
      synergies: ['Strategic Thinking', 'Clarity'],
    },
    isDefault: true,
  },
  {
    name: 'Patience',
    slotType: LoadoutSlotType.SECONDARY_WEAPON,
    description: 'Long-term thinking and delayed gratification. Improves compound growth and reduces burnout risk.',
    powerLevel: 230,
    benefits: {
      meaning: 12,
      capacity: 8,
    },
    metadata: {
      xpMapping: {
        meaning: 12,
        capacity: 8,
        longTermThinking: 25, // → meaningXP
        compoundGrowth: 20, // → oxygenXP
      },
      counters: ['Impulsiveness', 'Short-term Thinking'],
      synergies: ['Strategic Thinking', 'Discipline'],
    },
    isDefault: true,
  },
  {
    name: 'Persistence',
    slotType: LoadoutSlotType.SECONDARY_WEAPON,
    description: 'Continued effort despite obstacles. Provides consistent bonuses and reduces failure penalties.',
    powerLevel: 260,
    benefits: {
      engines: 12,
      xpGain: 0.08,
    },
    metadata: {
      xpMapping: {
        engines: 12,
        consistency: 20, // → enginesXP
        grit: 25, // → capacityXP
      },
      counters: ['Giving Up', 'Discouragement'],
      synergies: ['Discipline', 'Resilience'],
    },
    isDefault: true,
  },
  {
    name: 'Composure',
    slotType: LoadoutSlotType.SECONDARY_WEAPON,
    description: 'Emotional regulation and steady temperament. Reduces negative energy impacts and maintains performance under pressure.',
    powerLevel: 270,
    benefits: {
      meaning: 15,
      capacity: 10,
    },
    metadata: {
      xpMapping: {
        meaning: 15,
        capacity: 10,
        emotionalStability: 30, // → meaningXP
        stressReduction: 25, // → capacityXP
      },
      counters: ['Anger', 'Anxiety', 'Panic'],
      synergies: ['Resilience', 'Calm', 'Patience'],
    },
    isDefault: true,
  },

  // Grenades
  {
    name: 'Energy Boost',
    slotType: LoadoutSlotType.GRENADE,
    description: 'A temporary surge of energy that allows for extra actions. Provides immediate energy restoration.',
    powerLevel: 150,
    benefits: {
      energyEfficiency: 0.2,
    },
    isDefault: true,
  },
  {
    name: 'Quick Recovery',
    slotType: LoadoutSlotType.GRENADE,
    description: 'Rapid restoration of Capacity after high-effort periods. Reduces recovery time.',
    powerLevel: 140,
    benefits: {
      capacity: 20,
    },
    isDefault: true,
  },
  {
    name: 'Momentum Shift',
    slotType: LoadoutSlotType.GRENADE,
    description: 'A sudden change in trajectory that breaks negative patterns. Provides XP bonus for next action.',
    powerLevel: 160,
    benefits: {
      xpGain: 0.25,
    },
    isDefault: true,
  },

  // Armor Abilities
  {
    name: 'Shield',
    slotType: LoadoutSlotType.ARMOR_ABILITY,
    description: 'Protection against setbacks and negative events. Reduces impact of failures and mistakes.',
    powerLevel: 180,
    benefits: {
      oxygen: 15,
      armor: 10,
    },
    metadata: {
      xpMapping: {
        oxygen: 15,
        protectionBonus: 20, // → capacityXP
        riskMitigation: 15, // → optionalityXP
      },
      counters: ['Setbacks', 'Failures'],
      synergies: ['Resilience', 'Fortification'],
    },
    isDefault: true,
  },
  {
    name: 'Regeneration',
    slotType: LoadoutSlotType.ARMOR_ABILITY,
    description: 'Passive recovery of resources over time. Provides steady resource gains.',
    powerLevel: 170,
    benefits: {
      capacity: 12,
      energyEfficiency: 0.12,
    },
    metadata: {
      xpMapping: {
        capacity: 12,
        recoveryRate: 25, // → capacityXP
        sustainability: 20, // → oxygenXP
      },
      counters: ['Depletion', 'Energy Drain'],
      synergies: ['Recovery', 'Balance'],
    },
    isDefault: true,
  },
  {
    name: 'Fortification',
    slotType: LoadoutSlotType.ARMOR_ABILITY,
    description: 'Strengthened defenses against burnout and capacity loss. Increases maximum Capacity.',
    powerLevel: 190,
    benefits: {
      capacity: 25,
    },
    metadata: {
      xpMapping: {
        capacity: 25,
        maxCapacityBonus: 30, // → capacityXP
        burnoutPrevention: 25, // → capacityXP
      },
      counters: ['Burnout', 'Capacity Loss'],
      synergies: ['Resilience', 'Shield'],
    },
    isDefault: true,
  },
  {
    name: 'Recovery',
    slotType: LoadoutSlotType.ARMOR_ABILITY,
    description: 'Accelerated burnout recovery and energy restoration. Dramatically reduces recovery time required.',
    powerLevel: 200,
    benefits: {
      capacity: 20,
      energyEfficiency: 0.15,
    },
    metadata: {
      xpMapping: {
        capacity: 20,
        recoverySpeed: 40, // → capacityXP
        energyRestoration: 35, // → capacityXP
      },
      counters: ['Burnout', 'Exhaustion', 'Depletion'],
      synergies: ['Regeneration', 'Calm', 'Balance'],
    },
    isDefault: true,
  },

  // Tactical Packages
  {
    name: 'Efficiency',
    slotType: LoadoutSlotType.TACTICAL_PACKAGE,
    description: 'Optimized resource usage and reduced waste. Improves energy efficiency across all actions.',
    powerLevel: 200,
    benefits: {
      energyEfficiency: 0.2,
      energyCostReduction: 0.15,
    },
    metadata: {
      xpMapping: {
        resourceOptimization: 30, // → oxygenXP
        wasteReduction: 25, // → capacityXP
      },
      counters: ['Waste', 'Inefficiency'],
      synergies: ['Optimization', 'Focus'],
    },
    isDefault: true,
  },
  {
    name: 'Synergy',
    slotType: LoadoutSlotType.TACTICAL_PACKAGE,
    description: 'Enhanced coordination between different systems. Provides bonuses when multiple stats are balanced.',
    powerLevel: 210,
    benefits: {
      xpGain: 0.12,
      engines: 8,
      oxygen: 8,
    },
    metadata: {
      xpMapping: {
        engines: 8,
        oxygen: 8,
        systemCoordination: 25, // → optionalityXP
      },
      counters: ['Fragmentation', 'Silos'],
      synergies: ['Balance', 'All'],
    },
    isDefault: true,
  },
  {
    name: 'Optimization',
    slotType: LoadoutSlotType.TACTICAL_PACKAGE,
    description: 'Systematic improvement of processes and workflows. Increases overall effectiveness.',
    powerLevel: 220,
    benefits: {
      xpGain: 0.18,
      energyEfficiency: 0.1,
    },
    metadata: {
      xpMapping: {
        processImprovement: 35, // → enginesXP
        systematicGains: 30, // → enginesXP
      },
      counters: ['Suboptimal Processes', 'Waste'],
      synergies: ['Efficiency', 'Strategic Thinking'],
    },
    isDefault: true,
  },

  // Support Upgrades
  {
    name: 'Motivation',
    slotType: LoadoutSlotType.SUPPORT_UPGRADE,
    description: 'Sustained drive and enthusiasm. Provides consistent bonuses to XP gain and action outcomes.',
    powerLevel: 160,
    benefits: {
      xpGain: 0.1,
      meaning: 10,
    },
    metadata: {
      xpMapping: {
        meaning: 10,
        intrinsicDrive: 25, // → meaningXP
        sustainedEnthusiasm: 20, // → capacityXP
      },
      counters: ['Apathy', 'Low Energy'],
      synergies: ['Clarity', 'Determination'],
    },
    isDefault: true,
  },
  {
    name: 'Clarity',
    slotType: LoadoutSlotType.SUPPORT_UPGRADE,
    description: 'Clear vision and understanding of goals. Improves decision-making and reduces wasted effort.',
    powerLevel: 150,
    benefits: {
      meaning: 15,
      optionality: 10,
    },
    metadata: {
      xpMapping: {
        meaning: 15,
        optionality: 10,
        goalAlignment: 30, // → meaningXP
        decisionClarity: 25, // → enginesXP
      },
      counters: ['Confusion', 'Lack of Direction'],
      synergies: ['Strategic Thinking', 'Focus'],
    },
    isDefault: true,
  },
  {
    name: 'Balance',
    slotType: LoadoutSlotType.SUPPORT_UPGRADE,
    description: 'Harmonious integration of all life systems. Provides small bonuses to all stats.',
    powerLevel: 170,
    benefits: {
      capacity: 5,
      engines: 5,
      oxygen: 5,
      meaning: 5,
      optionality: 5,
    },
    metadata: {
      xpMapping: {
        capacity: 5,
        engines: 5,
        oxygen: 5,
        meaning: 5,
        optionality: 5,
        systemicHarmony: 20, // Bonus for integration
      },
      counters: ['Imbalance', 'Overspecialization'],
      synergies: ['All'],
    },
    isDefault: true,
  },
]

async function main() {
  console.log('Seeding loadout items...')

  for (const item of loadoutItems) {
    await prisma.loadoutItem.upsert({
      where: {
        name_slotType: {
          name: item.name,
          slotType: item.slotType,
        },
      },
      update: item,
      create: item,
    })
  }

  console.log(`Seeded ${loadoutItems.length} loadout items`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

