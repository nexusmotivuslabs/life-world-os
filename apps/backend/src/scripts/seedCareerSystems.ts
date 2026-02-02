/**
 * Seed Career Systems Script
 * 
 * Populates Optionality, Reputation, and Trust systems with teams, agents, and products.
 * These are cross-system career development systems in the CROSS_SYSTEM_STATES tier.
 */

import { PrismaClient, TeamDomain, TeamAgentRole, TeamProductType, GuideCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding career systems (Optionality, Reputation, Trust)...')

  // Get or create Nexus Motivus organization (owns all products)
  const nexusMotivus = await prisma.organization.upsert({
    where: { id: 'nexus-motivus-org-id' },
    update: {},
    create: {
      id: 'nexus-motivus-org-id',
      name: 'Nexus Motivus',
      description: 'Master Systems - Product Development Organization',
      isActive: true,
    },
  })
  console.log(`✅ Organization: ${nexusMotivus.name}`)

  // Get all agents
  const agents = await prisma.agent.findMany()
  const agentMap = new Map(agents.map(a => [a.type, a]))

  const careerTeams = [
    // ============================================================================
    // OPTIONALITY SYSTEM - 3 Teams, 9 Agents, 6 Products
    // ============================================================================
    {
      domain: TeamDomain.DECISION_ANALYSIS,
      name: 'Decision Analysis Team',
      description: 'Expert team focused on decision reversibility, risk mitigation, and opportunity cost analysis',
      icon: '🎯',
      order: 1,
      leadAgentType: 'DECISION_ANALYST' as const,
      agentRoles: [
        { type: 'DECISION_ANALYST' as const, role: TeamAgentRole.LEAD },
        { type: 'RISK_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
        { type: 'SYSTEMS_THINKER' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Classify Decision Reversibility',
          description: 'Analyze whether a decision can be undone and at what cost',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 3,
          estimatedTime: 45,
          steps: [
            {
              id: '1',
              title: 'Identify Decision Type',
              description: 'Determine if decision is reversible or irreversible',
              instructions: 'Ask: Can this be undone? What would reversal cost?',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Calculate Reversal Cost',
              description: 'Estimate time, money, and reputation cost to reverse',
              instructions: 'Consider financial cost, time investment, and relationship impact',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Build Mitigation Buffer',
              description: 'Create safety net for irreversible decisions',
              instructions: 'Maintain cash reserve, health capacity, and relationship goodwill',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Decision Reversibility Calculator',
          description: 'Input a decision and receive a reversibility score, reversal cost estimate, and risk level',
          type: TeamProductType.CALCULATOR,
          icon: '🔄',
          order: 1,
          url: '/products/decision-reversibility',
          accessUrl: '/systems/optionality/products/decision-reversibility',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Reversibility Score', description: 'Calculate how easily a decision can be undone', enabled: true },
            { name: 'Cost Estimate', description: 'Estimate financial and time cost to reverse', enabled: true },
            { name: 'Risk Assessment', description: 'Identify irreversible consequences', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'decision_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Risk Mitigation Planner',
          description: 'Design buffers for irreversible risks: cash reserves, health capacity, reputation goodwill',
          type: TeamProductType.PLANNER,
          icon: '🛡️',
          order: 2,
          url: '/products/risk-mitigation',
          accessUrl: '/systems/optionality/products/risk-mitigation',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Buffer Planning', description: 'Plan cash, health, and reputation buffers', enabled: true },
            { name: 'Risk Tracking', description: 'Monitor exposure to irreversible risks', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'risk_data', direction: 'read' as const },
            { system: 'Finance', dataType: 'buffer_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.SKILL_DEVELOPMENT,
      name: 'Skill Development Team',
      description: 'Specialized team for building transferable skills and timing specialization',
      icon: '📚',
      order: 2,
      leadAgentType: 'LEARNING_ARCHITECT' as const,
      agentRoles: [
        { type: 'LEARNING_ARCHITECT' as const, role: TeamAgentRole.LEAD },
        { type: 'SPECIALIZATION_ADVISOR' as const, role: TeamAgentRole.MEMBER },
        { type: 'PROGRESS_TRACKER' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Build Transferable Skill Stack',
          description: 'Develop skills that compound across multiple domains',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 4,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Identify Core Transferable Skills',
              description: 'Select skills that apply across domains',
              instructions: 'Focus on communication, systems thinking, problem decomposition',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Design Learning Path',
              description: 'Create deliberate practice plan',
              instructions: 'Set specific practice goals, track learning rate, adjust approach',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Time Specialization',
              description: 'Know when to specialize vs stay general',
              instructions: 'Avoid premature narrowing, specialize when transferable foundation is solid',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Skill Transferability Analyzer',
          description: 'Map skills to opportunity spaces and calculate portability scores across domains',
          type: TeamProductType.ANALYZER,
          icon: '🔍',
          order: 3,
          url: '/products/skill-transferability',
          accessUrl: '/systems/optionality/products/skill-transferability',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Skill Mapping', description: 'Map skills to career opportunities', enabled: true },
            { name: 'Portability Score', description: 'Calculate how transferable skills are', enabled: true },
            { name: 'Gap Analysis', description: 'Identify missing transferable skills', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'skill_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Learning Rate Tracker',
          description: 'Log decisions, track accuracy improvement over time, measure learning velocity',
          type: TeamProductType.TRACKER,
          icon: '📈',
          order: 4,
          url: '/products/learning-rate',
          accessUrl: '/systems/optionality/products/learning-rate',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Decision Logging', description: 'Record decisions and outcomes', enabled: true },
            { name: 'Accuracy Tracking', description: 'Measure decision quality improvement', enabled: true },
            { name: 'Learning Velocity', description: 'Track rate of skill acquisition', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'learning_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.PROOF_BUILDING,
      name: 'Proof-Building Team',
      description: 'Expert team for creating artifacts, quantifying impact, and making work legible',
      icon: '📝',
      order: 3,
      leadAgentType: 'ARTIFACT_DESIGNER' as const,
      agentRoles: [
        { type: 'ARTIFACT_DESIGNER' as const, role: TeamAgentRole.LEAD },
        { type: 'IMPACT_ANALYST' as const, role: TeamAgentRole.MEMBER },
        { type: 'VISIBILITY_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Create Durable Proof Artifacts',
          description: 'Build documentation, metrics, and systems that demonstrate impact',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 3,
          estimatedTime: 50,
          steps: [
            {
              id: '1',
              title: 'Identify Proof Opportunities',
              description: 'Find work that generates durable evidence',
              instructions: 'Look for design docs, post-mortems, reusable systems, metrics',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Quantify Impact',
              description: 'Tie work to measurable outcomes',
              instructions: 'Capture before/after metrics, document efficiency gains',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Make Impact Legible',
              description: 'Communicate results in noisy environments',
              instructions: 'Create clear visualizations, share updates, close loops visibly',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Artifact Portfolio Template',
          description: 'Structured templates for design docs, post-mortems, and technical guides',
          type: TeamProductType.TEMPLATE,
          icon: '📄',
          order: 5,
          url: '/products/artifact-portfolio',
          accessUrl: '/systems/optionality/products/artifact-portfolio',
          securityLevel: 'LOW',
          requiresAuth: true,
          features: [
            { name: 'Design Doc Templates', description: 'Pre-built templates for technical design', enabled: true },
            { name: 'Post-Mortem Format', description: 'Structured retrospective templates', enabled: true },
            { name: 'Guide Structure', description: 'Framework for knowledge documentation', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'artifact_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Impact Dashboard',
          description: 'Track and visualize before/after metrics, contributions, and outcomes',
          type: TeamProductType.DASHBOARD,
          icon: '📊',
          order: 6,
          url: '/products/impact-dashboard',
          accessUrl: '/systems/optionality/products/impact-dashboard',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Metrics Tracking', description: 'Track before/after impact metrics', enabled: true },
            { name: 'Contribution Visualization', description: 'Visualize individual contributions', enabled: true },
            { name: 'Outcome Reports', description: 'Generate impact summary reports', enabled: true },
          ],
          integrationPoints: [
            { system: 'Optionality', dataType: 'impact_data', direction: 'read' as const },
          ],
        },
      ],
    },

    // ============================================================================
    // REPUTATION & TRUST SYSTEM - 3 Teams, 9 Agents, 6 Products
    // ============================================================================
    {
      domain: TeamDomain.TRUST_BUILDING,
      name: 'Trust-Building Team',
      description: 'Expert team focused on building trust through competence, reliability, and alignment',
      icon: '🤝',
      order: 4,
      leadAgentType: 'TRUST_ANALYST' as const,
      agentRoles: [
        { type: 'TRUST_ANALYST' as const, role: TeamAgentRole.LEAD },
        { type: 'RELIABILITY_COACH' as const, role: TeamAgentRole.MEMBER },
        { type: 'ALIGNMENT_STRATEGIST' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Build Trust Through 3 Pillars',
          description: 'Strengthen competence, reliability, and alignment to build forward-looking trust',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 4,
          estimatedTime: 55,
          steps: [
            {
              id: '1',
              title: 'Demonstrate Competence',
              description: 'Show ability to do the work',
              instructions: 'Focus on technical ability, domain knowledge, problem-solving',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Build Reliable Delivery',
              description: 'Deliver consistently over time',
              instructions: 'Promise less, deliver more. Communicate early when issues arise.',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Ensure Alignment',
              description: 'Act in shared interest',
              instructions: 'Make transparent motives, think long-term, avoid misalignment signals',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Trust Health Checker',
          description: 'Audit competence, reliability, and alignment scores. Identify trust erosion patterns.',
          type: TeamProductType.DASHBOARD,
          icon: '💚',
          order: 7,
          url: '/products/trust-health',
          accessUrl: '/systems/reputation/products/trust-health',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Competence Score', description: 'Track technical and domain competence', enabled: true },
            { name: 'Reliability Score', description: 'Monitor consistency of delivery', enabled: true },
            { name: 'Alignment Score', description: 'Measure shared interest alignment', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'trust_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Commitment Tracker',
          description: 'Monitor promises vs deliveries, flag at-risk commitments, provide early warning system',
          type: TeamProductType.TRACKER,
          icon: '✅',
          order: 8,
          url: '/products/commitment-tracker',
          accessUrl: '/systems/reputation/products/commitment-tracker',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Promise Logging', description: 'Record all commitments made', enabled: true },
            { name: 'Delivery Tracking', description: 'Track completion status', enabled: true },
            { name: 'Risk Alerts', description: 'Early warning for at-risk commitments', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'commitment_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.REPUTATION_DEFENSE,
      name: 'Reputation Defense Team',
      description: 'Specialized team for avoiding reputation burns, owning failures, and closing loops',
      icon: '🛡️',
      order: 5,
      leadAgentType: 'REPUTATION_GUARDIAN' as const,
      agentRoles: [
        { type: 'REPUTATION_GUARDIAN' as const, role: TeamAgentRole.LEAD },
        { type: 'FAILURE_ANALYST' as const, role: TeamAgentRole.MEMBER },
        { type: 'COMMUNICATION_SPECIALIST' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Avoid Reputation Burns',
          description: 'Identify and prevent behaviors that rapidly destroy reputation',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 4,
          estimatedTime: 50,
          steps: [
            {
              id: '1',
              title: 'Identify Reputation Risks',
              description: 'Recognize behaviors that burn reputation',
              instructions: 'Watch for overpromising, blame-shifting, defensiveness, unowned failures',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Own Failures Visibly',
              description: 'Transform failures into learning demonstrations',
              instructions: 'Acknowledge mistakes quickly, explain what you learned, adjust course',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Close Loops Explicitly',
              description: 'Deliver bad news early and close communication loops',
              instructions: 'No surprises. Communicate issues early. Confirm resolution explicitly.',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Reputation Damage Calculator',
          description: 'Score behaviors for reputation burn risk: overpromising, blame, defensiveness',
          type: TeamProductType.CALCULATOR,
          icon: '⚠️',
          order: 9,
          url: '/products/reputation-damage',
          accessUrl: '/systems/reputation/products/reputation-damage',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Behavior Scoring', description: 'Assess reputation risk of actions', enabled: true },
            { name: 'Burn Analysis', description: 'Identify patterns that damage reputation', enabled: true },
            { name: 'Recovery Path', description: 'Generate recovery strategies', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'behavior_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Loop Closure Template',
          description: 'Structured templates for failure communications and recovery plans',
          type: TeamProductType.TEMPLATE,
          icon: '🔄',
          order: 10,
          url: '/products/loop-closure',
          accessUrl: '/systems/reputation/products/loop-closure',
          securityLevel: 'LOW',
          requiresAuth: true,
          features: [
            { name: 'Failure Comms Template', description: 'Structure for acknowledging failures', enabled: true },
            { name: 'Recovery Plan Format', description: 'Template for corrective action plans', enabled: true },
            { name: 'Update Structure', description: 'Format for progress updates', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'communication_data', direction: 'read' as const },
          ],
        },
      ],
    },
    {
      domain: TeamDomain.EGO_MANAGEMENT,
      name: 'Ego Management Team',
      description: 'Expert team for separating ego from identity and responding with curiosity',
      icon: '🧠',
      order: 6,
      leadAgentType: 'EGO_COACH' as const,
      agentRoles: [
        { type: 'EGO_COACH' as const, role: TeamAgentRole.LEAD },
        { type: 'FEEDBACK_PROCESSOR' as const, role: TeamAgentRole.MEMBER },
        { type: 'COURSE_CORRECTOR' as const, role: TeamAgentRole.MEMBER },
      ],
      guides: [
        {
          title: 'Separate Ego from Identity',
          description: 'Respond to criticism with curiosity instead of defensiveness',
          category: GuideCategory.BUSINESS_DEVELOPMENT,
          difficulty: 5,
          estimatedTime: 60,
          steps: [
            {
              id: '1',
              title: 'Detect Ego-Identity Fusion',
              description: 'Identify when being wrong feels like a threat',
              instructions: 'Watch for defensiveness, need to be right, treating criticism as attack',
              isOptional: false,
              order: 0,
            },
            {
              id: '2',
              title: 'Convert Criticism to Data',
              description: 'Remove emotional charge from feedback',
              instructions: 'Ask: What is the signal here? What can I learn?',
              isOptional: false,
              order: 1,
            },
            {
              id: '3',
              title: 'Adjust Without Self-Flagellation',
              description: 'Course-correct based on feedback',
              instructions: 'Change behavior, no drama, no over-correction, just adjust',
              isOptional: false,
              order: 2,
            },
          ],
        },
      ],
      products: [
        {
          name: 'Ego-Identity Audit',
          description: 'Detect danger signals: need to be right, threat response, position-shifting',
          type: TeamProductType.ANALYZER,
          icon: '🔍',
          order: 11,
          url: '/products/ego-identity',
          accessUrl: '/systems/reputation/products/ego-identity',
          securityLevel: 'MEDIUM',
          requiresAuth: true,
          features: [
            { name: 'Fusion Detection', description: 'Identify ego-identity fusion patterns', enabled: true },
            { name: 'Threat Analysis', description: 'Recognize defensive reactions', enabled: true },
            { name: 'Pattern Tracking', description: 'Monitor ego-driven behaviors over time', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'ego_data', direction: 'read' as const },
          ],
        },
        {
          name: 'Feedback Response Builder',
          description: 'Templates for curiosity-first responses to criticism and feedback',
          type: TeamProductType.TOOL,
          icon: '💬',
          order: 12,
          url: '/products/feedback-response',
          accessUrl: '/systems/reputation/products/feedback-response',
          securityLevel: 'LOW',
          requiresAuth: true,
          features: [
            { name: 'Response Templates', description: 'Pre-built curiosity-first responses', enabled: true },
            { name: 'Question Generator', description: 'Generate clarifying questions', enabled: true },
            { name: 'Tone Checker', description: 'Assess response tone for defensiveness', enabled: true },
          ],
          integrationPoints: [
            { system: 'Reputation', dataType: 'feedback_data', direction: 'read' as const },
          ],
        },
      ],
    },
  ]

  // Create teams, agents, and products
  for (const teamData of careerTeams) {
    console.log(`\n📋 Creating team: ${teamData.name}`)

    // Get lead agent
    const leadAgent = agentMap.get(teamData.leadAgentType)
    if (!leadAgent) {
      console.warn(`⚠️  Lead agent not found: ${teamData.leadAgentType}. Skipping team.`)
      continue
    }

    // Create team
    const team = await prisma.team.upsert({
      where: { domain: teamData.domain },
      update: {
        name: teamData.name,
        description: teamData.description,
        icon: teamData.icon,
        order: teamData.order,
        teamLeadAgentId: leadAgent.id,
      },
      create: {
        domain: teamData.domain,
        name: teamData.name,
        description: teamData.description,
        icon: teamData.icon,
        order: teamData.order,
        teamLeadAgentId: leadAgent.id,
      },
    })
    console.log(`  ✅ Team created: ${team.name}`)

    // Associate agents with team
    for (const agentRole of teamData.agentRoles) {
      const agent = agentMap.get(agentRole.type)
      if (!agent) {
        console.warn(`  ⚠️  Agent not found: ${agentRole.type}`)
        continue
      }

      await prisma.teamAgent.upsert({
        where: {
          teamId_agentId: {
            teamId: team.id,
            agentId: agent.id,
          },
        },
        update: {
          role: agentRole.role,
        },
        create: {
          teamId: team.id,
          agentId: agent.id,
          role: agentRole.role,
        },
      })
      console.log(`  👤 Agent assigned: ${agent.name} (${agentRole.role})`)
    }

    // Create team guides
    for (const guideData of teamData.guides) {
      const { steps, ...guideInfo } = guideData

      const guide = await prisma.moneyGuide.upsert({
        where: {
          id: `${team.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
        },
        create: {
          id: `${team.id}-${guideInfo.title.toLowerCase().replace(/\s+/g, '-')}`,
          teamId: team.id,
          ...guideInfo,
          steps: steps as any,
          isTeamGuide: true,
        },
        update: {
          ...guideInfo,
          steps: steps as any,
          isTeamGuide: true,
        },
      })
      console.log(`  📖 Guide created: ${guide.title}`)
    }

    // Create products and associate with team
    for (const productData of teamData.products) {
      const { features, integrationPoints, ...productInfo } = productData
      const productId = `${team.id}-${productInfo.name.toLowerCase().replace(/\s+/g, '-')}`

      // Create product owned by organization
      const product = await prisma.product.upsert({
        where: { id: productId },
        update: {
          name: productData.name,
          description: productData.description,
          type: productData.type,
          icon: productData.icon,
          order: productData.order,
          url: productData.url,
          accessUrl: productData.accessUrl,
          securityLevel: productData.securityLevel,
          requiresAuth: productData.requiresAuth,
          features: features as any,
          integrationPoints: integrationPoints as any,
        },
        create: {
          id: productId,
          organizationId: nexusMotivus.id,
          name: productData.name,
          description: productData.description,
          type: productData.type,
          icon: productData.icon,
          order: productData.order,
          url: productData.url,
          accessUrl: productData.accessUrl,
          securityLevel: productData.securityLevel,
          requiresAuth: productData.requiresAuth,
          features: features as any,
          integrationPoints: integrationPoints as any,
        },
      })
      console.log(`  📦 Product created: ${product.name}`)

      // Associate product with team
      await prisma.teamProductAssociation.upsert({
        where: {
          teamId_productId: {
            teamId: team.id,
            productId: product.id,
          },
        },
        update: {},
        create: {
          teamId: team.id,
          productId: product.id,
        },
      })
      console.log(`  🔗 Product linked to team: ${product.name}`)
    }
  }

  console.log('\n✨ Career systems seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding career systems:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
