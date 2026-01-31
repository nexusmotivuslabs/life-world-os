/**
 * Knowledge Search Component
 * 
 * Search across all knowledge content: Laws, Security, Awareness Layers, etc.
 * Part of the Knowledge Plane - read-only search results.
 */

import { useState, useEffect, useMemo } from 'react'
import { Search, BookOpen, Sparkles, ChevronRight, Package, Layers, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { powerLawsApi, bibleLawsApi, PowerLaw, BibleLaw, productsApi, Product, realityNodeApi, RealityNode } from '../../services/financeApi'
import { awarenessApi, AwarenessLayer } from '../../services/awarenessApi'
import { artifactApi, UserArtifact } from '../../services/artifactApi'
import { logger } from '../../lib/logger'
import { getCategoryDisplayName } from '../../utils/realityNodeDisplay'
import { enumToDisplayName } from '../../utils/enumDisplayNames'

interface SearchResult {
  id: string
  type: 'law-power' | 'law-bible' | 'awareness-layer' | 'security' | 'product' | 'system-component' | 'artifact'
  title: string
  description?: string
  content?: string
  category?: string
  route?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface KnowledgeSearchProps {
  initialQuery?: string
}

export default function KnowledgeSearch({ initialQuery = '' }: KnowledgeSearchProps = {}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [powerLaws, setPowerLaws] = useState<PowerLaw[]>([])
  const [bibleLaws, setBibleLaws] = useState<BibleLaw[]>([])
  const [awarenessLayers, setAwarenessLayers] = useState<AwarenessLayer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [realityNodes, setRealityNodes] = useState<RealityNode[]>([])
  const [artifacts, setArtifacts] = useState<UserArtifact[]>([])

  useEffect(() => {
    loadAllContent()
  }, [])

  const loadAllContent = async () => {
    try {
      setLoading(true)
      
      // Load Power Laws - Load from ALL domains
      try {
        const allPowerLaws: PowerLaw[] = []
        // All Power Law domains from enum
        const powerDomains: string[] = ['MONEY', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'NEGOTIATION', 'ENERGY']
        for (const domain of powerDomains) {
          try {
            const laws = await powerLawsApi.getLawsByDomain(domain as PowerLaw['domain'])
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
          const fallbackDomains: string[] = ['MONEY', 'INVESTMENT', 'CAREER', 'BUSINESS', 'RELATIONSHIPS', 'LEADERSHIP', 'SPIRITUAL_GROWTH', 'STEWARDSHIP', 'GENEROSITY', 'ENERGY']
          for (const domain of fallbackDomains) {
            try {
              const laws = await bibleLawsApi.getLawsByDomain(domain as BibleLaw['domain'])
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

      // Load Products
      try {
        const productsResponse = await productsApi.list()
        setProducts(productsResponse.products || [])
      } catch (err) {
        console.error('Error loading products:', err)
      }

      // Load System Components (RealityNodes)
      try {
        const nodesResponse = await realityNodeApi.getNodes()
        setRealityNodes(nodesResponse.nodes || [])
      } catch (err) {
        console.error('Error loading system components:', err)
      }

      // Load User Artifacts
      try {
        const artifactsResponse = await artifactApi.list('demo-user-id') // TODO: Use actual userId from auth
        setArtifacts(artifactsResponse.artifacts || [])
      } catch (err) {
        logger.error('Error loading artifacts', err instanceof Error ? err : new Error(String(err)))
      }
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

    // Search Power Laws (48 Laws of Power) - All domains
    powerLaws.forEach((law) => {
      const matches =
        law.title.toLowerCase().includes(query) ||
        law.originalDescription?.toLowerCase().includes(query) ||
        law.domainApplication?.toLowerCase().includes(query) ||
        law.strategies?.some((s: string) => s.toLowerCase().includes(query)) ||
        law.examples?.some((e: string) => e.toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `power-${law.id}`,
          type: 'law-power',
          title: law.title,
          description: law.originalDescription || law.domainApplication,
          content: law.domainApplication,
          category: `48 Laws of Power - ${enumToDisplayName(law.domain)}`,
          route: '/knowledge/laws',
          icon: BookOpen,
          color: 'text-blue-400',
        })
      }
    })

    // Search Bible Laws - All domains
    bibleLaws.forEach((law) => {
      const matches =
        law.title.toLowerCase().includes(query) ||
        law.scriptureReference?.toLowerCase().includes(query) ||
        law.originalText?.toLowerCase().includes(query) ||
        law.domainApplication?.toLowerCase().includes(query) ||
        law.principles?.some((p: { text?: string }) => p.text?.toLowerCase().includes(query)) ||
        law.practicalApplications?.some((app: string) => app.toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `bible-${law.id}`,
          type: 'law-bible',
          title: law.title,
          description: law.domainApplication || law.scriptureReference,
          content: law.domainApplication || law.originalText,
          category: `Bible Laws - ${enumToDisplayName(law.domain)}`,
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
        (layer.metadata && JSON.stringify(layer.metadata as Record<string, unknown>).toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `awareness-${layer.id}`,
          type: 'awareness-layer',
          title: layer.title,
          description: layer.description || undefined,
          content: layer.category,
          category: `Awareness Layer - ${layer.category}`,
          route: '/knowledge/meaning',
          icon: Sparkles,
          color: 'text-purple-400',
        })
      }
    })

    // Search Products
    products.forEach((product) => {
      const matches =
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.type?.toLowerCase().includes(query) ||
        (product.features && JSON.stringify(product.features).toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `product-${product.id}`,
          type: 'product',
          title: product.name,
          description: product.description,
          content: product.type,
          category: `Product - ${product.type}`,
          route: `/master/money/products/${product.id}`,
          icon: Package,
          color: 'text-green-400',
        })
      }
    })

    // Search System Components (RealityNodes)
    realityNodes.forEach((node) => {
      const matches =
        node.title.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query) ||
        node.nodeType?.toLowerCase().includes(query) ||
        node.category?.toLowerCase().includes(query) ||
        (node.metadata && JSON.stringify(node.metadata).toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `system-${node.id}`,
          type: 'system-component',
          title: node.title,
          description: node.description,
          content: `${node.nodeType}${node.category ? ` - ${getCategoryDisplayName(node.category)}` : ''}`,
          category: `System Component - ${node.nodeType}`,
          route: '/knowledge/overview',
          icon: Layers,
          color: 'text-indigo-400',
        })
      }
    })

    // Search User Artifacts
    artifacts.forEach((artifact) => {
      const matches =
        artifact.title.toLowerCase().includes(query) ||
        artifact.description?.toLowerCase().includes(query) ||
        artifact.productName?.toLowerCase().includes(query) ||
        artifact.type?.toLowerCase().includes(query) ||
        artifact.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
        (artifact.data && JSON.stringify(artifact.data).toLowerCase().includes(query))
      
      if (matches) {
        results.push({
          id: `artifact-${artifact.id}`,
          type: 'artifact',
          title: artifact.title,
          description: artifact.description || `From ${artifact.productName}`,
          content: artifact.type,
          category: `Artifact - ${artifact.type}`,
          route: `/master/money/products/${artifact.productId || ''}`,
          icon: FileText,
          color: 'text-yellow-400',
        })
      }
    })

    return results
  }, [searchQuery, powerLaws, bibleLaws, awarenessLayers, products, realityNodes, artifacts])

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
      case 'product':
        return 'Product'
      case 'system-component':
        return 'System Component'
      case 'artifact':
        return 'Artifact'
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
      case 'product':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'system-component':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'artifact':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Knowledge Search</h2>
        </div>
        <p className="text-gray-400">
          Search across all artifacts: Laws, Principles, Frameworks, Products, System Components, and User Artifacts.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
          type="text"
          placeholder="Search artifacts, products, system components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-lg"
          autoFocus={!initialQuery}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading knowledge content...</div>
        </div>
      ) : searchQuery.trim() ? (
        <div>
          <div className="mb-4 text-sm text-gray-400">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
          {searchResults.length === 0 ? (
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => {
                const Icon = result.icon
                return (
                  <div
                    key={result.id}
                    className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(result.type)}`}>
                        <Icon className={`w-5 h-5 ${result.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                          {result.category && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{result.title}</h3>
                        {result.description && (
                          <p className="text-gray-300 mb-3">{result.description}</p>
                        )}
                        {result.content && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                            <p className="text-sm text-gray-300 line-clamp-3">{result.content}</p>
                          </div>
                        )}
                        {result.route && (
                          <Link
                            to={result.route}
                            className="mt-4 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {result.type === 'product' && 'View Product'}
                            {result.type === 'system-component' && 'View in Overview'}
                            {result.type === 'artifact' && 'View Artifact'}
                            {result.type === 'law-power' || result.type === 'law-bible' ? 'View in Laws' : ''}
                            {result.type === 'awareness-layer' && 'View in Meaning System'}
                            {!['product', 'system-component', 'artifact', 'law-power', 'law-bible', 'awareness-layer'].includes(result.type) && 'Explore content'}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 text-center">
          <p className="text-gray-400">Enter a search query to find artifacts</p>
          <p className="text-gray-500 text-sm mt-2">
            Search across Laws, Products, System Components, Artifacts, Awareness Layers, and more
          </p>
        </div>
      )}
    </div>
  )
}

