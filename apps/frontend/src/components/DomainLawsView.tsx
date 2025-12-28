/**
 * Domain Laws View Component
 * 
 * Displays 48 Laws of Power and Bible Laws mapped to a specific domain.
 * Used within each system to show domain-specific laws and frameworks.
 */

import { useState, useEffect } from 'react'
import { BookOpen, Search, ChevronRight } from 'lucide-react'
import { powerLawsApi, bibleLawsApi, PowerLaw, BibleLaw } from '../services/financeApi'
import { MasterDomain } from '../types'

interface DomainLawsViewProps {
  domain: MasterDomain
}

// Map MasterDomain to PowerLawDomain (string)
const mapToPowerLawDomain = (domain: MasterDomain): string => {
  switch (domain) {
    case MasterDomain.FINANCE:
      return 'MONEY'
    case MasterDomain.ENERGY:
      return 'ENERGY'
    default:
      return 'FINANCE' // Default fallback
  }
}

// Map MasterDomain to BibleLawDomain (string)
const mapToBibleLawDomain = (domain: MasterDomain): string => {
  switch (domain) {
    case MasterDomain.FINANCE:
      return 'MONEY'
    case MasterDomain.ENERGY:
      return 'ENERGY'
    case MasterDomain.INVESTMENT:
      return 'INVESTMENT'
    default:
      return 'FINANCE' // Default fallback
  }
}

export default function DomainLawsView({ domain }: DomainLawsViewProps) {
  const [view, setView] = useState<'power' | 'bible'>('power')
  const [powerLaws, setPowerLaws] = useState<PowerLaw[]>([])
  const [bibleLaws, setBibleLaws] = useState<BibleLaw[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const powerDomain = mapToPowerLawDomain(domain)
  const bibleDomain = mapToBibleLawDomain(domain)

  useEffect(() => {
    if (view === 'power') {
      loadPowerLaws()
    } else {
      loadBibleLaws()
    }
  }, [view, domain])

  const loadPowerLaws = async () => {
    try {
      setLoading(true)
      const laws = await powerLawsApi.getLawsByDomain(powerDomain)
      setPowerLaws(laws)
    } catch (error) {
      console.error('Error loading Power laws:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBibleLaws = async () => {
    try {
      setLoading(true)
      const laws = await bibleLawsApi.getLawsByDomain(bibleDomain)
      setBibleLaws(laws)
    } catch (error) {
      console.error('Error loading Bible laws:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPowerLaws = powerLaws.filter(
    (law) =>
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.originalDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.domainApplication?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBibleLaws = bibleLaws.filter(
    (law) =>
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.scriptureReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.domainApplication?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDomainLabel = () => {
    switch (domain) {
      case MasterDomain.FINANCE:
        return 'Finance'
      case MasterDomain.ENERGY:
        return 'Energy'
      case MasterDomain.HEALTH:
        return 'Health'
      case MasterDomain.TRAVEL:
        return 'Travel'
      case MasterDomain.MEANING:
        return 'Meaning'
      default:
        return 'System'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold">Laws, Principles & Frameworks</h2>
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded border border-indigo-500/30">
            {getDomainLabel()} Domain
          </span>
        </div>
        <p className="text-gray-400">
          Browse 48 Laws of Power and Bible Laws applied to the {getDomainLabel().toLowerCase()} domain. This is read-only reference material.
        </p>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('power')}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            view === 'power'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          48 Laws of Power
        </button>
        <button
          onClick={() => setView('bible')}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            view === 'bible'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          Bible Laws
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${view === 'power' ? '48 Laws of Power' : 'Bible Laws'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading laws...</div>
        </div>
      ) : (
        <>
          {view === 'power' ? (
            <div className="space-y-4">
              {filteredPowerLaws.length === 0 ? (
                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
                  <p className="text-gray-400">No Power laws found for this domain.</p>
                </div>
              ) : (
                filteredPowerLaws.map((law) => (
                  <div
                    key={law.id}
                    className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        Law {law.lawNumber}: {law.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-3">{law.originalDescription}</p>
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                      <h4 className="font-semibold text-blue-400 mb-2">Domain Application</h4>
                      <p className="text-gray-300 text-sm">{law.domainApplication}</p>
                    </div>
                    {law.strategies && law.strategies.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-green-400 mb-2">Strategies</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {law.strategies.map((strategy, idx) => (
                            <li key={idx}>{strategy}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {law.examples && law.examples.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-yellow-400 mb-2">Examples</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {law.examples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBibleLaws.length === 0 ? (
                <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
                  <p className="text-gray-400">No Bible laws found for this domain.</p>
                </div>
              ) : (
                filteredBibleLaws.map((law) => (
                  <div
                    key={law.id}
                    className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{law.title}</h3>
                        <p className="text-gray-400 text-sm">{law.scriptureReference}</p>
                      </div>
                    </div>
                    {law.originalText && (
                      <p className="text-gray-300 mb-3 italic">"{law.originalText}"</p>
                    )}
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                      <h4 className="font-semibold text-blue-400 mb-2">Domain Application</h4>
                      <p className="text-gray-300 text-sm">{law.domainApplication}</p>
                    </div>
                    {law.principles && Array.isArray(law.principles) && law.principles.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-green-400 mb-2">Principles</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {law.principles.map((principle: any, idx: number) => (
                            <li key={idx}>{typeof principle === 'string' ? principle : principle.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {law.practicalApplications && Array.isArray(law.practicalApplications) && law.practicalApplications.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-yellow-400 mb-2">Practical Applications</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {law.practicalApplications.map((app: string, idx: number) => (
                            <li key={idx}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

