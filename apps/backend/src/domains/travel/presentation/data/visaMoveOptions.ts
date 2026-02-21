/**
 * Static options for visa/move dropdowns and AI-consumable endpoints.
 * Used by GET /api/travel/visa-move/options and to build guidance.
 */

export const VISA_MOVE_COUNTRIES = [
  { value: 'DE', label: 'Germany' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'IE', label: 'Ireland' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'US', label: 'United States' },
  { value: 'PT', label: 'Portugal' },
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'JP', label: 'Japan' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'OTHER', label: 'Other (research yourself)' },
] as const

export const VISA_TYPES = [
  { value: 'WORK', label: 'Work visa / employment' },
  { value: 'DIGITAL_NOMAD', label: 'Digital nomad / remote work' },
  { value: 'STUDENT', label: 'Student visa' },
  { value: 'FAMILY', label: 'Family reunion / dependent' },
  { value: 'INVESTOR', label: 'Investor / golden visa' },
  { value: 'SKILLED', label: 'Skilled worker / points-based' },
  { value: 'OTHER', label: 'Other' },
] as const

export const EDUCATION_LEVELS = [
  { value: 'NONE', label: 'No formal requirement' },
  { value: 'SECONDARY', label: 'Secondary / high school' },
  { value: 'BACHELOR', label: "Bachelor's degree" },
  { value: 'MASTER', label: "Master's degree" },
  { value: 'PHD', label: 'Doctorate / PhD' },
  { value: 'VOCATIONAL', label: 'Vocational / trade qualification' },
] as const

/** Dimensions for safety/fit research (e.g. by ethnicity, nationality). */
export const SAFETY_FIT_DIMENSIONS = [
  { value: 'ETHNICITY', label: 'Safety & welcome by ethnicity' },
  { value: 'NATIONALITY', label: 'Visa / treatment by nationality' },
  { value: 'RELIGION', label: 'Safety & welcome by religion' },
  { value: 'LGBTQ', label: 'LGBTQ+ safety & rights' },
  { value: 'GENERAL', label: 'General safety indices only' },
] as const

export interface VisaMoveGuidanceInput {
  targetCountry: string
  visaType: string
  educationLevel?: string
  safetyFitDimension?: string
}

export interface VisaMoveGuidanceResult {
  suggestedPrerequisites: string[]
  suggestedDocuments: string[]
  suggestedResidencySteps: string[]
  suggestedSafetyFit: string[]
  suggestedKeyDates: string[]
  note?: string
}

/**
 * Return guidance for the given profile. Static rules keyed by country/visa.
 * AI or other services can call this; later can be replaced by LLM or external API.
 */
export function getVisaMoveGuidance(input: VisaMoveGuidanceInput): VisaMoveGuidanceResult {
  const { targetCountry, visaType, educationLevel, safetyFitDimension } = input
  const result: VisaMoveGuidanceResult = {
    suggestedPrerequisites: [],
    suggestedDocuments: [],
    suggestedResidencySteps: [],
    suggestedSafetyFit: [],
    suggestedKeyDates: [],
  }

  // Prerequisites: education, skills, language
  if (educationLevel && educationLevel !== 'NONE') {
    result.suggestedPrerequisites.push(`Verify degree/qualification recognition in ${getCountryLabel(targetCountry)}`)
    result.suggestedPrerequisites.push('Check if professional body or skills assessment is required')
  }
  result.suggestedPrerequisites.push('Identify language requirement (e.g. IELTS, local test) and book exam if needed')
  if (['WORK', 'SKILLED', 'DIGITAL_NOMAD'].includes(visaType)) {
    result.suggestedPrerequisites.push('List skills and experience that match visa criteria')
  }

  // Documents (common + country-specific hints)
  result.suggestedDocuments.push('Valid passport (check expiry is 6+ months beyond move date)')
  result.suggestedDocuments.push('Passport-size photos per destination rules')
  result.suggestedDocuments.push('Visa application form and fee')
  if (['WORK', 'SKILLED'].includes(visaType)) {
    result.suggestedDocuments.push('Job offer or contract (if required)')
    result.suggestedDocuments.push('CV / résumé')
  }
  if (targetCountry === 'UK') {
    result.suggestedDocuments.push('UK visa: proof of English (e.g. IELTS), TB test if applicable')
  }
  if (['AU', 'CA', 'NZ'].includes(targetCountry)) {
    result.suggestedDocuments.push('Police clearance / certificate of good conduct')
    result.suggestedDocuments.push('Medical exam if required by country')
  }
  if (targetCountry === 'DE' || targetCountry === 'AT') {
    result.suggestedDocuments.push('Recognized qualification (ZAB/Anabin for DE) if skilled route')
  }

  // Residency steps
  result.suggestedResidencySteps.push('Submit visa/residency application (online or consulate)')
  result.suggestedResidencySteps.push('Biometrics / in-person appointment if required')
  result.suggestedResidencySteps.push('Wait for decision (check typical processing times)')
  result.suggestedResidencySteps.push('Collect permit / visa and check conditions')
  result.suggestedResidencySteps.push('Register address (Anmeldung, GPV, etc.) after arrival')
  result.suggestedResidencySteps.push('Open local bank account; register for tax if working')

  // Safety & fit by profile
  if (safetyFitDimension && safetyFitDimension !== 'GENERAL') {
    result.suggestedSafetyFit.push(`Research safety and welcome in ${getCountryLabel(targetCountry)} for your profile (${getSafetyFitLabel(safetyFitDimension)})`)
    result.suggestedSafetyFit.push('Check expat forums and travel safety indexes by demographic where available')
    result.suggestedSafetyFit.push('Note any visa or entry restrictions that vary by nationality or origin')
  } else {
    result.suggestedSafetyFit.push(`Research general safety indices and healthcare quality for ${getCountryLabel(targetCountry)}`)
    result.suggestedSafetyFit.push('Check travel advisories (e.g. government site) for your destination')
  }
  result.suggestedSafetyFit.push('Plan health and travel insurance that covers you abroad')

  // Key dates
  result.suggestedKeyDates.push('Visa/residency application deadline')
  result.suggestedKeyDates.push('Biometrics or interview date')
  result.suggestedKeyDates.push('Expected decision date')
  result.suggestedKeyDates.push('Intended move / flight date')
  result.suggestedKeyDates.push('First housing payment / lease start')

  result.note = `Guidance is generic. Always confirm requirements on the official immigration website for ${getCountryLabel(targetCountry)} and your specific situation.`

  return result
}

function getCountryLabel(value: string): string {
  const c = VISA_MOVE_COUNTRIES.find((x) => x.value === value)
  return c ? c.label : value
}

function getSafetyFitLabel(value: string): string {
  const s = SAFETY_FIT_DIMENSIONS.find((x) => x.value === value)
  return s ? s.label : value
}
