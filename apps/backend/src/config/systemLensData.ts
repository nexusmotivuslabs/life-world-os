/**
 * System lens data: per-system overrides for foundational nodes (laws, principles, frameworks).
 * Used to seed metadata.systemLenses on global nodes and to resolve display by systemId.
 *
 * Structure: for each (conceptType, conceptKey) we have a Record<systemId, Lens>.
 * Lens fields override the global node when present; missing fields fall back to global.
 */

import { SYSTEM_UNIVERSAL_CONCEPT_MAP } from './systemUniversalConceptConfig'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SystemId = keyof typeof SYSTEM_UNIVERSAL_CONCEPT_MAP

export interface LawLens {
  title?: string
  description?: string
  statement?: string
  derivedFrom?: string[]
  recursiveBehavior?: string
  violationOutcome?: string
  whyThisLawPersists?: string
}

export interface PrincipleLens {
  title?: string
  description?: string
  principle?: string
  alignedWith?: string[]
  whyItWorks?: string
  violationPattern?: string
  predictableResult?: string
}

export interface FrameworkLens {
  title?: string
  description?: string
  descriptionStrong?: string
  purpose?: string
  basedOn?: string[]
  structure?: string
  whenToUse?: string
  whenNotToUse?: string
}

export type ConceptType = 'fundamentalLaw' | 'strategicPrinciple' | 'systemicPrinciple' | 'crossSystemPrinciple' | 'framework'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLabel(id: string): string {
  return id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
}

function titleToDisplay(title: string): string {
  return title.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Build default lens: "(Concept) (System)" title; other fields fall back to global. */
function defaultLawLens(conceptKey: string, systemId: string): LawLens {
  return { title: `${titleToDisplay(conceptKey)} (${formatLabel(systemId)})` }
}
function defaultPrincipleLens(conceptKey: string, systemId: string): PrincipleLens {
  return { title: `${titleToDisplay(conceptKey)} (${formatLabel(systemId)})` }
}
function defaultFrameworkLens(conceptKey: string, systemId: string): FrameworkLens {
  return { title: `${titleToDisplay(conceptKey)} (${formatLabel(systemId)})` }
}

// ---------------------------------------------------------------------------
// Explicit system lens content (add full overrides here)
// ---------------------------------------------------------------------------

const EXPLICIT_FRAMEWORK_LENSES: Record<string, Record<string, Partial<FrameworkLens>>> = {
  PARETO_PRINCIPLE: {
    money: {
      title: 'Pareto Principle (Money)',
      description:
        'In money, ~20% of your inputs produce ~80% of your financial results. A small number of expense categories, income sources, and investment decisions drive most of your outcomes. Focus on the vital few: the biggest leaks, the highest-return actions, and the most impactful allocations.',
      descriptionStrong:
        'The 80/20 rule applied to finance: 20% of expense categories usually account for 80% of spending (find and cut those first). 20% of income activities often produce 80% of earnings (protect and grow those). A minority of holdings often drive most portfolio return—and most portfolio risk. Use the Pareto principle to identify where to cut, where to invest time and capital, and where to avoid spreading effort evenly.',
      purpose:
        'Identify the minority of financial inputs that produce the majority of results—so you can cut the 80% of effort that yields little, and double down on the 20% that compounds.',
      structure:
        '1. List inputs: expense categories, income sources, investments, time spent on money-related tasks. 2. Measure output: savings impact, income generated, return per unit of risk, value of time. 3. Rank by impact. 4. Focus: cut or automate the trivial many; protect and scale the vital few. Examples: (a) Spending: housing, transport, food often are the vital few—optimise there before trimming subscriptions. (b) Income: one skill or client may deliver most revenue—invest in that. (c) Portfolio: a few positions or one asset class may drive most return—understand concentration and risk. (d) Time: one or two high-leverage activities (e.g. negotiation, system-building) beat many low-leverage tasks.',
      whenToUse:
        'When deciding where to cut spending; when allocating time to income-generating activities; when building or rebalancing a portfolio; when prioritising which financial habits to change first.',
      whenNotToUse:
        'When every expense category is already optimised and marginal; when outputs are not measurable (e.g. some intangible benefits); when the distribution is roughly equal (rare in personal finance).',
    },
    optionality: {
      title: 'Pareto Principle (Optionality)',
      description:
        'Focus on the small number of actions, assets, or decisions that disproportionately increase future choices, not just immediate output. Most effort produces linear results. A minority creates leverage, flexibility, and paths that stay open. Optionality grows when resources are concentrated on inputs that preserve freedom, reversibility, and upside while limiting downside.',
      descriptionStrong:
        'The Pareto Principle, applied to optionality, prioritises the inputs that expand degrees of freedom over time. Instead of optimising for short-term efficiency, it identifies actions that unlock multiple future paths with minimal irreversible commitment. In optionality-driven systems, the goal is not to maximise output today, but to maximise choice tomorrow.',
      purpose:
        'Identify the critical few inputs that: keep future options open; enable asymmetric upside; minimise irreversible commitments.',
      whenToUse:
        'When decisions are irreversible or costly to unwind; when future conditions are uncertain; when preserving strategic freedom matters more than immediate efficiency.',
      whenNotToUse:
        'When execution speed matters more than flexibility; when outcomes are tightly constrained and fully known; when the system requires uniform reliability across all components.',
    },
  },
}

const EXPLICIT_LAW_LENSES: Record<string, Record<string, Partial<LawLens>>> = {}
const EXPLICIT_STRATEGIC_PRINCIPLE_LENSES: Record<string, Record<string, Partial<PrincipleLens>>> = {}
const EXPLICIT_SYSTEMIC_PRINCIPLE_LENSES: Record<string, Record<string, Partial<PrincipleLens>>> = {}
const EXPLICIT_CROSS_SYSTEM_PRINCIPLE_LENSES: Record<string, Record<string, Partial<PrincipleLens>>> = {}

// ---------------------------------------------------------------------------
// Build lens maps from SYSTEM_UNIVERSAL_CONCEPT_MAP (recursive over all systems × concepts)
// ---------------------------------------------------------------------------

function buildLawLenses(): Record<string, Record<SystemId, LawLens>> {
  const out: Record<string, Record<string, LawLens>> = {}
  for (const [systemId, mapping] of Object.entries(SYSTEM_UNIVERSAL_CONCEPT_MAP)) {
    for (const key of mapping.fundamentalLaws) {
      if (!out[key]) out[key] = {} as Record<SystemId, LawLens>
      const explicit = (EXPLICIT_LAW_LENSES as Record<string, Record<string, Partial<LawLens>>>)[key]?.[systemId]
      out[key][systemId as SystemId] = explicit
        ? { ...defaultLawLens(key, systemId), ...explicit }
        : defaultLawLens(key, systemId)
    }
  }
  return out
}

function buildStrategicPrincipleLenses(): Record<string, Record<SystemId, PrincipleLens>> {
  const out: Record<string, Record<string, PrincipleLens>> = {}
  for (const [systemId, mapping] of Object.entries(SYSTEM_UNIVERSAL_CONCEPT_MAP)) {
    for (const key of mapping.strategicPrinciples) {
      if (!out[key]) out[key] = {} as Record<SystemId, PrincipleLens>
      const explicit = (EXPLICIT_STRATEGIC_PRINCIPLE_LENSES as Record<string, Record<string, Partial<PrincipleLens>>>)[key]?.[systemId]
      out[key][systemId as SystemId] = explicit
        ? { ...defaultPrincipleLens(key, systemId), ...explicit }
        : defaultPrincipleLens(key, systemId)
    }
  }
  return out
}

function buildSystemicPrincipleLenses(): Record<string, Record<SystemId, PrincipleLens>> {
  const out: Record<string, Record<string, PrincipleLens>> = {}
  for (const [systemId, mapping] of Object.entries(SYSTEM_UNIVERSAL_CONCEPT_MAP)) {
    for (const key of mapping.systemicPrinciples) {
      if (!out[key]) out[key] = {} as Record<SystemId, PrincipleLens>
      const explicit = (EXPLICIT_SYSTEMIC_PRINCIPLE_LENSES as Record<string, Record<string, Partial<PrincipleLens>>>)[key]?.[systemId]
      out[key][systemId as SystemId] = explicit
        ? { ...defaultPrincipleLens(key, systemId), ...explicit }
        : defaultPrincipleLens(key, systemId)
    }
  }
  return out
}

function buildCrossSystemPrincipleLenses(): Record<string, Record<SystemId, PrincipleLens>> {
  const out: Record<string, Record<string, PrincipleLens>> = {}
  for (const [systemId, mapping] of Object.entries(SYSTEM_UNIVERSAL_CONCEPT_MAP)) {
    for (const key of mapping.crossSystemPrinciples) {
      if (!out[key]) out[key] = {} as Record<SystemId, PrincipleLens>
      const explicit = (EXPLICIT_CROSS_SYSTEM_PRINCIPLE_LENSES as Record<string, Record<string, Partial<PrincipleLens>>>)[key]?.[systemId]
      out[key][systemId as SystemId] = explicit
        ? { ...defaultPrincipleLens(key, systemId), ...explicit }
        : defaultPrincipleLens(key, systemId)
    }
  }
  return out
}

function buildFrameworkLenses(): Record<string, Record<SystemId, FrameworkLens>> {
  const out: Record<string, Record<string, FrameworkLens>> = {}
  for (const [systemId, mapping] of Object.entries(SYSTEM_UNIVERSAL_CONCEPT_MAP)) {
    for (const key of mapping.frameworks) {
      if (!out[key]) out[key] = {} as Record<SystemId, FrameworkLens>
      const explicit = EXPLICIT_FRAMEWORK_LENSES[key]?.[systemId]
      out[key][systemId as SystemId] = explicit
        ? { ...defaultFrameworkLens(key, systemId), ...explicit }
        : defaultFrameworkLens(key, systemId)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const FUNDAMENTAL_LAW_LENSES = buildLawLenses()
export const STRATEGIC_PRINCIPLE_LENSES = buildStrategicPrincipleLenses()
export const SYSTEMIC_PRINCIPLE_LENSES = buildSystemicPrincipleLenses()
export const CROSS_SYSTEM_PRINCIPLE_LENSES = buildCrossSystemPrincipleLenses()
export const FRAMEWORK_LENSES = buildFrameworkLenses()

/** Get system lens for a fundamental law. */
export function getFundamentalLawLens(lawTitle: string, systemId: SystemId): LawLens | undefined {
  return FUNDAMENTAL_LAW_LENSES[lawTitle]?.[systemId]
}

/** Get system lens for a strategic principle. */
export function getStrategicPrincipleLens(principleTitle: string, systemId: SystemId): PrincipleLens | undefined {
  return STRATEGIC_PRINCIPLE_LENSES[principleTitle]?.[systemId]
}

/** Get system lens for a systemic principle. */
export function getSystemicPrincipleLens(principleTitle: string, systemId: SystemId): PrincipleLens | undefined {
  return SYSTEMIC_PRINCIPLE_LENSES[principleTitle]?.[systemId]
}

/** Get system lens for a cross-system principle. */
export function getCrossSystemPrincipleLens(principleTitle: string, systemId: SystemId): PrincipleLens | undefined {
  return CROSS_SYSTEM_PRINCIPLE_LENSES[principleTitle]?.[systemId]
}

/** Get system lens for a framework. */
export function getFrameworkLens(frameworkTitle: string, systemId: SystemId): FrameworkLens | undefined {
  return FRAMEWORK_LENSES[frameworkTitle]?.[systemId]
}

/** Get systemLenses metadata object for a fundamental law (for seeding). */
export function getFundamentalLawSystemLenses(lawTitle: string): Record<string, LawLens> {
  return FUNDAMENTAL_LAW_LENSES[lawTitle] ?? {}
}

/** Get systemLenses metadata object for a strategic principle (for seeding). */
export function getStrategicPrincipleSystemLenses(principleTitle: string): Record<string, PrincipleLens> {
  return STRATEGIC_PRINCIPLE_LENSES[principleTitle] ?? {}
}

/** Get systemLenses metadata object for a systemic principle (for seeding). */
export function getSystemicPrincipleSystemLenses(principleTitle: string): Record<string, PrincipleLens> {
  return SYSTEMIC_PRINCIPLE_LENSES[principleTitle] ?? {}
}

/** Get systemLenses metadata object for a cross-system principle (for seeding). */
export function getCrossSystemPrincipleSystemLenses(principleTitle: string): Record<string, PrincipleLens> {
  return CROSS_SYSTEM_PRINCIPLE_LENSES[principleTitle] ?? {}
}

/** Get systemLenses metadata object for a framework (for seeding). */
export function getFrameworkSystemLenses(frameworkTitle: string): Record<string, FrameworkLens> {
  return FRAMEWORK_LENSES[frameworkTitle] ?? {}
}
