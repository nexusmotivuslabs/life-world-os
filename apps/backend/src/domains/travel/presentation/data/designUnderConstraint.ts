/**
 * Design Under Constraint: optionality without destroying long-term compounding.
 * First principle: Optionality is not movement. It is the ability to move without
 * destroying long-term compounding. Pensions, mortgages, ISAs, tax residency are
 * compounding systems — you reconfigure around them, not smash them.
 *
 * Used by GET /api/travel/visa-move/design-under-constraint and for AI/guidance.
 */

export const FIRST_PRINCIPLE = {
  headline: 'Optionality is not movement.',
  body: 'Optionality is the ability to move without destroying long-term compounding.',
  systems: [
    'Pensions, mortgages, ISAs, tax residency. These are compounding systems.',
    "You don't smash them. You reconfigure around them.",
  ],
}

export const THREE_LAYERS = {
  headline: 'Think in three layers:',
  layers: [
    'Foundations you should not casually break',
    'Assets that can travel',
    'Decisions that are reversible vs irreversible',
  ],
}

export const PENSIONS_UK = {
  title: 'Pensions (UK) — do not panic, do not cash out',
  hardTruth: [
    'Your UK pension is one of the most tax-efficient vehicles you will ever have.',
    'Hard to replicate abroad.',
    'Extremely expensive to rebuild if damaged.',
  ],
  defaultRule: 'Leave it alone unless there is a clear, superior structure.',
  whatMakesSense: [
    'Keep your UK pension open and intact.',
    'Continue contributing if tax-efficient.',
    'Let it compound independently of location.',
  ],
  note: 'UK pensions are location-agnostic assets. They don\'t trap you geographically.',
  beCareful: [
    'Overseas tax treatment of pension growth',
    'Double taxation depending on country',
    'Currency exposure over long time horizons',
  ],
  notToDo: [
    "Don't cash out early.",
    "Don't move pensions just because you're moving countries.",
    "Don't treat pensions as \"later me's problem\".",
  ],
}

export const PROPERTY_SECTION = {
  title: 'Mortgages and property — this is where people get stuck',
  intro: 'Property is often the real anchor, not jobs. So ask: Is this property a home, a liability, or a future option?',
  scenarioA: {
    title: 'Scenario A: You keep the UK property',
    summary: 'Often the best optionality move.',
    bullets: ['Convert to buy-to-let if allowed', 'Rent covers mortgage partially or fully', 'Retain exposure to UK property market', 'Gives you a "return point"'],
    keeps: ['Credit history alive', 'Asset compounding', 'Family safety net'],
  },
  scenarioB: {
    title: 'Scenario B: You sell before moving',
    summary: 'Increases liquidity but loses market exposure, creates reinvestment risk.',
    note: 'Sometimes correct, but usually later, not first.',
  },
  scenarioC: {
    title: 'Scenario C: You keep it empty',
    summary: 'Usually the worst option: cash drain, no compounding, psychological weight.',
  },
}

export const ISAS_SECTION = {
  title: 'ISAs, savings, investments',
  isas: 'ISAs are UK tax shelters. Some countries don\'t recognise ISA tax-free status. But you usually don\'t need to close them.',
  rule: 'Keep ISAs. Stop contributing if required. Let them compound quietly.',
  general: 'General investments can usually be held globally. Watch tax residency rules. Avoid triggering unnecessary capital gains on exit.',
}

export const TAX_RESIDENCY_SECTION = {
  title: 'The key constraint you must respect: tax residency',
  intro: 'This is where optionality lives or dies.',
  affects: ['Income tax', 'Capital gains', 'Pension contributions', 'Mortgage interest relief', 'Investment reporting'],
  rule: 'You cannot be fuzzy here.',
  optionalityIncreases: [
    'You clearly know when you are UK-resident vs not',
    'You plan transitions, not "figure it out later"',
  ],
}

export const FAMILY_SECTION = {
  title: 'Family changes the calculus',
  priorities: ['Stability > speed', 'Reversibility > optimisation', 'Redundancy > maximal returns'],
  goal: 'Your goal is not "financial efficiency". Your goal is robustness under change.',
}

export const CLEAN_CHECKLIST = {
  title: 'A clean checklist (Design Under Constraint style)',
  intro: 'Before any move, you want clear answers to:',
  sections: [
    {
      id: 'pensions',
      title: 'Pensions',
      questions: ['Can I keep contributing?', 'How will this be taxed abroad?', 'Is there any irreversible downside to leaving it untouched?'],
    },
    {
      id: 'property',
      title: 'Property',
      questions: ['Can it be rented?', 'Does rent cover mortgage + buffer?', 'Does this preserve a return path?'],
    },
    {
      id: 'liquidity',
      title: 'Liquidity',
      questions: ['Do I have 6–12 months of runway?', 'In which currency?'],
    },
    {
      id: 'tax_residency',
      title: 'Tax residency',
      questions: ['When exactly does residency change?', 'What triggers tax obligations?'],
    },
  ],
  closing: 'If you can answer those, you are not stuck. You\'re prepared.',
}

export const REFRAME = {
  insteadOf: '"Can we move abroad?"',
  ask: '"Can we make it safe to try living abroad for 12–24 months without burning long-term assets?"',
  note: "That's a solvable problem.",
}
