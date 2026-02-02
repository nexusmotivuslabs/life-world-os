/**
 * Seed Reality Hierarchy
 * 
 * Seeds the Reality hierarchy with REALITY as root and its children/grandchildren.
 * Applies Pareto principle (80/20) - selects top 5 most important nodes at each level.
 * Maximum depth: 4 levels (REALITY -> Level 1 -> Level 2 -> Level 3)
 */

import { PrismaClient, RealityNodeType, RealityNodeCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Constants for node IDs
const REALITY_ID = 'reality-root'
const CONSTRAINTS_OF_REALITY_ID = 'constraints-of-reality'
const LAWS_ID = 'laws-node'
const PRINCIPLES_ID = 'principles-node'
const FRAMEWORKS_ID = 'frameworks-node'
const AGENTS_ID = 'agents-node'
const ENVIRONMENTS_ID = 'environments-node'
const RESOURCES_ID = 'resources-node'
const ENGINES_ID = 'engines-node'
const VALUE_ID = 'value-root'
const FINANCE_ID = 'finance-system'
const SYSTEMS_ID = 'systems-node'

/**
 * Merge metadata objects, preserving existing fields while adding/updating new ones
 */
function mergeMetadata(
  existing: Record<string, any> | null,
  newFields: Record<string, any>
): Record<string, any> {
  if (!existing) return newFields
  
  // Merge: new fields take precedence, but preserve existing custom fields
  // Only overwrite if new field is explicitly provided and not empty
  const merged = { ...existing }
  
  for (const [key, value] of Object.entries(newFields)) {
    // Always update version and sync timestamps
    if (key.startsWith('_')) {
      merged[key] = value
    } else if (value !== null && value !== undefined && value !== '') {
      // Update template fields if provided
      merged[key] = value
    }
    // Otherwise preserve existing value
  }
  
  return merged
}

// Helper function to create a node with upsert and smart metadata merging
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
  // First, try to find by ID
  let existing = await prisma.realityNode.findUnique({
    where: { id: data.id },
    select: { metadata: true },
  })

  // If not found by ID, check if a node with same title and parentId exists (unique constraint)
  if (!existing) {
    const existingByTitle = await prisma.realityNode.findFirst({
      where: {
        title: data.title,
        parentId: data.parentId,
      },
      select: { id: true, metadata: true },
    })
    
    if (existingByTitle) {
      // Node exists with same title/parentId but different ID - update it
      existing = existingByTitle
      // Update the ID to match what we want
      await prisma.realityNode.update({
        where: { id: existingByTitle.id },
        data: { id: data.id },
      })
      // Re-fetch with new ID
      existing = await prisma.realityNode.findUnique({
        where: { id: data.id },
        select: { metadata: true },
      })
    }
  }

  // Merge metadata if node exists
  const finalMetadata = existing
    ? mergeMetadata(existing.metadata as Record<string, any> | null, data.metadata || {})
    : data.metadata

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
      metadata: finalMetadata,
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
      metadata: finalMetadata,
    },
  })
}

// Pareto-selected top 5 fundamental laws (most impactful)
// Each law follows the template: Derived From, Statement, Recursive Behavior, Violation Outcome, Why This Law Persists
const FUNDAMENTAL_LAWS = [
  {
    title: 'LAW_OF_COMPOUNDING',
    description: 'Effects multiply over time. Small consistent actions lead to exponential results.',
    category: RealityNodeCategory.FUNDAMENTAL,
    derivedFrom: ['Constraints of Reality'],
    statement: 'Effects multiply over time. Small consistent actions lead to exponential results.',
    recursiveBehavior: 'Each compounding cycle amplifies the previous cycle, creating accelerating returns that become increasingly difficult to reverse.',
    violationOutcome: 'Systems that ignore compounding fail to account for exponential growth or decay, leading to catastrophic underestimation of long-term outcomes.',
    whyThisLawPersists: 'Time is unidirectional and effects accumulate. The mathematical nature of compounding is independent of human awareness or intention.',
  },
  {
    title: 'LAW_OF_ENTROPY',
    description: 'Systems tend toward disorder without energy input. Maintenance is required.',
    category: RealityNodeCategory.FUNDAMENTAL,
    derivedFrom: ['Constraints of Reality'],
    statement: 'Systems tend toward disorder without energy input. Maintenance is required.',
    recursiveBehavior: 'Disorder begets more disorder. Without intervention, systems degrade at an accelerating rate until they reach maximum entropy.',
    violationOutcome: 'Systems that ignore entropy experience progressive decay, eventual collapse, and loss of function without warning.',
    whyThisLawPersists: 'Energy distribution naturally moves toward equilibrium. This is a thermodynamic fact that applies to all systems, regardless of domain.',
  },
  {
    title: 'LAW_OF_TIME',
    description: 'Time flows in one direction. Opportunity cost is real and irreversible.',
    category: RealityNodeCategory.FUNDAMENTAL,
    derivedFrom: ['Constraints of Reality'],
    statement: 'Time flows in one direction. Opportunity cost is real and irreversible.',
    recursiveBehavior: 'Each moment forecloses alternatives. The cost of time spent compounds as future options diminish.',
    violationOutcome: 'Systems that ignore time constraints accumulate opportunity costs, miss windows of action, and face irreversible consequences.',
    whyThisLawPersists: 'Time is a fundamental dimension of reality. Its unidirectional nature is not a human construct but a physical constraint.',
  },
  {
    title: 'LAW_OF_ENERGY',
    description: 'Energy is conserved and transformed. All actions require energy expenditure.',
    category: RealityNodeCategory.FUNDAMENTAL,
    derivedFrom: ['Constraints of Reality'],
    statement: 'Energy is conserved and transformed. All actions require energy expenditure.',
    recursiveBehavior: 'Energy spent cannot be recovered. Each action depletes available energy, reducing capacity for future actions.',
    violationOutcome: 'Systems that ignore energy constraints exhaust themselves, experience burnout, and fail to sustain operations.',
    whyThisLawPersists: 'Energy conservation is a fundamental physical law. All processes, including cognitive and social ones, require energy transformation.',
  },
  {
    title: 'LAW_OF_CAUSE_EFFECT',
    description: 'Every effect has a cause. Actions have consequences, both intended and unintended.',
    category: RealityNodeCategory.FUNDAMENTAL,
    derivedFrom: ['Constraints of Reality'],
    statement: 'Every effect has a cause. Actions have consequences, both intended and unintended.',
    recursiveBehavior: 'Effects become causes for subsequent effects, creating chains of consequences that propagate through systems.',
    violationOutcome: 'Systems that ignore cause-effect relationships experience unexpected consequences, cascading failures, and loss of predictability.',
    whyThisLawPersists: 'Causality is a fundamental structure of reality. The relationship between actions and outcomes exists independently of observation.',
  },
]

// Pareto-selected top 5 strategic principles
// Each principle follows the template: Aligned With, Principle, Why It Works, Violation Pattern, Predictable Result
const STRATEGIC_PRINCIPLES = [
  {
    title: 'LEVERAGE',
    description: 'Use leverage to amplify results. Find ways to multiply your efforts.',
    category: RealityNodeCategory.STRATEGIC,
    alignedWith: ['Law of Energy', 'Law of Compounding'],
    principle: 'Seek mechanisms that multiply the impact of each unit of energy expended.',
    whyItWorks: 'Aligning with energy conservation and compounding allows limited resources to produce disproportionate outcomes over time.',
    violationPattern: 'Direct effort applied without leverage mechanisms, treating all actions as equal in impact.',
    predictableResult: 'Linear returns that fail to scale, eventual exhaustion from inefficient energy use, and inability to compete with leveraged systems.',
  },
  {
    title: 'MARGIN_OF_SAFETY',
    description: 'Build buffers and safety margins. Prepare for uncertainty and volatility.',
    category: RealityNodeCategory.STRATEGIC,
    alignedWith: ['Law of Entropy', 'Law of Cause and Effect'],
    principle: 'Maintain reserves and buffers that exceed minimum requirements to absorb unexpected disruptions.',
    whyItWorks: 'Entropy guarantees unexpected events. Cause-effect chains produce unforeseen consequences. Buffers provide resilience against both.',
    violationPattern: 'Operating at maximum capacity with no reserves, assuming predictable conditions, ignoring edge cases.',
    predictableResult: 'System failure when unexpected events occur, cascading breakdowns from single points of failure, inability to recover from disruptions.',
  },
  {
    title: 'INVERSION',
    description: 'Think backwards. Avoid failure by understanding what not to do.',
    category: RealityNodeCategory.STRATEGIC,
    alignedWith: ['Law of Cause and Effect'],
    principle: 'Identify and avoid actions that guarantee failure before optimizing for success.',
    whyItWorks: 'Cause-effect relationships work in reverse. Avoiding negative causes prevents negative effects more reliably than pursuing positive causes guarantees positive effects.',
    violationPattern: 'Focusing only on what to do, ignoring failure modes, assuming success is the default outcome.',
    predictableResult: 'Repeated failures from preventable causes, inability to learn from mistakes, optimization of the wrong variables.',
  },
  {
    title: 'OPPORTUNITY_COST',
    description: 'Every choice has a cost. The best alternative forgone is the real cost.',
    category: RealityNodeCategory.STRATEGIC,
    alignedWith: ['Law of Time', 'Law of Energy'],
    principle: 'Evaluate decisions by comparing against the best alternative use of the same time and energy.',
    whyItWorks: 'Time and energy are finite. Choosing one action precludes others. The value of the best alternative is the true cost of any decision.',
    violationPattern: 'Evaluating choices in isolation, ignoring alternatives, treating sunk costs as relevant, focusing only on direct costs.',
    predictableResult: 'Suboptimal resource allocation, accumulation of opportunity costs, failure to maximize value from limited resources.',
  },
  {
    title: 'SYSTEMS_THINKING',
    description: 'Understand interconnections and feedback loops. See the whole system.',
    category: RealityNodeCategory.STRATEGIC,
    alignedWith: ['Law of Cause and Effect', 'Law of Energy'],
    principle: 'Analyze systems by mapping relationships, feedback loops, and energy flows rather than isolated components.',
    whyItWorks: 'Cause-effect chains create interconnected systems. Energy flows through these connections. Understanding the system reveals leverage points and unintended consequences.',
    violationPattern: 'Optimizing individual components in isolation, ignoring feedback loops, treating systems as linear and independent.',
    predictableResult: 'Local optimizations that degrade system performance, unexpected side effects from interventions, inability to predict system behavior.',
  },
]

// Pareto-selected top 5 systemic principles
// Each principle follows the template: Aligned With, Principle, Why It Works, Violation Pattern, Predictable Result
const SYSTEMIC_PRINCIPLES = [
  {
    title: 'FIRST_PRINCIPLES',
    description: 'Break down complex problems to fundamental truths. Build from the ground up.',
    category: RealityNodeCategory.SYSTEMIC,
    alignedWith: ['Law of Cause and Effect'],
    principle: 'Reason from fundamental truths rather than analogies or assumptions.',
    whyItWorks: 'Cause-effect relationships trace to fundamental causes. Building from first principles ensures solutions address root causes rather than symptoms.',
    violationPattern: 'Reasoning by analogy, accepting assumptions without verification, building on inherited beliefs.',
    predictableResult: 'Solutions that address symptoms not causes, inability to innovate beyond existing patterns, accumulation of flawed assumptions.',
  },
  {
    title: 'FEEDBACK_LOOPS',
    description: 'Systems respond to feedback. Positive and negative loops drive behavior.',
    category: RealityNodeCategory.SYSTEMIC,
    alignedWith: ['Law of Cause and Effect', 'Law of Energy'],
    principle: 'Design systems with feedback mechanisms that adjust behavior based on outcomes.',
    whyItWorks: 'Cause-effect chains create feedback. Energy flows through these loops. Systems without feedback cannot adapt or self-correct.',
    violationPattern: 'Linear thinking without loops, ignoring system responses to interventions, designing open-loop systems.',
    predictableResult: 'Systems that cannot self-correct, accumulation of errors, inability to adapt to changing conditions.',
  },
  {
    title: 'EMERGENCE',
    description: 'Complex behaviors emerge from simple rules. The whole is greater than the sum.',
    category: RealityNodeCategory.SYSTEMIC,
    alignedWith: ['Law of Cause and Effect', 'Law of Compounding'],
    principle: 'Recognize that system-level properties emerge from component interactions, not component properties alone.',
    whyItWorks: 'Cause-effect interactions between components compound into system behaviors. The system exhibits properties that components alone do not possess.',
    violationPattern: 'Reductionist thinking that ignores interactions, assuming system behavior equals sum of parts, optimizing components in isolation.',
    predictableResult: 'Failure to predict system behavior, inability to design complex systems, missing emergent opportunities and risks.',
  },
  {
    title: 'ADAPTATION',
    description: 'Systems adapt to survive. Flexibility and resilience are key.',
    category: RealityNodeCategory.SYSTEMIC,
    alignedWith: ['Law of Entropy', 'Law of Energy'],
    principle: 'Design systems with capacity to change structure and behavior in response to environmental pressures.',
    whyItWorks: 'Entropy creates changing conditions. Energy constraints shift. Systems that cannot adapt exhaust energy fighting entropy and fail.',
    violationPattern: 'Rigid systems that resist change, optimizing for static conditions, assuming stability is permanent.',
    predictableResult: 'Systems that become obsolete, inability to respond to change, eventual failure when conditions shift.',
  },
  {
    title: 'HIERARCHY',
    description: 'Systems organize in hierarchies. Levels of abstraction enable complexity.',
    category: RealityNodeCategory.SYSTEMIC,
    alignedWith: ['Law of Cause and Effect'],
    principle: 'Structure systems in hierarchical layers where higher levels abstract and coordinate lower levels.',
    whyItWorks: 'Cause-effect relationships organize naturally into hierarchies. Abstraction reduces complexity while maintaining control. Hierarchies enable scaling.',
    violationPattern: 'Flat structures that ignore levels, mixing abstraction levels, treating all components as equal.',
    predictableResult: 'Complexity overload, inability to scale, loss of control, inefficient coordination.',
  },
]

// Cross-System State Principles (also act as modifiers)
const CROSS_SYSTEM_PRINCIPLES = [
  {
    title: 'TRUST',
    description: 'Trust is a forward-looking belief built on competence, reliability, and alignment. Acts as a global modifier affecting all systems.',
    category: RealityNodeCategory.CROSS_SYSTEM as any, // Type assertion for newly added enum
    alignedWith: ['Law of Cause and Effect', 'Law of Compounding'],
    principle: 'Build trust through consistent demonstration of competence, reliability, and alignment. Trust acts as a global modifier reducing costs and unlocking opportunities across all systems.',
    whyItWorks: 'Trust compounds slowly but decays quickly. High trust reduces verification costs, friction, and unlocks opportunities. Low trust increases costs and restricts access across all systems.',
    violationPattern: 'Inconsistent behavior, breaking commitments, acting against shared interests, demonstrating incompetence repeatedly.',
    predictableResult: 'Increased costs across all systems, restricted opportunities, higher verification requirements, reduced optionality, and system-wide friction.',
    metadata: {
      isCrossSystemModifier: true,
      modifierType: 'GLOBAL',
      affectsAllSystems: true,
      calculationBasis: ['Competence Score', 'Reliability Score', 'Alignment Score'],
      applicationRules: {
        costMultiplier: '(1 - trust/100) for high trust, (1 + (100-trust)/100) for low trust',
        opportunityUnlocker: 'Unlock when trust > threshold',
        frictionReducer: 'Reduce verification at high trust levels',
      },
    },
  },
  {
    title: 'REPUTATION',
    description: 'Reputation is not what people think of you. It is what they expect from you. A forward-looking expectation governing access.',
    category: RealityNodeCategory.CROSS_SYSTEM as any, // Type assertion for newly added enum
    alignedWith: ['Law of Compounding', 'Law of Cause and Effect'],
    principle: 'Reputation compounds like interest - slow to build, fast to destroy. Every interaction is a micro-deposit or withdrawal.',
    whyItWorks: 'Reputation governs access to opportunities, partnerships, and resources. High reputation opens doors; low reputation closes them across all systems.',
    violationPattern: 'Inconsistent outcomes, failing to meet expectations, negative public actions, breaking trust repeatedly.',
    predictableResult: 'Doors close, opportunities disappear, partnerships dissolve, restricted access to resources across all systems.',
    metadata: {
      isCrossSystemModifier: true,
      modifierType: 'ACCESS',
      affectsAllSystems: true,
    },
  },
  {
    title: 'OPTIONALITY',
    description: 'Optionality is the right, but not the obligation, to act. Strategic freedom across all systems.',
    category: RealityNodeCategory.CROSS_SYSTEM as any, // Type assertion for newly added enum
    alignedWith: ['Law of Time', 'Law of Energy'],
    principle: 'Maintain optionality by preserving resources and choices. High optionality unlocks higher-risk, higher-reward actions.',
    whyItWorks: 'Time and energy are finite. Optionality decays when resources are idle. High optionality enables asymmetric risk-reward opportunities.',
    violationPattern: 'Committing all resources early, eliminating choices, ignoring opportunity costs, using resources inefficiently.',
    predictableResult: 'Restricted actions, limited choices, forced paths, inability to respond to better opportunities, reduced strategic freedom.',
    metadata: {
      isCrossSystemModifier: true,
      modifierType: 'FREEDOM',
      affectsAllSystems: true,
    },
  },
  {
    title: 'ENERGY_RESERVE',
    description: 'Reserve energy enables sustained effort when needed. Stored capacity beyond daily budget.',
    category: RealityNodeCategory.CROSS_SYSTEM as any, // Type assertion for newly added enum
    alignedWith: ['Law of Energy', 'Law of Entropy'],
    principle: 'Build energy reserve through consistent energy management. Reserve enables cross-system sustained efforts during critical periods.',
    whyItWorks: 'Daily energy is insufficient for critical periods. Reserve enables sustained effort across multiple days and systems when needed.',
    violationPattern: 'Operating at maximum capacity, no reserve buffer, poor energy management, exhausting all energy daily.',
    predictableResult: 'Forced to stop when daily energy depleted, cannot sustain critical efforts, inability to handle emergencies, loss of momentum.',
    metadata: {
      isCrossSystemModifier: true,
      modifierType: 'CAPACITY',
      affectsAllSystems: true,
    },
  },
]

// Systems hierarchy data - organized by tier
interface SubSystem {
  name: string
  description: string
}

interface SystemData {
  id: string
  name: string
  description: string
  mantra: string
  route: string
  orderIndex: number
  subSystems?: SubSystem[]
}

const SYSTEMS_HIERARCHY_DATA: Record<string, SystemData[]> = {
  SURVIVAL_TIER: [
    {
      id: 'health',
      name: 'HEALTH',
      description: 'Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity.',
      mantra: 'Capacity governs everything else.',
      route: '/master/health',
      orderIndex: 1,
      subSystems: [
        { name: 'CAPACITY', description: 'Capacity state management and tracking' },
        { name: 'RECOVERY', description: 'Recovery actions and elasticity' },
        { name: 'RESILIENCE', description: 'Mental and physical resilience' },
      ],
    },
  ],
  STABILITY_TIER: [
    {
      id: 'money',
      name: 'MONEY',
      description: 'Financial guidance with AI agents, domain teams, and interactive products.',
      mantra: 'Cash flow is oxygen. Buffers are armor.',
      route: '/master/money',
      orderIndex: 1,
      subSystems: [
        { name: 'PRODUCTS', description: 'Financial products and services' },
        { name: 'AGENTS', description: 'AI agents for financial guidance' },
        { name: 'TEAMS', description: 'Domain teams and workflows' },
      ],
    },
    {
      id: 'energy',
      name: 'ENERGY',
      description: 'Track and manage your energy levels and capacity.',
      mantra: 'Energy is the currency of action.',
      route: '/master/energy',
      orderIndex: 2,
      subSystems: [
        { name: 'STATES', description: 'Energy states and levels' },
        { name: 'LEVELS', description: 'Energy capacity levels' },
        { name: 'BUFFS', description: 'Energy enhancements and buffs' },
      ],
    },
  ],
  GROWTH_TIER: [
    {
      id: 'education',
      name: 'EDUCATION',
      description: 'Education System (Tier 0). Learning, knowledge acquisition, and skill development across all domains.',
      mantra: 'Learning is the foundation of all growth.',
      route: '/master/education',
      orderIndex: 0,
      subSystems: [
        { name: 'LEARNING', description: 'Learning systems and methods' },
        { name: 'KNOWLEDGE', description: 'Knowledge acquisition and retention' },
        { name: 'SKILLS', description: 'Skill development and mastery' },
      ],
    },
    {
      id: 'investment',
      name: 'INVESTMENT',
      description: 'Portfolio management, rebalancing, and investment strategies.',
      mantra: 'Compound time, not just money.',
      route: '/systems/investment',
      orderIndex: 1,
    },
    {
      id: 'training',
      name: 'TRAINING',
      description: 'Skill development and progression tracking.',
      mantra: 'Skills compound, habits compound.',
      route: '/systems/training',
      orderIndex: 2,
    },
  ],
  LEVERAGE_TIER: [],
  EXPRESSION_TIER: [
    {
      id: 'travel',
      name: 'TRAVEL',
      description: 'Find location alternatives and travel recommendations.',
      mantra: 'Location is optionality.',
      route: '/master/travel',
      orderIndex: 1,
    },
    {
      id: 'meaning',
      name: 'MEANING',
      description: 'Purpose, values alignment, and spiritual/psychological resilience.',
      mantra: 'Purpose protects against decay.',
      route: '/knowledge/meaning',
      orderIndex: 2,
    },
  ],
  CROSS_SYSTEM_STATES: [
    {
      id: 'trust',
      name: 'TRUST',
      description: 'Global modifier that affects multiple systems. Built on competence, reliability, and alignment.',
      mantra: 'Trust is a forward-looking belief.',
      route: '/systems/trust',
      orderIndex: 1,
    },
    {
      id: 'reputation',
      name: 'REPUTATION',
      description: 'Cross-system state that governs access to opportunities, partnerships, and resources.',
      mantra: 'Reputation is not what people think of you. It is what they expect from you.',
      route: '/systems/reputation',
      orderIndex: 2,
    },
    {
      id: 'optionality',
      name: 'OPTIONALITY',
      description: 'Cross-system state representing available choices and strategic freedom.',
      mantra: 'Optionality is the right, but not the obligation, to act.',
      route: '/systems/optionality',
      orderIndex: 3,
    },
    {
      id: 'energy-reserve',
      name: 'ENERGY_RESERVE',
      description: 'Cross-system state representing stored energy capacity beyond daily budget.',
      mantra: 'Reserve energy enables sustained effort when needed.',
      route: '/systems/energy-reserve',
      orderIndex: 4,
    },
  ],
}

// Helper to get tier order index
function getTierOrderIndex(tierName: string): number {
  const tierOrder: Record<string, number> = {
    SURVIVAL_TIER: 1,
    STABILITY_TIER: 2,
    GROWTH_TIER: 3,
    LEVERAGE_TIER: 4,
    EXPRESSION_TIER: 5,
    CROSS_SYSTEM_STATES: 6,
  }
  return tierOrder[tierName] || 99
}

// Get Universal Concept title for each system
function getUniversalConceptForSystem(systemId: string): string {
  const conceptMap: Record<string, string> = {
    'health': 'BIOLOGY',
    'money': 'MONEY',
    'energy': 'ENERGY',
    'investment': 'INVESTMENT',
    'training': 'TRAINING',
    'education': 'LEARNING',
    'travel': 'TRAVEL',
    'meaning': 'MEANING',
  }
  return conceptMap[systemId] || 'CONCEPT'
}

// Seed system-specific pathways
async function seedSystemPathways(systemId: string, universalConceptId: string, systemNodeId: string) {
  // Health System Pathways
  if (systemId === 'health') {
    const healthPathways = [
      {
        title: 'ENERGY',
        description: 'Mitochondrial function, Sleep, Hormones, Metabolic efficiency',
        children: [
          { title: 'MITOCHONDRIAL_FUNCTION', description: 'Cellular energy production' },
          { title: 'SLEEP', description: 'Sleep quality and recovery' },
          { title: 'HORMONES', description: 'Hormonal balance and regulation' },
          { title: 'METABOLIC_EFFICIENCY', description: 'Metabolic health and efficiency' },
        ],
      },
      {
        title: 'NEUROSCIENCE',
        description: 'Stress, Cognition, Mental Health',
        children: [
          { title: 'STRESS', description: 'Stress management and response' },
          { title: 'COGNITION', description: 'Cognitive function and performance' },
          { title: 'MENTAL_HEALTH', description: 'Mental health and wellbeing' },
          {
            title: 'NUTRITION',
            description: 'Nutrition and brain health',
            children: [
              {
                title: 'MACRONUTRIENTS',
                description: 'Protein, Carbs, Fats',
                children: [
                  { title: 'PROTEIN', description: 'Protein sources and requirements' },
                  { title: 'CARBS', description: 'Carbohydrate sources and metabolism' },
                  { title: 'FATS', description: 'Fat sources and essential fatty acids' },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'RESPIRATORY',
        description: 'Air Quality, Breathing, Oxygen delivery',
        children: [
          { title: 'AIR_QUALITY', description: 'Environmental air quality' },
          { title: 'BREATHING', description: 'Breathing techniques and patterns' },
          { title: 'OXYGEN_DELIVERY', description: 'Oxygen transport and utilization' },
        ],
      },
      {
        title: 'MUSCULOSKELETAL',
        description: 'Exercise, Movement, Posture',
        children: [
          { title: 'EXERCISE', description: 'Physical exercise and training' },
          { title: 'MOVEMENT', description: 'Movement patterns and mobility' },
          { title: 'POSTURE', description: 'Postural alignment and health' },
        ],
      },
      {
        title: 'CARDIOVASCULAR',
        description: 'Heart Health, Blood Pressure, Circulation',
        children: [
          { title: 'HEART_HEALTH', description: 'Cardiovascular health' },
          { title: 'BLOOD_PRESSURE', description: 'Blood pressure regulation' },
          { title: 'CIRCULATION', description: 'Circulatory system health' },
        ],
      },
      {
        title: 'IMMUNE_SYSTEM',
        description: 'Inflammation, Recovery, Social Connection',
        children: [
          { title: 'INFLAMMATION', description: 'Inflammatory response and management' },
          { title: 'RECOVERY', description: 'Recovery and healing processes' },
          { title: 'SOCIAL_CONNECTION', description: 'Social connections and immune health' },
        ],
      },
    ]

    for (let i = 0; i < healthPathways.length; i++) {
      const pathway = healthPathways[i]
      const pathwayId = `${universalConceptId}-${pathway.title.toLowerCase().replace(/_/g, '-')}`
      await createNode({
        id: pathwayId,
        title: pathway.title,
        description: pathway.description,
        parentId: universalConceptId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.BIOLOGICAL,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          isPathway: true,
          systemId: 'health',
          seededAt: new Date().toISOString(),
        },
      })

      // Add children pathways
      if (pathway.children) {
        for (let j = 0; j < pathway.children.length; j++) {
          const child = pathway.children[j] as any // Type assertion for nested children
          const childId = `${pathwayId}-${child.title.toLowerCase().replace(/_/g, '-')}`
          await createNode({
            id: childId,
            title: child.title,
            description: child.description,
            parentId: pathwayId,
            nodeType: RealityNodeType.CATEGORY,
            category: RealityNodeCategory.BIOLOGICAL,
            immutable: true,
            orderIndex: j + 1,
            metadata: {
              isPathway: true,
              systemId: 'health',
              seededAt: new Date().toISOString(),
            },
          })

          // Add grandchildren if they exist (e.g., MACRONUTRIENTS -> Protein, Carbs, Fats -> FRUIT/Protein)
          if (child.children && Array.isArray(child.children)) {
            for (let k = 0; k < child.children.length; k++) {
              const grandchild = child.children[k]
              const grandchildId = `${childId}-${grandchild.title.toLowerCase().replace(/_/g, '-')}`
              await createNode({
                id: grandchildId,
                title: grandchild.title,
                description: grandchild.description,
                parentId: childId,
                nodeType: RealityNodeType.CATEGORY,
                category: RealityNodeCategory.BIOLOGICAL,
                immutable: true,
                orderIndex: k + 1,
                metadata: {
                  isPathway: true,
                  systemId: 'health',
                  seededAt: new Date().toISOString(),
                },
              })

              // Add great-grandchildren for Protein (FRUIT/Protein)
              if (child.title === 'MACRONUTRIENTS' && grandchild.title === 'PROTEIN') {
                await createNode({
                  id: `${grandchildId}-fruit-protein`,
                  title: 'FRUIT_PROTEIN',
                  description: 'Fruit-based protein sources and plant proteins',
                  parentId: grandchildId,
                  nodeType: RealityNodeType.CATEGORY,
                  category: RealityNodeCategory.BIOLOGICAL,
                  immutable: true,
                  orderIndex: 1,
                  metadata: {
                    isPathway: true,
                    systemId: 'health',
                    seededAt: new Date().toISOString(),
                  },
                })
              }
            }
          }
        }
      }
    }
    console.log(`        → Seeded Health pathways under BIOLOGY`)
  }

  // Finance System Pathways
  if (systemId === 'money' || systemId === 'finance') {
    const financePathways = [
      {
        title: 'INVESTMENT',
        description: 'Investment strategies and asset management',
        children: [
          {
            title: 'EQUITY_MARKETS',
            description: 'Stock market investments',
            children: [
              { title: 'S&P_500', description: 'S&P 500 index investments' },
              { title: 'INDIVIDUAL_STOCKS', description: 'Individual stock selection' },
            ],
          },
          {
            title: 'ASSET_ALLOCATION',
            description: 'Portfolio allocation strategies',
            children: [
              { title: 'STOCKS', description: 'Stock allocation' },
              { title: 'BONDS', description: 'Bond allocation' },
              { title: 'CASH', description: 'Cash allocation' },
            ],
          },
        ],
      },
      {
        title: 'CASH_FLOW',
        description: 'Income, Expenses, Savings Rate',
        children: [
          { title: 'INCOME', description: 'Income sources and management' },
          { title: 'EXPENSES', description: 'Expense tracking and optimization' },
          { title: 'SAVINGS_RATE', description: 'Savings rate and accumulation' },
        ],
      },
      {
        title: 'CAPITAL',
        description: 'Debt, Leverage, Net Worth',
        children: [
          { title: 'DEBT', description: 'Debt management and optimization' },
          { title: 'LEVERAGE', description: 'Strategic use of leverage' },
          { title: 'NET_WORTH', description: 'Net worth tracking and growth' },
        ],
      },
    ]

    for (let i = 0; i < financePathways.length; i++) {
      const pathway = financePathways[i]
      const pathwayId = `${universalConceptId}-${pathway.title.toLowerCase().replace(/_/g, '-')}`
      await createNode({
        id: pathwayId,
        title: pathway.title,
        description: pathway.description,
        parentId: universalConceptId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.ECONOMIC,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          isPathway: true,
          systemId: 'finance',
          seededAt: new Date().toISOString(),
        },
      })

      // Add children pathways
      if (pathway.children) {
        for (let j = 0; j < pathway.children.length; j++) {
          const child = pathway.children[j]
          const childId = `${pathwayId}-${child.title.toLowerCase().replace(/_/g, '-')}`
          await createNode({
            id: childId,
            title: child.title,
            description: child.description,
            parentId: pathwayId,
            nodeType: RealityNodeType.CATEGORY,
            category: RealityNodeCategory.ECONOMIC,
            immutable: true,
            orderIndex: j + 1,
            metadata: {
              isPathway: true,
              systemId: 'finance',
              seededAt: new Date().toISOString(),
            },
          })

          // Add grandchildren if they exist
          if (child.children) {
            for (let k = 0; k < child.children.length; k++) {
              const grandchild = child.children[k]
              await createNode({
                id: `${childId}-${grandchild.title.toLowerCase().replace(/_/g, '-')}`,
                title: grandchild.title,
                description: grandchild.description,
                parentId: childId,
                nodeType: RealityNodeType.CATEGORY,
                category: RealityNodeCategory.ECONOMIC,
                immutable: true,
                orderIndex: k + 1,
                metadata: {
                  isPathway: true,
                  systemId: 'finance',
                  seededAt: new Date().toISOString(),
                },
              })
            }
          }
        }
      }
    }
    console.log(`        → Seeded Finance pathways under MONEY`)
  }

  // Education System Pathways
  if (systemId === 'education') {
    const educationPathways = [
      {
        title: 'TECHNICAL_KNOWLEDGE',
        description: 'Computer Science, Mathematics, Physics',
        children: [
          { title: 'COMPUTER_SCIENCE', description: 'Programming, algorithms, systems' },
          { title: 'MATHEMATICS', description: 'Mathematical concepts and applications' },
          { title: 'PHYSICS', description: 'Physical principles and laws' },
        ],
      },
      {
        title: 'FINANCIAL_KNOWLEDGE',
        description: 'Investing, Markets, Economics',
        children: [
          { title: 'INVESTING', description: 'Investment strategies and principles' },
          { title: 'MARKETS', description: 'Market dynamics and analysis' },
          { title: 'ECONOMICS', description: 'Economic principles and systems' },
        ],
      },
      {
        title: 'DOMAIN_KNOWLEDGE',
        description: 'Health Science, Business, Psychology',
        children: [
          { title: 'HEALTH_SCIENCE', description: 'Health and medical knowledge' },
          { title: 'BUSINESS', description: 'Business principles and practices' },
          { title: 'PSYCHOLOGY', description: 'Psychological principles and behavior' },
        ],
      },
      {
        title: 'META_LEARNING',
        description: 'Study Systems, Memory, Skill Acquisition',
        children: [
          { title: 'STUDY_SYSTEMS', description: 'Effective study methods and systems' },
          { title: 'MEMORY', description: 'Memory techniques and retention' },
          { title: 'SKILL_ACQUISITION', description: 'Skill learning and mastery' },
        ],
      },
    ]

    for (let i = 0; i < educationPathways.length; i++) {
      const pathway = educationPathways[i]
      const pathwayId = `${universalConceptId}-${pathway.title.toLowerCase().replace(/_/g, '-')}`
      await createNode({
        id: pathwayId,
        title: pathway.title,
        description: pathway.description,
        parentId: universalConceptId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.FOUNDATIONAL,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          isPathway: true,
          systemId: 'education',
          seededAt: new Date().toISOString(),
        },
      })

      // Add children pathways
      if (pathway.children) {
        for (let j = 0; j < pathway.children.length; j++) {
          const child = pathway.children[j]
          await createNode({
            id: `${pathwayId}-${child.title.toLowerCase().replace(/_/g, '-')}`,
            title: child.title,
            description: child.description,
            parentId: pathwayId,
            nodeType: RealityNodeType.CATEGORY,
            category: RealityNodeCategory.FOUNDATIONAL,
            immutable: true,
            orderIndex: j + 1,
            metadata: {
              isPathway: true,
              systemId: 'education',
              seededAt: new Date().toISOString(),
            },
          })
        }
      }
    }
    console.log(`        → Seeded Education pathways under LEARNING`)
  }

  // Optionality System Pathways
  if (systemId === 'optionality') {
    const optionalityPathways = [
      {
        title: 'REVERSIBLE_DECISIONS',
        description: 'Low-cost decisions that can be undone',
        children: [
          { title: 'ROLE_CHANGES', description: 'Internal role transitions within organization' },
          { title: 'SKILL_ACQUISITION', description: 'Learning new technical stacks and tools' },
          { title: 'SIDE_PROJECTS', description: 'Low-risk exploration projects and experiments' },
        ],
      },
      {
        title: 'IRREVERSIBLE_DECISIONS',
        description: 'High-cost decisions that permanently narrow future options',
        children: [
          { title: 'DEBT_COMMITMENTS', description: 'Long-term financial obligations and mortgages' },
          { title: 'LIFESTYLE_INFLATION', description: 'Raising baseline expenses permanently' },
          { title: 'REPUTATION_DAMAGE', description: 'Trust violations and burned bridges' },
          { title: 'HEALTH_NEGLECT', description: 'Irreversible health consequences from neglect' },
        ],
      },
      {
        title: 'TRANSFERABLE_SKILLS',
        description: 'Skills that compound across multiple domains',
        children: [
          { title: 'COMMUNICATION', description: 'Written and verbal communication skills' },
          { title: 'SYSTEMS_THINKING', description: 'Understanding interconnections and feedback loops' },
          { title: 'PROBLEM_DECOMPOSITION', description: 'Breaking complex problems into manageable parts' },
          { title: 'LEARNING_HOW_TO_LEARN', description: 'Meta-learning and skill acquisition strategies' },
        ],
      },
      {
        title: 'PROOF_ARTIFACTS',
        description: 'Durable outputs that demonstrate competence and impact',
        children: [
          { title: 'DOCUMENTATION', description: 'Design docs, technical guides, post-mortems' },
          { title: 'METRICS', description: 'Before/after measurements and impact quantification' },
          { title: 'REUSABLE_SYSTEMS', description: 'Tools and systems others can use' },
          { title: 'DECISION_LOGS', description: 'Tracked decisions and learning over time' },
        ],
      },
    ]

    for (let i = 0; i < optionalityPathways.length; i++) {
      const pathway = optionalityPathways[i]
      const pathwayId = `${universalConceptId}-${pathway.title.toLowerCase().replace(/_/g, '-')}`
      await createNode({
        id: pathwayId,
        title: pathway.title,
        description: pathway.description,
        parentId: universalConceptId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.STRATEGIC,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          isPathway: true,
          systemId: 'optionality',
          seededAt: new Date().toISOString(),
        },
      })

      // Add children pathways
      if (pathway.children) {
        for (let j = 0; j < pathway.children.length; j++) {
          const child = pathway.children[j]
          const childId = `${pathwayId}-${child.title.toLowerCase().replace(/_/g, '-')}`
          await createNode({
            id: childId,
            title: child.title,
            description: child.description,
            parentId: pathwayId,
            nodeType: RealityNodeType.CATEGORY,
            category: RealityNodeCategory.STRATEGIC,
            immutable: true,
            orderIndex: j + 1,
            metadata: {
              isPathway: true,
              systemId: 'optionality',
              seededAt: new Date().toISOString(),
            },
          })
        }
      }
    }
    console.log(`        → Seeded Optionality pathways under OPTIONALITY`)
  }

  // Reputation & Trust System Pathways
  if (systemId === 'reputation' || systemId === 'trust') {
    const reputationPathways = [
      {
        title: 'TRUST_PILLARS',
        description: 'Three components of trust: competence, reliability, alignment',
        children: [
          { title: 'COMPETENCE', description: 'Technical ability and domain expertise' },
          { title: 'RELIABILITY', description: 'Consistent delivery and dependable execution' },
          { title: 'ALIGNMENT', description: 'Acting in shared interest with stakeholders' },
        ],
      },
      {
        title: 'REPUTATION_BURNS',
        description: 'Fast ways to destroy reputation capital',
        children: [
          { title: 'OVERPROMISING', description: 'Committing beyond realistic capacity' },
          { title: 'UNOWNED_FAILURE', description: 'Blaming systems or people instead of owning mistakes' },
          { title: 'DEFENSIVENESS', description: 'Treating feedback as personal threat' },
          { title: 'POSITION_SHIFTING', description: 'Changing story when proven wrong' },
        ],
      },
      {
        title: 'MICRO_DEPOSITS',
        description: 'Daily reputation building through small actions',
        children: [
          { title: 'CONSISTENT_DELIVERY', description: 'Reliability under pressure and uncertainty' },
          { title: 'EARLY_COMMUNICATION', description: 'Delivering bad news quickly to avoid surprises' },
          { title: 'VISIBLE_CLOSURE', description: 'Explicitly closing loops and confirming resolution' },
          { title: 'UNDER_PROMISE', description: 'Promising less and delivering more consistently' },
        ],
      },
      {
        title: 'EGO_MANAGEMENT',
        description: 'Separating ego from identity to preserve reputation',
        children: [
          { title: 'CURIOSITY_RESPONSE', description: 'Responding to criticism with genuine questions' },
          { title: 'IDENTITY_SEPARATION', description: 'Being wrong does not mean being worthless' },
          { title: 'FEEDBACK_AS_DATA', description: 'Converting emotional criticism into useful signal' },
          { title: 'COURSE_CORRECTION', description: 'Adjusting behavior without drama or defensiveness' },
        ],
      },
    ]

    for (let i = 0; i < reputationPathways.length; i++) {
      const pathway = reputationPathways[i]
      const pathwayId = `${universalConceptId}-${pathway.title.toLowerCase().replace(/_/g, '-')}`
      await createNode({
        id: pathwayId,
        title: pathway.title,
        description: pathway.description,
        parentId: universalConceptId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.CROSS_SYSTEM,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          isPathway: true,
          systemId: systemId,
          seededAt: new Date().toISOString(),
        },
      })

      // Add children pathways
      if (pathway.children) {
        for (let j = 0; j < pathway.children.length; j++) {
          const child = pathway.children[j]
          const childId = `${pathwayId}-${child.title.toLowerCase().replace(/_/g, '-')}`
          await createNode({
            id: childId,
            title: child.title,
            description: child.description,
            parentId: pathwayId,
            nodeType: RealityNodeType.CATEGORY,
            category: RealityNodeCategory.CROSS_SYSTEM,
            immutable: true,
            orderIndex: j + 1,
            metadata: {
              isPathway: true,
              systemId: systemId,
              seededAt: new Date().toISOString(),
            },
          })
        }
      }
    }
    console.log(`        → Seeded Reputation/Trust pathways under ${systemId.toUpperCase()}`)
  }

  // For other systems, create a basic universal concept structure
  if (!['health', 'money', 'finance', 'education'].includes(systemId)) {
    // Create at least one pathway node to ensure the system has universal concepts
    await createNode({
      id: `${universalConceptId}-concepts`,
      title: 'CONCEPTS',
      description: `Universal concepts and principles for ${systemId} system.`,
      parentId: universalConceptId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1,
      metadata: {
        isPathway: true,
        systemId: systemId,
        seededAt: new Date().toISOString(),
      },
    })
    console.log(`        → Created basic universal concepts for ${systemId}`)
  }
}

// Pareto-selected top 5 frameworks
// Each framework follows the template: Based On, Purpose, Structure, When to Use, When Not to Use
const FRAMEWORKS = [
  {
    title: 'PARETO_PRINCIPLE',
    description: '80/20 rule. Focus on the vital few that produce most results.',
    category: RealityNodeCategory.STRATEGIC,
    basedOn: ['Leverage', 'Opportunity Cost'],
    purpose: 'Identify the minority of inputs that produce the majority of outputs to optimize resource allocation.',
    structure: '1. Identify all inputs. 2. Measure outputs for each input. 3. Rank inputs by output. 4. Focus on top 20% that produce 80% of results.',
    whenToUse: 'When resources are limited, when outputs are measurable, when input-output relationships are unequal.',
    whenNotToUse: 'When all inputs are equally critical, when outputs cannot be measured, when the 80/20 distribution does not apply.',
  },
  {
    title: 'DOMAIN_APPLICATION_FRAMEWORK',
    description: 'Apply universal principles across specific domains (Money, Career, Relationships).',
    category: RealityNodeCategory.STRATEGIC,
    basedOn: ['Systems Thinking', 'First Principles'],
    purpose: 'Translate universal principles into domain-specific actions by identifying domain constraints and opportunities.',
    structure: '1. Identify the principle. 2. Understand domain constraints. 3. Map principle to domain context. 4. Generate domain-specific actions. 5. Test and refine.',
    whenToUse: 'When applying principles across different domains, when domain expertise is available, when principles need contextualization.',
    whenNotToUse: 'When domain constraints invalidate the principle, when domain-specific frameworks already exist, when principles are domain-specific.',
  },
  {
    title: 'DECISION_MATRIX',
    description: 'Systematic approach to evaluating options and making decisions.',
    category: RealityNodeCategory.STRATEGIC,
    basedOn: ['Opportunity Cost', 'Systems Thinking'],
    purpose: 'Structure decision-making by explicitly comparing options across multiple criteria to reduce bias and improve outcomes.',
    structure: '1. List decision options. 2. Identify evaluation criteria. 3. Weight criteria by importance. 4. Score each option on each criterion. 5. Calculate weighted scores. 6. Select highest-scoring option.',
    whenToUse: 'When multiple options exist, when criteria are clear, when decisions have significant consequences, when bias reduction is important.',
    whenNotToUse: 'When time is extremely limited, when criteria cannot be defined, when options are not comparable, when intuition is more reliable.',
  },
  {
    title: 'RISK_ASSESSMENT_FRAMEWORK',
    description: 'Identify, assess, and mitigate risks systematically.',
    category: RealityNodeCategory.STRATEGIC,
    basedOn: ['Margin of Safety', 'Inversion'],
    purpose: 'Systematically identify potential failures, assess their probability and impact, and develop mitigation strategies.',
    structure: '1. Identify potential risks. 2. Assess probability of each risk. 3. Assess impact of each risk. 4. Prioritize by probability × impact. 5. Develop mitigation strategies. 6. Monitor and update.',
    whenToUse: 'When outcomes are uncertain, when failures have significant consequences, when planning for the future, when operating in volatile environments.',
    whenNotToUse: 'When risks are negligible, when time is extremely limited, when perfect information is available, when risks are completely unpredictable.',
  },
  {
    title: 'GOAL_HIERARCHY_FRAMEWORK',
    description: 'Organize goals in a hierarchy from vision to actionable tasks.',
    category: RealityNodeCategory.STRATEGIC,
    basedOn: ['Hierarchy', 'Systems Thinking'],
    purpose: 'Structure goals from high-level vision down to specific actions to ensure alignment and enable execution.',
    structure: '1. Define vision (top level). 2. Break into strategic goals. 3. Break goals into objectives. 4. Break objectives into tasks. 5. Assign resources and timelines. 6. Execute and review.',
    whenToUse: 'When goals are complex, when multiple levels of abstraction are needed, when alignment is critical, when coordinating multiple actors.',
    whenNotToUse: 'When goals are simple and immediate, when hierarchy adds unnecessary complexity, when flexibility is more important than structure.',
  },
]

// Pareto-selected top 5 agent types
const AGENT_TYPES = [
  {
    title: 'HUMAN',
    description: 'Individual human agents with consciousness, goals, and agency.',
    category: RealityNodeCategory.HUMAN,
  },
  {
    title: 'COLLECTIVE',
    description: 'Groups of humans acting as a unit (teams, communities, organizations).',
    category: RealityNodeCategory.COLLECTIVE,
  },
  {
    title: 'ARTIFICIAL',
    description: 'AI systems and automated agents with programmed behaviors.',
    category: RealityNodeCategory.ARTIFICIAL,
  },
  {
    title: 'ORGANISATIONAL',
    description: 'Formal organizations with structure, processes, and hierarchies.',
    category: RealityNodeCategory.ORGANISATIONAL,
  },
  {
    title: 'HYBRID',
    description: 'Combinations of human and artificial agents working together.',
    category: RealityNodeCategory.HYBRID,
  },
]

// Meaningful capabilities for HUMAN agents (replaces generic examples)
const HUMAN_CAPABILITIES = [
  {
    title: 'COGNITIVE_ABILITIES',
    description: 'Mental capacities for thinking, reasoning, and problem-solving.',
    category: RealityNodeCategory.HUMAN,
  },
  {
    title: 'EMOTIONAL_INTELLIGENCE',
    description: 'Capacity to understand and manage emotions in self and others.',
    category: RealityNodeCategory.HUMAN,
  },
  {
    title: 'PHYSICAL_CAPABILITIES',
    description: 'Bodily capacities for action, endurance, and recovery.',
    category: RealityNodeCategory.HUMAN,
  },
  {
    title: 'SOCIAL_SKILLS',
    description: 'Abilities to communicate, persuade, and build relationships.',
    category: RealityNodeCategory.HUMAN,
  },
  {
    title: 'CREATIVE_CAPACITY',
    description: 'Ability to generate novel ideas and solutions.',
    category: RealityNodeCategory.HUMAN,
  },
]

// Cognitive abilities breakdown
const COGNITIVE_ABILITIES = [
  { title: 'STRATEGIC_THINKING', description: 'Long-term planning and pattern recognition.', category: RealityNodeCategory.HUMAN },
  { title: 'ANALYTICAL_REASONING', description: 'Breaking down complex problems logically.', category: RealityNodeCategory.HUMAN },
  { title: 'PATTERN_RECOGNITION', description: 'Identifying recurring structures and trends.', category: RealityNodeCategory.HUMAN },
  { title: 'MENTAL_MODELS', description: 'Internal representations of how systems work.', category: RealityNodeCategory.HUMAN },
  { title: 'DECISION_MAKING', description: 'Evaluating options and choosing optimal paths.', category: RealityNodeCategory.HUMAN },
]

// Emotional intelligence breakdown
const EMOTIONAL_INTELLIGENCE = [
  { title: 'SELF_AWARENESS', description: 'Understanding own emotions and triggers.', category: RealityNodeCategory.HUMAN },
  { title: 'EMPATHY', description: 'Sensing and understanding others\' emotions.', category: RealityNodeCategory.HUMAN },
  { title: 'EMOTIONAL_REGULATION', description: 'Managing emotional responses effectively.', category: RealityNodeCategory.HUMAN },
  { title: 'MOTIVATION', description: 'Internal drive to pursue goals.', category: RealityNodeCategory.HUMAN },
  { title: 'SOCIAL_AWARENESS', description: 'Reading social dynamics and group emotions.', category: RealityNodeCategory.HUMAN },
]

// Physical capabilities breakdown
const PHYSICAL_CAPABILITIES = [
  { title: 'ENDURANCE', description: 'Sustained energy output over time.', category: RealityNodeCategory.HUMAN },
  { title: 'STRENGTH', description: 'Peak force generation capacity.', category: RealityNodeCategory.HUMAN },
  { title: 'RECOVERY', description: 'Speed of returning to baseline after exertion.', category: RealityNodeCategory.HUMAN },
  { title: 'COORDINATION', description: 'Fine motor control and movement precision.', category: RealityNodeCategory.HUMAN },
  { title: 'ADAPTABILITY', description: 'Physical adjustment to changing conditions.', category: RealityNodeCategory.HUMAN },
]

// Pareto-selected top 5 environment types
const ENVIRONMENT_TYPES = [
  {
    title: 'PHYSICAL',
    description: 'Physical spaces and material environments (offices, homes, nature).',
    category: RealityNodeCategory.PHYSICAL,
  },
  {
    title: 'ECONOMIC',
    description: 'Economic systems, markets, and financial environments.',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'DIGITAL',
    description: 'Digital spaces, online platforms, and virtual environments.',
    category: RealityNodeCategory.DIGITAL,
  },
  {
    title: 'SOCIAL',
    description: 'Social networks, relationships, and cultural environments.',
    category: RealityNodeCategory.SOCIAL,
  },
  {
    title: 'BIOLOGICAL',
    description: 'Biological systems, ecosystems, and living environments.',
    category: RealityNodeCategory.BIOLOGICAL,
  },
]

// Economic environment breakdown
const ECONOMIC_ENVIRONMENTS = [
  { title: 'CAPITAL_MARKETS', description: 'Markets for long-term financial instruments.', category: RealityNodeCategory.ECONOMIC },
  { title: 'LABOR_MARKETS', description: 'Markets for human work and skills.', category: RealityNodeCategory.ECONOMIC },
  { title: 'REAL_ESTATE_MARKETS', description: 'Markets for property and land.', category: RealityNodeCategory.ECONOMIC },
  { title: 'COMMODITY_MARKETS', description: 'Markets for raw materials and goods.', category: RealityNodeCategory.ECONOMIC },
  { title: 'CURRENCY_MARKETS', description: 'Markets for money exchange and forex.', category: RealityNodeCategory.ECONOMIC },
]

// Finance categories under Value -> Finance
const FINANCE_CATEGORIES = [
  {
    title: 'MONEY',
    description: 'Medium of exchange. Cash flow, liquidity, and buffers.',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'INVESTING',
    description: 'Growth mechanisms. Assets, allocation, and compounding.',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'RISK',
    description: 'Uncertainty management. Volatility, drawdown, and fragility.',
    category: RealityNodeCategory.STRATEGIC,
  },
  {
    title: 'LEVERAGE',
    description: 'Amplification mechanisms. Debt, credit, and optionality.',
    category: RealityNodeCategory.STRATEGIC,
  },
  {
    title: 'PROTECTION',
    description: 'Preservation strategies. Insurance, hedging, and redundancy.',
    category: RealityNodeCategory.STRATEGIC,
  },
]

// Money children
const MONEY_CHILDREN = [
  { title: 'CASH_FLOW', description: 'Movement of money in and out. Income streams and expenses.', category: RealityNodeCategory.ECONOMIC },
  { title: 'LIQUIDITY', description: 'Accessibility of assets. Ability to convert to cash quickly.', category: RealityNodeCategory.ECONOMIC },
  { title: 'BUFFERS', description: 'Safety reserves. Emergency funds and cash cushions.', category: RealityNodeCategory.ECONOMIC },
]

// Investing children
const INVESTING_CHILDREN = [
  { title: 'ASSETS', description: 'Owned resources that generate value. Stocks, bonds, real estate, businesses.', category: RealityNodeCategory.ECONOMIC },
  { title: 'ALLOCATION', description: 'Distribution of capital across asset classes and investments.', category: RealityNodeCategory.STRATEGIC },
  { title: 'COMPOUNDING', description: 'Exponential growth through reinvestment. Time is the multiplier.', category: RealityNodeCategory.STRATEGIC },
]

// Risk children
const RISK_CHILDREN = [
  { title: 'VOLATILITY', description: 'Price fluctuation and variability. Measurement of uncertainty.', category: RealityNodeCategory.STRATEGIC },
  { title: 'DRAWDOWN', description: 'Peak-to-trough decline. Maximum loss from a high point.', category: RealityNodeCategory.STRATEGIC },
  { title: 'FRAGILITY', description: 'Sensitivity to shocks. Vulnerability to extreme events.', category: RealityNodeCategory.STRATEGIC },
]

// Leverage children
const LEVERAGE_CHILDREN = [
  { title: 'DEBT', description: 'Borrowed capital. Liabilities used to amplify returns or opportunities.', category: RealityNodeCategory.ECONOMIC },
  { title: 'CREDIT', description: 'Borrowing capacity. Access to capital based on reputation and assets.', category: RealityNodeCategory.ECONOMIC },
  { title: 'OPTIONALITY', description: 'Position to benefit from upside while limiting downside. Real options.', category: RealityNodeCategory.STRATEGIC },
]

// Protection children
const PROTECTION_CHILDREN = [
  { title: 'INSURANCE', description: 'Risk transfer mechanisms. Protection against losses and liabilities.', category: RealityNodeCategory.STRATEGIC },
  { title: 'HEDGING', description: 'Offsetting risks. Strategies to reduce exposure to adverse movements.', category: RealityNodeCategory.STRATEGIC },
  { title: 'REDUNDANCY', description: 'Backup systems and reserves. Multiple sources of security.', category: RealityNodeCategory.STRATEGIC },
]

// Engine types with reference keys
const ENGINE_TYPES = [
  {
    title: 'CAREER',
    description: 'Career engine generates income through employment. Stable but limited growth potential. Lower fragility but dependent on employment status.',
    engineType: 'CAREER',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'BUSINESS',
    description: 'Business engine generates income through entrepreneurship and side projects. High potential but higher risk and fragility.',
    engineType: 'BUSINESS',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'INVESTMENT',
    description: 'Investment engine generates passive income through assets and investments. Requires initial capital but provides long-term wealth building.',
    engineType: 'INVESTMENT',
    category: RealityNodeCategory.ECONOMIC,
  },
  {
    title: 'LEARNING',
    description: 'Learning engine converts skills into income. Long-term investment with low fragility as skills persist.',
    engineType: 'LEARNING',
    category: RealityNodeCategory.ECONOMIC,
  },
]

// Capital markets breakdown
const CAPITAL_MARKETS = [
  { title: 'STOCK_MARKET', description: 'Public equity trading and ownership.', category: RealityNodeCategory.ECONOMIC },
  { title: 'BOND_MARKET', description: 'Debt instruments and fixed income.', category: RealityNodeCategory.ECONOMIC },
  { title: 'DERIVATIVES', description: 'Financial contracts derived from underlying assets.', category: RealityNodeCategory.ECONOMIC },
  { title: 'PRIVATE_EQUITY', description: 'Non-public company ownership and investment.', category: RealityNodeCategory.ECONOMIC },
  { title: 'VENTURE_CAPITAL', description: 'Early-stage company financing.', category: RealityNodeCategory.ECONOMIC },
]

// Digital environment breakdown
const DIGITAL_ENVIRONMENTS = [
  { title: 'SOCIAL_PLATFORMS', description: 'Networks for human connection and content sharing.', category: RealityNodeCategory.DIGITAL },
  { title: 'MARKETPLACES', description: 'Digital platforms for buying and selling.', category: RealityNodeCategory.DIGITAL },
  { title: 'COLLABORATION_TOOLS', description: 'Software for teamwork and coordination.', category: RealityNodeCategory.DIGITAL },
  { title: 'CONTENT_PLATFORMS', description: 'Platforms for creating and consuming media.', category: RealityNodeCategory.DIGITAL },
  { title: 'BLOCKCHAIN_NETWORKS', description: 'Decentralized digital ledgers and systems.', category: RealityNodeCategory.DIGITAL },
]

// Generate Pareto-selected examples for deeper levels (max 5)
function generateParetoExamples(parentTitle: string, level: number, category?: RealityNodeCategory): Array<{
  title: string
  description: string
  category?: RealityNodeCategory
}> {
  const examples: Array<{ title: string; description: string; category?: RealityNodeCategory }> = []
  
  // Apply Pareto: select top 5 most important examples
  for (let i = 1; i <= 5; i++) {
    const exampleTitle = `${parentTitle}_EXAMPLE_${i}`
    const description = `Pareto-selected example ${i} of ${parentTitle} at level ${level}. This represents one of the top 20% most impactful instances.`
    examples.push({
      title: exampleTitle,
      description,
      category,
    })
  }
  
  return examples
}

// Recursive seeding with Pareto selection (max 5 children, max depth 4)
async function seedRecursively(
  parentId: string,
  level: number,
  examples: Array<{ title: string; description: string; category?: RealityNodeCategory }>,
  nodeType: RealityNodeType,
  maxDepth: number = 4
): Promise<void> {
  // Stop at max depth
  if (level >= maxDepth) {
    return
  }

  const parent = await prisma.realityNode.findUnique({ where: { id: parentId } })
  if (!parent) {
    throw new Error(`Parent node ${parentId} not found`)
  }

  // Stop if parent is REALITY (we only seed under REALITY's direct children)
  if (parent.nodeType === RealityNodeType.REALITY) {
    return
  }

  // Create exactly 5 children (Pareto top 5)
  for (let i = 0; i < examples.length && i < 5; i++) {
    const example = examples[i]
    const childId = `${parentId}-${example.title.toLowerCase().replace(/_/g, '-')}-${level}`
    
    const child = await createNode({
      id: childId,
      title: example.title,
      description: example.description,
      parentId: parentId,
      nodeType: nodeType,
      category: example.category,
      immutable: level <= 2, // Immutable for top 3 levels
      orderIndex: i + 1,
      metadata: {
        level,
        paretoRank: i + 1, // Rank within Pareto top 5
        seededAt: new Date().toISOString(),
      },
    })

    // Recursively seed 5 children for this node (if not at max depth)
    if (level < maxDepth - 1) {
      const childExamples = generateParetoExamples(example.title, level + 1, example.category)
      await seedRecursively(child.id, level + 1, childExamples, nodeType, maxDepth)
    }
  }
}

// Seed meaningful hierarchies with predefined data (no generic examples)
async function seedMeaningfulHierarchy(
  parentId: string,
  children: Array<{ title: string; description: string; category?: RealityNodeCategory }>,
  nodeType: RealityNodeType,
  grandchildrenMap?: Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>,
  greatGrandchildrenMap?: Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>
): Promise<void> {
  console.log(`  → Seeding ${children.length} children for ${parentId}...`)
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childId = `${parentId}-${child.title.toLowerCase().replace(/_/g, '-')}`
    
    const childNode = await createNode({
      id: childId,
      title: child.title,
      description: child.description,
      parentId: parentId,
      nodeType: nodeType,
      category: child.category,
      immutable: true,
      orderIndex: i + 1,
      metadata: {
        seededAt: new Date().toISOString(),
      },
    })
    
    // Seed grandchildren if provided
    if (grandchildrenMap && grandchildrenMap.has(child.title)) {
      const grandchildren = grandchildrenMap.get(child.title)!
      console.log(`    → Seeding ${grandchildren.length} grandchildren for ${child.title}...`)
      
      for (let j = 0; j < grandchildren.length; j++) {
        const grandchild = grandchildren[j]
        const grandchildId = `${childId}-${grandchild.title.toLowerCase().replace(/_/g, '-')}`
        
        const grandchildNode = await createNode({
          id: grandchildId,
          title: grandchild.title,
          description: grandchild.description,
          parentId: childId,
          nodeType: nodeType,
          category: grandchild.category,
          immutable: false,
          orderIndex: j + 1,
          metadata: {
            seededAt: new Date().toISOString(),
          },
        })
        
        // Seed great-grandchildren if provided
        if (greatGrandchildrenMap && greatGrandchildrenMap.has(grandchild.title)) {
          const greatGrandchildren = greatGrandchildrenMap.get(grandchild.title)!
          console.log(`      → Seeding ${greatGrandchildren.length} great-grandchildren for ${grandchild.title}...`)
          
          for (let k = 0; k < greatGrandchildren.length; k++) {
            const greatGrandchild = greatGrandchildren[k]
            const greatGrandchildId = `${grandchildId}-${greatGrandchild.title.toLowerCase().replace(/_/g, '-')}`
            
            await createNode({
              id: greatGrandchildId,
              title: greatGrandchild.title,
              description: greatGrandchild.description,
              parentId: grandchildId,
              nodeType: nodeType,
              category: greatGrandchild.category,
              immutable: false,
              orderIndex: k + 1,
              metadata: {
                seededAt: new Date().toISOString(),
              },
            })
          }
        }
      }
    }
  }
}

export async function seedRealityHierarchy() {
  console.log('🌱 Seeding Reality hierarchy with Pareto selection (top 5 per level)...')

  try {
    // Phase 1: Create REALITY root
    console.log('\n📌 Phase 1: Creating REALITY root...')
    const realityNode = await createNode({
      id: REALITY_ID,
      title: 'REALITY',
      description: 'The single immutable root of all existence. All nodes trace back to REALITY.',
      parentId: null,
      nodeType: RealityNodeType.REALITY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 0,
      metadata: {
        isRoot: true,
        seededAt: new Date().toISOString(),
      },
    })
    console.log('✅ Created REALITY root')

    // Phase 2: Create top-level categories under REALITY (3 children)
    console.log('\n📌 Phase 2: Creating top-level categories...')
    
    const constraintsNode = await createNode({
      id: CONSTRAINTS_OF_REALITY_ID,
      title: 'CONSTRAINTS_OF_REALITY',
      description: 'Fundamental constraints that govern reality. Laws, principles, and frameworks.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1,
    })

    const agentsNode = await createNode({
      id: AGENTS_ID,
      title: 'AGENTS',
      description: 'Entities that act within reality. Human, collective, artificial, organizational, and hybrid agents.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 2,
    })

    const environmentsNode = await createNode({
      id: ENVIRONMENTS_ID,
      title: 'ENVIRONMENTS',
      description: 'Contexts and settings where reality manifests. Physical, economic, digital, social, and biological environments.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 3,
    })

    const resourcesNode = await createNode({
      id: RESOURCES_ID,
      title: 'RESOURCES',
      description: 'Resources available within reality. Engines, assets, and value creation mechanisms.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 4,
    })
    console.log('✅ Created top-level categories')

    // Phase 3: Build CONSTRAINTS_OF_REALITY hierarchy
    console.log('\n📌 Phase 3: Building CONSTRAINTS_OF_REALITY hierarchy...')
    
    // Create LAWS under CONSTRAINTS_OF_REALITY
    const lawsNode = await createNode({
      id: LAWS_ID,
      title: 'LAWS',
      description: 'Universal laws that govern all systems. Fundamental, strategic, and systemic laws.',
      parentId: CONSTRAINTS_OF_REALITY_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1,
    })

    // Create PRINCIPLES under CONSTRAINTS_OF_REALITY
    const principlesNode = await createNode({
      id: PRINCIPLES_ID,
      title: 'PRINCIPLES',
      description: 'Strategic and systemic principles for decision-making and system design.',
      parentId: CONSTRAINTS_OF_REALITY_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 2,
    })

    // Create FRAMEWORKS under CONSTRAINTS_OF_REALITY
    const frameworksNode = await createNode({
      id: FRAMEWORKS_ID,
      title: 'FRAMEWORKS',
      description: 'Practical frameworks for applying laws and principles across domains.',
      parentId: CONSTRAINTS_OF_REALITY_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 3,
    })

    // Create DERIVED_CONDITIONS under CONSTRAINTS_OF_REALITY
    const derivedConditionsId = `${CONSTRAINTS_OF_REALITY_ID}-derived-conditions`
    const derivedConditionsNode = await createNode({
      id: derivedConditionsId,
      title: 'DERIVED_CONDITIONS',
      description: 'Conditions that emerge from the fundamental constraints of reality. Scarcity, trade-offs, opportunity costs, irreversibility, and degrees of freedom.',
      parentId: CONSTRAINTS_OF_REALITY_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 4,
    })

    // Create SCARCITY under DERIVED_CONDITIONS
    const scarcityId = `${derivedConditionsId}-scarcity`
    const scarcityNode = await createNode({
      id: scarcityId,
      title: 'SCARCITY',
      description: 'The fundamental condition that resources are limited. All forms of scarcity constrain possibilities and create trade-offs.',
      parentId: derivedConditionsId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1,
    })

    // Create scarcity types
    const scarcityTypes = [
      { title: 'TIME_SCARCITY', description: 'Time is finite and cannot be created or stored. Every moment spent is an opportunity cost.' },
      { title: 'ENERGY_SCARCITY', description: 'Energy is limited. Physical, mental, and emotional energy must be managed and conserved.' },
      { title: 'ATTENTION_SCARCITY', description: 'Attention is a finite cognitive resource. Focus on one thing means ignoring others.' },
      { title: 'RESOURCE_SCARCITY', description: 'Material resources are finite. Money, materials, and physical assets are limited.' },
    ]

    for (let i = 0; i < scarcityTypes.length; i++) {
      await createNode({
        id: `${scarcityId}-${scarcityTypes[i].title.toLowerCase().replace(/_/g, '-')}`,
        title: scarcityTypes[i].title,
        description: scarcityTypes[i].description,
        parentId: scarcityId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.FOUNDATIONAL,
        immutable: true,
        orderIndex: i + 1,
      })
    }

    // Create TRADE_OFFS under DERIVED_CONDITIONS
    await createNode({
      id: `${derivedConditionsId}-trade-offs`,
      title: 'TRADE_OFFS',
      description: 'The fundamental reality that choosing one option means forgoing others. Every decision involves trade-offs.',
      parentId: derivedConditionsId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 2,
    })

    // Create OPPORTUNITY_COST under DERIVED_CONDITIONS
    await createNode({
      id: `${derivedConditionsId}-opportunity-cost`,
      title: 'OPPORTUNITY_COST',
      description: 'The value of the next best alternative that must be forgone when making a choice. The true cost of any decision.',
      parentId: derivedConditionsId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 3,
    })

    // Create IRREVERSIBILITY under DERIVED_CONDITIONS
    await createNode({
      id: `${derivedConditionsId}-irreversibility`,
      title: 'IRREVERSIBILITY',
      description: 'Some actions and decisions cannot be undone. Time flows in one direction, and some consequences are permanent.',
      parentId: derivedConditionsId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 4,
    })

    // Create DEGREES_OF_FREEDOM under DERIVED_CONDITIONS
    const degreesOfFreedomId = `${derivedConditionsId}-degrees-of-freedom`
    const degreesOfFreedomNode = await createNode({
      id: degreesOfFreedomId,
      title: 'DEGREES_OF_FREEDOM',
      description: 'The number of independent parameters that can vary within constraints. Freedom exists within boundaries.',
      parentId: derivedConditionsId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 5,
    })

    // Create FREEDOM under DEGREES_OF_FREEDOM
    const freedomId = `${degreesOfFreedomId}-freedom`
    await createNode({
      id: freedomId,
      title: 'FREEDOM',
      description: 'The capacity to act within available degrees of freedom. True freedom exists within constraints, not in their absence.',
      parentId: degreesOfFreedomId,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1,
    })

    // Create children of FREEDOM
    const freedomChildren = [
      {
        title: 'AUTONOMY',
        description: 'The ability to act independently without external control or influence. Self-directed action within available degrees of freedom.',
        orderIndex: 1,
      },
      {
        title: 'AGENCY',
        description: 'The power to make choices and take action. The capacity to cause change through intentional behavior.',
        orderIndex: 2,
      },
      {
        title: 'CHOICE',
        description: 'The availability of options to act upon. The range of alternatives available within constraints.',
        orderIndex: 3,
      },
      {
        title: 'CAPABILITY',
        description: 'The skills, resources, and competencies needed to act. The practical means to exercise freedom.',
        orderIndex: 4,
      },
    ]

    for (const child of freedomChildren) {
      await createNode({
        id: `${freedomId}-${child.title.toLowerCase().replace(/_/g, '-')}`,
        title: child.title,
        description: child.description,
        parentId: freedomId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.FOUNDATIONAL,
        immutable: true,
        orderIndex: child.orderIndex,
      })
    }

    console.log('  → Created DERIVED_CONDITIONS hierarchy with Scarcity, Trade-offs, Opportunity Cost, Irreversibility, and Degrees of Freedom')
    console.log('  → Created FREEDOM with children: Autonomy, Agency, Choice, and Capability')

    // Seed Fundamental Laws (5 Pareto-selected)
    console.log('  → Seeding Fundamental Laws...')
    for (let i = 0; i < FUNDAMENTAL_LAWS.length; i++) {
      const law = FUNDAMENTAL_LAWS[i]
      await createNode({
        id: `${LAWS_ID}-fundamental-${law.title.toLowerCase().replace(/_/g, '-')}`,
        title: law.title,
        description: law.description,
        parentId: LAWS_ID,
        nodeType: RealityNodeType.LAW,
        category: law.category,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          _version: '2.0.0',
          _templateType: 'law',
          _lastSynced: new Date().toISOString(),
          derivedFrom: law.derivedFrom || [],
          statement: law.statement || law.description,
          recursiveBehavior: law.recursiveBehavior || '',
          violationOutcome: law.violationOutcome || '',
          whyThisLawPersists: law.whyThisLawPersists || '',
        },
      })
    }

    // Seed Strategic Principles (5 Pareto-selected)
    console.log('  → Seeding Strategic Principles...')
    for (let i = 0; i < STRATEGIC_PRINCIPLES.length; i++) {
      const principle = STRATEGIC_PRINCIPLES[i]
      await createNode({
        id: `${PRINCIPLES_ID}-strategic-${principle.title.toLowerCase().replace(/_/g, '-')}`,
        title: principle.title,
        description: principle.description,
        parentId: PRINCIPLES_ID,
        nodeType: RealityNodeType.PRINCIPLE,
        category: principle.category,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          _version: '2.0.0',
          _templateType: 'principle',
          _lastSynced: new Date().toISOString(),
          alignedWith: principle.alignedWith || [],
          principle: principle.principle || principle.description,
          whyItWorks: principle.whyItWorks || '',
          violationPattern: principle.violationPattern || '',
          predictableResult: principle.predictableResult || '',
        },
      })
    }

    // Seed Systemic Principles (5 Pareto-selected)
    console.log('  → Seeding Systemic Principles...')
    for (let i = 0; i < SYSTEMIC_PRINCIPLES.length; i++) {
      const principle = SYSTEMIC_PRINCIPLES[i]
      await createNode({
        id: `${PRINCIPLES_ID}-systemic-${principle.title.toLowerCase().replace(/_/g, '-')}`,
        title: principle.title,
        description: principle.description,
        parentId: PRINCIPLES_ID,
        nodeType: RealityNodeType.PRINCIPLE,
        category: principle.category,
        immutable: true,
        orderIndex: STRATEGIC_PRINCIPLES.length + i + 1,
        metadata: {
          _version: '2.0.0',
          _templateType: 'principle',
          _lastSynced: new Date().toISOString(),
          alignedWith: principle.alignedWith || [],
          principle: principle.principle || principle.description,
          whyItWorks: principle.whyItWorks || '',
          violationPattern: principle.violationPattern || '',
          predictableResult: principle.predictableResult || '',
        },
      })
    }

    // Seed Cross-System State Principles (also act as modifiers)
    console.log('  → Seeding Cross-System State Principles...')
    for (let i = 0; i < CROSS_SYSTEM_PRINCIPLES.length; i++) {
      const principle = CROSS_SYSTEM_PRINCIPLES[i]
      await createNode({
        id: `${PRINCIPLES_ID}-cross-system-${principle.title.toLowerCase().replace(/_/g, '-')}`,
        title: principle.title,
        description: principle.description,
        parentId: PRINCIPLES_ID,
        nodeType: RealityNodeType.PRINCIPLE,
        category: principle.category,
        immutable: true,
        orderIndex: STRATEGIC_PRINCIPLES.length + SYSTEMIC_PRINCIPLES.length + i + 1,
        metadata: {
          _version: '2.0.0',
          _templateType: 'principle',
          _lastSynced: new Date().toISOString(),
          alignedWith: principle.alignedWith || [],
          principle: principle.principle || principle.description,
          whyItWorks: principle.whyItWorks || '',
          violationPattern: principle.violationPattern || '',
          predictableResult: principle.predictableResult || '',
          ...principle.metadata, // Include cross-system modifier metadata
        },
      })
    }

    // Seed Frameworks (5 Pareto-selected)
    console.log('  → Seeding Frameworks...')
    for (let i = 0; i < FRAMEWORKS.length; i++) {
      const framework = FRAMEWORKS[i]
      await createNode({
        id: `${FRAMEWORKS_ID}-${framework.title.toLowerCase().replace(/_/g, '-')}`,
        title: framework.title,
        description: framework.description,
        parentId: FRAMEWORKS_ID,
        nodeType: RealityNodeType.FRAMEWORK,
        category: framework.category,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          _version: '2.0.0',
          _templateType: 'framework',
          _lastSynced: new Date().toISOString(),
          basedOn: framework.basedOn || [],
          purpose: framework.purpose || framework.description,
          structure: framework.structure || '',
          whenToUse: framework.whenToUse || '',
          whenNotToUse: framework.whenNotToUse || '',
        },
      })
    }

    // Phase 4: Build AGENTS hierarchy with meaningful content
    console.log('\n📌 Phase 4: Building AGENTS hierarchy...')
    
    // Create maps for grandchildren and great-grandchildren
    const agentGrandchildrenMap = new Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>()
    agentGrandchildrenMap.set('HUMAN', HUMAN_CAPABILITIES)
    
    const agentGreatGrandchildrenMap = new Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>()
    agentGreatGrandchildrenMap.set('COGNITIVE_ABILITIES', COGNITIVE_ABILITIES)
    agentGreatGrandchildrenMap.set('EMOTIONAL_INTELLIGENCE', EMOTIONAL_INTELLIGENCE)
    agentGreatGrandchildrenMap.set('PHYSICAL_CAPABILITIES', PHYSICAL_CAPABILITIES)
    
    await seedMeaningfulHierarchy(
      AGENTS_ID,
      AGENT_TYPES,
      RealityNodeType.AGENT,
      agentGrandchildrenMap,
      agentGreatGrandchildrenMap
    )

    // Phase 5: Build ENVIRONMENTS hierarchy with meaningful content
    console.log('\n📌 Phase 5: Building ENVIRONMENTS hierarchy...')
    
    const envGrandchildrenMap = new Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>()
    envGrandchildrenMap.set('ECONOMIC', ECONOMIC_ENVIRONMENTS)
    envGrandchildrenMap.set('DIGITAL', DIGITAL_ENVIRONMENTS)
    
    const envGreatGrandchildrenMap = new Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>()
    envGreatGrandchildrenMap.set('CAPITAL_MARKETS', CAPITAL_MARKETS)
    
    await seedMeaningfulHierarchy(
      ENVIRONMENTS_ID,
      ENVIRONMENT_TYPES,
      RealityNodeType.ENVIRONMENT,
      envGrandchildrenMap,
      envGreatGrandchildrenMap
    )

    // Phase 6: Build RESOURCES hierarchy with Engines
    console.log('\n📌 Phase 6: Building RESOURCES hierarchy...')
    
    // Create ENGINES node under RESOURCES
    const enginesNode = await createNode({
      id: ENGINES_ID,
      title: 'ENGINES',
      description: 'Value creation mechanisms that generate income, Gold, and Oxygen. Sustainable income sources: Career, Business, Investment, and Learning.',
      parentId: RESOURCES_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.ECONOMIC,
      immutable: true,
      orderIndex: 1,
      metadata: {
        resourceType: 'ENGINES',
        seededAt: new Date().toISOString(),
      },
    })
    console.log('  → Created ENGINES node')

    // Seed Engine Types as child nodes with reference keys
    console.log('  → Seeding Engine Types...')
    for (let i = 0; i < ENGINE_TYPES.length; i++) {
      const engineType = ENGINE_TYPES[i]
      await createNode({
        id: `${ENGINES_ID}-${engineType.engineType.toLowerCase()}`,
        title: engineType.title,
        description: engineType.description,
        parentId: ENGINES_ID,
        nodeType: RealityNodeType.CATEGORY,
        category: engineType.category,
        immutable: true,
        orderIndex: i + 1,
        metadata: {
          engineType: engineType.engineType, // Reference key
          resourceType: 'ENGINE',
          seededAt: new Date().toISOString(),
        },
      })
    }
    console.log(`  → Seeded ${ENGINE_TYPES.length} engine types`)

    // Phase 7: Build VALUE -> FINANCE hierarchy
    console.log('\n📌 Phase 7: Building VALUE -> FINANCE hierarchy...')
    
    // Create VALUE root invariant under REALITY (not a system, just a container)
    const valueNode = await createNode({
      id: VALUE_ID,
      title: 'VALUE',
      description: 'Root invariant. The fundamental measure and medium of worth. All value flows through this node. This is not a system, but a foundational container for value-related systems.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 5,
      metadata: {
        isRootInvariant: true,
        isSystem: false,
        seededAt: new Date().toISOString(),
      },
    })
    console.log('  → Created VALUE root invariant')

    // Create FINANCE system under VALUE (this is the actual system)
    const financeNode = await createNode({
      id: FINANCE_ID,
      title: 'FINANCE',
      description: 'Finance System. The complete financial framework covering money, investing, risk, leverage, and protection. This is a system, not just a category.',
      parentId: VALUE_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.ECONOMIC,
      immutable: true,
      orderIndex: 1,
      metadata: {
        isSystem: true,
        systemType: 'FINANCE',
        systemName: 'Finance System',
        seededAt: new Date().toISOString(),
      },
    })
    console.log('  → Created FINANCE system')

    // Create Universal Concept for Finance (MONEY)
    const financeUniversalConceptId = `${FINANCE_ID}-universal-concept`
    const financeUniversalConcept = await createNode({
      id: financeUniversalConceptId,
      title: 'MONEY',
      description: 'Universal concept for Finance system. The foundational domain knowledge that governs financial systems.',
      parentId: FINANCE_ID,
      nodeType: RealityNodeType.CATEGORY,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 1, // First index - root artifact
      metadata: {
        isUniversalConcept: true,
        systemId: 'finance',
        seededAt: new Date().toISOString(),
      },
    })
    console.log('  → Created Universal Concept: MONEY')

    // Add Finance-specific pathways
    await seedSystemPathways('finance', financeUniversalConceptId, FINANCE_ID)

    // Create finance category nodes and their children
    const financeGrandchildrenMap = new Map<string, Array<{ title: string; description: string; category?: RealityNodeCategory }>>()
    financeGrandchildrenMap.set('MONEY', MONEY_CHILDREN)
    financeGrandchildrenMap.set('INVESTING', INVESTING_CHILDREN)
    financeGrandchildrenMap.set('RISK', RISK_CHILDREN)
    financeGrandchildrenMap.set('LEVERAGE', LEVERAGE_CHILDREN)
    financeGrandchildrenMap.set('PROTECTION', PROTECTION_CHILDREN)

    await seedMeaningfulHierarchy(
      FINANCE_ID,
      FINANCE_CATEGORIES,
      RealityNodeType.CATEGORY,
      financeGrandchildrenMap
    )
    console.log('  → Seeded Finance categories and children')

    // Phase 8: Build SYSTEMS hierarchy
    console.log('\n📌 Phase 8: Building SYSTEMS hierarchy...')
    
    const systemsNode = await createNode({
      id: SYSTEMS_ID,
      title: 'SYSTEMS',
      description: 'Operational systems that construct and navigate reality. Organized by tier: Survival, Stability, Growth, Leverage, Expression, and Cross-System States.',
      parentId: REALITY_ID,
      nodeType: RealityNodeType.UNIVERSAL_FOUNDATION,
      category: RealityNodeCategory.FOUNDATIONAL,
      immutable: true,
      orderIndex: 6, // After VALUE
      metadata: {
        seededAt: new Date().toISOString(),
      },
    })
    console.log('  → Created SYSTEMS node')

    // Create tier nodes and their systems
    // Ensures max 3 instances per level, max 5 levels total (ROOT -> Tier -> System -> Sub-System -> Artifact)
    for (const [tierName, systems] of Object.entries(SYSTEMS_HIERARCHY_DATA)) {
      if (systems.length === 0) continue // Skip empty tiers
      
      const tierNode = await createNode({
        id: `${SYSTEMS_ID}-${tierName.toLowerCase()}`,
        title: tierName,
        description: `Systems in the ${tierName.replace(/_/g, ' ')} tier.`,
        parentId: SYSTEMS_ID,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.SYSTEM_TIER as any, // Type assertion for newly added enum
        immutable: true,
        orderIndex: getTierOrderIndex(tierName),
        metadata: {
          systemTier: tierName,
          seededAt: new Date().toISOString(),
        },
      })
      console.log(`  → Created ${tierName} tier node`)

      // Create systems under this tier (limit to 3 per tier for efficiency)
      const systemsToSeed = systems.slice(0, 3)
      for (const system of systemsToSeed) {
        const systemNode = await createNode({
          id: `${tierNode.id}-${system.id}`,
          title: system.name,
          description: system.description,
          parentId: tierNode.id,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.SYSTEM as any, // Type assertion for newly added enum
          immutable: true,
          orderIndex: system.orderIndex,
          metadata: {
            isSystem: true,
            systemId: system.id,
            systemMantra: system.mantra,
            systemRoute: system.route,
            systemTier: tierName,
            subSystems: system.subSystems || [],
            seededAt: new Date().toISOString(),
          },
        })
        console.log(`    → Created ${system.name} system`)

        // Create Universal Concept for this system (system-specific root)
        const universalConceptTitle = getUniversalConceptForSystem(system.id)
        const universalConceptId = `${systemNode.id}-universal-concept`
        const universalConceptNode = await createNode({
          id: universalConceptId,
          title: universalConceptTitle,
          description: `Universal concept for ${system.name} system. The foundational domain knowledge that governs this system.`,
          parentId: systemNode.id,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.FOUNDATIONAL,
          immutable: true,
          orderIndex: 1, // First index - root artifact
          metadata: {
            isUniversalConcept: true,
            systemId: system.id,
            seededAt: new Date().toISOString(),
          },
        })
        console.log(`      → Created Universal Concept: ${universalConceptTitle}`)

        // Add system-specific pathways
        await seedSystemPathways(system.id, universalConceptId, systemNode.id)

        // Create sub-systems if they exist (limit to 3 per system, level 4)
        if (system.subSystems && system.subSystems.length > 0) {
          const subSystemsToSeed = system.subSystems.slice(0, 3)
          for (let i = 0; i < subSystemsToSeed.length; i++) {
            const subSystem = subSystemsToSeed[i]
            await createNode({
              id: `${systemNode.id}-${subSystem.name.toLowerCase()}`,
              title: subSystem.name.toUpperCase(),
              description: subSystem.description,
              parentId: systemNode.id,
              nodeType: RealityNodeType.CATEGORY,
              category: RealityNodeCategory.SYSTEM as any, // Type assertion for newly added enum
              immutable: false,
              orderIndex: i + 2, // After universal concept
              metadata: {
                isSubSystem: true,
                parentSystem: system.id,
                seededAt: new Date().toISOString(),
              },
            })
          }
          console.log(`      → Created ${subSystemsToSeed.length} sub-systems for ${system.name}`)
        }
      }
    }
    console.log('  → Seeded SYSTEMS hierarchy')

    // Note: Power Laws and Bible Laws linking happens after they are seeded
    // See linkLawsToRealityHierarchy() function for the linking phase

    console.log('\n✅ Reality hierarchy seeded successfully!')
    console.log('   Structure: REALITY -> 6 top-level (Constraints, Agents, Environments, Resources, Value, Systems) -> children -> grandchildren -> great-grandchildren')
    console.log('   Total levels: 5+ (including REALITY root)')
    console.log('   Power Laws and Bible Laws linked to hierarchy')
    console.log('   Resources -> Engines -> Engine Types (CAREER, BUSINESS, INVESTMENT, LEARNING)')
    console.log('   Value (root invariant) -> Finance (system) -> Categories (Money, Investing, Risk, Leverage, Protection) -> Children')
    console.log('   Systems -> Tiers -> Systems -> Sub-Systems (organized by tier with max 3 instances per level)')

  } catch (error) {
    console.error('❌ Error seeding Reality hierarchy:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export linking functions for use after Power Laws and Bible Laws are seeded
// These functions create their own PrismaClient instance
export async function linkPowerLawsToHierarchy(lawsParentId: string = 'laws-node') {
  const linkPrisma = new PrismaClient()
  try {
    // Create POWER category under LAWS if it doesn't exist
    const powerCategoryId = `${lawsParentId}-power`
    await linkPrisma.realityNode.upsert({
      where: { id: powerCategoryId },
      update: {
        title: 'POWER',
        description: '48 Laws of Power applied across different domains (Money, Energy, Career, Business, Relationships, Leadership, Negotiation)',
        parentId: lawsParentId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.POWER,
        immutable: true,
        orderIndex: 100,
      },
      create: {
        id: powerCategoryId,
        title: 'POWER',
        description: '48 Laws of Power applied across different domains (Money, Energy, Career, Business, Relationships, Leadership, Negotiation)',
        parentId: lawsParentId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.POWER,
        immutable: true,
        orderIndex: 100,
      },
    })

    // Get all Power Laws grouped by domain
    const powerLaws = await linkPrisma.powerLaw.findMany({
      orderBy: [{ domain: 'asc' }, { lawNumber: 'asc' }],
    })

    // Group by domain
    const lawsByDomain = new Map<string, typeof powerLaws>()
    for (const law of powerLaws) {
      const domain = law.domain
      if (!lawsByDomain.has(domain)) {
        lawsByDomain.set(domain, [])
      }
      lawsByDomain.get(domain)!.push(law)
    }

    // Create domain categories under POWER
    for (const [domain, domainLaws] of lawsByDomain.entries()) {
      const domainCategoryId = `${powerCategoryId}-${domain.toLowerCase()}`
      
      // Create domain category
      await linkPrisma.realityNode.upsert({
        where: { id: domainCategoryId },
        update: {
          title: domain,
          description: `48 Laws of Power applied to ${domain} domain`,
          parentId: powerCategoryId,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.POWER,
          immutable: false,
          orderIndex: Array.from(lawsByDomain.keys()).indexOf(domain) + 1,
          metadata: {
            domain,
            lawCount: domainLaws.length,
          },
        },
        create: {
          id: domainCategoryId,
          title: domain,
          description: `48 Laws of Power applied to ${domain} domain`,
          parentId: powerCategoryId,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.POWER,
          immutable: false,
          orderIndex: Array.from(lawsByDomain.keys()).indexOf(domain) + 1,
          metadata: {
            domain,
            lawCount: domainLaws.length,
          },
        },
      })

      // Create RealityNodes for each Power Law
      for (const law of domainLaws) {
        const lawNodeId = `${domainCategoryId}-law-${law.lawNumber}`
        await linkPrisma.realityNode.upsert({
          where: { id: lawNodeId },
          update: {
            title: `Law ${law.lawNumber}: ${law.title}`,
            description: law.originalDescription,
            parentId: domainCategoryId,
            nodeType: RealityNodeType.LAW,
            category: RealityNodeCategory.POWER,
            immutable: false,
            orderIndex: law.lawNumber,
            metadata: {
              lawNumber: law.lawNumber,
              domain: law.domain,
              powerLawId: law.id,
              category: law.category,
              order: law.order,
            },
          },
          create: {
            id: lawNodeId,
            title: `Law ${law.lawNumber}: ${law.title}`,
            description: law.originalDescription,
            parentId: domainCategoryId,
            nodeType: RealityNodeType.LAW,
            category: RealityNodeCategory.POWER,
            immutable: false,
            orderIndex: law.lawNumber,
            metadata: {
              lawNumber: law.lawNumber,
              domain: law.domain,
              powerLawId: law.id,
              category: law.category,
              order: law.order,
            },
          },
        })
      }
      console.log(`  ✅ Linked ${domainLaws.length} Power Laws for ${domain} domain`)
    }

    console.log(`  ✅ Linked ${powerLaws.length} total Power Laws to hierarchy`)
  } catch (error) {
    console.error('  ❌ Error linking Power Laws:', error)
    throw error
  } finally {
    await linkPrisma.$disconnect()
  }
}

// Export linking functions for use after Power Laws and Bible Laws are seeded
export async function linkBibleLawsToHierarchy(lawsParentId: string = 'laws-node') {
  const linkPrisma = new PrismaClient()
  try {
    // Create BIBLICAL category under LAWS if it doesn't exist
    const biblicalCategoryId = `${lawsParentId}-biblical`
    await linkPrisma.realityNode.upsert({
      where: { id: biblicalCategoryId },
      update: {
        title: 'BIBLICAL',
        description: 'Biblical principles and teachings applied across different domains (Money, Investment, Career, Business, Relationships, Leadership, Spiritual Growth, Stewardship, Generosity, Energy)',
        parentId: lawsParentId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.BIBLICAL,
        immutable: true,
        orderIndex: 200,
      },
      create: {
        id: biblicalCategoryId,
        title: 'BIBLICAL',
        description: 'Biblical principles and teachings applied across different domains (Money, Investment, Career, Business, Relationships, Leadership, Spiritual Growth, Stewardship, Generosity, Energy)',
        parentId: lawsParentId,
        nodeType: RealityNodeType.CATEGORY,
        category: RealityNodeCategory.BIBLICAL,
        immutable: true,
        orderIndex: 200,
      },
    })

    // Get all Bible Laws grouped by domain
    const bibleLaws = await linkPrisma.bibleLaw.findMany({
      orderBy: [{ domain: 'asc' }, { lawNumber: 'asc' }],
    })

    // Group by domain
    const lawsByDomain = new Map<string, typeof bibleLaws>()
    for (const law of bibleLaws) {
      const domain = law.domain
      if (!lawsByDomain.has(domain)) {
        lawsByDomain.set(domain, [])
      }
      lawsByDomain.get(domain)!.push(law)
    }

    // Create domain categories under BIBLICAL
    for (const [domain, domainLaws] of lawsByDomain.entries()) {
      const domainCategoryId = `${biblicalCategoryId}-${domain.toLowerCase()}`
      
      // Create domain category
      await linkPrisma.realityNode.upsert({
        where: { id: domainCategoryId },
        update: {
          title: domain,
          description: `Biblical principles applied to ${domain} domain`,
          parentId: biblicalCategoryId,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.BIBLICAL,
          immutable: false,
          orderIndex: Array.from(lawsByDomain.keys()).indexOf(domain) + 1,
          metadata: {
            domain,
            lawCount: domainLaws.length,
          },
        },
        create: {
          id: domainCategoryId,
          title: domain,
          description: `Biblical principles applied to ${domain} domain`,
          parentId: biblicalCategoryId,
          nodeType: RealityNodeType.CATEGORY,
          category: RealityNodeCategory.BIBLICAL,
          immutable: false,
          orderIndex: Array.from(lawsByDomain.keys()).indexOf(domain) + 1,
          metadata: {
            domain,
            lawCount: domainLaws.length,
          },
        },
      })

      // Create RealityNodes for each Bible Law
      for (const law of domainLaws) {
        const lawNodeId = `${domainCategoryId}-law-${law.lawNumber}`
        await linkPrisma.realityNode.upsert({
          where: { id: lawNodeId },
          update: {
            title: `${law.title} (${law.scriptureReference})`,
            description: law.originalText || law.domainApplication,
            parentId: domainCategoryId,
            nodeType: RealityNodeType.LAW,
            category: RealityNodeCategory.BIBLICAL,
            immutable: false,
            orderIndex: law.lawNumber,
            metadata: {
              lawNumber: law.lawNumber,
              domain: law.domain,
              bibleLawId: law.id,
              scriptureReference: law.scriptureReference,
              category: law.category,
              order: law.order,
            },
          },
          create: {
            id: lawNodeId,
            title: `${law.title} (${law.scriptureReference})`,
            description: law.originalText || law.domainApplication,
            parentId: domainCategoryId,
            nodeType: RealityNodeType.LAW,
            category: RealityNodeCategory.BIBLICAL,
            immutable: false,
            orderIndex: law.lawNumber,
            metadata: {
              lawNumber: law.lawNumber,
              domain: law.domain,
              bibleLawId: law.id,
              scriptureReference: law.scriptureReference,
              category: law.category,
              order: law.order,
            },
          },
        })
      }
      console.log(`  ✅ Linked ${domainLaws.length} Bible Laws for ${domain} domain`)
    }

    console.log(`  ✅ Linked ${bibleLaws.length} total Bible Laws to hierarchy`)
  } catch (error) {
    console.error('  ❌ Error linking Bible Laws:', error)
    throw error
  } finally {
    await linkPrisma.$disconnect()
  }
}

// Export for use in master seed script
export default seedRealityHierarchy

// Allow running standalone (ES module compatible check)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRealityHierarchy()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

