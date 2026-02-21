/**
 * Skill Transferability Analyzer
 * Optionality mini-app: map skills to opportunities, portability score, gap analysis.
 */
import { useState } from 'react'
import { Search, BarChart3, Lightbulb, Plus } from 'lucide-react'

const DOMAINS = ['Engineering', 'Product', 'Leadership', 'Operations', 'Finance', 'Creative']

export default function SkillTransferabilityAnalyzer() {
  const [skill, setSkill] = useState('')
  const [skills, setSkills] = useState<{ name: string; domains: string[] }[]>([])
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])

  const addSkill = () => {
    if (!skill.trim()) return
    setSkills((prev) => [...prev, { name: skill.trim(), domains: [...selectedDomains] }])
    setSkill('')
    setSelectedDomains([])
  }

  const toggleDomain = (d: string) => {
    setSelectedDomains((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  const portabilityScore =
    skills.length === 0
      ? 0
      : Math.round(
          (skills.reduce((acc, s) => acc + (s.domains.length || 1), 0) / skills.length / DOMAINS.length) * 100
        )

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-blue-400" /> Skill transferability
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Add skills and tag domains they apply to. Higher portability = more options.
      </p>
      <div className="space-y-2 mb-3">
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          placeholder="e.g. Systems thinking, Writing"
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
        />
        <div className="flex flex-wrap gap-1">
          {DOMAINS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDomain(d)}
              className={`px-2 py-1 rounded text-xs ${
                selectedDomains.includes(d)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={addSkill}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
        >
          <Plus className="w-4 h-4" /> Add skill
        </button>
      </div>
      {skills.length > 0 && (
        <div className="p-3 rounded-lg bg-gray-800 border border-gray-600 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Portability score
            </span>
            <span className="text-lg font-bold text-green-400">{Math.min(100, portabilityScore)}</span>
          </div>
          <p className="text-xs text-gray-500">
            Based on how many domains your skills apply to.
          </p>
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Your skills
        </h4>
        {skills.length === 0 ? (
          <p className="text-xs text-gray-500">Add skills above to see mapping.</p>
        ) : (
          skills.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-800/80"
            >
              <span className="text-sm text-white">{s.name}</span>
              <span className="text-xs text-gray-400">
                {s.domains.length ? s.domains.join(', ') : '—'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
