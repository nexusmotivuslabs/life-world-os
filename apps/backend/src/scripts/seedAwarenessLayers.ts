/**
 * Seed script for Awareness Layers
 * 
 * Seeds the awareness layer system with:
 * - Bible (ROOT, orderIndex: 1) - Primary root awareness layer
 * - People (ROOT) - Another root parent
 * - Nihilism (EXAMINE, parent: People) - With team system prompt metadata
 * 
 * Run with: npx tsx src/scripts/seedAwarenessLayers.ts
 */

import { PrismaClient, AwarenessLayerCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Nihilism team system prompt metadata
const nihilismMetadata = {
  purpose: "To ensure the team recognises, detects, and stabilises nihilistic drift that can emerge during high abstraction, systems thinking, or deconstruction phases.",
  contextDefinition: {
    description: "Nihilism is treated as a transitional cognitive state, not a belief system.",
    referenceModel: "Analysis by Friedrich Nietzsche and modern psychology research",
    conditions: [
      "Existing meaning systems are dismantled",
      "No replacement structure is yet operational",
      "Individuals retain high analytical clarity"
    ]
  },
  operationalDefinition: {
    definition: "A reduction in perceived meaning or value that leads to short time horizons, disengagement, or excessive cynicism in decision making.",
    treatment: "This is treated as a risk signal, not a personal failing."
  },
  observableIndicators: [
    "Persistent framing of work as 'arbitrary' or 'pointless'",
    "Avoidance of long term responsibility",
    "Excessive detachment disguised as rationality",
    "Decreased ownership paired with high critique",
    "Collapse of motivation despite intellectual engagement"
  ],
  systemResponseProtocol: {
    step1: {
      title: "Re-anchoring responsibility",
      actions: [
        "Clarify ownership",
        "Define impact scope",
        "Reinforce continuity of effort over outcome"
      ]
    },
    step2: {
      title: "Reducing abstraction",
      actions: [
        "Move from theory to execution",
        "Shorten feedback loops",
        "Emphasise concrete deliverables"
      ]
    },
    step3: {
      title: "Restoring time horizon",
      actions: [
        "Re-connect work to downstream users",
        "Surface second order effects",
        "Emphasise survivability and durability over optimisation"
      ]
    },
    note: "No moral framing is applied."
  },
  explicitNonResponses: [
    "Argue meaning philosophically",
    "Impose belief systems",
    "Moralise disengagement",
    "Treat nihilism as error or weakness"
  ],
  designPrinciple: {
    meaning: "A stabilising constraint that enables sustained effort under uncertainty.",
    responsibility: "The smallest unit of durable meaning."
  },
  reviewHook: {
    question: "Where have we dismantled systems faster than we rebuilt replacements?",
    frequency: "Quarterly",
    purpose: "This question surfaces nihilistic risk early."
  },
  whyThisWorks: [
    "Normalises the phase",
    "Prevents silent decay",
    "Converts insight into responsibility",
    "Keeps teams functional during deep thinking cycles"
  ],
  commonFailureModes: [
    "Mistake cynicism for clarity",
    "Confuse deconstruction with progress",
    "Ignore psychological load at the systems layer"
  ]
}

async function seedAwarenessLayers() {
  console.log('\n🌱 Seeding Awareness Layers...\n')

  try {
    // 1. Seed Bible (ROOT, orderIndex: 1, primary root)
    const bible = await prisma.awarenessLayer.upsert({
      where: { id: 'bible-awareness-layer' },
      update: {
        title: 'Bible',
        description: 'The primary root awareness layer - biblical principles and teachings as foundational guidance.',
        category: AwarenessLayerCategory.ROOT,
        parentId: null,
        orderIndex: 1,
        isRoot: true,
      },
      create: {
        id: 'bible-awareness-layer',
        title: 'Bible',
        description: 'The primary root awareness layer - biblical principles and teachings as foundational guidance.',
        category: AwarenessLayerCategory.ROOT,
        parentId: null,
        orderIndex: 1,
        isRoot: true,
      },
    })
    console.log(`✅ Seeded Bible awareness layer (ROOT, orderIndex: 1)`)

    // 2. Seed People (ROOT, another root parent)
    const people = await prisma.awarenessLayer.upsert({
      where: { id: 'people-awareness-layer' },
      update: {
        title: 'People',
        description: 'Root awareness layer for human-centered perspectives and frameworks.',
        category: AwarenessLayerCategory.ROOT,
        parentId: null,
        orderIndex: 2,
        isRoot: true,
      },
      create: {
        id: 'people-awareness-layer',
        title: 'People',
        description: 'Root awareness layer for human-centered perspectives and frameworks.',
        category: AwarenessLayerCategory.ROOT,
        parentId: null,
        orderIndex: 2,
        isRoot: true,
      },
    })
    console.log(`✅ Seeded People awareness layer (ROOT, orderIndex: 2)`)

    // 3. Seed Nihilism (EXAMINE, parent: People)
    const nihilism = await prisma.awarenessLayer.upsert({
      where: { id: 'nihilism-awareness-layer' },
      update: {
        title: 'Nihilism',
        description: 'Awareness layer for detecting and stabilising nihilistic drift during high abstraction phases.',
        category: AwarenessLayerCategory.EXAMINE,
        parentId: people.id,
        orderIndex: 1,
        isRoot: false,
        metadata: nihilismMetadata,
      },
      create: {
        id: 'nihilism-awareness-layer',
        title: 'Nihilism',
        description: 'Awareness layer for detecting and stabilising nihilistic drift during high abstraction phases.',
        category: AwarenessLayerCategory.EXAMINE,
        parentId: people.id,
        orderIndex: 1,
        isRoot: false,
        metadata: nihilismMetadata,
      },
    })
    console.log(`✅ Seeded Nihilism awareness layer (EXAMINE, parent: People)`)
    console.log(`   └─ Metadata includes team system prompt with indicators, protocols, and response strategies`)

    console.log(`\n✨ Seeding complete! 3 awareness layers seeded.`)
    console.log(`   - Bible (ROOT, #1)`)
    console.log(`   - People (ROOT)`)
    console.log(`   - Nihilism (EXAMINE → People)`)

  } catch (error) {
    console.error('❌ Error seeding awareness layers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
seedAwarenessLayers()
  .then(() => {
    console.log('\n✅ Seed script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error)
    process.exit(1)
  })

export default seedAwarenessLayers

