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

// States exist only under Agents or Systems (ontology refactor). Energy states live under Systems -> Health -> States.
const HEALTH_SYSTEM_STATES_ID = 'systems-node-health-states'
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
    sentiment: 'positive' as const,
    adviceToReinforce: 'Protect focus blocks; eliminate interruptions; set clear goals and single-task. Build rituals (time, place, cue) and gradually extend session length. Use environment design so focus becomes the default.',
    specialTermWhatItIs: 'Focus is a state of deep concentration where attention is narrowed on one task or goal and distractions are minimised. It is the gateway to flow and high-quality output.',
    specialTermKeyFacts: [
      'Single-tasking and clear goals sustain focus.',
      'Interruptions cause a significant cost to re-engage (context-switching).',
      'Focus is energy-intensive; it works best in protected time blocks.',
      'Environment design (quiet, cues, no notifications) makes focus easier to achieve.',
    ],
    specialTermHowItContributesToLife: 'Focus multiplies the quality and quantity of meaningful work. It supports learning, decision quality, and progress on what matters. Protecting focus is one of the highest-leverage habits for long-term outcomes and well-being.',
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
    sentiment: 'negative' as const,
    adviceToAvoid: 'Prioritise rest and recovery; reduce commitments; set boundaries. Address chronic stress and overcommitment. Seek support and consider role or environment changes. Recovery takes time—avoid rushing back to full load.',
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
    sentiment: 'positive' as const,
    adviceToReinforce: 'Create conditions for rest, safety, and acceptance; protect sleep and downtime. Reduce unnecessary stimulation and decision load. Use routines and environment to make calm the default between high-arousal periods.',
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
// sentiment + adviceToReinforce (positive) / adviceToAvoid (negative) for hierarchy tree sentiment & advice UI
const CHILD_STATES = [
  {
    parentTitle: 'ANGER',
    children: [
      {
        title: 'RAGE',
        description: 'Extreme anger with loss of control',
        category: RealityNodeCategory.FUNDAMENTAL,
        sentiment: 'negative' as const,
        adviceToAvoid: 'Pause before acting: take space, regulate breathing, or defer response. Name the feeling and the trigger. Redirect energy into non-harmful outlets (e.g. movement, writing). Address underlying injustice or threat when calm. Seek support if rage is frequent or hard to control.',
      },
      { title: 'RESENTMENT', description: 'Persistent bitter anger toward perceived wrong', category: RealityNodeCategory.FUNDAMENTAL },
      { title: 'FRUSTRATION', description: 'Anger at blocked goals or obstacles', category: RealityNodeCategory.FUNDAMENTAL },
    ]
  },
  {
    parentTitle: 'FOCUS',
    children: [
      {
        title: 'FLOW_STATE',
        description: 'Optimal experience with full immersion',
        category: RealityNodeCategory.FUNDAMENTAL,
        sentiment: 'positive' as const,
        adviceToReinforce: 'Match challenge to skill; eliminate interruptions; set clear goals and immediate feedback. Protect deep-work blocks and build rituals (time, place, cue) that signal focus. Gradually extend session length.',
        specialTermWhatItIs: 'Flow state (or "being in the zone") is a mental state of full immersion and focused energy where you perform at your best with a sense of ease. Attention is fully absorbed, self-consciousness drops, and time can feel distorted. It is the optimal experience described by psychologist Mihaly Csikszentmihalyi.',
        specialTermKeyFacts: [
          'Requires a balance between challenge and skill—neither boredom nor anxiety.',
          'Clear goals and immediate feedback support flow.',
          'Common in creative work, sports, music, and deep work when distractions are removed.',
          'Time can feel like it speeds up or slows down.',
          'Flow is fragile: interruptions can break it; recovery takes minutes.',
        ],
        specialTermHowItContributesToLife: 'Flow increases performance, learning, and satisfaction. It makes difficult tasks feel rewarding and builds mastery. Regular flow supports well-being, meaning, and sustained high output without burning out—so designing your environment and schedule to enable flow is a high-leverage investment in how you work and live.',
      },
      {
        title: 'DEEP_WORK',
        description: 'Sustained concentration on cognitively demanding task',
        category: RealityNodeCategory.FUNDAMENTAL,
        sentiment: 'positive' as const,
        adviceToReinforce: 'Schedule fixed blocks; remove distractions (notifications, clutter). Start with shorter sessions and increase. Use environment and routine as cues so deep work becomes a default.',
      },
    ]
  },
  {
    parentTitle: 'BURNOUT',
    children: [
      {
        title: 'CYNICISM',
        description: 'Negative detached attitude toward work',
        category: RealityNodeCategory.FUNDAMENTAL,
        sentiment: 'negative' as const,
        adviceToAvoid: 'Reconnect with purpose and small wins; limit exposure to negativity; set boundaries. Rest and recover before making big decisions. Seek meaning in one area (e.g. one project or relationship) before generalising. Consider role or environment change if sustained.',
      },
      { title: 'EMOTIONAL_EXHAUSTION', description: 'Feeling emotionally drained and depleted', category: RealityNodeCategory.FUNDAMENTAL },
    ]
  },
]

export async function seedEnergyStates() {
  console.log('🌱 Seeding Energy States...')

  try {
    // Energy states live under Systems -> Health -> States (States only under Agents or Systems)
    console.log('  → Creating ENERGY_STATES under Health system States...')

    // Create ENERGY_STATES category under Health system's States branch
    await createNode({
      id: ENERGY_STATES_ID,
      title: 'ENERGY_STATES',
      description: 'States related to energy, attention, and emotional arousal.',
      parentId: HEALTH_SYSTEM_STATES_ID,
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
          ...('sentiment' in state && state.sentiment && { sentiment: state.sentiment }),
          ...('adviceToReinforce' in state && state.adviceToReinforce && { adviceToReinforce: state.adviceToReinforce }),
          ...('adviceToAvoid' in state && state.adviceToAvoid && { adviceToAvoid: state.adviceToAvoid }),
          ...('specialTermWhatItIs' in state && state.specialTermWhatItIs && { specialTermWhatItIs: state.specialTermWhatItIs }),
          ...('specialTermKeyFacts' in state && state.specialTermKeyFacts && { specialTermKeyFacts: state.specialTermKeyFacts }),
          ...('specialTermHowItContributesToLife' in state && state.specialTermHowItContributesToLife && { specialTermHowItContributesToLife: state.specialTermHowItContributesToLife }),
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
        const metadata: Record<string, unknown> = {
          parentState: parentState.parentTitle,
          seededAt: new Date().toISOString(),
        }
        if ('sentiment' in child && child.sentiment) metadata.sentiment = child.sentiment
        if ('adviceToAvoid' in child && child.adviceToAvoid) metadata.adviceToAvoid = child.adviceToAvoid
        if ('adviceToReinforce' in child && child.adviceToReinforce) metadata.adviceToReinforce = child.adviceToReinforce
        if ('specialTermWhatItIs' in child && child.specialTermWhatItIs) metadata.specialTermWhatItIs = child.specialTermWhatItIs
        if ('specialTermKeyFacts' in child && child.specialTermKeyFacts) metadata.specialTermKeyFacts = child.specialTermKeyFacts
        if ('specialTermHowItContributesToLife' in child && child.specialTermHowItContributesToLife) metadata.specialTermHowItContributesToLife = child.specialTermHowItContributesToLife

        await createNode({
          id: childId,
          title: child.title,
          description: child.description,
          parentId: parentId,
          nodeType: RealityNodeType.PRINCIPLE,
          category: child.category,
          immutable: false,
          orderIndex: i + 1,
          metadata,
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

