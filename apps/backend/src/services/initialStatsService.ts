import { Season } from '../types'

export interface QuestionnaireAnswers {
  lifePhase: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
  financialMonths: number
  healthRating: 'weak' | 'medium' | 'strong' | 'very_strong'
  incomeSources: number
  purposeClarity: 'weak' | 'medium' | 'strong' | 'very_strong'
  availableOptions: number
  stressManagement: 'low' | 'medium' | 'high' | 'very_high'
  experienceLevel: 'beginner' | 'some' | 'experienced' | 'very_experienced'
}

export interface InitialStats {
  season: Season
  clouds: {
    capacity: number
    engines: number
    oxygen: number
    meaning: number
    optionality: number
  }
  resources: {
    oxygen: number
    water: number
    gold: number
    armor: number
    keys: number
  }
  xp: {
    overall: number
    capacity: number
    engines: number
    oxygen: number
    meaning: number
    optionality: number
  }
}

/**
 * Calculate initial game stats based on questionnaire answers
 */
export function calculateInitialStats(answers: QuestionnaireAnswers): InitialStats {
  // Calculate Cloud Strengths (0-100)
  const capacityStrength = calculateCapacityStrength(answers.healthRating)
  const enginesStrength = calculateEnginesStrength(answers.incomeSources)
  const oxygenStrength = calculateOxygenStrength(answers.financialMonths)
  const meaningStrength = calculateMeaningStrength(answers.purposeClarity)
  const optionalityStrength = calculateOptionalityStrength(answers.availableOptions)

  // Calculate Resources
  const oxygen = answers.financialMonths
  const water = calculateWaterResource(answers.healthRating)
  const gold = calculateGoldResource(answers.financialMonths, answers.incomeSources)
  const armor = calculateArmorResource(answers.stressManagement)
  const keys = calculateKeysResource(answers.availableOptions, answers.purposeClarity)

  // Calculate Starting XP
  const startingXP = calculateStartingXP(answers.experienceLevel)
  const categoryXP = calculateCategoryXP(answers, startingXP)

  return {
    season: answers.lifePhase,
    clouds: {
      capacity: capacityStrength,
      engines: enginesStrength,
      oxygen: oxygenStrength,
      meaning: meaningStrength,
      optionality: optionalityStrength,
    },
    resources: {
      oxygen,
      water,
      gold,
      armor,
      keys,
    },
    xp: {
      overall: startingXP,
      capacity: categoryXP.capacity,
      engines: categoryXP.engines,
      oxygen: categoryXP.oxygen,
      meaning: categoryXP.meaning,
      optionality: categoryXP.optionality,
    },
  }
}

function calculateCapacityStrength(healthRating: string): number {
  switch (healthRating) {
    case 'weak':
      return 40
    case 'medium':
      return 60
    case 'strong':
      return 75
    case 'very_strong':
      return 90
    default:
      return 50
  }
}

function calculateEnginesStrength(incomeSources: number): number {
  if (incomeSources === 1) return 40
  if (incomeSources === 2) return 60
  if (incomeSources >= 4) return 85
  if (incomeSources >= 3) return 75
  return 50
}

function calculateOxygenStrength(financialMonths: number): number {
  if (financialMonths <= 1) return 30
  if (financialMonths <= 3) return 50
  if (financialMonths <= 6) return 70
  return 85
}

function calculateMeaningStrength(purposeClarity: string): number {
  switch (purposeClarity) {
    case 'weak':
      return 35
    case 'medium':
      return 55
    case 'strong':
      return 75
    case 'very_strong':
      return 90
    default:
      return 50
  }
}

function calculateOptionalityStrength(availableOptions: number): number {
  if (availableOptions === 1) return 30
  if (availableOptions <= 3) return 50
  if (availableOptions <= 5) return 70
  return 85
}

function calculateWaterResource(healthRating: string): number {
  switch (healthRating) {
    case 'weak':
      return 30
    case 'medium':
      return 50
    case 'strong':
      return 75
    case 'very_strong':
      return 90
    default:
      return 50
  }
}

function calculateGoldResource(financialMonths: number, incomeSources: number): number {
  // Base gold on financial months (rough estimate: $1000 per month saved)
  const baseGold = financialMonths * 1000
  // Bonus for multiple income sources
  const incomeBonus = (incomeSources - 1) * 500
  return Math.max(0, baseGold + incomeBonus)
}

function calculateArmorResource(stressManagement: string): number {
  switch (stressManagement) {
    case 'low':
      return 20
    case 'medium':
      return 45
    case 'high':
      return 70
    case 'very_high':
      return 85
    default:
      return 50
  }
}

function calculateKeysResource(availableOptions: number, purposeClarity: string): number {
  let keys = 0
  // Keys from having options
  if (availableOptions >= 3) keys += 1
  if (availableOptions >= 5) keys += 1
  // Keys from clarity
  if (purposeClarity === 'strong' || purposeClarity === 'very_strong') keys += 1
  return keys
}

function calculateStartingXP(experienceLevel: string): number {
  switch (experienceLevel) {
    case 'beginner':
      return 0
    case 'some':
      return 750
    case 'experienced':
      return 1750
    case 'very_experienced':
      return 3000
    default:
      return 0
  }
}

function calculateCategoryXP(answers: QuestionnaireAnswers, overallXP: number): {
  capacity: number
  engines: number
  oxygen: number
  meaning: number
  optionality: number
} {
  // Distribute XP based on user's current situation
  // More XP in areas that are already stronger (they've been working on them)
  
  const capacityXP = Math.round(overallXP * 0.2 * (answers.healthRating === 'strong' || answers.healthRating === 'very_strong' ? 1.2 : 0.8))
  const enginesXP = Math.round(overallXP * 0.25 * (answers.incomeSources >= 2 ? 1.2 : 0.8))
  const oxygenXP = Math.round(overallXP * 0.2 * (answers.financialMonths >= 3 ? 1.2 : 0.8))
  const meaningXP = Math.round(overallXP * 0.15 * (answers.purposeClarity === 'strong' || answers.purposeClarity === 'very_strong' ? 1.2 : 0.8))
  const optionalityXP = Math.round(overallXP * 0.2 * (answers.availableOptions >= 3 ? 1.2 : 0.8))

  // Ensure total doesn't exceed overall XP
  const total = capacityXP + enginesXP + oxygenXP + meaningXP + optionalityXP
  if (total > overallXP) {
    const ratio = overallXP / total
    return {
      capacity: Math.round(capacityXP * ratio),
      engines: Math.round(enginesXP * ratio),
      oxygen: Math.round(oxygenXP * ratio),
      meaning: Math.round(meaningXP * ratio),
      optionality: Math.round(optionalityXP * ratio),
    }
  }

  return {
    capacity: capacityXP,
    engines: enginesXP,
    oxygen: oxygenXP,
    meaning: meaningXP,
    optionality: optionalityXP,
  }
}

