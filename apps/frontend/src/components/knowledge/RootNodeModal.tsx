/**
 * Root Node Modal Component
 * 
 * Displays detailed information about a root node in a modal container.
 * Shows all information about immutable, FOUNDATIONAL nodes.
 */

import { useEffect, useRef } from 'react'
import { X, Lock, Layers, BookOpen, Target, ChevronRight, ArrowUp, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNodeTypeDisplayName, getCategoryDisplayName, getNodeTypeDescription, getCategoryDescription } from '../../utils/realityNodeDisplay'

interface AncestorNode {
  id: string
  title: string
  description?: string
  nodeType: string
  category?: string
  immutable?: boolean
  orderIndex: number
}

interface ChildNode {
  id: string
  title: string
  description?: string
  nodeType: string
  category?: string
  immutable?: boolean
  orderIndex: number
}

interface RootNodeData {
  id: string
  title: string
  description?: string
  nodeType: string
  category?: string
  immutable?: boolean
  orderIndex?: number
  metadata?: any
  ancestors?: AncestorNode[]
  children?: ChildNode[]
}

// Support both old format (for backwards compatibility) and new format
type NodeData = RootNodeData | {
  ancestors: AncestorNode[]
  node: RootNodeData
  children: ChildNode[]
  depth: number
}

interface RootNodeModalProps {
  node: NodeData | null
  isOpen: boolean
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void // Callback to navigate to another node
}

export default function RootNodeModal({ node, isOpen, onClose, onNavigateToNode }: RootNodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
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

  if (!node || !isOpen) return null

  // Normalize node data - handle both hierarchy format and direct node format
  const nodeData: RootNodeData = 'node' in node ? node.node : node
  const ancestors: AncestorNode[] = 'ancestors' in node ? node.ancestors : (node.ancestors || [])
  const children: ChildNode[] = 'children' in node ? node.children : (node.children || [])

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'REALITY':
        return <Layers className="w-8 h-8 text-purple-500" />
      case 'UNIVERSAL_FOUNDATION':
        return <Target className="w-8 h-8 text-indigo-400" />
      case 'CATEGORY':
        return <BookOpen className="w-8 h-8 text-blue-400" />
      case 'LAW':
        return <BookOpen className="w-8 h-8 text-yellow-400" />
      case 'PRINCIPLE':
        return <BookOpen className="w-8 h-8 text-blue-400" />
      case 'FRAMEWORK':
        return <Target className="w-8 h-8 text-cyan-400" />
      case 'AGENT':
        return <Layers className="w-8 h-8 text-green-400" />
      case 'ENVIRONMENT':
        return <Layers className="w-8 h-8 text-orange-400" />
      default:
        return <Layers className="w-8 h-8 text-gray-400" />
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
        className={`px-3 py-1.5 text-sm rounded border font-medium ${colors[category] || colors.FOUNDATIONAL}`}
        title={getCategoryDescription(category)}
      >
        {getCategoryDisplayName(category)}
      </span>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-700"
              role="dialog"
              aria-modal="true"
              aria-labelledby="root-node-modal-title"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      nodeData.nodeType === 'REALITY' 
                        ? 'bg-purple-500/20' 
                        : nodeData.nodeType === 'UNIVERSAL_FOUNDATION'
                        ? 'bg-indigo-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      {getNodeIcon(nodeData.nodeType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 id="root-node-modal-title" className="text-3xl font-bold text-white">
                          {nodeData.title}
                        </h2>
                        {nodeData.immutable && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-medium">Immutable</span>
                          </div>
                        )}
                        {getCategoryBadge(nodeData.category)}
                      </div>
                      {nodeData.description && (
                        <p className="text-gray-300 mt-2">{nodeData.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Parent Hierarchy (Ancestors) - Navigatable */}
                {ancestors && ancestors.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <ArrowUp className="w-5 h-5 text-indigo-400" />
                      Parent Hierarchy ({ancestors.length} levels up)
                    </h3>
                    <div className="space-y-2">
                      {ancestors.map((ancestor, index) => (
                        <div
                          key={ancestor.id}
                          onClick={() => onNavigateToNode?.(ancestor.id)}
                          className={`bg-gray-700/50 rounded-lg p-4 border border-gray-600 transition-all cursor-pointer hover:border-indigo-500/50 hover:bg-gray-700/70 ${
                            onNavigateToNode ? 'hover:shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <ChevronUp className="w-4 h-4" />
                                <span>Level {ancestors.length - index}</span>
                              </div>
                              <div className="p-2 bg-indigo-500/20 rounded-lg">
                                {getNodeIcon(ancestor.nodeType)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{ancestor.title}</h4>
                                {ancestor.description && (
                                  <p className="text-sm text-gray-400 mt-1">{ancestor.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {ancestor.immutable && (
                                <Lock className="w-4 h-4 text-purple-400" title="Immutable" />
                              )}
                              {getCategoryBadge(ancestor.category)}
                              {onNavigateToNode && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Node Information */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Node Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Type</p>
                      <p className="text-white font-medium">{getNodeTypeDisplayName(nodeData.nodeType)}</p>
                      {getNodeTypeDescription(nodeData.nodeType) && (
                        <p className="text-xs text-gray-500 mt-1">{getNodeTypeDescription(nodeData.nodeType)}</p>
                      )}
                    </div>
                    {nodeData.category && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Category</p>
                        <p className="text-white font-medium">{getCategoryDisplayName(nodeData.category)}</p>
                        {getCategoryDescription(nodeData.category) && (
                          <p className="text-xs text-gray-500 mt-1">{getCategoryDescription(nodeData.category)}</p>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Status</p>
                      <p className="text-white font-medium">
                        {nodeData.immutable ? 'Immutable (Cannot be modified)' : 'Mutable'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Node ID</p>
                      <p className="text-white font-mono text-sm">{nodeData.id}</p>
                    </div>
                  </div>
                  {nodeData.metadata && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Metadata</p>
                      <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-auto">
                        {JSON.stringify(nodeData.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Children - Navigatable */}
                {children && children.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-400" />
                      Children ({children.length})
                    </h3>
                    <div className="space-y-3">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => onNavigateToNode?.(child.id)}
                          className={`bg-gray-700/50 rounded-lg p-4 border border-gray-600 transition-all ${
                            onNavigateToNode ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-gray-700/70 hover:shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-500/20 rounded-lg">
                                {getNodeIcon(child.nodeType)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{child.title}</h4>
                                {child.description && (
                                  <p className="text-sm text-gray-400 mt-1">{child.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {child.immutable && (
                                <Lock className="w-4 h-4 text-purple-400" title="Immutable" />
                              )}
                              {getCategoryBadge(child.category)}
                              {onNavigateToNode && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="bg-indigo-500/10 rounded-lg p-6 border border-indigo-500/30">
                  <h3 className="text-lg font-semibold text-indigo-300 mb-3">About Root Nodes</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Root nodes are foundational elements in the Reality hierarchy. They represent immutable,
                    foundational concepts that govern all systems. These nodes cannot be modified and serve
                    as the structural foundation for all knowledge in the Life World OS.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

