import { useEffect, useState } from 'react'
import { powerLawsApi, bibleLawsApi } from '../services/financeApi'
import { BookOpen, Book, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { logger } from '../lib/logger'

interface PowerLaw {
  id: string
  lawNumber: number
  title: string
  originalDescription: string
  domainApplication: string
  strategies: string[]
  examples?: string[]
  warnings?: string[]
  counterStrategies?: string[]
}

interface BibleLaw {
  id: string
  lawNumber: number
  title: string
  scriptureReference: string
  originalText?: string
  domainApplication: string
  principles: Array<{ text: string; examples?: Array<{ description: string; impact: string }> }>
  practicalApplications: string[]
  examples?: string[]
  warnings?: string[]
  relatedVerses?: string[]
}

export default function EnergyLawsView() {
  const [powerLaws, setPowerLaws] = useState<PowerLaw[]>([])
  const [bibleLaws, setBibleLaws] = useState<BibleLaw[]>([])
  const [view, setView] = useState<'power' | 'bible'>('power')
  const [loading, setLoading] = useState(true)
  const [selectedLaw, setSelectedLaw] = useState<PowerLaw | BibleLaw | null>(null)

  useEffect(() => {
    loadLaws()
  }, [])

  const loadLaws = async () => {
    try {
      setLoading(true)
      const [powerRes, bibleRes] = await Promise.all([
        powerLawsApi.getLawsByDomain('ENERGY').catch(() => []),
        bibleLawsApi.getLawsByDomain('ENERGY').catch(() => []),
      ])
      setPowerLaws(powerRes)
      setBibleLaws(bibleRes)
    } catch (error) {
      logger.error('Error loading energy laws:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">Loading energy laws...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setView('power')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'power'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Book className="w-4 h-4 inline mr-2" />
          48 Laws of Power ({powerLaws.length})
        </button>
        <button
          onClick={() => setView('bible')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'bible'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Bible Laws ({bibleLaws.length})
        </button>
      </div>

      {/* Laws List */}
      {view === 'power' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {powerLaws.map((law, index) => (
            <motion.div
              key={law.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => setSelectedLaw(law)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-400">
                  Law {law.lawNumber}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{law.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {law.domainApplication}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {view === 'bible' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bibleLaws.map((law, index) => (
            <motion.div
              key={law.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => setSelectedLaw(law)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-400">
                  {law.scriptureReference}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{law.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {law.domainApplication}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Law Detail Modal */}
      {selectedLaw && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLaw(null)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {view === 'power' ? `Law ${(selectedLaw as PowerLaw).lawNumber}` : (selectedLaw as BibleLaw).scriptureReference}
              </h2>
              <button
                onClick={() => setSelectedLaw(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-4">{selectedLaw.title}</h3>

            {view === 'power' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Original Law</h4>
                  <p className="text-gray-400 text-sm">{(selectedLaw as PowerLaw).originalDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Energy Application</h4>
                  <p className="text-gray-300">{(selectedLaw as PowerLaw).domainApplication}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Strategies</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {(selectedLaw as PowerLaw).strategies.map((strategy, i) => (
                      <li key={i} className="text-sm">{strategy}</li>
                    ))}
                  </ul>
                </div>
                {(selectedLaw as PowerLaw).warnings && (
                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-400">Warnings</h4>
                    <ul className="list-disc list-inside space-y-1 text-yellow-300">
                      {(selectedLaw as PowerLaw).warnings!.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {view === 'bible' && (
              <div className="space-y-4">
                {(selectedLaw as BibleLaw).originalText && (
                  <div>
                    <h4 className="font-semibold mb-2">Scripture</h4>
                    <p className="text-gray-300 italic">{(selectedLaw as BibleLaw).originalText}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Energy Application</h4>
                  <p className="text-gray-300">{(selectedLaw as BibleLaw).domainApplication}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Principles</h4>
                  <ul className="space-y-3">
                    {(selectedLaw as BibleLaw).principles.map((principle, i) => (
                      <li key={i} className="text-gray-300">
                        <div className="font-medium mb-1">{principle.text}</div>
                        {principle.examples && (
                          <ul className="list-disc list-inside ml-4 text-sm text-gray-400">
                            {principle.examples.map((ex, j) => (
                              <li key={j}>{ex.description}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Practical Applications</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {(selectedLaw as BibleLaw).practicalApplications.map((app, i) => (
                      <li key={i} className="text-sm">{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty States */}
      {view === 'power' && powerLaws.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No power laws available for energy domain yet.</p>
        </div>
      )}

      {view === 'bible' && bibleLaws.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No Bible laws available for energy domain yet.</p>
        </div>
      )}
    </div>
  )
}

