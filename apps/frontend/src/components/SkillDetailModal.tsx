/**
 * SkillDetailModal
 *
 * Simple modal when a skill has no realityNodeId: shows label, description,
 * and a CTA to switch to Universal Concepts tab.
 */

import { useEffect, useRef } from 'react'
import { X, BookOpen } from 'lucide-react'
import type { SkillsMapSkill } from '../config/skillsMapConfig'

interface SkillDetailModalProps {
  skill: SkillsMapSkill | null
  isOpen: boolean
  onClose: () => void
  onExploreInConcepts: () => void
}

export default function SkillDetailModal({
  skill,
  isOpen,
  onClose,
  onExploreInConcepts,
}: SkillDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

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
      aria-labelledby="skill-detail-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="skill-detail-title" className="text-xl font-semibold text-white">
            {skill.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {skill.description && (
          <p className="mt-3 text-gray-300">{skill.description}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
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
