/**
 * SkillLeverageModal
 *
 * When a skill symbol is opened: shows the full leverage framework
 * (problem, structure, leverage profile, compounding, cost, signal vs noise,
 * interaction effects, observable metrics) and Decision: Invest / Maintain / Avoid.
 * Falls back to description + matrix-derived hints when content is missing.
 */

import { useEffect, useRef } from 'react'
import { X, BookOpen, GitBranch } from 'lucide-react'
import type { SkillsMapSkill, SkillLeverageContent } from '../config/skillsMapConfig'
import { getSkillLeverageContent } from '../config/skillsMapConfig'

function deriveLeverageFromPosition(x: number): SkillLeverageContent['leverage'] {
  if (x >= 8) return 'High'
  if (x >= 6) return 'Moderate'
  if (x >= 4) return 'Moderate'
  return 'Low'
}

function deriveCompoundingFromPosition(y: number): SkillLeverageContent['compounding'] {
  if (y >= 8) return 'High'
  if (y >= 6) return 'Moderate'
  if (y >= 4) return 'Linear'
  return 'Linear'
}

function deriveDecisionFromPosition(x: number, y: number): 'Invest' | 'Maintain' | 'Avoid' {
  const sum = x + y
  if (sum >= 14) return 'Invest'
  if (sum <= 4) return 'Avoid'
  return 'Maintain'
}

interface SkillLeverageModalProps {
  skill: SkillsMapSkill | null
  systemId?: string
  isOpen: boolean
  onClose: () => void
  onExploreInConcepts: () => void
  onOpenNode?: (realityNodeId: string) => void
}

function Section({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
      <div className="mt-1.5 text-gray-200">{children}</div>
    </section>
  )
}

function Placeholder() {
  return <span className="text-gray-500 italic">Not yet defined</span>
}

export default function SkillLeverageModal({
  skill,
  systemId,
  isOpen,
  onClose,
  onExploreInConcepts,
  onOpenNode,
}: SkillLeverageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const content = skill ? getSkillLeverageContent(skill.id) : null
  const leverage = content?.leverage ?? (skill ? deriveLeverageFromPosition(skill.x) : null)
  const compounding = content?.compounding ?? (skill ? deriveCompoundingFromPosition(skill.y) : null)
  const transferability = content?.transferability ?? null
  const decision = content?.decision ?? (skill ? deriveDecisionFromPosition(skill.x, skill.y) : 'Maintain')

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!skill || !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-leverage-title"
    >
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-700 bg-gray-800 p-6 pb-4">
          <div>
            {skill.capability && (
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Capability → {skill.capability}
              </p>
            )}
            <h2 id="skill-leverage-title" className="text-xl font-semibold text-white">
              {skill.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6 pt-4">
          {/* 1. What problem does this skill solve? */}
          <Section title="1. What problem does this skill solve?">
            {content?.problem ? (
              <ul className="list-inside list-disc space-y-1 text-sm">
                {content.problem.constraint && (
                  <li><strong>Constraint:</strong> {content.problem.constraint}</li>
                )}
                {content.problem.failurePrevented && (
                  <li><strong>Failure prevented:</strong> {content.problem.failurePrevented}</li>
                )}
                {content.problem.upsideUnlocked && (
                  <li><strong>Upside unlocked:</strong> {content.problem.upsideUnlocked}</li>
                )}
              </ul>
            ) : (
              <p className="text-sm">{skill.description ?? <Placeholder />}</p>
            )}
          </Section>

          {/* 2. Where does this skill sit structurally? */}
          <Section title="2. Where does this skill sit structurally?">
            {skill.capability && (
              <p className="text-sm">Capability → <strong>{skill.capability}</strong> → Skill: {skill.label}</p>
            )}
            {content?.systemImpacts?.length ? (
              <p className="mt-1 text-sm">
                <strong>System impact:</strong>{' '}
                {content.systemImpacts.join(' · ')}
              </p>
            ) : (
              <p className="text-sm">{skill.description ? `System: ${systemId ?? '—'}` : <Placeholder />}</p>
            )}
          </Section>

          {/* 3. Leverage profile */}
          <Section title="3. Leverage profile">
            <div className="flex flex-wrap gap-4 text-sm">
              <span><strong>Systemic leverage:</strong> {leverage ?? <Placeholder />}</span>
              <span><strong>Compounding power:</strong> {compounding ?? <Placeholder />}</span>
              <span><strong>Transferability:</strong> {transferability ?? <Placeholder />}</span>
            </div>
            {!content && (
              <p className="mt-1 text-xs text-gray-500">Derived from matrix position (X, Y) when not defined.</p>
            )}
          </Section>

          {/* 4. Compounding mechanism */}
          <Section title="4. Compounding mechanism">
            {content?.compoundingMechanism?.length ? (
              <ul className="list-inside list-disc space-y-0.5 text-sm">
                {content.compoundingMechanism.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm"><Placeholder /></p>
            )}
          </Section>

          {/* 5. Cost to mastery */}
          <Section title="5. Cost to mastery">
            {content?.costToMastery ? (
              <ul className="space-y-0.5 text-sm">
                {content.costToMastery.timeToCompetence && (
                  <li><strong>Time to competence:</strong> {content.costToMastery.timeToCompetence}</li>
                )}
                {content.costToMastery.timeToMastery && (
                  <li><strong>Time to mastery:</strong> {content.costToMastery.timeToMastery}</li>
                )}
                {content.costToMastery.maintenanceCost && (
                  <li><strong>Maintenance cost:</strong> {content.costToMastery.maintenanceCost}</li>
                )}
                {content.costToMastery.cognitiveLoad && (
                  <li><strong>Cognitive load:</strong> {content.costToMastery.cognitiveLoad}</li>
                )}
              </ul>
            ) : (
              <p className="text-sm"><Placeholder /></p>
            )}
          </Section>

          {/* 6. Signal vs noise */}
          <Section title="6. Signal vs noise">
            {content?.signalVsNoise ? (
              <div className="space-y-1 text-sm">
                <p><strong>Fake:</strong> {content.signalVsNoise.fake}</p>
                <p><strong>Real:</strong> {content.signalVsNoise.real}</p>
              </div>
            ) : (
              <p className="text-sm"><Placeholder /></p>
            )}
          </Section>

          {/* 7. Interaction effects */}
          <Section title="7. Interaction effects">
            {content?.interactionEffects?.length ? (
              <ul className="list-inside list-disc space-y-0.5 text-sm">
                {content.interactionEffects.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm"><Placeholder /></p>
            )}
          </Section>

          {/* 8. Observable metrics */}
          <Section title="8. Observable metrics">
            {content?.observableMetrics?.length ? (
              <p className="text-sm">{content.observableMetrics.join(' · ')}</p>
            ) : (
              <p className="text-sm"><Placeholder /></p>
            )}
          </Section>

          {/* Decision */}
          <Section title="Decision" className="border-t border-gray-700 pt-4">
            <p className="text-base font-semibold">
              <span
                className={
                  decision === 'Invest'
                    ? 'text-emerald-400'
                    : decision === 'Avoid'
                    ? 'text-red-400'
                    : 'text-amber-400'
                }
              >
                {decision}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Invest = double down · Maintain = keep current · Avoid = stop or don’t start
            </p>
          </Section>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-700 p-6">
          <button
            type="button"
            onClick={() => {
              onClose()
              onExploreInConcepts()
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            <BookOpen className="h-4 w-4" />
            Explore in Universal Concepts
          </button>
          {skill.realityNodeId && onOpenNode && (
            <button
              type="button"
              onClick={() => onOpenNode(skill.realityNodeId!)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              <GitBranch className="h-4 w-4" />
              Open node in tree
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
