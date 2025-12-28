/**
 * Choose Plane Assistant
 * 
 * Silent assistant component (like Thanos/Ebony Maw) that provides contextual guidance.
 * Combines local knowledge (app data) with root knowledge (external APIs) for verification.
 * Appears contextually based on current navigation node.
 */

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen, Zap, Sparkles, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentNode, isSystemNode } from '../services/navigationService'
import { useGameStore } from '../store/useGameStore'

interface AssistantSuggestion {
  type: 'knowledge' | 'systems' | 'both'
  message: string
  action?: {
    label: string
    path: string
  }
}

export default function ChoosePlaneAssistant() {
  const location = useLocation()
  const { dashboard } = useGameStore()
  const [suggestion, setSuggestion] = useState<AssistantSuggestion | null>(null)
  const [showAssistant, setShowAssistant] = useState(false)
  
  // Check if we're on the home page for special highlighting
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const currentNode = getCurrentNode(location.pathname)
    
    // Only show assistant on System Tiers page or when contextually relevant
    if (location.pathname === '/tiers' || location.pathname === '/') {
      // Determine suggestion based on context
      const newSuggestion = generateSuggestion(currentNode, dashboard)
      setSuggestion(newSuggestion)
      setShowAssistant(true)
    } else if (isSystemNode(location.pathname)) {
      // Show contextual guidance for system pages
      const newSuggestion = generateSystemSuggestion(currentNode, dashboard)
      setSuggestion(newSuggestion)
      setShowAssistant(true)
    } else {
      setShowAssistant(false)
    }
  }, [location.pathname, dashboard])

  if (!showAssistant || !suggestion) {
    return null
  }

  // Enhanced styling for home page
  const containerClasses = isHomePage
    ? "mb-8 p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50 rounded-xl shadow-lg shadow-indigo-500/20"
    : "mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"

  const iconContainerClasses = isHomePage
    ? "p-3 bg-indigo-500/30 rounded-xl flex-shrink-0"
    : "p-2 bg-indigo-500/20 rounded-lg flex-shrink-0"

  const iconClasses = isHomePage
    ? "w-6 h-6 text-indigo-300"
    : "w-5 h-5 text-indigo-400"

  const titleClasses = isHomePage
    ? "font-bold text-xl text-indigo-200"
    : "font-semibold text-indigo-300"

  const messageClasses = isHomePage
    ? "text-base text-gray-200 mb-4"
    : "text-sm text-gray-300 mb-3"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={containerClasses}
      >
        <div className="flex items-start gap-4">
          <div className={iconContainerClasses}>
            <Sparkles className={iconClasses} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={titleClasses}>
                {isHomePage ? 'Choose Your Mode' : 'Navigation Assistant'}
              </h3>
              {!isHomePage && (
                <span className="text-xs text-indigo-400/70">Contextual Guidance</span>
              )}
            </div>
            <p className={messageClasses}>{suggestion.message}</p>
            {suggestion.action && (
              <div className="flex gap-3">
                {suggestion.type === 'knowledge' || suggestion.type === 'both' ? (
                  <a
                    href="/knowledge"
                    className={`px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/40 hover:border-blue-400/60 rounded-lg text-sm font-medium text-blue-200 transition-all hover:scale-105 flex items-center gap-2 ${
                      isHomePage ? 'shadow-md' : ''
                    }`}
                  >
                    <BookOpen className={isHomePage ? "w-5 h-5" : "w-4 h-4"} />
                    Explore Knowledge
                  </a>
                ) : null}
                {suggestion.type === 'systems' || suggestion.type === 'both' ? (
                  <a
                    href="/systems"
                    className={`px-4 py-2.5 bg-yellow-600/20 hover:bg-yellow-600/30 border-2 border-yellow-500/40 hover:border-yellow-400/60 rounded-lg text-sm font-medium text-yellow-200 transition-all hover:scale-105 flex items-center gap-2 ${
                      isHomePage ? 'shadow-md' : ''
                    }`}
                  >
                    <Zap className={isHomePage ? "w-5 h-5" : "w-4 h-4"} />
                    Enter Action Mode
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function generateSuggestion(
  currentNode: ReturnType<typeof getCurrentNode>,
  dashboard: any
): AssistantSuggestion {
  // Combine local knowledge (dashboard) with context
  if (currentNode?.id === 'system-tiers' || currentNode?.id === 'home') {
    return {
      type: 'both',
      message: 'Explore systems by tier, or choose a mode to interact with them. Knowledge for understanding, Systems for action.',
    }
  }

  return {
    type: 'both',
    message: 'Navigate through the system hierarchy or choose a mode to interact.',
  }
}

function generateSystemSuggestion(
  currentNode: ReturnType<typeof getCurrentNode>,
  dashboard: any
): AssistantSuggestion {
  // Provide contextual guidance based on system
  if (currentNode?.id === 'finance-system') {
    return {
      type: 'systems',
      message: 'Finance System: Manage finances, investments, and cash flow. Use Systems for transactions, Knowledge for financial laws and principles.',
    }
  }

  if (currentNode?.id === 'energy-system') {
    return {
      type: 'systems',
      message: 'Energy System: Track and manage your energy levels. Systems for actions, Knowledge for energy laws and optimization strategies.',
    }
  }

  return {
    type: 'both',
    message: 'Explore this system in Knowledge for understanding, or Systems for action.',
  }
}

