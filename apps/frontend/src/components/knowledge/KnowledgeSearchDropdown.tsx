/**
 * Knowledge Search Dropdown Component
 * 
 * Dropdown search that shows results automatically as you type.
 * Part of the Knowledge Plane - read-only search results.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, BookOpen, Shield, Sparkles, ChevronRight, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { powerLawsApi, bibleLawsApi, PowerLaw, BibleLaw, PowerLawDomain, BibleLawDomain } from '../../services/financeApi'
import { awarenessApi, AwarenessLayer } from '../../services/awarenessApi'

interface SearchResult {
  id: string
  type: 'law-power' | 'law-bible' | 'awareness-layer' | 'security'
  title: string
  description?: string
  content?: string
  category?: string
  route?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function KnowledgeSearchDropdown() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [powerLaws, setPowerLaws] = useState<PowerLaw[]>([])
  const [bibleLaws, setBibleLaws] = useState<BibleLaw[]>([])
  const [awarenessLayers, setAwarenessLayers] = useState<AwarenessLayer[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadAllContent()
  }, [])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchQuery('')
      }
    }

    if (searchQuery.trim()) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchQuery])

  const loadAllContent = async () => {
    try {
      setLoading(true)
      
      // Load Power Laws - Load from ALL domains
      try {
        const allPowerLaws: PowerLaw[] = []
        // All Power Law domains from enum
        const powerDomains: PowerLawDomain[] = ['MONEY', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'NEGOTIATION', 'ENERGY']
        for (const domain of powerDomains) {
          try {
            const laws = await powerLawsApi.getLawsByDomain(domain)
            allPowerLaws.push(...laws)
          } catch (err) {
            console.error(`Error loading Power laws for ${domain}:`, err)
          }
        }
        setPowerLaws(allPowerLaws)
      } catch (err) {
        console.error('Error loading Power laws:', err)
      }

      // Load Bible Laws - Dynamically fetch all available domains
      try {
        const allBibleLaws: BibleLaw[] = []
        // Get all available domains from API
        try {
          const domainsResponse = await bibleLawsApi.getDomains()
          const domains = domainsResponse.map(d => d.domain)
          
          // Load laws from all available domains
          for (const domain of domains) {
            try {
              const laws = await bibleLawsApi.getLawsByDomain(domain)
              allBibleLaws.push(...laws)
            } catch (err) {
              console.error(`Error loading Bible laws for ${domain}:`, err)
            }
          }
        } catch (err) {
          // Fallback to known domains if API fails
          console.error('Error fetching Bible law domains, using fallback:', err)
          const fallbackDomains: BibleLawDomain[] = ['MONEY', 'INVESTMENT', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'SPIRITUAL_GROWTH', 'STEWARDSHIP', 'GENEROSITY', 'ENERGY']
          for (const domain of fallbackDomains) {
            try {
              const laws = await bibleLawsApi.getLawsByDomain(domain)
              allBibleLaws.push(...laws)
            } catch (domainErr) {
              console.error(`Error loading Bible laws for ${domain}:`, domainErr)
            }
          }
        }
        setBibleLaws(allBibleLaws)
      } catch (err) {
        console.error('Error loading Bible laws:', err)
      }

      // Load Awareness Layers
      try {
        const response = await awarenessApi.getLayers()
        setAwarenessLayers(response.layers || [])
      } catch (err) {
        console.error('Error loading awareness layers:', err)
      }

      // Note: Products removed - Knowledge Search limited to knowledge artifacts only
    } finally {
      setLoading(false)
    }
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search Power Laws
    powerLaws.forEach((law) => {
      const matches =
        law.title.toLowerCase().includes(query) ||
        law.description?.toLowerCase().includes(query) ||
        law.interpretation?.toLowerCase().includes(query)
      
      if (matches) {
        results.push({
          id: `power-${law.id}`,
          type: 'law-power',
          title: law.title,
          description: law.description,
          content: law.interpretation,
          category: `48 Laws of Power - ${law.domain}`,
          route: '/knowledge/laws',
          icon: BookOpen,
          color: 'text-blue-400',
        })
      }
    })

    // Search Bible Laws
    bibleLaws.forEach((law) => {
      const matches =
        law.title.toLowerCase().includes(query) ||
        law.description?.toLowerCase().includes(query) ||
        law.interpretation?.toLowerCase().includes(query) ||
        law.scriptureReference?.toLowerCase().includes(query)
      
      if (matches) {
        results.push({
          id: `bible-${law.id}`,
          type: 'law-bible',
          title: law.title,
          description: law.description,
          content: law.interpretation || law.scriptureReference,
          category: `Bible Laws - ${law.domain}`,
          route: '/knowledge/laws',
          icon: BookOpen,
          color: 'text-purple-400',
        })
      }
    })

    // Search Awareness Layers
    awarenessLayers.forEach((layer) => {
      const matches =
        layer.title.toLowerCase().includes(query) ||
        layer.description?.toLowerCase().includes(query) ||
        layer.content?.toLowerCase().includes(query)
      
      if (matches) {
        results.push({
          id: `awareness-${layer.id}`,
          type: 'awareness-layer',
          title: layer.title,
          description: layer.description,
          content: layer.content,
          category: `Awareness Layer - ${layer.category}`,
          route: '/knowledge/meaning',
          icon: Sparkles,
          color: 'text-purple-400',
        })
      }
    })

    // Note: Security/Products search removed - Knowledge Search limited to knowledge artifacts only

    // Limit to top 5 results for dropdown
    return results.slice(0, 5)
  }, [searchQuery, powerLaws, bibleLaws, awarenessLayers])

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'law-power':
        return '48 Laws of Power'
      case 'law-bible':
        return 'Bible Laws'
      case 'awareness-layer':
        return 'Awareness Layer'
      case 'security':
        return 'Security'
      default:
        return 'Knowledge'
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'law-power':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'law-bible':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'awareness-layer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'security':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery('')
    if (result.route) {
      navigate(result.route)
    }
  }

  const handleViewAll = () => {
    navigate('/knowledge/search', { state: { query: searchQuery } })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search knowledge artifacts (48 Laws, Bible Laws, Awareness Layers)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inline Results - Show automatically below input */}
      {searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              Loading knowledge content...
            </div>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <>
                  <div className="p-2 border-b border-gray-700">
                    <div className="text-xs text-gray-400 px-2">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                  <div className="py-2">
                    {searchResults.map((result) => {
                      const Icon = result.icon
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                              <Icon className={`w-4 h-4 ${result.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(result.type)}`}>
                                  {getTypeLabel(result.type)}
                                </span>
                                {result.category && (
                                  <span className="text-xs text-gray-500 truncate">
                                    {result.category}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-white mb-1 truncate">
                                {result.title}
                              </h4>
                              {result.description && (
                                <p className="text-xs text-gray-400 line-clamp-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-2 border-t border-gray-700">
                    <button
                      onClick={handleViewAll}
                      className="w-full px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 rounded transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">No results found for "{searchQuery}"</p>
                  <button
                    onClick={handleViewAll}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Try advanced search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

