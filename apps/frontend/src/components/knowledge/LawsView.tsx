/**
 * Laws View Component
 * 
 * Read-only display of 48 Laws of Power and Bible Laws.
 * Part of the Knowledge Plane - no mutations allowed.
 */

import { useState, useEffect } from 'react'
import { BookOpen, Search, ChevronRight, Filter, Target } from 'lucide-react'
import { powerLawsApi, bibleLawsApi, PowerLaw, BibleLaw, PowerLawDomain, BibleLawDomain } from '../../services/financeApi'
import { logger } from '../lib/logger'

export default function LawsView() {
  const [view, setView] = useState<'power' | 'bible'>('power')
  const [powerLaws, setPowerLaws] = useState<PowerLaw[]>([])
  const [bibleLaws, setBibleLaws] = useState<BibleLaw[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>('MONEY')
  const [selectedCategory, setSelectedCategory] = useState<string>('') // Empty = all categories
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [availableDomains, setAvailableDomains] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<Array<{ category: string; count: number }>>([])
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    loadAvailableDomains()
    loadAvailableCategories()
  }, [view])

  useEffect(() => {
    if (availableDomains.length > 0) {
      // If selected domain is not available in current view, switch to first available
      if (!availableDomains.includes(selectedDomain)) {
        setSelectedDomain(availableDomains[0])
      }
    }
  }, [availableDomains, selectedDomain])

  useEffect(() => {
    if (selectedDomain && availableDomains.includes(selectedDomain)) {
      if (view === 'power') {
        loadPowerLaws()
      } else {
        loadBibleLaws()
      }
    }
  }, [view, selectedDomain, selectedCategory, availableDomains])

  const loadAvailableDomains = async () => {
    try {
      setLoadingDomains(true)
      if (view === 'bible') {
        // Fetch Bible Law domains from API
        const domains = await bibleLawsApi.getDomains()
        setAvailableDomains(domains.map(d => d.domain))
      } else {
        // Fetch Power Law domains from API
        const domains = await powerLawsApi.getDomains()
        setAvailableDomains(domains.map(d => d.domain))
      }
    } catch (error) {
      logger.error('Error loading domains:', error)
      // Fallback to default domains
      if (view === 'bible') {
        setAvailableDomains(['MONEY', 'INVESTMENT', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'SPIRITUAL_GROWTH', 'STEWARDSHIP', 'GENEROSITY', 'ENERGY'])
      } else {
        setAvailableDomains(['MONEY', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'NEGOTIATION', 'ENERGY'])
      }
    } finally {
      setLoadingDomains(false)
    }
  }

  const loadAvailableCategories = async () => {
    try {
      setLoadingCategories(true)
      if (view === 'bible') {
        const categories = await bibleLawsApi.getCategories()
        setAvailableCategories(categories)
      } else {
        const categories = await powerLawsApi.getCategories()
        setAvailableCategories(categories)
      }
    } catch (error) {
      logger.error('Error loading categories:', error)
      setAvailableCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadPowerLaws = async () => {
    if (!selectedDomain) return
    try {
      setLoading(true)
      const category = selectedCategory || undefined
      const laws = await powerLawsApi.getLawsByDomain(selectedDomain as PowerLawDomain, category)
      setPowerLaws(laws)
    } catch (error) {
      logger.error('Error loading Power laws:', error)
      setPowerLaws([])
    } finally {
      setLoading(false)
    }
  }

  const loadBibleLaws = async () => {
    if (!selectedDomain) return
    try {
      setLoading(true)
      const category = selectedCategory || undefined
      const laws = await bibleLawsApi.getLawsByDomain(selectedDomain as BibleLawDomain, category)
      setBibleLaws(laws)
    } catch (error) {
      logger.error('Error loading Bible laws:', error)
      setBibleLaws([])
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
      law.originalText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.domainApplication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.scriptureReference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold">Laws, Principles & Frameworks</h2>
        </div>
        <p className="text-gray-400 mb-4">
          Browse 48 Laws of Power, Bible Laws, extracted principles, and strategic frameworks. This is read-only reference material.
        </p>
        
        {/* Nested Structure Indicator */}
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-indigo-400 rounded"></div>
            <h3 className="font-semibold text-indigo-300">Nested Structure</h3>
          </div>
          <div className="ml-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              <span className="text-gray-300"><strong>Laws:</strong> 48 Laws of Power and Bible Laws</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              <span className="text-gray-300"><strong>Principles:</strong> Core principles extracted from laws</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              <span className="text-gray-300"><strong>Frameworks:</strong> Strategic decision-making frameworks</span>
            </div>
          </div>
        </div>
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

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domain Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Domain
          </label>
          {loadingDomains ? (
            <div className="text-gray-400 text-sm">Loading domains...</div>
          ) : (
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value)
              }}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white w-full"
            >
              {availableDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Category
          </label>
          {loadingCategories ? (
            <div className="text-gray-400 text-sm">Loading categories...</div>
          ) : (
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
              }}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white w-full"
            >
              <option value="">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search laws..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Laws List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading laws...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {view === 'power' ? (
            filteredPowerLaws.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
                <p className="text-gray-400">No laws found</p>
              </div>
            ) : (
              filteredPowerLaws.map((law) => (
                <div
                  key={law.id}
                  className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                          Law {law.order}
                        </span>
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          {law.domain}
                        </span>
                        {law.category && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30">
                            {law.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{law.title}</h3>
                      {law.originalDescription && (
                        <p className="text-gray-300 mb-3">{law.originalDescription}</p>
                      )}
                      {law.domainApplication && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm font-medium text-gray-300 mb-1">Domain Application:</p>
                          <p className="text-sm text-gray-300">{law.domainApplication}</p>
                        </div>
                      )}
                      {law.strategies && law.strategies.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm font-medium text-gray-300 mb-2">Strategies:</p>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {law.strategies.map((strategy, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredBibleLaws.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
                <p className="text-gray-400">No laws found</p>
              </div>
            ) : (
              filteredBibleLaws.map((law) => (
                <div
                  key={law.id}
                  className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                          Law {law.order}
                        </span>
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          {law.domain}
                        </span>
                        {law.category && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                            {law.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{law.title}</h3>
                      {law.originalText && (
                        <p className="text-gray-300 mb-3 italic">"{law.originalText}"</p>
                      )}
                      {law.domainApplication && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm font-medium text-gray-300 mb-1">Domain Application:</p>
                          <p className="text-sm text-gray-300">{law.domainApplication}</p>
                        </div>
                      )}
                      {law.scriptureReference && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm text-gray-400 mb-1">Scripture Reference:</p>
                          <p className="text-sm text-gray-300">{law.scriptureReference}</p>
                        </div>
                      )}
                      {law.principles && Array.isArray(law.principles) && law.principles.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm font-medium text-green-400 mb-2">Principles:</p>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {law.principles.map((principle: any, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{typeof principle === 'string' ? principle : principle.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {law.practicalApplications && Array.isArray(law.practicalApplications) && law.practicalApplications.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                          <p className="text-sm font-medium text-cyan-400 mb-2">Practical Applications:</p>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {law.practicalApplications.map((app: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{app}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  )
}

