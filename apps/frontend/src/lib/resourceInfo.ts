// Resource Information Data Structure
// Based on SYSTEM_DESIGN.md

export type ResourceType = 'oxygen' | 'water' | 'gold' | 'armor' | 'keys'

export interface ResourceInfo {
  type: ResourceType
  name: string
  description: string
  fullDescription: string
  strongEffects: string[] // What happens when resource is high
  weakEffects: string[] // What happens when resource is low
  mediumEffects: string[] // What happens when resource is medium
  howToEarn: string[] // How to increase this resource
  howToSpend: string[] // How this resource is used/spent
  relatedClouds: string[] // Which clouds affect this resource
  relatedSystems: string[] // Other systems it connects to
  icon: string // Icon name or emoji
  unit: string // Display unit
}

export const resourceInfoData: Record<ResourceType, ResourceInfo> = {
  oxygen: {
    type: 'oxygen',
    name: 'Oxygen',
    description: 'Monthly cash flow coverage',
    fullDescription:
      'Oxygen represents your financial breathing room - how many months of expenses you have covered. Like oxygen in the body, financial oxygen (cash flow) is essential for survival and growth. When you have high Oxygen, you can make decisions without panic, take opportunities, and invest in growth. When Oxygen is low, every decision becomes urgent and stressful.',
    strongEffects: [
      'Multiple months of expenses covered (6+ months)',
      'Financial breathing room for strategic decisions',
      'Can take opportunities without panic',
      'Reduced financial stress and urgency',
      'Ability to invest in growth and assets',
      'Can say no to bad opportunities',
      'System allows expansion and new ventures',
    ],
    weakEffects: [
      'Living paycheck to paycheck (0-1 months)',
      'High financial stress and urgency',
      'Cannot take opportunities',
      'Forced to accept any work or opportunity',
      'No buffer for emergencies',
      'System blocks expansion if < 3 months',
      'Vulnerable to unexpected expenses',
    ],
    mediumEffects: [
      'Some savings but limited (2-3 months)',
      'Moderate financial security',
      'Can handle small emergencies',
      'Building financial buffer',
      'Some flexibility but still cautious',
    ],
    howToEarn: [
      'Build emergency fund (start with 1 month, aim for 6+)',
      'Increase income through engines (salary, business, investments)',
      'Reduce unnecessary expenses',
      'Automate savings from each paycheck',
      'Create multiple income streams',
      'Track expenses and identify waste',
      'Avoid lifestyle inflation',
    ],
    howToSpend: [
      'Cover monthly expenses and bills',
      'Invest in growth opportunities',
      'Build assets and investments',
      'Emergency expenses and unexpected costs',
      'Invest in skills and education',
      'Start new ventures or businesses',
    ],
    relatedClouds: [
      'Oxygen Cloud (directly linked - represents financial stability)',
      'Engines Cloud (income sources generate Oxygen)',
    ],
    relatedSystems: [
      'System rules (blocks expansion if < 3 months)',
      'Engines (income sources produce Oxygen)',
      'Season transitions (low Oxygen may force Winter)',
      'XP earning (financial activities earn Oxygen XP)',
    ],
    icon: '💨',
    unit: 'months',
  },
  water: {
    type: 'water',
    name: 'Water',
    description: 'Health and energy score',
    fullDescription:
      'Water represents your physical and mental health, energy levels, and overall well-being. It is the foundation that allows all other systems to function. When Water is high, you have energy to execute plans, maintain systems, and sustain output. When Water is low, your ability to function degrades, and the system may force you into Winter season to recover.',
    strongEffects: [
      'High energy levels (75-100%)',
      'Resilient to stress and pressure',
      'Can sustain peak output periods',
      'Quick recovery from setbacks',
      'Strong immune system and physical health',
      'Clear mental focus and decision-making',
      'System allows all seasons and activities',
    ],
    weakEffects: [
      'Low energy and frequent fatigue (< 30%)',
      'Vulnerable to burnout and exhaustion',
      'Difficulty maintaining consistent output',
      'Slow recovery from stress',
      'Compromised immune system',
      'Brain fog and poor decision-making',
      'System blocks progression if < 30%',
      'System forces Winter season if < 20%',
    ],
    mediumEffects: [
      'Moderate energy (30-75%)',
      'Some resilience but needs careful management',
      'Can handle normal workloads',
      'Recovery takes longer than ideal',
      'May need to pace activities',
    ],
    howToEarn: [
      'Prioritize sleep (7-9 hours consistently)',
      'Regular exercise and movement',
      'Manage stress through meditation or mindfulness',
      'Eat nutritious meals regularly',
      'Take breaks and respect your limits',
      'Build recovery time into your schedule',
      'Track and monitor your energy patterns',
      'Seek medical care when needed',
    ],
    howToSpend: [
      'Daily activities and work',
      'Exercise and physical activities',
      'Mental work and decision-making',
      'Social interactions and relationships',
      'Learning and skill development',
      'Recovery and rest periods',
    ],
    relatedClouds: [
      'Capacity Cloud (directly linked - health and energy)',
    ],
    relatedSystems: [
      'Capacity Cloud (directly affects Water)',
      'Season transitions (low Water forces Winter)',
      'XP earning capacity (affects how much you can do)',
      'System rules (blocks progression if < 30%)',
    ],
    icon: '💧',
    unit: '%',
  },
  gold: {
    type: 'gold',
    name: 'Gold',
    description: 'Assets and savings',
    fullDescription:
      'Gold represents your accumulated assets, savings, and wealth. Unlike Oxygen (which is about cash flow coverage), Gold is about total financial assets and net worth. High Gold means you have built wealth over time through savings, investments, and asset accumulation. Gold provides long-term security and can generate passive income.',
    strongEffects: [
      'Significant accumulated wealth',
      'Assets generating passive income',
      'Long-term financial security',
      'Can weather economic downturns',
      'Freedom to make long-term investments',
      'Reduced dependency on active income',
      'Can support lifestyle without constant work',
    ],
    weakEffects: [
      'Little to no accumulated assets',
      'No passive income sources',
      'High dependency on active income',
      'Vulnerable to economic changes',
      'Cannot make long-term investments',
      'Limited financial security',
    ],
    mediumEffects: [
      'Some assets and savings',
      'Building wealth over time',
      'Moderate financial security',
      'Some passive income potential',
    ],
    howToEarn: [
      'Save consistently from income',
      'Invest in income-producing assets',
      'Build investment portfolio',
      'Create passive income streams',
      'Reduce expenses and increase savings rate',
      'Invest in real estate or businesses',
      'Compound returns over time',
    ],
    howToSpend: [
      'Invest in assets and opportunities',
      'Build passive income streams',
      'Large purchases and investments',
      'Emergency fund (converts to Oxygen)',
      'Long-term wealth building',
      'Support lifestyle during low-income periods',
    ],
    relatedClouds: [
      'Optionality Cloud (assets create freedom)',
      'Engines Cloud (investment engines generate Gold)',
      'Oxygen Cloud (Gold can convert to Oxygen)',
    ],
    relatedSystems: [
      'Engines (investment engines produce Gold)',
      'Optionality Cloud (assets increase optionality)',
      'XP earning (saving and investing activities)',
      'Milestones (first asset, passive income)',
    ],
    icon: '💰',
    unit: '$',
  },
  armor: {
    type: 'armor',
    name: 'Armor',
    description: 'Buffers, systems, boundaries',
    fullDescription:
      'Armor represents your protective systems, boundaries, and buffers that shield you from stress, burnout, and external pressures. High Armor means you have strong boundaries, good stress management, and systems in place to protect your well-being. Low Armor means you are vulnerable to external pressures and may struggle with boundaries.',
    strongEffects: [
      'Strong boundaries and stress management (70-100%)',
      'Can say no to misaligned opportunities',
      'Protected from external pressures',
      'Systems in place to prevent burnout',
      'Clear limits and boundaries respected',
      'Resilient to others\' agendas',
      'Can maintain focus on priorities',
    ],
    weakEffects: [
      'Poor boundaries and stress management (< 30%)',
      'Vulnerable to external pressures',
      'Difficulty saying no',
      'Susceptible to burnout',
      'Others\' agendas can derail you',
      'Struggle to maintain focus',
      'High stress and overwhelm',
    ],
    mediumEffects: [
      'Moderate boundaries (30-70%)',
      'Some stress management',
      'Working on setting limits',
      'Occasional boundary challenges',
    ],
    howToEarn: [
      'Set and enforce clear boundaries',
      'Practice saying no to misaligned opportunities',
      'Build stress management systems',
      'Create buffers in your schedule',
      'Develop emotional resilience',
      'Learn to prioritize your needs',
      'Build support systems and networks',
      'Practice mindfulness and self-care',
    ],
    howToSpend: [
      'Protecting against stress and pressure',
      'Maintaining boundaries',
      'Saying no to opportunities',
      'Managing external demands',
      'Preventing burnout',
      'Shielding from others\' agendas',
    ],
    relatedClouds: [
      'Capacity Cloud (health affects ability to maintain boundaries)',
      'Meaning Cloud (values inform boundaries)',
    ],
    relatedSystems: [
      'Capacity Cloud (affects ability to maintain Armor)',
      'Meaning Cloud (values help set boundaries)',
      'Season management (Armor helps prevent burnout)',
      'XP earning (boundary-setting activities)',
    ],
    icon: '🛡️',
    unit: '%',
  },
  keys: {
    type: 'keys',
    name: 'Keys',
    description: 'Options unlocked, freedom milestones',
    fullDescription:
      'Keys represent unlocked options, freedom milestones, and the ability to choose different paths in life. Each Key represents a significant achievement or capability that opens new possibilities. High Keys means you have many options and can pivot when needed. Low Keys means you are locked into a single path with limited alternatives.',
    strongEffects: [
      'Many unlocked options (3+ keys)',
      'Can pivot when circumstances change',
      'Freedom to choose opportunities',
      'Multiple viable paths forward',
      'Reduced dependency on any single system',
      'Skills and network provide alternatives',
      'Financial assets create security',
    ],
    weakEffects: [
      'Few or no unlocked options (0-1 keys)',
      'Locked into single path',
      'No alternatives if current path fails',
      'High dependency on fragile systems',
      'Cannot pivot or adapt',
      'Limited skills or network',
    ],
    mediumEffects: [
      'Some options unlocked (1-2 keys)',
      'Building alternatives',
      'Moderate flexibility',
      'Developing new capabilities',
    ],
    howToEarn: [
      'Achieve major milestones',
      'Build diverse skill set',
      'Grow professional network',
      'Create multiple income streams',
      'Develop transferable skills',
      'Build financial assets',
      'Complete significant projects',
      'Unlock achievements in the system',
    ],
    howToSpend: [
      'Unlock new opportunities',
      'Access different career paths',
      'Pivot when circumstances change',
      'Take calculated risks',
      'Explore new ventures',
      'Make major life transitions',
    ],
    relatedClouds: [
      'Optionality Cloud (directly linked - freedom and options)',
      'Meaning Cloud (clarity unlocks Keys)',
    ],
    relatedSystems: [
      'Milestones (major achievements unlock Keys)',
      'Optionality Cloud (directly affects Keys)',
      'Meaning Cloud (clarity helps unlock Keys)',
      'XP earning (learning and achievement activities)',
    ],
    icon: '🔑',
    unit: '',
  },
}

export function getResourceInfo(type: ResourceType): ResourceInfo {
  return resourceInfoData[type]
}

export function getResourceStatus(value: number, type: ResourceType): 'strong' | 'medium' | 'weak' {
  if (type === 'oxygen') {
    if (value >= 6) return 'strong'
    if (value >= 2) return 'medium'
    return 'weak'
  }
  if (type === 'water' || type === 'armor') {
    if (value >= 70) return 'strong'
    if (value >= 30) return 'medium'
    return 'weak'
  }
  if (type === 'gold') {
    // Gold thresholds are more relative, but we'll use rough estimates
    if (value >= 50000) return 'strong'
    if (value >= 10000) return 'medium'
    return 'weak'
  }
  if (type === 'keys') {
    if (value >= 3) return 'strong'
    if (value >= 1) return 'medium'
    return 'weak'
  }
  return 'medium'
}

export function getResourceEffects(resourceInfo: ResourceInfo, value: number): string[] {
  const status = getResourceStatus(value, resourceInfo.type)
  switch (status) {
    case 'strong':
      return resourceInfo.strongEffects
    case 'weak':
      return resourceInfo.weakEffects
    default:
      return resourceInfo.mediumEffects
  }
}





