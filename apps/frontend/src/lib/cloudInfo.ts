// Cloud Information Data Structure
// Based on SYSTEM_DESIGN.md and LIFE_WORLD_MAP.md

export type CloudType = 'capacity' | 'engines' | 'oxygen' | 'meaning' | 'optionality'

export interface CloudInfo {
  type: CloudType
  name: string
  description: string
  fullDescription: string
  strongEffects: string[] // What happens at 70-100%
  weakEffects: string[] // What happens at 0-40%
  mediumEffects: string[] // What happens at 40-70%
  affectsResources: string[] // Which resources it affects
  affectsXP: string[] // Which XP categories it influences
  improvementTips: string[] // How to improve this cloud
  relatedSystems: string[] // Other systems it connects to
  icon: string // Icon name or emoji
}

export const cloudInfoData: Record<CloudType, CloudInfo> = {
  capacity: {
    type: 'capacity',
    name: 'Capacity Cloud',
    description: 'Health, energy, nervous system resilience',
    fullDescription:
      'The Capacity Cloud represents your physical and mental health, energy levels, and nervous system resilience. It is the foundation that allows all other systems to function. When strong, you can sustain high output without burnout. When weak, your ability to execute and maintain systems degrades.',
    strongEffects: [
      'High energy levels throughout the day',
      'Resilient to stress and pressure',
      'Can sustain peak output periods',
      'Quick recovery from setbacks',
      'Strong immune system and physical health',
      'Clear mental focus and decision-making',
    ],
    weakEffects: [
      'Low energy and frequent fatigue',
      'Vulnerable to burnout and exhaustion',
      'Difficulty maintaining consistent output',
      'Slow recovery from stress',
      'Compromised immune system',
      'Brain fog and poor decision-making',
      'System may force Winter season if Water < 20',
    ],
    mediumEffects: [
      'Moderate energy with occasional dips',
      'Some resilience but needs careful management',
      'Can handle normal workloads',
      'Recovery takes longer than ideal',
      'May need to pace activities',
    ],
    affectsResources: ['Water (health and energy score)'],
    affectsXP: ['Capacity XP (health and energy activities)'],
    improvementTips: [
      'Prioritize sleep (7-9 hours consistently)',
      'Regular exercise and movement',
      'Manage stress through meditation or mindfulness',
      'Eat nutritious meals regularly',
      'Take breaks and respect your limits',
      'Build recovery time into your schedule',
      'Track and monitor your energy patterns',
    ],
    relatedSystems: [
      'Water resource (directly linked)',
      'Season transitions (low capacity forces Winter)',
      'XP earning capacity (affects how much you can do)',
    ],
    icon: '💪',
  },
  engines: {
    type: 'engines',
    name: 'Engines Cloud',
    description: 'Income sources (salary, business, investments)',
    fullDescription:
      'The Engines Cloud represents your income-generating systems: salary, business ventures, investments, and other revenue streams. These are the mechanisms that convert your effort and resources into financial returns. A strong Engines Cloud means multiple, reliable income sources. A weak one means dependency on a single fragile source.',
    strongEffects: [
      'Multiple income streams operating',
      'Diversified revenue sources',
      'Reduced dependency on any single source',
      'Higher financial stability',
      'More flexibility in career decisions',
      'Ability to take calculated risks',
    ],
    weakEffects: [
      'Dependent on single income source',
      'High financial fragility',
      'Vulnerable to job loss or market changes',
      'Limited career flexibility',
      'Difficulty saying no to opportunities',
      'Stress from financial uncertainty',
    ],
    mediumEffects: [
      'Some income diversification',
      'Moderate financial stability',
      'Some flexibility but still dependent',
      'Building additional income streams',
    ],
    affectsResources: ['Oxygen (cash flow coverage)'],
    affectsXP: ['Engines XP (work and business activities)'],
    improvementTips: [
      'Diversify income sources (don\'t rely on one job)',
      'Build side projects or freelance work',
      'Invest in income-producing assets',
      'Develop skills that increase earning potential',
      'Create systems that generate passive income',
      'Build emergency fund (3-6 months expenses)',
      'Track and optimize each income stream',
    ],
    relatedSystems: [
      'Oxygen resource (income affects cash flow)',
      'Engines (individual income sources)',
      'XP earning (work activities)',
    ],
    icon: '⚙️',
  },
  oxygen: {
    type: 'oxygen',
    name: 'Oxygen Cloud',
    description: 'Cash flow and financial stability',
    fullDescription:
      'The Oxygen Cloud represents your cash flow and financial stability. Like oxygen in the body, financial oxygen (cash flow) is essential for survival and growth. When strong, you have breathing room to make decisions and take opportunities. When weak, every decision becomes urgent and stressful.',
    strongEffects: [
      'Multiple months of expenses covered',
      'Financial breathing room for decisions',
      'Can take opportunities without panic',
      'Reduced financial stress',
      'Ability to invest in growth',
      'Can say no to bad opportunities',
    ],
    weakEffects: [
      'Living paycheck to paycheck',
      'High financial stress and urgency',
      'Cannot take opportunities',
      'Forced to accept any work',
      'No buffer for emergencies',
      'System blocks expansion if < 3 months',
    ],
    mediumEffects: [
      'Some savings but limited',
      'Moderate financial security',
      'Can handle small emergencies',
      'Building financial buffer',
    ],
    affectsResources: ['Oxygen (monthly cash flow coverage)'],
    affectsXP: ['Oxygen XP (saving and financial activities)'],
    improvementTips: [
      'Build emergency fund (start with 1 month, aim for 6+)',
      'Track expenses and identify waste',
      'Increase income through engines',
      'Reduce unnecessary expenses',
      'Automate savings',
      'Avoid lifestyle inflation',
      'Create multiple income streams',
    ],
    relatedSystems: [
      'Oxygen resource (directly linked)',
      'Engines Cloud (income affects cash flow)',
      'System rules (blocks expansion if < 3 months)',
    ],
    icon: '💨',
  },
  meaning: {
    type: 'meaning',
    name: 'Meaning Cloud',
    description: 'Values, direction, philosophy',
    fullDescription:
      'The Meaning Cloud represents your sense of purpose and direction in life. It encompasses your core values, personal philosophy, and the "why" behind your actions. When strong, you have clear purpose, make decisions aligned with your values, and feel motivated and fulfilled. When weak, you may feel lost, disconnected from your goals, or question whether your choices truly matter to you.',
    strongEffects: [
      'Clear sense of purpose and direction',
      'Decisions align with values',
      'High motivation and engagement',
      'Resilient to external pressures',
      'Can say no to misaligned opportunities',
      'Strong sense of fulfillment',
    ],
    weakEffects: [
      'Lack of direction or purpose',
      'Difficulty making decisions',
      'Low motivation and engagement',
      'Feeling lost or disconnected',
      'Questioning life choices',
      'Vulnerable to others\' agendas',
    ],
    mediumEffects: [
      'Some clarity but still exploring',
      'Values are forming',
      'Moderate sense of direction',
      'Building understanding of purpose',
    ],
    affectsResources: ['Keys (unlocked through clarity)'],
    affectsXP: ['Meaning XP (values and purpose activities)'],
    improvementTips: [
      'Reflect on core values and principles',
      'Define personal mission and vision',
      'Spend time in nature or meditation',
      'Read philosophy or spiritual texts',
      'Journal about purpose and meaning',
      'Connect with mentors or guides',
      'Practice gratitude and mindfulness',
      'Align daily actions with values',
    ],
    relatedSystems: [
      'Keys resource (clarity unlocks options)',
      'Season choices (meaning guides season transitions)',
      'Decision-making (values inform choices)',
    ],
    icon: '🌟',
  },
  optionality: {
    type: 'optionality',
    name: 'Optionality Cloud',
    description: 'Assets, savings, skills, freedom',
    fullDescription:
      'The Optionality Cloud represents your freedom and ability to choose. It includes assets, savings, skills, network, and other resources that give you options. When strong, you have multiple paths forward and can pivot when needed. When weak, you are locked into a single path with no alternatives.',
    strongEffects: [
      'Multiple options and paths available',
      'Can pivot when circumstances change',
      'Freedom to choose opportunities',
      'Reduced dependency on any single system',
      'Skills and network provide alternatives',
      'Financial assets create security',
    ],
    weakEffects: [
      'Locked into single path',
      'No alternatives if current path fails',
      'High dependency on fragile systems',
      'Cannot pivot or adapt',
      'Limited skills or network',
      'No financial buffer for changes',
    ],
    mediumEffects: [
      'Some options but limited',
      'Building skills and assets',
      'Moderate flexibility',
      'Developing alternatives',
    ],
    affectsResources: ['Keys (options unlocked)', 'Gold (assets and savings)'],
    affectsXP: ['Optionality XP (learning and asset-building activities)'],
    improvementTips: [
      'Build diverse skill set',
      'Save and invest in assets',
      'Grow professional network',
      'Learn new capabilities',
      'Create multiple income streams',
      'Build emergency fund',
      'Develop transferable skills',
      'Invest in yourself (education, health)',
    ],
    relatedSystems: [
      'Keys resource (options unlocked)',
      'Gold resource (assets and savings)',
      'Engines (multiple income sources)',
      'XP earning (learning activities)',
    ],
    icon: '🔑',
  },
}

export function getCloudInfo(type: CloudType): CloudInfo {
  return cloudInfoData[type]
}

export function getCloudStrengthStatus(strength: number): 'strong' | 'medium' | 'weak' {
  if (strength >= 70) return 'strong'
  if (strength >= 40) return 'medium'
  return 'weak'
}

export function getCloudEffects(cloudInfo: CloudInfo, strength: number): string[] {
  const status = getCloudStrengthStatus(strength)
  switch (status) {
    case 'strong':
      return cloudInfo.strongEffects
    case 'weak':
      return cloudInfo.weakEffects
    default:
      return cloudInfo.mediumEffects
  }
}

