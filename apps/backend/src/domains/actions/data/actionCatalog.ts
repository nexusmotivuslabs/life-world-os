/**
 * Static action catalog for the Context → Actions Engine.
 * Engine chooses best 3 given context; it does not invent actions.
 */

export interface ActionDefinitionSeed {
  slug: string
  label: string
  explanationShort: string | null
  goalCategories: string[]
  energyLevelMin: string
  timeMinutesMax: number
  locationTypes: string[]
  mobileFriendly: boolean
  urgencyWeight: number
  order: number
}

export const ACTION_CATALOG: ActionDefinitionSeed[] = [
  { slug: '10-min-planning-sprint', label: 'Do a 10 minute planning sprint', explanationShort: 'Lock in next steps without overthinking.', goalCategories: ['focus'], energyLevelMin: 'medium', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 2, order: 1 },
  { slug: 'pay-most-urgent-bill', label: 'Pay the most urgent bill', explanationShort: 'One bill cleared reduces mental load.', goalCategories: ['finance'], energyLevelMin: 'low', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 3, order: 2 },
  { slug: 'prepare-visa-checklist', label: 'Prepare visa document checklist', explanationShort: 'One list so nothing slips.', goalCategories: ['travel_planning'], energyLevelMin: 'low', timeMinutesMax: 30, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 2, order: 3 },
  { slug: 'write-one-paragraph-constraint', label: 'Write one paragraph for Design Under Constraint', explanationShort: 'Capture one pensions/property/ISA or tax residency fact.', goalCategories: ['finance', 'travel_planning'], energyLevelMin: 'medium', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 1, order: 4 },
  { slug: 'walk-15-min', label: 'Walk for 15 minutes', explanationShort: 'Low barrier, clears head.', goalCategories: ['recovery'], energyLevelMin: 'low', timeMinutesMax: 20, locationTypes: ['home', 'office', 'commute', 'outside'], mobileFriendly: true, urgencyWeight: 1, order: 5 },
  { slug: 'book-gp-appointment', label: 'Book GP appointment', explanationShort: 'One call, future you is covered.', goalCategories: ['recovery'], energyLevelMin: 'low', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 2, order: 6 },
  { slug: 'meal-prep-tomorrow', label: 'Meal prep for tomorrow', explanationShort: 'One less decision tomorrow.', goalCategories: ['recovery', 'focus'], energyLevelMin: 'medium', timeMinutesMax: 60, locationTypes: ['home'], mobileFriendly: false, urgencyWeight: 1, order: 7 },
  { slug: 'single-deep-work-block', label: 'Single 25-min deep work block', explanationShort: 'One thing, no switching.', goalCategories: ['focus', 'learning'], energyLevelMin: 'high', timeMinutesMax: 30, locationTypes: ['home', 'office'], mobileFriendly: false, urgencyWeight: 2, order: 8 },
  { slug: 'review-visa-next-steps', label: 'Review visa next steps from checklist', explanationShort: 'Reconnect with your move plan.', goalCategories: ['travel_planning'], energyLevelMin: 'low', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 2, order: 9 },
  { slug: 'log-one-pension-fact', label: 'Log one pension or tax residency fact', explanationShort: 'Design Under Constraint: capture one fact.', goalCategories: ['finance', 'travel_planning'], energyLevelMin: 'low', timeMinutesMax: 10, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 1, order: 10 },
  { slug: '5-min-stretch', label: '5 minute stretch or breathwork', explanationShort: 'Resets tension without leaving the room.', goalCategories: ['recovery'], energyLevelMin: 'low', timeMinutesMax: 10, locationTypes: ['home', 'office', 'commute'], mobileFriendly: true, urgencyWeight: 1, order: 11 },
  { slug: 'one-learning-note', label: 'Write one learning note or summary', explanationShort: 'Compound knowledge in one paragraph.', goalCategories: ['learning'], energyLevelMin: 'medium', timeMinutesMax: 15, locationTypes: ['home', 'office'], mobileFriendly: true, urgencyWeight: 1, order: 12 },
]
