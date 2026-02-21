/**
 * VisaMoveChecklist
 *
 * Travel Logistics Team product: track visa documents, residency steps,
 * housing, and move milestones so nothing slips. Dropdowns call backend
 * endpoints so AI and users get actionable next steps.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Calendar,
  FileText,
  Home,
  MapPin,
  Plus,
  Trash2,
  GraduationCap,
  Shield,
  Info,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { travelApi, type VisaMoveOptionsResponse, type VisaMoveGuidanceResponse, type VisaMovePathsResponse, type UserMoveContextPayload } from '../../services/travelApi'

type SectionId = 'prerequisites' | 'documents' | 'residency' | 'housing' | 'dates' | 'safety_fit'

interface ChecklistItem {
  id: string
  label: string
  dueDate?: string
  done: boolean
}

const SECTION_CONFIG: Record<
  SectionId,
  { label: string; icon: typeof FileText; placeholder: string }
> = {
  prerequisites: {
    label: 'Education, skills & language',
    icon: GraduationCap,
    placeholder: 'e.g. Degree recognition, language test, skills assessment',
  },
  documents: {
    label: 'Visa & residency documents',
    icon: FileText,
    placeholder: 'e.g. Passport copy, visa application, police clearance',
  },
  residency: {
    label: 'Residency steps',
    icon: MapPin,
    placeholder: 'e.g. Submit application, biometrics, collect permit',
  },
  housing: {
    label: 'Housing & bookings',
    icon: Home,
    placeholder: 'e.g. Lease signing, deposit, first month rent',
  },
  dates: {
    label: 'Key dates',
    icon: Calendar,
    placeholder: 'e.g. Visa interview, move date, flight',
  },
  safety_fit: {
    label: 'Safety & fit by profile',
    icon: Shield,
    placeholder: 'e.g. Research safety for my profile, safest places by ethnicity',
  },
}

const STORAGE_KEY = 'visa-move-checklist'

function loadStored(): Record<SectionId, ChecklistItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, ChecklistItem[]>
      return {
        prerequisites: parsed.prerequisites ?? [],
        documents: parsed.documents ?? [],
        residency: parsed.residency ?? [],
        housing: parsed.housing ?? [],
        dates: parsed.dates ?? [],
        safety_fit: parsed.safety_fit ?? [],
      }
    }
  } catch {
    // ignore
  }
  return {
    prerequisites: [],
    documents: [],
    residency: [],
    housing: [],
    dates: [],
    safety_fit: [],
  }
}

function saveStored(data: Record<SectionId, ChecklistItem[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

const FALLBACK_OPTIONS: VisaMoveOptionsResponse = {
  countries: [
    { value: 'DE', label: 'Germany' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'OTHER', label: 'Other' },
  ],
  visaTypes: [
    { value: 'WORK', label: 'Work visa' },
    { value: 'DIGITAL_NOMAD', label: 'Digital nomad' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'OTHER', label: 'Other' },
  ],
  educationLevels: [
    { value: 'NONE', label: 'No formal requirement' },
    { value: 'BACHELOR', label: "Bachelor's" },
    { value: 'MASTER', label: "Master's" },
    { value: 'OTHER', label: 'Other' },
  ],
  safetyFitDimensions: [
    { value: 'ETHNICITY', label: 'Safety & welcome by ethnicity' },
    { value: 'NATIONALITY', label: 'By nationality' },
    { value: 'GENERAL', label: 'General safety only' },
  ],
}

const FALLBACK_PATHS: VisaMovePathsResponse = {
  intro: 'The 3 viable optionality paths for someone like you. No hype. No Instagram nonsense. These are the only real ones.',
  paths: [
    {
      id: 'employer-sponsored',
      title: 'Path 1: Employer-sponsored mobility',
      subtitle: 'Internal transfer · Global company · Relocation package',
      bullets: ['Internal transfer', 'Global company', 'Relocation package'],
      pros: ['Safest for family', 'Healthcare and admin handled'],
      cons: ['Slow', 'You trade autonomy for security', "You're dependent on corporate timing"],
      summary: 'This path works, but only if you deliberately aim at companies with global footprints.',
    },
    {
      id: 'remote-residency',
      title: 'Path 2: Remote-first income + residency',
      subtitle: 'UK income · Live abroad legally · Digital nomad or residence visas',
      bullets: ['UK income', 'Live abroad legally', 'Digital nomad or residence visas'],
      pros: ['Faster', 'Keeps income stable', 'High control'],
      cons: ['Requires employer or contract flexibility', 'Requires discipline and planning'],
      summary: 'This is where optionality usually opens first.',
    },
    {
      id: 'ownership-income',
      title: 'Path 3: Ownership-based income',
      subtitle: 'Consulting · Advisory · IP · Long-term, low-maintenance income',
      bullets: ['Consulting', 'Advisory', 'IP', 'Long-term, low-maintenance income'],
      pros: ['Maximum control', 'Long-term family optionality'],
      cons: ['Slow to build', 'Not a short-term escape hatch'],
      summary: 'This is the second leg, not the first.',
    },
  ],
}

const GUIDANCE_SECTION_MAP: Record<string, SectionId> = {
  suggestedPrerequisites: 'prerequisites',
  suggestedDocuments: 'documents',
  suggestedResidencySteps: 'residency',
  suggestedSafetyFit: 'safety_fit',
  suggestedKeyDates: 'dates',
}

export default function VisaMoveChecklist() {
  const [options, setOptions] = useState<VisaMoveOptionsResponse | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [profile, setProfile] = useState({
    targetCountry: '',
    visaType: '',
    educationLevel: '',
    safetyFitDimension: '',
  })
  const [guidance, setGuidance] = useState<VisaMoveGuidanceResponse | null>(null)
  const [guidanceLoading, setGuidanceLoading] = useState(false)
  const [guidanceError, setGuidanceError] = useState<string | null>(null)
  const [paths, setPaths] = useState<VisaMovePathsResponse | null>(null)
  const [pathsOpen, setPathsOpen] = useState(false)
  const [situation, setSituation] = useState<UserMoveContextPayload>({})
  const [situationOpen, setSituationOpen] = useState(false)
  const [contextLoading, setContextLoading] = useState(false)
  const [contextSaving, setContextSaving] = useState(false)
  const [designContent, setDesignContent] = useState<Awaited<ReturnType<typeof travelApi.getDesignUnderConstraint>> | null>(null)
  const [designOpen, setDesignOpen] = useState(false)

  const [sections, setSections] = useState<Record<SectionId, ChecklistItem[]>>(loadStored)
  const [newItem, setNewItem] = useState<Record<SectionId, string>>({
    prerequisites: '',
    documents: '',
    residency: '',
    housing: '',
    dates: '',
    safety_fit: '',
  })
  const [newDue, setNewDue] = useState<Record<SectionId, string>>({
    prerequisites: '',
    documents: '',
    residency: '',
    housing: '',
    dates: '',
    safety_fit: '',
  })

  useEffect(() => {
    let cancelled = false
    travelApi
      .getVisaMoveOptions()
      .then((data) => {
        if (!cancelled) setOptions(data)
      })
      .catch(() => {
        if (!cancelled) setOptions(FALLBACK_OPTIONS)
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    travelApi
      .getVisaMovePaths()
      .then((data) => {
        if (!cancelled) setPaths(data)
      })
      .catch(() => {
        if (!cancelled) setPaths(FALLBACK_PATHS)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setContextLoading(true)
    travelApi
      .getVisaMoveContext()
      .then(({ context }) => {
        if (!cancelled && context) setSituation(context)
      })
      .catch(() => { if (!cancelled) setSituation({}) })
      .finally(() => { if (!cancelled) setContextLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!designOpen || designContent) return
    let cancelled = false
    travelApi.getDesignUnderConstraint().then((data) => { if (!cancelled) setDesignContent(data) }).catch(() => {})
    return () => { cancelled = true }
  }, [designOpen, designContent])

  const saveSituation = async () => {
    setContextSaving(true)
    try {
      await travelApi.putVisaMoveContext(situation)
    } finally {
      setContextSaving(false)
    }
  }

  const opts = options || FALLBACK_OPTIONS

  const persist = (next: Record<SectionId, ChecklistItem[]>) => {
    setSections(next)
    saveStored(next)
  }

  const addItem = (section: SectionId) => {
    const label = newItem[section].trim()
    if (!label) return
    const due = newDue[section].trim() || undefined
    const list = sections[section]
    const id = `${section}-${Date.now()}-${list.length}`
    persist({
      ...sections,
      [section]: [...list, { id, label, dueDate: due, done: false }],
    })
    setNewItem((prev) => ({ ...prev, [section]: '' }))
    setNewDue((prev) => ({ ...prev, [section]: '' }))
  }

  const toggleDone = (section: SectionId, id: string) => {
    const list = sections[section].map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    )
    persist({ ...sections, [section]: list })
  }

  const removeItem = (section: SectionId, id: string) => {
    persist({
      ...sections,
      [section]: sections[section].filter((item) => item.id !== id),
    })
  }

  const clearCompleted = (section: SectionId) => {
    persist({
      ...sections,
      [section]: sections[section].filter((item) => !item.done),
    })
  }

  const addItemByLabel = (section: SectionId, label: string) => {
    const list = sections[section]
    const id = `${section}-${Date.now()}-${list.length}`
    persist({
      ...sections,
      [section]: [...list, { id, label, done: false }],
    })
  }

  const handleGetNextSteps = async () => {
    if (!profile.targetCountry || !profile.visaType) {
      setGuidanceError('Select at least target country and visa type.')
      return
    }
    setGuidanceError(null)
    setGuidance(null)
    setGuidanceLoading(true)
    try {
      const data = await travelApi.getVisaMoveGuidance({
        targetCountry: profile.targetCountry,
        visaType: profile.visaType,
        educationLevel: profile.educationLevel || undefined,
        safetyFitDimension: profile.safetyFitDimension || undefined,
      })
      setGuidance(data)
    } catch (e) {
      setGuidanceError(e instanceof Error ? e.message : 'Failed to load guidance. Sign in and try again.')
    } finally {
      setGuidanceLoading(false)
    }
  }

  const totalItems = Object.values(sections).reduce((acc, list) => acc + list.length, 0)
  const doneCount = Object.values(sections).reduce(
    (acc, list) => acc + list.filter((i) => i.done).length,
    0
  )

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <h3 className="font-semibold text-sm text-white">Visa & Move Checklist</h3>
          <p className="text-xs text-gray-400">
            {doneCount} of {totalItems} done · Prerequisites, documents, housing, safety & dates
          </p>
        </div>
      </div>

      {/* Your situation — current location & financial plumbing (Design Under Constraint) */}
      <div className="rounded-lg border border-violet-700/40 bg-violet-950/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setSituationOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        >
          <span className="text-xs font-semibold text-violet-200">
            Your situation (current location & financial plumbing)
          </span>
          <ChevronDown className={`w-4 h-4 text-violet-400 transition-transform ${situationOpen ? 'rotate-180' : ''}`} />
        </button>
        {situationOpen && (
          <div className="px-3 pb-3 space-y-2 border-t border-violet-700/30 pt-2">
            {contextLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Current country</label>
                  <input
                    type="text"
                    value={situation.currentCountry ?? ''}
                    onChange={(e) => setSituation((s) => ({ ...s, currentCountry: e.target.value || undefined }))}
                    placeholder="e.g. UK"
                    className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Pension (e.g. UK)</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <select
                      value={situation.pensions?.hasPension === true ? 'yes' : situation.pensions?.hasPension === false ? 'no' : ''}
                      onChange={(e) => setSituation((s) => ({ ...s, pensions: { ...s.pensions, hasPension: e.target.value === 'yes' } }))}
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-violet-500 focus:outline-none flex-1 min-w-0"
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <select
                      value={situation.pensions?.keepContributing === true ? 'yes' : situation.pensions?.keepContributing === false ? 'no' : ''}
                      onChange={(e) => setSituation((s) => ({ ...s, pensions: { ...s.pensions, keepContributing: e.target.value === 'yes' } }))}
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-violet-500 focus:outline-none flex-1 min-w-0"
                    >
                      <option value="">Keep contributing? —</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Property</label>
                  <select
                    value={situation.property?.scenario ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setSituation((s) => ({ ...s, property: { ...s.property, scenario: (v === 'keep_rent' || v === 'sell_before' || v === 'keep_empty' || v === 'none') ? v : undefined } }))
                    }}
                    className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="">—</option>
                    <option value="keep_rent">Keep & rent (BTL)</option>
                    <option value="sell_before">Sell before move</option>
                    <option value="keep_empty">Keep empty</option>
                    <option value="none">None</option>
                  </select>
                  {(situation.property?.scenario === 'keep_rent') && (
                    <div className="flex gap-2">
                      <select
                        value={situation.property?.canRent === true ? 'yes' : situation.property?.canRent === false ? 'no' : ''}
                        onChange={(e) => setSituation((s) => ({ ...s, property: { ...s.property, canRent: e.target.value === 'yes' } }))}
                        className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white"
                      >
                        <option value="">Can rent? —</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      <select
                        value={situation.property?.rentCoversMortgage === true ? 'yes' : situation.property?.rentCoversMortgage === false ? 'no' : ''}
                        onChange={(e) => setSituation((s) => ({ ...s, property: { ...s.property, rentCoversMortgage: e.target.value === 'yes' } }))}
                        className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white"
                      >
                        <option value="">Rent covers mortgage? —</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">ISAs / investments</label>
                  <div className="flex gap-2">
                    <select
                      value={situation.isas?.hasIsa === true ? 'yes' : situation.isas?.hasIsa === false ? 'no' : ''}
                      onChange={(e) => setSituation((s) => ({ ...s, isas: { ...s.isas, hasIsa: e.target.value === 'yes' } }))}
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white flex-1"
                    >
                      <option value="">ISA? —</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <select
                      value={situation.isas?.hasInvestments === true ? 'yes' : situation.isas?.hasInvestments === false ? 'no' : ''}
                      onChange={(e) => setSituation((s) => ({ ...s, isas: { ...s.isas, hasInvestments: e.target.value === 'yes' } }))}
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white flex-1"
                    >
                      <option value="">Other investments? —</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Tax residency change (when?)</label>
                  <input
                    type="text"
                    value={situation.taxResidency?.residencyChangeDate ?? ''}
                    onChange={(e) => setSituation((s) => ({ ...s, taxResidency: { ...s.taxResidency, residencyChangeDate: e.target.value || undefined } }))}
                    placeholder="e.g. After 6 months abroad"
                    className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">Family & liquidity</label>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={situation.family?.hasDependants === true ? 'yes' : situation.family?.hasDependants === false ? 'no' : ''}
                      onChange={(e) => setSituation((s) => ({ ...s, family: { ...s.family, hasDependants: e.target.value === 'yes' } }))}
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white"
                    >
                      <option value="">Dependants? —</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={situation.liquidity?.runwayMonths ?? ''}
                      onChange={(e) => setSituation((s) => ({ ...s, liquidity: { ...s.liquidity, runwayMonths: e.target.value ? parseInt(e.target.value, 10) : undefined } }))}
                      placeholder="Runway (months)"
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white w-24"
                    />
                    <input
                      type="text"
                      value={situation.liquidity?.runwayCurrency ?? ''}
                      onChange={(e) => setSituation((s) => ({ ...s, liquidity: { ...s.liquidity, runwayCurrency: e.target.value || undefined } }))}
                      placeholder="Currency"
                      className="rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white w-20"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={saveSituation}
                  disabled={contextSaving}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium"
                >
                  {contextSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save situation
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Design Under Constraint — first principle, three layers, checklist */}
      <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setDesignOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        >
          <span className="text-xs font-semibold text-emerald-200">Design Under Constraint</span>
          <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${designOpen ? 'rotate-180' : ''}`} />
        </button>
        {designOpen && (
          <div className="px-3 pb-3 space-y-3 border-t border-emerald-700/30 pt-2 text-xs">
            {!designContent ? (
              <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>
            ) : (
              <>
                <div>
                  <p className="font-semibold text-emerald-100">{designContent.firstPrinciple.headline}</p>
                  <p className="text-gray-300 mt-0.5">{designContent.firstPrinciple.body}</p>
                  <ul className="text-gray-400 mt-1 space-y-0.5">
                    {(designContent.firstPrinciple.systems as string[]).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-emerald-100">{designContent.threeLayers.headline}</p>
                  <ul className="text-gray-300 mt-0.5 space-y-0.5">
                    {(designContent.threeLayers.layers as string[]).map((l, i) => (
                      <li key={i}>· {l}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-emerald-100">{designContent.cleanChecklist.title}</p>
                  <p className="text-gray-400 mt-0.5">{designContent.cleanChecklist.intro}</p>
                  <ul className="mt-1 space-y-1">
                    {designContent.cleanChecklist.sections.map((sec) => (
                      <li key={sec.id}>
                        <span className="text-emerald-200">{sec.title}:</span>{' '}
                        {(sec.questions as string[]).join(' · ')}
                      </li>
                    ))}
                  </ul>
                  <p className="text-emerald-200/90 italic mt-1">{designContent.cleanChecklist.closing}</p>
                </div>
                <div className="pt-1 border-t border-emerald-700/30">
                  <p className="text-gray-400">Reframe:</p>
                  <p className="text-gray-300">Instead of {designContent.reframe.insteadOf}</p>
                  <p className="text-emerald-200 font-medium">Ask: {designContent.reframe.ask}</p>
                  <p className="text-gray-400 italic">{designContent.reframe.note}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Your move profile – dropdowns wired to backend options endpoint */}
      <div className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-3 space-y-2">
        <h4 className="text-xs font-semibold text-cyan-200">Your move profile</h4>
        {optionsLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading options…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={profile.targetCountry}
                onChange={(e) => setProfile((p) => ({ ...p, targetCountry: e.target.value }))}
                className="w-full rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Target country</option>
                {opts.countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={profile.visaType}
                onChange={(e) => setProfile((p) => ({ ...p, visaType: e.target.value }))}
                className="w-full rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Visa type</option>
                {opts.visaTypes.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              <select
                value={profile.educationLevel}
                onChange={(e) => setProfile((p) => ({ ...p, educationLevel: e.target.value }))}
                className="w-full rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Education level (optional)</option>
                {opts.educationLevels.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
              <select
                value={profile.safetyFitDimension}
                onChange={(e) => setProfile((p) => ({ ...p, safetyFitDimension: e.target.value }))}
                className="w-full rounded px-2 py-1.5 bg-gray-800 border border-gray-600 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Safety & fit by (optional)</option>
                {opts.safetyFitDimensions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleGetNextSteps}
              disabled={guidanceLoading || !profile.targetCountry || !profile.visaType}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-medium"
            >
              {guidanceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting next steps…
                </>
              ) : (
                'Get next steps'
              )}
            </button>
            {guidanceError && (
              <p className="text-xs text-amber-400">{guidanceError}</p>
            )}
          </>
        )}
      </div>

      {/* Suggested next steps from API – add to checklist */}
      {guidance && (
        <div className="rounded-lg border border-green-700/40 bg-green-950/20 p-3 space-y-3">
          <h4 className="text-xs font-semibold text-green-200">Suggested next steps</h4>
          {guidance.note && (
            <p className="text-xs text-gray-400 italic">{guidance.note}</p>
          )}
          {(['suggestedPrerequisites', 'suggestedDocuments', 'suggestedResidencySteps', 'suggestedSafetyFit', 'suggestedKeyDates'] as const).map((key) => {
            const sectionId = GUIDANCE_SECTION_MAP[key]
            const items = guidance[key]
            if (!sectionId || !Array.isArray(items) || items.length === 0) return null
            return (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1">{SECTION_CONFIG[sectionId].label}</p>
                <ul className="space-y-1">
                  {items.map((label, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="flex-1 text-xs text-gray-300">{label}</span>
                      <button
                        type="button"
                        onClick={() => addItemByLabel(sectionId, label)}
                        className="flex-shrink-0 px-2 py-0.5 rounded bg-green-600/40 text-green-300 text-xs hover:bg-green-600/60"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {/* The 3 viable optionality paths – feedback like "these are the only real ones" */}
      {((paths ?? FALLBACK_PATHS).paths?.length ?? 0) > 0 && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setPathsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-semibold text-amber-200">
              {(paths ?? FALLBACK_PATHS).intro}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-amber-400 transition-transform ${pathsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {pathsOpen && (paths ?? FALLBACK_PATHS).paths && (
            <div className="px-3 pb-3 space-y-3 border-t border-amber-700/30 pt-2">
              {(paths ?? FALLBACK_PATHS).paths!.map((path) => (
                <div
                  key={path.id}
                  className="rounded-lg border border-amber-700/30 bg-gray-900/50 p-2.5 space-y-1.5"
                >
                  <h5 className="text-xs font-semibold text-amber-100">{path.title}</h5>
                  <p className="text-xs text-gray-400">{path.subtitle}</p>
                  <div className="flex flex-wrap gap-x-2 gap-y-0 text-xs text-gray-500">
                    {path.bullets.map((b, i) => (
                      <span key={i}>{b}{i < path.bullets.length - 1 ? ' ·' : ''}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <p className="text-[10px] font-medium text-green-400/90 uppercase tracking-wide">Pros</p>
                      <ul className="text-xs text-gray-400">
                        {path.pros.map((p, i) => (
                          <li key={i}>· {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-amber-400/90 uppercase tracking-wide">Cons</p>
                      <ul className="text-xs text-gray-400">
                        {path.cons.map((c, i) => (
                          <li key={i}>· {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-amber-200/90 italic pt-0.5">{path.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety & fit note: research can vary by ethnicity, nationality, etc. */}
      <div className="flex gap-2 p-3 rounded-lg bg-cyan-950/30 border border-cyan-700/30">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300">
          <span className="font-medium text-cyan-200">Safety and welcome vary by place and by profile.</span>
          {' '}
          Research safest places to live and work, and how destination fit (including by ethnicity, nationality, or identity) is reported by others. Use the &quot;Safety & fit by profile&quot; section below to track your research and sources.
        </div>
      </div>

      {(Object.keys(SECTION_CONFIG) as SectionId[]).map((sectionId) => {
        const config = SECTION_CONFIG[sectionId]
        const Icon = config.icon
        const list = sections[sectionId]
        const completedInSection = list.filter((i) => i.done).length

        return (
          <motion.section
            key={sectionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/80 rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-gray-300">{config.label}</span>
              </div>
              {completedInSection > 0 && (
                <button
                  type="button"
                  onClick={() => clearCompleted(sectionId)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Clear done
                </button>
              )}
            </div>
            <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-700/50 group"
                >
                  <button
                    type="button"
                    onClick={() => toggleDone(sectionId, item.id)}
                    className="flex-shrink-0 text-gray-500 hover:text-cyan-400"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`flex-1 min-w-0 text-sm ${
                      item.done ? 'text-gray-500 line-through' : 'text-gray-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.dueDate && (
                    <span className="flex items-center gap-0.5 text-xs text-gray-500 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {item.dueDate}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(sectionId, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 flex-shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1 p-2 border-t border-gray-700/50">
              <input
                type="text"
                value={newItem[sectionId]}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, [sectionId]: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && addItem(sectionId)}
                placeholder={config.placeholder}
                className="flex-1 min-w-0 rounded px-2 py-1.5 bg-gray-700 border border-gray-600 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="text"
                value={newDue[sectionId]}
                onChange={(e) =>
                  setNewDue((prev) => ({ ...prev, [sectionId]: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && addItem(sectionId)}
                placeholder="Due"
                className="w-20 rounded px-2 py-1.5 bg-gray-700 border border-gray-600 text-xs text-gray-300 placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addItem(sectionId)}
                disabled={!newItem[sectionId].trim()}
                className="p-1.5 rounded bg-cyan-600/30 text-cyan-400 hover:bg-cyan-600/50 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Add"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
