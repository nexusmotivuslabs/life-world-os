/**
 * Hierarchy Tree View Component
 * 
 * Displays the full hierarchy tree from REALITY (root) down to Laws, Principles & Frameworks
 * This structure supports artifacts and provides a complete ontological view.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, BookOpen, FileText, Layers, Target, Lock, Maximize2, Minimize2, X, Info, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'
import { realityNodeApi, RealityNode } from '../../services/financeApi'
import { getCategoryDisplayName, getCategoryDescription, getNodeTypeDisplayName } from '../../utils/realityNodeDisplay'
import { enumToDisplayName } from '../../utils/enumDisplayNames'
import { motion, AnimatePresence } from 'framer-motion'
import { hierarchyCache } from '../../lib/hierarchyCache'

interface TreeNode {
  id: string
  label: string
  type: 'reality' | 'constraint' | 'category' | 'domain' | 'law' | 'principle' | 'framework' | 'power-law' | 'bible-law' | 'artifact'
  category?: string // Category field for organizing laws
  immutable?: boolean
  children?: TreeNode[]
  data?: any
}

interface HierarchyTreeViewProps {
  rootNodeId?: string // Optional: start from a specific node instead of REALITY root
  overrideParentId?: string // Optional: override parent for child entities (makes them appear under a different parent)
  onArtifactClick?: (artifactId: string) => void // Optional: callback when artifact is clicked (for embedded use)
  refreshTrigger?: number // Optional: increment this to trigger a refresh
}

// Resolve API root id (reality -> reality-root) for initial state and effects
const getActualRootId = (rootNodeId: string) =>
  rootNodeId === 'reality' ? 'reality-root' : rootNodeId

export default function HierarchyTreeView({ rootNodeId = 'reality', overrideParentId, onArtifactClick, refreshTrigger }: HierarchyTreeViewProps = {}) {
  const navigate = useNavigate()
  const actualRootId = getActualRootId(rootNodeId)
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasDataIssues, setHasDataIssues] = useState(false)
  // Initial expanded: use actual root id so root node (e.g. reality-root) is expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set([actualRootId]))
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(true)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const expandedNodesRef = useRef<Set<string>>(expandedNodes)
  const refreshTreeDataRef = useRef<() => Promise<void>>(null!)
  const isRefreshingRef = useRef(false)

  // Keep ref in sync so refresh callback can read current expanded state without being in deps
  useEffect(() => {
    expandedNodesRef.current = expandedNodes
  }, [expandedNodes])

  // Refresh tree data: stable deps (no expandedNodes) so main effect doesn't re-run on every expand/collapse
  const refreshTreeData = useCallback(async () => {
    if (isRefreshingRef.current) return
    try {
      isRefreshingRef.current = true
      setIsRefreshing(true)
      const preservedExpandedNodes = new Set(expandedNodesRef.current)
      realityNodeApi.clearCache()
      const rootTree = await loadNodeWithChildren(actualRootId, overrideParentId)
      await hierarchyCache.set(actualRootId, rootTree)
      setTreeData([rootTree])
      setLastRefreshTime(new Date())
      setExpandedNodes(preservedExpandedNodes)
    } catch (err) {
      console.error('Failed to refresh tree data:', err)
    } finally {
      isRefreshingRef.current = false
      setIsRefreshing(false)
    }
  }, [actualRootId, overrideParentId])

  refreshTreeDataRef.current = refreshTreeData

  // Load tree once on mount and when root/parent change only (no dependency on refreshTreeData or expandedNodes)
  useEffect(() => {
    loadTreeData()
    const interval = setInterval(() => {
      refreshTreeDataRef.current?.()
    }, 300000) // 5 minutes – hierarchy changes rarely
    refreshIntervalRef.current = interval
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [rootNodeId, overrideParentId])

  // Refresh when parent explicitly triggers via refreshTrigger
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refreshTreeDataRef.current?.()
    }
  }, [refreshTrigger])

  // Ensure root node is expanded when tree first loads (use actual id e.g. reality-root)
  useEffect(() => {
    if (treeData.length > 0 && treeData[0].id) {
      setExpandedNodes((prev) => {
        const next = new Set(prev)
        next.add(treeData[0].id)
        return next
      })
    }
  }, [treeData])

  // Convert node title to human-readable display name
  const getDisplayName = (title: string): string => {
    // Special case: REALITY displays as "ROOT"
    if (title === 'REALITY') {
      return 'ROOT'
    }
    // If it's already in a readable format, return as-is
    if (title.includes(' ') && title[0] === title[0].toUpperCase() && title !== title.toUpperCase()) {
      return title
    }
    // Otherwise, convert from UPPER_SNAKE_CASE to Title Case
    return enumToDisplayName(title)
  }

  // Convert RealityNode to TreeNode format
  const convertToTreeNode = (node: RealityNode): TreeNode => {
    return {
      id: node.id,
      label: node.title,
      type: getTreeNodeType(node.nodeType),
      category: node.category || undefined,
      immutable: node.immutable || false,
      data: node.metadata || {},
      children: [] // Will be populated by recursive loading
    }
  }

  // Map Reality node types to tree node types
  const getTreeNodeType = (nodeType: string): TreeNode['type'] => {
    const typeMap: Record<string, TreeNode['type']> = {
      'REALITY': 'reality',
      'UNIVERSAL_FOUNDATION': 'constraint',
      'CATEGORY': 'category',
      'LAW': 'law',
      'PRINCIPLE': 'principle',
      'FRAMEWORK': 'framework',
      'AGENT': 'artifact',
      'ENVIRONMENT': 'artifact',
    }
    return typeMap[nodeType] || 'artifact'
  }

  // Recursively load children for a node
  const loadNodeWithChildren = async (nodeId: string, effectiveParentId?: string): Promise<TreeNode> => {
    const [nodeResponse, childrenResponse] = await Promise.all([
      realityNodeApi.getNode(nodeId),
      realityNodeApi.getChildren(nodeId)
    ])

    const node = convertToTreeNode(nodeResponse.node)
    
    // If overrideParentId is provided and this node's parent should be overridden
    if (overrideParentId && effectiveParentId && node.data?.parentId !== overrideParentId) {
      // Override the parent relationship in the node data
      node.data = { ...node.data, originalParentId: node.data?.parentId, parentId: overrideParentId }
    }
    
    // Load children recursively
    if (childrenResponse.children && childrenResponse.children.length > 0) {
      node.children = await Promise.all(
        childrenResponse.children.map(child => loadNodeWithChildren(child.id, overrideParentId || effectiveParentId))
      )
    }

    return node
  }

  const loadTreeData = async (clearCacheFirst = false) => {
    try {
      setError(null)
      setHasDataIssues(false)
      
      // Determine the actual root node ID to use
      const actualRootId = rootNodeId === 'reality' ? 'reality-root' : rootNodeId
      
      // Clear cache if requested
      if (clearCacheFirst) {
        realityNodeApi.clearCache()
        hierarchyCache.invalidate(actualRootId)
      }
      
      // STALE-WHILE-REVALIDATE: Try to load from cache first
      const cached = await hierarchyCache.get(actualRootId)
      if (cached && !clearCacheFirst) {
        // Show cached data immediately (instant load)
        setTreeData([cached.rootNode])
        setLastRefreshTime(new Date(cached.metadata.timestamp))
        setLoading(false) // Don't show loading spinner for cached data
        
        // Then refresh in background (revalidate)
        refreshTreeDataInBackground(actualRootId)
        return
      }
      
      // No cache or cache cleared, load fresh
      setLoading(true)
      console.log(`Loading hierarchy tree from root: ${actualRootId}`)
      
      // Load root and all its children recursively from database
      const rootTree = await loadNodeWithChildren(actualRootId, overrideParentId)

      console.log(`Loaded tree data:`, rootTree)
      
      // Cache the result for future use
      await hierarchyCache.set(actualRootId, rootTree)
      
      // Set the loaded tree
      setTreeData([rootTree])
      setLastRefreshTime(new Date())
    } catch (err: any) {
      console.error('Failed to load tree from backend:', err)
      
      // Determine error type
      const isNetworkError = err?.message?.includes('fetch') || 
                            err?.message?.includes('network') ||
                            err?.message?.includes('Failed to fetch') ||
                            err?.code === 'ECONNREFUSED' ||
                            err?.name === 'TypeError'
      
      const isBackendError = err?.status >= 500 || err?.status === 404
      const errorMessage = isNetworkError 
        ? 'Cannot connect to backend server. Please ensure the backend is running on port 5001.'
        : isBackendError
        ? 'Backend server error. Please check server logs.'
        : err?.message || 'Unable to load hierarchy data.'
      
      // Try to use stale cache if available (offline support)
      const actualRootId = rootNodeId === 'reality' ? 'reality-root' : rootNodeId
      const staleCache = await hierarchyCache.get(actualRootId)
      if (staleCache) {
        console.log('Using stale cache due to network error')
        setTreeData([staleCache.rootNode])
        setLastRefreshTime(new Date(staleCache.metadata.timestamp))
        setError(`Using cached data (${new Date(staleCache.metadata.timestamp).toLocaleString()}). ${errorMessage}`)
        setHasDataIssues(true) // Still show warning even with cached data
      } else {
        setError(errorMessage + ' No cached data available.')
        setHasDataIssues(true)
        setTreeData([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Background refresh (doesn't block UI) - stale-while-revalidate pattern
  const refreshTreeDataInBackground = async (actualRootId: string) => {
    try {
      // Clear API cache to ensure fresh data
      realityNodeApi.clearCache()
      
      // Load fresh data
      const rootTree = await loadNodeWithChildren(actualRootId, overrideParentId)
      
      // Update cache
      await hierarchyCache.set(actualRootId, rootTree)
      
      // Only update UI if tree structure actually changed (by checksum)
      setTreeData(prev => {
        if (prev.length === 0) {
          return [rootTree]
        }
        
        // Check if structure changed by comparing checksums
        const cached = hierarchyCache.getFromMemory(actualRootId)
        if (cached) {
          const oldChecksum = cached.metadata.checksum
          const newChecksum = hierarchyCache.calculateChecksum(rootTree)
          
          if (oldChecksum !== newChecksum) {
            // Structure changed, update UI
            setLastRefreshTime(new Date())
            return [rootTree]
          }
        }
        
        // No change, keep existing (but update timestamp silently)
        return prev
      })
    } catch (err) {
      console.error('Background refresh failed:', err)
      // Don't show error, just log it - user still has cached data
    }
  }

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    await refreshTreeData()
  }, [refreshTreeData])

  // Helper function to find a node by ID in the tree
  const findNodeById = (node: TreeNode, id: string): TreeNode | null => {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id)
        if (found) return found
      }
    }
    return null
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const getNodeIcon = (type: TreeNode['type']) => {
    switch (type) {
      case 'reality':
        return <Layers className="w-5 h-5 text-purple-500" />
      case 'constraint':
        return <Target className="w-4 h-4 text-indigo-400" />
      case 'category':
        return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'domain':
        return <Target className="w-4 h-4 text-green-400" />
      case 'law':
        return <FileText className="w-4 h-4 text-yellow-400" />
      case 'principle':
        return <ChevronRight className="w-3 h-3 text-purple-400" />
      case 'framework':
        return <Layers className="w-4 h-4 text-cyan-400" />
      case 'power-law':
        return <FileText className="w-4 h-4 text-orange-400" />
      case 'bible-law':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'artifact':
        return <Layers className="w-4 h-4 text-pink-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return null
    
    const colors: Record<string, string> = {
      FOUNDATIONAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      FUNDAMENTAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      POWER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      BIBLICAL: 'bg-green-500/20 text-green-400 border-green-500/30',
      STRATEGIC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      SYSTEMIC: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      CROSS_SYSTEM: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      SYSTEM_TIER: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      SYSTEM: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      HUMAN: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      COLLECTIVE: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      ARTIFICIAL: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      ORGANISATIONAL: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      HYBRID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      PHYSICAL: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
      ECONOMIC: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      DIGITAL: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      SOCIAL: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      BIOLOGICAL: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    }
    
    return (
      <span 
        className={`px-1.5 py-0.5 text-xs rounded border ${colors[category] || colors.FOUNDATIONAL}`}
        title={getCategoryDescription(category)}
      >
        {getCategoryDisplayName(category)}
      </span>
    )
  }

  // Check if a node has no data (no description, no children, no meaningful metadata)
  const hasNoData = (node: TreeNode): boolean => {
    const hasDescription = node.data?.description && node.data.description.trim().length > 0
    const hasChildren = node.children && node.children.length > 0
    const hasMetadata = node.data && Object.keys(node.data).length > 0 && 
      Object.keys(node.data).some(key => key !== 'description' && node.data[key] != null)
    
    return !hasDescription && !hasChildren && !hasMetadata
  }

  // Navigate to artifacts view with artifact ID or call callback if provided
  const navigateToArtifact = (node: TreeNode) => {
    // Construct artifact ID from node ID (for reality nodes, it's reality-node-{nodeId})
    const artifactId = `reality-node-${node.id}`
    
    // If callback is provided (tree is embedded), use it to open modal directly
    if (onArtifactClick) {
      onArtifactClick(artifactId)
    } else {
      // Otherwise, navigate to artifacts view with the specific artifact ID
      navigate(`/knowledge/artifacts?id=${encodeURIComponent(artifactId)}`)
    }
  }

  const renderTreeNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode?.id === node.id
    // Reduced indent for better mobile experience (20px per level, max 160px)
    const indent = Math.min(level * 20, 160)
    const showLock = node.immutable || hasNoData(node)
    const lockTitle = node.immutable ? 'Immutable' : 'No data available'
    const displayName = getDisplayName(node.label)

    const handleRowClick = (e: React.MouseEvent) => {
      // If clicking the chevron area, toggle expansion
      if (hasChildren && (e.target as HTMLElement).closest('button[data-chevron]')) {
        toggleNode(node.id)
        return
      }
      // If clicking the info button, show details modal
      if ((e.target as HTMLElement).closest('button[title="View details"]')) {
        setSelectedNode(node)
        return
      }
      // If clicking the external link button, navigate to artifacts
      if ((e.target as HTMLElement).closest('button[title="View artifact"]')) {
        navigateToArtifact(node)
        return
      }
      // For leaf nodes (laws, principles, etc.), navigate to artifacts view
      // For parent nodes, toggle expansion or show details
      if (!hasChildren && (node.type === 'law' || node.type === 'principle' || node.type === 'framework')) {
        navigateToArtifact(node)
      } else {
        // Otherwise, select the node (shows details modal)
        setSelectedNode(node)
      }
    }

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={handleRowClick}
          className={`flex items-center gap-1 sm:gap-2 py-1.5 px-1 sm:px-2 rounded transition-colors group cursor-pointer ${
            isSelected 
              ? 'bg-blue-500/20 border border-blue-500/50' 
              : 'hover:bg-gray-700/50'
          } ${
            level === 0 ? 'font-bold text-base sm:text-lg bg-purple-500/10 border border-purple-500/30' : 
            level === 1 ? 'font-semibold text-sm sm:text-base' : 'text-sm sm:text-base'
          }`}
          style={{ paddingLeft: `${Math.min(indent + 8, 200)}px` }}
        >
          {hasChildren ? (
            <button
              data-chevron
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-gray-600/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0">{getNodeIcon(node.type)}</div>
            <span
              className={`truncate flex-1 ${
                isSelected
                  ? 'text-blue-300'
                  : node.type === 'reality'
                  ? 'text-purple-300'
                  : level === 1
                  ? 'text-indigo-300'
                  : level === 2
                  ? 'text-blue-300'
                  : 'text-gray-300'
              }`}
              title={node.label} // Show original label on hover
            >
              {displayName}
              {hasChildren && (
                <span className="text-gray-500 ml-1 hidden sm:inline">(I)</span>
              )}
            </span>
            <span className="text-xs text-gray-500 ml-1 sm:ml-2 flex-shrink-0 hidden sm:inline">
              min 1 max 3
            </span>
            {showLock && (
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" title={lockTitle} />
            )}
            <div className="hidden sm:block">{getCategoryBadge(node.category)}</div>
            {node.data?.description && (
              <span className="text-xs text-gray-500 ml-1 sm:ml-2 italic truncate hidden md:inline">
                - {node.data.description}
              </span>
            )}
          </div>
          {/* Show external link button for laws, principles, frameworks */}
          {(node.type === 'law' || node.type === 'principle' || node.type === 'framework') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateToArtifact(node)
              }}
              className="p-1 rounded hover:bg-green-500/20 text-gray-400 hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              title="View artifact"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedNode(node)
            }}
            className="p-1 rounded hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            title="View details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-700/50 ml-2">
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading Reality hierarchy tree...</div>
      </div>
    )
  }

  const expandAll = () => {
    const allNodeIds = new Set<string>()
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id)
        if (node.children) {
          collectIds(node.children)
        }
      })
    }
    collectIds(treeData)
    setExpandedNodes(allNodeIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set([actualRootId]))
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Data Issues Warning */}
      {hasDataIssues && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-400 font-semibold mb-1">Data Connection Issue</h4>
              <p className="text-yellow-200/80 text-sm mb-2">
                {error || "We're experiencing issues connecting to the data service. Some information may be unavailable or incomplete."}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setHasDataIssues(false)
                    setError(null)
                    // Clear cache and force fresh load
                    await loadTreeData(true)
                  }}
                  className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded border border-yellow-500/30 text-sm transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Connection
                </button>
                {error?.includes('port 5001') && (
                  <a
                    href="http://localhost:5001/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 text-sm transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Check Backend Health
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Reality</h2>
            {lastRefreshTime && (
              <span className="text-xs text-gray-500">
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-500/30 text-sm flex items-center gap-2 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 text-sm flex items-center gap-2 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              Collapse All
            </button>
          </div>
        </div>
        <p className="text-gray-400">
          Complete hierarchical view from REALITY (root) down to individual laws, principles, and frameworks.
          This structure supports artifacts and provides a complete ontological view. The tree is collapsed to root by default - click nodes to expand/collapse sections.
        </p>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-2 sm:p-4 border border-gray-700 max-h-[600px] sm:max-h-[800px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <p>Loading hierarchy tree...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={loadTreeData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors mt-2"
            >
              Retry
            </button>
          </div>
        ) : treeData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No hierarchy data available.</p>
            <p className="text-gray-500 text-sm">
              The database may not be seeded yet. Run the seed script to populate the Reality hierarchy.
            </p>
          </div>
        ) : (
          treeData.map((node) => renderTreeNode(node, 0))
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
          className="w-full flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors mb-3"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Legend</span>
          </div>
          {isLegendCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {!isLegendCollapsed && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Node Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>{getNodeTypeDisplayName('REALITY')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>{getNodeTypeDisplayName('UNIVERSAL_FOUNDATION')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{getNodeTypeDisplayName('CATEGORY')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span>{getNodeTypeDisplayName('LAW')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{getNodeTypeDisplayName('PRINCIPLE')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>{getNodeTypeDisplayName('FRAMEWORK')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-400" />
                <span>{getNodeTypeDisplayName('AGENT')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>{getNodeTypeDisplayName('ENVIRONMENT')}</span>
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {['FOUNDATIONAL', 'FUNDAMENTAL', 'POWER', 'BIBLICAL', 'STRATEGIC', 'SYSTEMIC', 'HUMAN', 'COLLECTIVE', 'ARTIFICIAL', 'ORGANISATIONAL', 'HYBRID', 'PHYSICAL', 'ECONOMIC', 'DIGITAL', 'SOCIAL', 'BIOLOGICAL'].map((cat) => (
                <span key={cat} className="text-xs">
                  {getCategoryBadge(cat)}
                </span>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Immutable nodes cannot be modified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Lock icon also indicates nodes with no data currently</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Artifact Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg border-2 border-blue-500/30 max-w-[95vw] sm:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 sm:p-6 flex items-start justify-between">
                <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                    {getNodeIcon(selectedNode.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white break-words">{getDisplayName(selectedNode.label)}</h2>
                      {(selectedNode.immutable || hasNoData(selectedNode)) && (
                        <Lock 
                          className="w-5 h-5 text-purple-400" 
                          title={selectedNode.immutable ? 'Immutable' : 'No data available'} 
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-400">
                        {getNodeTypeDisplayName(selectedNode.type)}
                      </span>
                      {selectedNode.category && getCategoryBadge(selectedNode.category)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                {selectedNode.data?.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedNode.data.description}</p>
                  </div>
                )}

                {/* Law Template Fields */}
                {selectedNode.type === 'law' && (
                  <>
                    {selectedNode.data?.derivedFrom && Array.isArray(selectedNode.data.derivedFrom) && selectedNode.data.derivedFrom.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Derived From</h3>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedNode.data.derivedFrom.map((constraint: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 text-sm font-medium"
                              >
                                {constraint}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedNode.data?.statement && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Statement</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.statement}</p>
                      </div>
                    )}
                    {selectedNode.data?.recursiveBehavior && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Recursive Behavior</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.recursiveBehavior}</p>
                      </div>
                    )}
                    {selectedNode.data?.violationOutcome && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Violation Outcome</h3>
                        <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedNode.data.violationOutcome}</p>
                      </div>
                    )}
                    {selectedNode.data?.whyThisLawPersists && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Why This Law Persists</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.whyThisLawPersists}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Principle Template Fields */}
                {selectedNode.type === 'principle' && (
                  <>
                    {selectedNode.data?.alignedWith && Array.isArray(selectedNode.data.alignedWith) && selectedNode.data.alignedWith.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Aligned With</h3>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedNode.data.alignedWith.map((law: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 text-sm font-medium"
                              >
                                {law}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedNode.data?.principle && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Principle</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.principle}</p>
                      </div>
                    )}
                    {selectedNode.data?.whyItWorks && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Why It Works</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.whyItWorks}</p>
                      </div>
                    )}
                    {selectedNode.data?.violationPattern && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Violation Pattern</h3>
                        <p className="text-gray-300 leading-relaxed bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">{selectedNode.data.violationPattern}</p>
                      </div>
                    )}
                    {selectedNode.data?.predictableResult && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Predictable Result of Violation</h3>
                        <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedNode.data.predictableResult}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Framework Template Fields */}
                {selectedNode.type === 'framework' && (
                  <>
                    {selectedNode.data?.basedOn && Array.isArray(selectedNode.data.basedOn) && selectedNode.data.basedOn.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Based On</h3>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedNode.data.basedOn.map((principle: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 text-sm font-medium"
                              >
                                {principle}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedNode.data?.purpose && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Purpose</h3>
                        <p className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4">{selectedNode.data.purpose}</p>
                      </div>
                    )}
                    {selectedNode.data?.structure && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Structure</h3>
                        <div className="text-gray-300 leading-relaxed bg-gray-700/50 rounded-lg p-4 whitespace-pre-line">{selectedNode.data.structure}</div>
                      </div>
                    )}
                    {selectedNode.data?.whenToUse && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">When to Use</h3>
                        <p className="text-gray-300 leading-relaxed bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">{selectedNode.data.whenToUse}</p>
                      </div>
                    )}
                    {selectedNode.data?.whenNotToUse && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">When Not to Use</h3>
                        <p className="text-gray-300 leading-relaxed bg-red-500/10 border border-red-500/30 rounded-lg p-4">{selectedNode.data.whenNotToUse}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Fallback: Generic Metadata Display */}
                {selectedNode.type !== 'law' && selectedNode.type !== 'principle' && selectedNode.type !== 'framework' && 
                 selectedNode.data && Object.keys(selectedNode.data).length > 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedNode.data).map(([key, value]) => {
                        if (key === 'description') return null
                        
                        return (
                          <div key={key} className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-400 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                            </h4>
                            <div className="text-gray-300">
                              {typeof value === 'object' ? (
                                <pre className="text-sm overflow-x-auto bg-gray-900/50 p-3 rounded">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : Array.isArray(value) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {value.map((item, idx) => (
                                    <li key={idx} className="text-sm">{String(item)}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm">{String(value)}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Children Count */}
                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">
                        Contains {selectedNode.children.length} child node{selectedNode.children.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
