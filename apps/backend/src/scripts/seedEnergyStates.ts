/**
 * Seed Energy States
 * 
 * Seeds energy states (Anger, Focus, Burnout, etc.) as Reality nodes
 * with parent/child relationships and XP impact metadata.
 */

import { PrismaClient, RealityNodeType, RealityNodeCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to create a node with upsert
async function createNode(data: {
  id: string
  title: string
  description?: string
  parentId: string | null
  nodeType: RealityNodeType
  category?: RealityNodeCategory
  immutable?: boolean
  orderIndex?: number
  metadata?: any
}) {
  return await prisma.realityNode.upsert({
    where: { id: data.id },
    update: {
      title: data.title,
      description: data.description,
      parentId: data.parentId,
      nodeType: data.nodeType,
      category: data.category,
      immutable: data.immutable ?? false,
      orderIndex: data.orderIndex || 0,
      metadata: data.metadata,
    },
    create: {
      id: data.id,
      title: data.title,
      description: data.description,
      parentId: data.parentId,
      nodeType: data.nodeType,
      category: data.category,
      immutable: data.immutable ?? false,
      orderIndex: data.orderIndex || 0,
      metadata: data.metadata,
    },
  })
}

const STATES_ID = 'reality-root-states'
const ENERGY_STATES_ID = 'states-energy-states'

// Energy states with full metadata including XP impacts
const ENERGY_STATES = [
  {
    title: 'ANGER',
    description: 'Short term energy surge driven by perceived threat or injustice',
    risesFrom: ['FEAR', 'THREAT_PERCEPTION', 'INJUSTICE'],
    givesRiseTo: ['RAGE', 'RESENTMENT', 'IMPULSIVE_ACTION'],
    strengths: [
      'Increased urgency',
      'Short term courage',
      'Reduced inhibition',
      'Can override fear temporarily'
    ],
    weaknesses: [
      'Collapses judgment',
      'Narrows attention',
      'Impairs long term planning',
      'Increases error rate',
      'Provokes escalation'
    ],
    status: 'Net negative over time',
    xpLedger: {
      primary: {
        decisionQuality: -30,      // → enginesXP
        strategicClarity: -40,      // → optionalityXP
        trustCapital: -20           // → meaningXP
      },
      secondary: {
        energyBurn: -15,            // → capacityXP
        recoveryTimePenalty: 25,
        reputationRisk: 'Variable'
      }
    },
    verdict: 'High cost, low compound value. Situational use only. Poor default state.',
    category: RealityNodeCategory.FUNDAMENTAL,
  },
  {
    title: 'FOCUS',
    description: 'Deep concentration state with narrowed attention and high productivity',
    risesFrom: ['CLARITY', 'PURPOSE', 'OPTIMAL_AROUSAL'],
    givesRiseTo: ['FLOW_STATE', 'PRODUCTIVITY', 'ACHIEVEMENT'],
    strengths: [
      'Heightened attention',
      'Reduced distractions',
      'Increased output quality',
      'Time compression effect',
      'Higher completion rate'
    ],
    weaknesses: [
      'Tunnel vision risk',
      'May miss peripheral opportunities',
      'Energy intensive',
      'Requires setup time',
      'Fragile to interruption'
    ],
    status: 'Net positive with proper management',
    xpLedger: {
      primary: {
        decisionQuality: 40,        // → enginesXP
        strategicClarity: 30,        // → optionalityXP
        productiveOutput: 50         // → enginesXP
      },
      secondary: {
        energyBurn: -20,             // → capacityXP (focused work is costly)
        xpGainMultiplier: 1.5,       // Bonus XP while in focus
        qualityBonus: 25
      }
    },
    verdict: 'High value state. Cultivate and protect. Use strategically for important work.',
    category: RealityNodeCategory.FUNDAMENTAL,
  },
  {
    title: 'BURNOUT',
    description: 'Depleted state from prolonged stress and insufficient recovery',
    risesFrom: ['CHRONIC_STRESS', 'INSUFFICIENT_RECOVERY', 'OVERCOMMITMENT'],
    givesRiseTo: ['CYNICISM', 'DETACHMENT', 'REDUCED_EFFECTIVENESS'],
    strengths: [
      'Forces recognition of limits',
      'Signals need for change',
      'Opportunity for reset'
    ],
    weaknesses: [
      'Severely reduced capacity',
      'Impaired judgment',
      'Low motivation',
      'Extended recovery time',
      'Compounds over time',
      'Affects all domains'
    ],
    status: 'Critical negative state requiring intervention',
    xpLedger: {
      primary: {
        decisionQuality: -50,        // → enginesXP
        strategicClarity: -60,        // → optionalityXP
        effectiveCapacity: -70       // → capacityXP
      },
      secondary: {
        xpGainMultiplier: 0.3,       // Severely reduced XP gain
        recoveryTimeRequired: 100,   // Long recovery period
        riskOfCompounding: 'High',
        domainSpillover: 'All domains affected'
      }
    },
    verdict: 'Catastrophic state. Prevention critical. Recovery requires extended time and deliberate action.',
    category: RealityNodeCategory.FUNDAMENTAL,
  },
  {
    title: 'CALM',
    description: 'Centered state with low arousal and stable emotional baseline',
    risesFrom: ['REST', 'SAFETY', 'ACCEPTANCE'],
    givesRiseTo: ['CLARITY', 'PATIENCE', 'OPENNESS'],
    strengths: [
      'Stable decision making',
      'Low energy cost',
      'Sustainable indefinitely',
      'Receptive to input',
      'Good default state'
    ],
    weaknesses: [
      'May lack urgency',
      'Reduced peak performance',
      'Can become complacency',
      'May miss time-sensitive opportunities'
    ],
    status: 'Positive baseline state',
    xpLedger: {
      primary: {
        decisionQuality: 20,         // → enginesXP
        strategicClarity: 25,         // → optionalityXP
        sustainableCapacity: 30      // → capacityXP
      },
      secondary: {
        energyBurn: -5,              // Very low energy cost
        recoveryRate: 15,            // Facilitates recovery
        emotionalStability: 40       // → meaningXP
      }
    },
    verdict: 'Excellent default state. Low cost, sustainable, enables good judgment.',
    category: RealityNodeCategory.FUNDAMENTAL,
  },
  {
    title: 'EXCITEMENT',
    description: 'High energy positive arousal state with elevated motivation',
    risesFrom: ['ANTICIPATION', 'OPPORTUNITY', 'NOVELTY'],
    givesRiseTo: ['ENTHUSIASM', 'ACTION', 'EXPLORATION'],
    strengths: [
      'High motivation',
      'Increased energy',
      'Willingness to take action',
      'Contagious to others',
      'Overcomes inertia'
    ],
    weaknesses: [
      'Can lead to overcommitment',
      'May cause hasty decisions',
      'Unsustainable long-term',
      'Can become anxiety',
      'Burnout risk if prolonged'
    ],
    status: 'Positive but unstable',
    xpLedger: {
      primary: {
        initiativeBonus: 35,         // → enginesXP
        momentumGeneration: 30,      // → optionalityXP
        actionBias: 25               // More likely to act
      },
      secondary: {
        energyBurn: -15,             // High energy cost
        riskTolerance: 'Increased',
        overcommitmentRisk: 'Moderate'
      }
    },
    verdict: 'Valuable for initiation and momentum. Manage duration and transition to sustainable states.',
    category: RealityNodeCategory.FUNDAMENTAL,
  },
]

// Child states (states that arise from primary states)
const CHILD_STATES = [
  {
    parentTitle: 'ANGER',
    children: [
      { title: 'RAGE', description: 'Extreme anger with loss of control', category: RealityNodeCategory.FUNDAMENTAL },
      { title: 'RESENTMENT', description: 'Persistent bitter anger toward perceived wrong', category: RealityNodeCategory.FUNDAMENTAL },
      { title: 'FRUSTRATION', description: 'Anger at blocked goals or obstacles', category: RealityNodeCategory.FUNDAMENTAL },
    ]
  },
  {
    parentTitle: 'FOCUS',
    children: [
      { title: 'FLOW_STATE', description: 'Optimal experience with full immersion', category: RealityNodeCategory.FUNDAMENTAL },
      { title: 'DEEP_WORK', description: 'Sustained concentration on cognitively demanding task', category: RealityNodeCategory.FUNDAMENTAL },
    ]
  },
  {
    parentTitle: 'BURNOUT',
    children: [
      { title: 'CYNICISM', description: 'Negative detached attitude toward work', category: RealityNodeCategory.FUNDAMENTAL },
      { title: 'EMOTIONAL_EXHAUSTION', description: 'Feeling emotionally drained and depleted', category: RealityNodeCategory.FUNDAMENTAL },
    ]
  },
]

export async function seedEnergyStates() {
  console.log('🌱 Seeding Energy States...')

  try {
    // Create STATES branch under REALITY (if not exists)
    console.log('  → Creating STATES branch...')
    await createNode({
      id: STATES_ID,
      title: 'STATES',
      description: 'Mental, emotional, and energy states that affect performance and outcomes.',
      parentId: 'reality-root',
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 4, // After CONSTRAINTS, AGENTS, ENVIRONMENTS
    })

    // Create ENERGY_STATES category under STATES
    console.log('  → Creating ENERGY_STATES category...')
    await createNode({
      id: ENERGY_STATES_ID,
      title: 'ENERGY_STATES',
      description: 'States related to energy, attention, and emotional arousal.',
      parentId: STATES_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FUNDAMENTAL,
      immutable: true,
      orderIndex: 1,
    })

    // Create primary energy states
    console.log('  → Creating primary energy states...')
    for (let i = 0; i < ENERGY_STATES.length; i++) {
      const state = ENERGY_STATES[i]
      const stateId = `${ENERGY_STATES_ID}-${state.title.toLowerCase()}`
      
      await createNode({
        id: stateId,
        title: state.title,
        description: state.description,
        parentId: ENERGY_STATES_ID,
        nodeType: RealityNodeType.PRINCIPLE,
        category: state.category,
        immutable: false,
        orderIndex: i + 1,
        metadata: {
          state: state.title,
          description: state.description,
          risesFrom: state.risesFrom,
          givesRiseTo: state.givesRiseTo,
          strengths: state.strengths,
          weaknesses: state.weaknesses,
          status: state.status,
          xpLedger: state.xpLedger,
          verdict: state.verdict,
          seededAt: new Date().toISOString(),
        },
      })
      
      console.log(`    ✓ Created ${state.title}`)
    }

    // Create child states
    console.log('  → Creating child states...')
    for (const parentState of CHILD_STATES) {
      const parentId = `${ENERGY_STATES_ID}-${parentState.parentTitle.toLowerCase()}`
      
      for (let i = 0; i < parentState.children.length; i++) {
        const child = parentState.children[i]
        const childId = `${parentId}-${child.title.toLowerCase()}`
        
        await createNode({
          id: childId,
          title: child.title,
          description: child.description,
          parentId: parentId,
          nodeType: RealityNodeType.PRINCIPLE,
          category: child.category,
          immutable: false,
          orderIndex: i + 1,
          metadata: {
            parentState: parentState.parentTitle,
            seededAt: new Date().toISOString(),
          },
        })
        
        console.log(`    ✓ Created ${child.title} (child of ${parentState.parentTitle})`)
      }
    }

    console.log('✅ Energy States seeded successfully!')
    console.log(`   Created ${ENERGY_STATES.length} primary states`)
    console.log(`   Created ${CHILD_STATES.reduce((sum, p) => sum + p.children.length, 0)} child states`)

  } catch (error) {
    console.error('❌ Error seeding energy states:', error)
    throw error
  }
}

// Export for use in master seed script
export default seedEnergyStates

// Allow running standalone (ES module compatible check)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnergyStates()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

